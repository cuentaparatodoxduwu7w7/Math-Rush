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
  const { user, isDeveloper } = useAuth();
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
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        {/* Hero Banner with Characters */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 rounded-3xl overflow-hidden card-elevated"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-rush-orange/20 via-rush-purple/10 to-rush-blue/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-rush-orange/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="relative p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Character Illustrations */}
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="relative"
                >
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-rush-orange to-rush-yellow flex items-center justify-center shadow-2xl glow-orange">
                    <img 
                      src="https://image.qwenlm.ai/generated-images/006bfac9-68a0-4b22-8ce8-5aa78504e096/_result.png"
                      alt="Cuy Matemático"
                      className="w-20 h-20 md:w-28 md:h-28 object-cover rounded-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<span class="text-5xl md:text-6xl">🐹</span>';
                      }}
                    />
                  </div>
                </motion.div>
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
                  className="relative hidden md:block"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rush-blue to-rush-purple flex items-center justify-center shadow-xl glow-purple">
                    <img 
                      src="https://image.qwenlm.ai/generated-images/4008da11-eb13-4253-b822-7c6ddae70000/_result.png"
                      alt="Llama Blanca"
                      className="w-16 h-16 object-cover rounded-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<span class="text-4xl">🦙</span>';
                      }}
                    />
                  </div>
                </motion.div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">
                  ¡Hola, <span className="bg-gradient-to-r from-rush-orange to-rush-yellow bg-clip-text text-transparent">{user.nickname}</span>!
                </h1>
                <p className="text-gray-300 mb-3">¿Listo para continuar tu aventura matemática?</p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <div className="flex items-center gap-2 bg-rush-yellow/20 px-3 py-1.5 rounded-full">
                    <span className="text-lg">🪙</span>
                    <span className="font-bold text-rush-yellow">{user.coins.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-rush-purple/20 px-3 py-1.5 rounded-full">
                    <span className="text-lg">💎</span>
                    <span className="font-bold text-rush-purple-light">{user.gems}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-rush-orange/20 px-3 py-1.5 rounded-full">
                    <span className="text-lg">🔥</span>
                    <span className="font-bold text-rush-orange">{user.streak} días</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Developer Banner */}
        {isDeveloper && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-gradient-to-r from-rush-orange/20 to-rush-purple/20 border border-rush-orange/30 rounded-xl p-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🛠️</span>
              <div className="flex-1">
                <p className="font-bold text-sm text-rush-orange">Modo Developer Activo</p>
                <p className="text-xs text-gray-400">Acceso completo a todas las funciones</p>
              </div>
              <Badge color="orange">DEV</Badge>
            </div>
          </motion.div>
        )}

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
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowModeSelect(true)}
          className="w-full rounded-3xl p-8 mb-6 relative overflow-hidden group"
          style={{
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #dc2626 100%)',
            boxShadow: '0 15px 50px rgba(249, 115, 22, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          }}
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/40 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -50, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-3"
            >
              ⚡
            </motion.div>
            <h2 className="font-display text-3xl md:text-4xl font-black mb-2">RUSH NOW</h2>
            <p className="text-white/90 text-base md:text-lg">¿Cómo quieres entrenar hoy?</p>
          </div>
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
