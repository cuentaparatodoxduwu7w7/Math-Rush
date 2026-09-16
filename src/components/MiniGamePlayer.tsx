// ============================================================
// Mini-Game Player Component
// ============================================================
// Renders AI-generated mini-games using existing Math-Rush components
// ============================================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MiniGameEngine, MiniGameState, GeneratedQuestion } from '../lib/minigame-engine';
import { MiniGameSchema } from '../lib/minigame-schema';
import { Card, Button, Badge, Timer, ComboCounter, XPBar } from '../components/ui';

interface MiniGamePlayerProps {
  schema: MiniGameSchema;
  onComplete: (results: {
    score: number;
    accuracy: number;
    xp: number;
    coins: number;
    gems: number;
  }) => void;
  onExit: () => void;
}

export default function MiniGamePlayer({ schema, onComplete, onExit }: MiniGamePlayerProps) {
  const [engine, setEngine] = useState<MiniGameEngine | null>(null);
  const [gameState, setGameState] = useState<MiniGameState | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean; score: number; combo: number } | null>(null);

  // Initialize engine
  useEffect(() => {
    try {
      const gameEngine = new MiniGameEngine(schema);
      setEngine(gameEngine);
      setGameState(gameEngine.getState());
      gameEngine.start();
    } catch (error) {
      console.error('Failed to initialize mini-game:', error);
      onExit();
    }
  }, [schema, onExit]);

  // Timer effect
  useEffect(() => {
    if (!engine || !gameState?.isPlaying) return;

    const interval = setInterval(() => {
      engine.updateTime(1);
      setGameState(engine.getState());

      if (engine.getState().isCompleted) {
        handleComplete();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [engine, gameState?.isPlaying]);

  const handleAnswer = (answerIndex: number) => {
    if (!engine || selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    const result = engine.submitAnswer(answerIndex);
    setFeedback(result);
    setShowFeedback(true);

    // Move to next question after delay
    setTimeout(() => {
      const hasNext = engine.nextQuestion();
      setGameState(engine.getState());
      setSelectedAnswer(null);
      setShowFeedback(false);
      setFeedback(null);

      if (!hasNext) {
        handleComplete();
      }
    }, 1500);
  };

  const handleComplete = () => {
    if (!engine) return;

    const state = engine.getState();
    const rewards = engine.getRewards();
    const accuracy = (state.score / (state.questions.length * 20)) * 100;

    onComplete({
      score: state.score,
      accuracy,
      xp: rewards.xp,
      coins: rewards.coins,
      gems: rewards.gems,
    });
  };

  if (!engine || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚙️</div>
          <p className="text-gray-400">Cargando mini-juego...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = engine.getCurrentQuestion();
  const progress = engine.getProgress();
  const config = engine.getGameTypeConfig();

  return (
    <div 
      className="min-h-screen p-4"
      style={{
        background: `linear-gradient(135deg, ${schema.theme.background} 0%, ${schema.theme.primary}20 100%)`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-white mb-1">
              {schema.name}
            </h1>
            <p className="text-sm text-white/70">{schema.description}</p>
          </div>
          <Button variant="ghost" onClick={onExit}>
            ✕ Salir
          </Button>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Timer */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⏱️</span>
              <span className="text-sm text-gray-400">Tiempo</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {Math.floor(gameState.timeRemaining / 60)}:{(gameState.timeRemaining % 60).toString().padStart(2, '0')}
            </p>
          </Card>

          {/* Score */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">⭐</span>
              <span className="text-sm text-gray-400">Puntuación</span>
            </div>
            <p className="text-2xl font-bold text-rush-yellow">{gameState.score}</p>
          </Card>

          {/* Progress */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📊</span>
              <span className="text-sm text-gray-400">Progreso</span>
            </div>
            <p className="text-2xl font-bold text-rush-orange">
              {progress.current}/{progress.total}
            </p>
          </Card>

          {/* Combo */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔥</span>
              <span className="text-sm text-gray-400">Combo</span>
            </div>
            <p className="text-2xl font-bold text-rush-purple">x{gameState.combo}</p>
          </Card>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-rush-orange to-rush-yellow rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress.percentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-8 mb-6">
              <div className="text-center">
                <div className="mb-4">
                  <Badge color="purple">
                    Pregunta {progress.current} de {progress.total}
                  </Badge>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
                  {currentQuestion.text}
                </h2>

                {/* Answer Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === currentQuestion.correctAnswer;
                    const showResult = showFeedback && (isSelected || isCorrect);

                    let buttonClass = 'border-2 border-white/20 hover:border-rush-orange/50 bg-white/5';
                    
                    if (showResult) {
                      if (isCorrect) {
                        buttonClass = 'border-2 border-rush-green bg-rush-green/20';
                      } else if (isSelected && !isCorrect) {
                        buttonClass = 'border-2 border-red-500 bg-red-500/20';
                      }
                    }

                    return (
                      <motion.button
                        key={index}
                        whileHover={!showFeedback ? { scale: 1.02 } : {}}
                        whileTap={!showFeedback ? { scale: 0.98 } : {}}
                        onClick={() => handleAnswer(index)}
                        disabled={showFeedback}
                        className={`p-6 rounded-xl text-xl font-bold text-white transition-all ${buttonClass}`}
                      >
                        <span className="text-sm text-white/50 mr-2">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        {option}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Feedback */}
        {showFeedback && feedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className={`p-6 ${feedback.correct ? 'bg-rush-green/10 border-rush-green/50' : 'bg-red-500/10 border-red-500/50'} border-2`}>
              <div className="text-center">
                <div className="text-4xl mb-2">
                  {feedback.correct ? '✅' : '❌'}
                </div>
                <p className={`text-xl font-bold mb-2 ${feedback.correct ? 'text-rush-green' : 'text-red-400'}`}>
                  {feedback.correct ? '¡Correcto!' : 'Incorrecto'}
                </p>
                {feedback.correct && (
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <span className="text-rush-orange">+{feedback.score} pts</span>
                    {feedback.combo > 1 && (
                      <span className="text-rush-purple">🔥 x{feedback.combo}</span>
                    )}
                  </div>
                )}
                {currentQuestion && (
                  <p className="text-sm text-gray-400 mt-3">
                    {currentQuestion.explanation}
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Game Type Specific UI */}
        {config.type === 'boss' && (
          <Card className="p-6 mb-6">
            <h3 className="font-bold text-white mb-4">⚔️ Boss Battle</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white">Boss HP</span>
                  <span className="text-red-400">{config.bossHealth}/{config.bossHealth}</span>
                </div>
                <div className="w-full h-4 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white">Player HP</span>
                  <span className="text-rush-green">{config.playerHealth}/{config.playerHealth}</span>
                </div>
                <div className="w-full h-4 bg-black/30 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rush-green to-green-400 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
