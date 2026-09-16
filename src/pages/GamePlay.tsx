import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { Button, Timer, Lives, ComboCounter, BossHealthBar, PlayerHealthBar, Card, Badge, Modal } from '../components/ui';
import { getBossForDifficulty } from '../lib/gameEngine';
import { mockAIRequest } from '../lib/gameEngine';
import { soundService } from '../services/soundService';

export default function GamePlayPage() {
  const { id: mode } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentSession, submitAnswer, nextQuestion, endGame, timeRemaining, setTimeRemaining, bossHp, bossMaxHp, playerHp } = useGame();
  const { user } = useAuth();
  const [isAnswering, setIsAnswering] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<{ correct: boolean; score: number; xp: number; coins: number; combo: number } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showCuySabio, setShowCuySabio] = useState(false);
  const [cuyMessage, setCuyMessage] = useState('');
  const [cuyLoading, setCuyLoading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(3);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown at start
  useEffect(() => {
    if (!currentSession || countdown === null) return;

    if (countdown > 0) {
      soundService.countdown();
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            soundService.rush();
            setTimeout(() => setCountdown(null), 500);
            return 0;
          }
          soundService.countdown();
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [currentSession, countdown]);

  // Timer
  useEffect(() => {
    if (!currentSession || currentSession.status !== 'playing' || isAnswering || showResult) return;
    if (mode === 'survival' || mode === 'boss_battle') return; // No timer for these

    timerRef.current = setInterval(() => {
      setTimeRemaining(timeRemaining - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeRemaining, currentSession, isAnswering, showResult, mode, setTimeRemaining]);

  // Time's up
  useEffect(() => {
    if (timeRemaining <= 0 && currentSession && !isAnswering && !showResult && mode !== 'survival' && mode !== 'boss_battle') {
      handleAnswer(-1); // Wrong answer on timeout
    }
  }, [timeRemaining]);

  const handleAnswer = useCallback((answerIndex: number) => {
    if (isAnswering || !currentSession) return;
    setIsAnswering(true);
    const result = submitAnswer(answerIndex);
    setLastAnswer(result);

    // Play sound based on answer
    if (result.correct) {
      soundService.correct();
      if (result.combo > 1) {
        setTimeout(() => soundService.combo(result.combo), 300);
      }
    } else {
      soundService.wrong();
    }

    setTimeout(() => {
      setIsAnswering(false);
      setLastAnswer(null);
      if (currentSession.game_mode === 'boss_battle' && bossHp <= 0) {
        soundService.victory();
        setShowResult(true);
        endGame();
      } else if (currentSession.game_mode === 'survival' && currentSession.lives <= 0) {
        setShowResult(true);
        endGame();
      } else {
        nextQuestion();
        if (mode !== 'survival' && mode !== 'boss_battle') {
          const nextQ = currentSession.questions[currentSession.current_question + 1];
          setTimeRemaining(nextQ?.time_limit || 15);
        }
      }
    }, 1500);
  }, [isAnswering, currentSession, submitAnswer, nextQuestion, endGame, bossHp, mode, setTimeRemaining]);

  // Calculate rank based on performance
  const calculateRank = (accuracy: number, maxCombo: number): { rank: string; color: string; emoji: string } => {
    if (accuracy >= 95 && maxCombo >= 8) return { rank: 'SS', color: 'from-yellow-400 to-orange-500', emoji: '👑' };
    if (accuracy >= 90 && maxCombo >= 6) return { rank: 'S', color: 'from-purple-500 to-pink-500', emoji: '⭐' };
    if (accuracy >= 80) return { rank: 'A', color: 'from-blue-500 to-cyan-500', emoji: '🎯' };
    if (accuracy >= 70) return { rank: 'B', color: 'from-green-500 to-emerald-500', emoji: '✓' };
    if (accuracy >= 60) return { rank: 'C', color: 'from-orange-500 to-amber-500', emoji: '👌' };
    return { rank: 'D', color: 'from-gray-500 to-gray-600', emoji: '💪' };
  };

  async function handleCuySabio(type: 'hint' | 'explanation' | 'step_by_step') {
    if (!currentSession) return;
    setCuyLoading(true);
    const question = currentSession.questions[currentSession.current_question];
    const message = await mockAIRequest(type, question);
    setCuyMessage(message);
    setCuyLoading(false);
    setShowCuySabio(true);
  }

  if (!currentSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="text-center p-8">
          <span className="text-5xl mb-4 block">🐹</span>
          <h2 className="text-xl font-bold mb-2">No hay partida activa</h2>
          <p className="text-gray-400 mb-4">Vuelve al lobby y empieza una nueva partida.</p>
          <Button variant="primary" onClick={() => navigate('/app')}>Volver al Lobby</Button>
        </Card>
      </div>
    );
  }

  const question = currentSession.questions[currentSession.current_question];
  const boss = currentSession.game_mode === 'boss_battle' ? getBossForDifficulty(currentSession.difficulty) : null;

  // Countdown Screen
  if (countdown !== null) {
    return (
      <div className="min-h-screen game-gradient flex items-center justify-center">
        <motion.div
          key={countdown}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 2, opacity: 0 }}
          className="text-center"
        >
          {countdown > 0 ? (
            <>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="text-9xl font-black bg-gradient-to-br from-rush-orange to-rush-yellow bg-clip-text text-transparent"
              >
                {countdown}
              </motion.div>
              <p className="text-2xl text-gray-400 mt-4">Prepárate...</p>
            </>
          ) : (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 0.8 }}
            >
              <div className="text-8xl font-black bg-gradient-to-br from-rush-orange via-rush-yellow to-rush-orange bg-clip-text text-transparent animate-pulse">
                ¡RUSH!
              </div>
              <motion.div
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="text-6xl mt-4"
              >
                ⚡
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  // Game Result Screen
  if (showResult || currentSession.status === 'completed') {
    const totalQuestions = currentSession.questions.length;
    const correctAnswers = Math.round((currentSession.score / 1000) * totalQuestions / 2); // Approximation
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const rankInfo = calculateRank(accuracy, currentSession.max_combo);

    return (
      <div className="min-h-screen flex items-center justify-center p-4 game-gradient relative overflow-hidden">
        {/* Background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-rush-orange/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="w-full max-w-2xl relative z-10"
        >
          <Card className="p-8 text-center card-elevated">
            {/* Title */}
            {currentSession.game_mode === 'boss_battle' && bossHp <= 0 ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                <span className="text-7xl mb-4 block">🏆</span>
                <h2 className="font-display text-4xl font-black bg-gradient-to-r from-rush-yellow to-rush-orange bg-clip-text text-transparent mb-2">
                  ¡BOSS DERROTADO!
                </h2>
              </motion.div>
            ) : currentSession.game_mode === 'survival' && currentSession.lives <= 0 ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                <span className="text-7xl mb-4 block">💀</span>
                <h2 className="font-display text-3xl font-black text-red-400 mb-2">RUN TERMINADA</h2>
              </motion.div>
            ) : (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                <span className="text-7xl mb-4 block">🎉</span>
                <h2 className="font-display text-4xl font-black bg-gradient-to-r from-rush-green to-emerald-500 bg-clip-text text-transparent mb-2">
                  ¡PARTIDA COMPLETADA!
                </h2>
              </motion.div>
            )}

            {/* Rank Display */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: 'spring', duration: 0.8 }}
              className="my-8"
            >
              <div className={`inline-block px-12 py-6 rounded-3xl bg-gradient-to-br ${rankInfo.color} shadow-2xl`}>
                <div className="text-6xl mb-2">{rankInfo.emoji}</div>
                <div className="text-7xl font-black text-white">{rankInfo.rank}</div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-rush-darker rounded-xl p-4"
              >
                <p className="text-3xl font-bold text-rush-orange">{currentSession.score.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Puntuación</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-rush-darker rounded-xl p-4"
              >
                <p className="text-3xl font-bold text-rush-green">{accuracy}%</p>
                <p className="text-xs text-gray-400 mt-1">Precisión</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-rush-darker rounded-xl p-4"
              >
                <p className="text-3xl font-bold text-rush-purple">+{currentSession.xp_earned}</p>
                <p className="text-xs text-gray-400 mt-1">XP Ganado</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-rush-darker rounded-xl p-4"
              >
                <p className="text-3xl font-bold text-rush-yellow">+{currentSession.coins_earned}</p>
                <p className="text-xs text-gray-400 mt-1">🪙 Monedas</p>
              </motion.div>
            </div>

            {/* Combo Display */}
            {currentSession.max_combo > 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
                className="bg-gradient-to-r from-rush-orange/20 to-rush-yellow/20 border border-rush-orange/30 rounded-xl p-4 mb-6"
              >
                <p className="text-sm text-gray-400 mb-1">Mejor Combo</p>
                <p className="text-4xl font-black text-rush-orange">x{currentSession.max_combo}</p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="space-y-3"
            >
              <Button variant="primary" size="lg" className="w-full" onClick={() => navigate('/app')}>
                ⚡ JUGAR OTRA VEZ
              </Button>
              <Button variant="outline" size="md" className="w-full" onClick={() => navigate('/app')}>
                VER EXPLICACIONES
              </Button>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="min-h-screen game-gradient flex flex-col">
      {/* Top Bar */}
      <div className="p-4 flex items-center justify-between">
        <button onClick={() => navigate('/app')} className="text-gray-400 hover:text-white text-sm">✕ Salir</button>
        <div className="flex items-center gap-3">
          <ComboCounter combo={currentSession.combo} />
          <Badge color="orange">{currentSession.score.toLocaleString()} pts</Badge>
        </div>
        {mode !== 'survival' && mode !== 'boss_battle' && (
          <Timer seconds={timeRemaining} total={question.time_limit} />
        )}
        {mode === 'survival' && <Lives count={currentSession.lives} />}
      </div>

      {/* Boss Battle UI */}
      {currentSession.game_mode === 'boss_battle' && boss && (
        <div className="px-4 space-y-2 mb-4">
          <BossHealthBar current={bossHp} max={bossMaxHp} name={boss.name} emoji={boss.emoji} />
          <PlayerHealthBar current={playerHp} />
        </div>
      )}

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSession.current_question}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
            {/* Question Card */}
            <Card className={`p-6 mb-6 text-center ${lastAnswer ? (lastAnswer.correct ? 'border-rush-green/50' : 'border-red-500/50 animate-shake') : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <Badge color="purple">{question.topic}</Badge>
                <span className="text-xs text-gray-500">{currentSession.current_question + 1}/{currentSession.questions.length}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold leading-relaxed">{question.text}</h2>
            </Card>

            {/* Answer Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {question.options.map((option, i) => {
                let btnClass = 'border-rush-purple/30 hover:border-rush-orange/50 hover:bg-rush-orange/5';
                if (lastAnswer) {
                  if (i === question.correct_answer) btnClass = 'border-rush-green bg-rush-green/10 text-rush-green';
                  else if (i !== question.correct_answer && lastAnswer.correct === false) btnClass = 'border-red-500/50 bg-red-500/10 text-red-400';
                  else btnClass = 'border-rush-purple/20 opacity-50';
                }
                return (
                  <motion.button
                    key={i}
                    whileTap={!isAnswering ? { scale: 0.95 } : {}}
                    onClick={() => handleAnswer(i)}
                    disabled={isAnswering}
                    className={`p-4 rounded-xl border-2 text-left font-medium transition-all ${btnClass}`}
                  >
                    <span className="text-sm text-gray-500 mr-2">{String.fromCharCode(65 + i)}.</span>
                    {option}
                  </motion.button>
                );
              })}
            </div>

            {/* Feedback */}
            {lastAnswer && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`mt-4 p-6 rounded-2xl text-center ${
                  lastAnswer.correct 
                    ? 'bg-gradient-to-br from-rush-green/20 to-emerald-500/20 border-2 border-rush-green/50' 
                    : 'bg-gradient-to-br from-red-500/20 to-rose-500/20 border-2 border-red-500/50'
                }`}
              >
                {lastAnswer.correct ? (
                  <>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', duration: 0.5 }}
                      className="text-5xl mb-2"
                    >
                      ✓
                    </motion.div>
                    <p className="text-2xl font-black text-rush-green mb-2">¡CORRECTO!</p>
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <span className="text-rush-orange font-bold">+{lastAnswer.score} pts</span>
                      <span className="text-rush-purple font-bold">+{lastAnswer.xp} XP</span>
                      <span className="text-rush-yellow font-bold">+{lastAnswer.coins} 🪙</span>
                    </div>
                    {lastAnswer.combo > 1 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-3 inline-block px-4 py-2 bg-gradient-to-r from-rush-orange to-rush-yellow rounded-full"
                      >
                        <span className="text-white font-black">🔥 COMBO x{lastAnswer.combo}</span>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      transition={{ duration: 0.3 }}
                      className="text-5xl mb-2"
                    >
                      ✗
                    </motion.div>
                    <p className="text-2xl font-black text-red-400 mb-2">INCORRECTO</p>
                    <p className="text-sm text-gray-400">¡Sigue intentando!</p>
                  </>
                )}
              </motion.div>
            )}

            {/* Cuy Sabio Button */}
            {!isAnswering && !lastAnswer && (
              <div className="flex justify-center mt-4 gap-2">
                <button
                  onClick={() => handleCuySabio('hint')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-rush-orange/10 text-rush-orange hover:bg-rush-orange/20 transition-colors"
                >
                  💡 Pista
                </button>
                <button
                  onClick={() => handleCuySabio('explanation')}
                  className="text-xs px-3 py-1.5 rounded-lg bg-rush-purple/10 text-rush-purple-light hover:bg-rush-purple/20 transition-colors"
                >
                  📚 Explicación
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Cuy Sabio Modal */}
      <Modal isOpen={showCuySabio} onClose={() => setShowCuySabio(false)} title="🐹 Cuy Sabio">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🐹</span>
          <p className="text-sm text-gray-400 italic">"No pasa nada. Vamos paso a paso."</p>
        </div>
        {cuyLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin text-2xl">🐹</div>
            <p className="text-sm text-gray-400 mt-2">Pensando...</p>
          </div>
        ) : (
          <div className="bg-rush-darker rounded-xl p-4 text-sm text-gray-300 whitespace-pre-line">
            {cuyMessage}
          </div>
        )}
        <Button variant="primary" className="w-full mt-4" onClick={() => setShowCuySabio(false)}>Entendido</Button>
      </Modal>
    </div>
  );
}
