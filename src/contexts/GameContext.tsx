import React, { createContext, useContext, useState, useCallback } from 'react';
import { GameSession, GameMode, Difficulty } from '../lib/supabase';
import { createGameSession, calculateScore, calculateBossDamage, getBossForDifficulty, calculateXPReward, calculateCoinsReward, trackEvent } from '../lib/gameEngine';
import { useAuth } from './AuthContext';

interface GameContextType {
  currentSession: GameSession | null;
  bossHp: number;
  bossMaxHp: number;
  playerHp: number;
  startGame: (mode: GameMode, difficulty: Difficulty) => void;
  submitAnswer: (answerIndex: number) => { correct: boolean; score: number; xp: number; coins: number; combo: number };
  nextQuestion: () => void;
  endGame: () => void;
  timeRemaining: number;
  setTimeRemaining: (t: number) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { user, updateProfile } = useAuth();
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [bossHp, setBossHp] = useState(100);
  const [bossMaxHp, setBossMaxHp] = useState(100);
  const [playerHp, setPlayerHp] = useState(100);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const startGame = useCallback((mode: GameMode, difficulty: Difficulty) => {
    if (!user) return;
    const session = createGameSession(user.id, mode, difficulty, mode === 'time_attack' ? 50 : 10);
    setCurrentSession(session);
    setTimeRemaining(mode === 'time_attack' ? 60 : session.questions[0]?.time_limit || 15);
    trackEvent('game_started', { mode, difficulty });

    if (mode === 'boss_battle') {
      const boss = getBossForDifficulty(difficulty);
      setBossMaxHp(boss.hp);
      setBossHp(boss.hp);
      setPlayerHp(100);
    }
  }, [user]);

  const submitAnswer = useCallback((answerIndex: number) => {
    if (!currentSession || currentSession.status !== 'playing') {
      return { correct: false, score: 0, xp: 0, coins: 0, combo: 0 };
    }

    const question = currentSession.questions[currentSession.current_question];
    const isCorrect = answerIndex === question.correct_answer;
    
    const { score, xp, coins, newCombo } = calculateScore(
      isCorrect,
      currentSession.combo,
      timeRemaining,
      currentSession.difficulty
    );

    let newLives = currentSession.lives;
    let newBossHp = bossHp;
    let newPlayerHp = playerHp;

    if (currentSession.game_mode === 'boss_battle') {
      const { bossDamage, playerDamage } = calculateBossDamage(isCorrect, currentSession.combo);
      newBossHp = Math.max(0, bossHp - bossDamage);
      newPlayerHp = Math.max(0, playerHp - playerDamage);
      setBossHp(newBossHp);
      setPlayerHp(newPlayerHp);
    }

    if (currentSession.game_mode === 'survival' && !isCorrect) {
      newLives = currentSession.lives - 1;
    }

    const updatedSession = {
      ...currentSession,
      score: currentSession.score + score,
      xp_earned: currentSession.xp_earned + xp,
      coins_earned: currentSession.coins_earned + coins,
      combo: newCombo,
      max_combo: Math.max(currentSession.max_combo, newCombo),
      lives: newLives,
    };

    setCurrentSession(updatedSession);

    return { correct: isCorrect, score, xp, coins, combo: newCombo };
  }, [currentSession, timeRemaining, bossHp, playerHp]);

  const nextQuestion = useCallback(() => {
    if (!currentSession) return;

    const nextIdx = currentSession.current_question + 1;
    
    if (currentSession.game_mode === 'boss_battle' && bossHp <= 0) {
      endGame();
      return;
    }

    if (currentSession.game_mode === 'survival' && currentSession.lives <= 0) {
      endGame();
      return;
    }

    if (currentSession.game_mode === 'boss_battle' && playerHp <= 0) {
      endGame();
      return;
    }

    if (nextIdx >= currentSession.questions.length && currentSession.game_mode !== 'time_attack' && currentSession.game_mode !== 'survival') {
      endGame();
      return;
    }

    setCurrentSession({
      ...currentSession,
      current_question: nextIdx,
    });

    if (currentSession.game_mode !== 'time_attack') {
      const nextQuestion = currentSession.questions[nextIdx];
      setTimeRemaining(nextQuestion?.time_limit || 15);
    }
  }, [currentSession, bossHp, playerHp]);

  const endGame = useCallback(() => {
    if (!currentSession) return;

    const correctAnswers = currentSession.current_question + 1;
    const totalXP = calculateXPReward(
      currentSession.game_mode,
      currentSession.score,
      correctAnswers,
      currentSession.questions.length,
      currentSession.max_combo
    );
    const totalCoins = calculateCoinsReward(currentSession.score, currentSession.max_combo);

    const finalSession = {
      ...currentSession,
      xp_earned: totalXP,
      coins_earned: totalCoins,
      status: 'completed' as const,
      end_time: new Date().toISOString(),
    };

    setCurrentSession(finalSession);
    trackEvent('game_finished', {
      mode: currentSession.game_mode,
      score: finalSession.score,
      xp: totalXP,
      coins: totalCoins,
    });

    // Update user profile
    if (user) {
      updateProfile({
        xp: user.xp + totalXP,
        coins: user.coins + totalCoins,
        level: user.level,
        last_active: new Date().toISOString(),
      });
    }
  }, [currentSession, user, updateProfile]);

  return (
    <GameContext.Provider value={{
      currentSession,
      bossHp,
      bossMaxHp,
      playerHp,
      startGame,
      submitAnswer,
      nextQuestion,
      endGame,
      timeRemaining,
      setTimeRemaining,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}
