import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { Button, Timer, Lives, ComboCounter, BossHealthBar, PlayerHealthBar, Card, Badge, Modal } from '../components/ui';
import { getBossForDifficulty } from '../lib/gameEngine';
import { mockAIRequest } from '../lib/gameEngine';

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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

    setTimeout(() => {
      setIsAnswering(false);
      setLastAnswer(null);
      if (currentSession.game_mode === 'boss_battle' && bossHp <= 0) {
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

  // Game Result Screen
  if (showResult || currentSession.status === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 game-gradient">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md">
          <Card className="p-8 text-center">
            {currentSession.game_mode === 'boss_battle' && bossHp <= 0 ? (
              <>
                <span className="text-6xl mb-4 block">🏆</span>
                <h2 className="font-display text-3xl font-black text-rush-yellow mb-2">¡BOSS DERROTADO!</h2>
              </>
            ) : currentSession.game_mode === 'survival' && currentSession.lives <= 0 ? (
              <>
                <span className="text-6xl mb-4 block">💀</span>
                <h2 className="font-display text-2xl font-black text-red-400 mb-2">RUN TERMINADA</h2>
              </>
            ) : (
              <>
                <span className="text-6xl mb-4 block">🎉</span>
                <h2 className="font-display text-3xl font-black text-rush-green mb-2">¡PARTIDA COMPLETADA!</h2>
              </>
            )}

            <div className="grid grid-cols-2 gap-4 my-6">
              <div className="bg-rush-darker rounded-xl p-3">
                <p className="text-2xl font-bold text-rush-orange">{currentSession.score.toLocaleString()}</p>
                <p className="text-xs text-gray-400">Puntuación</p>
              </div>
              <div className="bg-rush-darker rounded-xl p-3">
                <p className="text-2xl font-bold text-rush-purple">+{currentSession.xp_earned}</p>
                <p className="text-xs text-gray-400">XP Ganado</p>
              </div>
              <div className="bg-rush-darker rounded-xl p-3">
                <p className="text-2xl font-bold text-rush-yellow">+{currentSession.coins_earned}</p>
                <p className="text-xs text-gray-400">🪙 Monedas</p>
              </div>
              <div className="bg-rush-darker rounded-xl p-3">
                <p className="text-2xl font-bold text-rush-orange">x{currentSession.max_combo}</p>
                <p className="text-xs text-gray-400">Mejor combo</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button variant="primary" size="lg" className="w-full" onClick={() => navigate('/app')}>
                ⚡ JUGAR OTRA VEZ
              </Button>
              <Button variant="outline" size="md" className="w-full" onClick={() => navigate('/app')}>
                VER EXPLICACIONES
              </Button>
            </div>
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-xl text-center ${lastAnswer.correct ? 'bg-rush-green/10 border border-rush-green/30' : 'bg-red-500/10 border border-red-500/30'}`}
              >
                <p className={`font-bold ${lastAnswer.correct ? 'text-rush-green' : 'text-red-400'}`}>
                  {lastAnswer.correct ? '✓ ¡Correcto!' : '✗ Incorrecto'}
                </p>
                {lastAnswer.correct && (
                  <p className="text-sm text-gray-400 mt-1">+{lastAnswer.score} pts · +{lastAnswer.xp} XP · +{lastAnswer.coins} 🪙</p>
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
