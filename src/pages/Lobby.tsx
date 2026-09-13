import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { AppLayout } from '../components/layout';
import { Button, Card, XPBar, Avatar, Badge, Modal } from '../components/ui';
import { getLevelInfo } from '../lib/mockData';
import { GameMode, Difficulty } from '../lib/supabase';

export default function LobbyPage() {
  const { user } = useAuth();
  const { startGame } = useGame();
  const navigate = useNavigate();
  const [showModeSelect, setShowModeSelect] = useState(false);
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);

  if (!user) return null;

  const levelInfo = getLevelInfo(user.xp);

  const modes = [
    { id: 'quick_rush' as GameMode, icon: '⚡', name: 'Quick Rush', desc: '10 preguntas rápidas', color: 'from-rush-orange/20 to-rush-yellow/20' },
    { id: 'time_attack' as GameMode, icon: '🔥', name: 'Time Attack', desc: 'Contra el reloj', color: 'from-red-500/20 to-rush-orange/20' },
    { id: 'boss_battle' as GameMode, icon: '💀', name: 'Boss Battle', desc: 'Derrota al jefe', color: 'from-rush-purple/20 to-rush-blue/20' },
    { id: 'survival' as GameMode, icon: '♾️', name: 'Survival', desc: 'Sobrevive con 5 vidas', color: 'from-rush-green/20 to-rush-blue/20' },
    { id: 'duel' as GameMode, icon: '⚔️', name: 'Duelo', desc: 'VS otro jugador', color: 'from-rush-yellow/20 to-rush-green/20' },
  ];

  const difficulties: { value: Difficulty; label: string; emoji: string }[] = [
    { value: 'principiante', label: 'Principiante', emoji: '🌱' },
    { value: 'basico', label: 'Básico', emoji: '📗' },
    { value: 'intermedio', label: 'Intermedio', emoji: '📘' },
    { value: 'avanzado', label: 'Avanzado', emoji: '🔥' },
  ];

  function handleModeSelect(mode: GameMode) {
    setSelectedMode(mode);
    setShowModeSelect(false);
    setShowDifficulty(true);
  }

  function handleDifficultySelect(difficulty: Difficulty) {
    if (!selectedMode) return;
    setShowDifficulty(false);
    startGame(selectedMode, difficulty);
    navigate(`/app/game/${selectedMode}`);
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Avatar name={user.nickname} level={levelInfo.level} size="lg" />
            <div>
              <h2 className="font-bold text-lg">{user.nickname}</h2>
              <Badge color="orange">Nv. {levelInfo.level} — {levelInfo.name}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-rush-yellow">🪙 {user.coins.toLocaleString()}</p>
              <p className="text-xs text-rush-purple-light">💎 {user.gems}</p>
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <XPBar current={user.xp} max={levelInfo.nextLevelXp} level={levelInfo.level} name={levelInfo.name} className="mb-6" />

        {/* Streak */}
        <motion.div
          className="card-glass rounded-xl p-3 mb-6 flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="font-bold text-sm">Racha: {user.streak} días</p>
              <p className="text-xs text-gray-400">¡Sigue así!</p>
            </div>
          </div>
          <Badge color="orange">Activo</Badge>
        </motion.div>

        {/* RUSH NOW Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowModeSelect(true)}
          className="w-full bg-gradient-to-r from-rush-orange to-rush-orange-dark rounded-2xl p-6 mb-4 shadow-lg shadow-rush-orange/30 animate-pulse-glow"
        >
          <span className="text-4xl mb-2 block">⚡</span>
          <h2 className="font-display text-2xl font-black">RUSH NOW</h2>
          <p className="text-white/70 text-sm mt-1">¿Cómo quieres entrenar?</p>
        </motion.button>

        {/* Scan Button */}
        <Link to="/app/scan">
          <button className="w-full card-glass rounded-2xl p-4 mb-6 flex items-center gap-4 hover:border-rush-purple/50 transition-all">
            <span className="text-3xl">📸</span>
            <div className="text-left">
              <p className="font-bold">ESCANEAR EJERCICIO</p>
              <p className="text-xs text-gray-400">Convierte tu tarea en un juego</p>
            </div>
            <span className="ml-auto text-gray-500">→</span>
          </button>
        </Link>

        {/* Daily Mission */}
        <Card className="mb-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xl">🎯</span>
            <h3 className="font-bold text-sm">Misión Diaria</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Completa 3 partidas</span>
              <Badge color="green">1/3</Badge>
            </div>
            <div className="w-full h-2 bg-rush-darker rounded-full overflow-hidden">
              <div className="h-full bg-rush-green rounded-full w-1/3" />
            </div>
            <p className="text-xs text-gray-500">Recompensa: +50 XP, +25 🪙</p>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="text-center p-3">
            <p className="text-xl font-bold text-rush-orange">12</p>
            <p className="text-xs text-gray-400">Partidas</p>
          </Card>
          <Card className="text-center p-3">
            <p className="text-xl font-bold text-rush-green">78%</p>
            <p className="text-xs text-gray-400">Aciertos</p>
          </Card>
          <Card className="text-center p-3">
            <p className="text-xl font-bold text-rush-purple">x5</p>
            <p className="text-xs text-gray-400">Mejor combo</p>
          </Card>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/app/library">
            <Card className="p-4 hover:border-rush-blue/50 transition-all cursor-pointer text-center">
              <span className="text-2xl mb-1 block">📚</span>
              <p className="text-sm font-medium">Biblioteca</p>
            </Card>
          </Link>
          <Link to="/app/ai-lab">
            <Card className="p-4 hover:border-rush-purple/50 transition-all cursor-pointer text-center">
              <span className="text-2xl mb-1 block">🤖</span>
              <p className="text-sm font-medium">Lab IA</p>
            </Card>
          </Link>
        </div>
      </div>

      {/* Mode Selection Modal */}
      <Modal isOpen={showModeSelect} onClose={() => setShowModeSelect(false)} title="¿Cómo quieres entrenar?">
        <div className="space-y-3">
          {modes.map(mode => (
            <button
              key={mode.id}
              onClick={() => handleModeSelect(mode.id)}
              className={`w-full p-4 rounded-xl border-2 border-rush-purple/20 bg-gradient-to-r ${mode.color} flex items-center gap-4 text-left hover:border-rush-orange/50 transition-all`}
            >
              <span className="text-3xl">{mode.icon}</span>
              <div>
                <p className="font-bold">{mode.name}</p>
                <p className="text-xs text-gray-400">{mode.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </Modal>

      {/* Difficulty Selection Modal */}
      <Modal isOpen={showDifficulty} onClose={() => setShowDifficulty(false)} title="Elige la dificultad">
        <div className="space-y-3">
          {difficulties.map(d => (
            <button
              key={d.value}
              onClick={() => handleDifficultySelect(d.value)}
              className="w-full p-4 rounded-xl border-2 border-rush-purple/20 flex items-center gap-4 text-left hover:border-rush-orange/50 transition-all"
            >
              <span className="text-2xl">{d.emoji}</span>
              <span className="font-medium">{d.label}</span>
            </button>
          ))}
        </div>
      </Modal>
    </AppLayout>
  );
}
