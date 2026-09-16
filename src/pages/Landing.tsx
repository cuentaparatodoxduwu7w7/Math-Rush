import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Modal } from '../components/ui';

// ============================================================
// LANDING PAGE
// ============================================================

function FloatingNumbers() {
  const numbers = ['+', '×', '÷', '−', '=', 'π', '∑', '√', '%', '∞', 'x²', 'Δ'];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {numbers.map((n, i) => (
        <motion.span
          key={i}
          className="absolute text-rush-purple/20 font-bold select-none"
          style={{
            fontSize: `${Math.random() * 30 + 20}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.3, 0.1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        >
          {n}
        </motion.span>
      ))}
    </div>
  );
}

function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-rush-orange rounded-full"
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
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}
    </div>
  );
}

// ============================================================
// INTERACTIVE DEMO MODAL
// ============================================================
function InteractiveDemoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const demoSteps = [
    {
      title: 'Landing Page',
      description: 'Bienvenida impactante con llamado a la acción',
      icon: '🏠',
      color: 'from-rush-orange to-rush-yellow',
      visual: (
        <div className="relative w-full h-full bg-gradient-to-br from-rush-dark via-rush-purple/20 to-rush-dark flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl mb-4"
            >
              🐹
            </motion.div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-rush-orange to-rush-yellow bg-clip-text text-transparent">
              MATH RUSH
            </h2>
            <p className="text-gray-400 mt-2">Aprende. Juega. Supera tus límites.</p>
          </motion.div>
        </div>
      ),
    },
    {
      title: 'Lobby',
      description: 'Menú principal estilo videojuego',
      icon: '🎮',
      color: 'from-rush-purple to-rush-blue',
      visual: (
        <div className="relative w-full h-full bg-gradient-to-br from-rush-dark to-rush-purple/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-rush-orange to-rush-yellow rounded-full flex items-center justify-center text-3xl">
              🐹
            </div>
            <div>
              <p className="font-bold text-lg">CuyGamer</p>
              <p className="text-xs text-gray-400">Nivel 12 · Novato</p>
            </div>
          </div>
          <div className="bg-rush-card/50 rounded-xl p-4 mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>XP</span>
              <span>3200/5000</span>
            </div>
            <div className="w-full h-2 bg-rush-darker rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '64%' }}
                transition={{ duration: 1 }}
                className="h-full bg-gradient-to-r from-rush-orange to-rush-yellow"
              />
            </div>
          </div>
          <motion.button
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-full bg-gradient-to-r from-rush-orange to-rush-orange-dark rounded-xl p-4 text-center"
          >
            <span className="text-2xl">⚡</span>
            <p className="font-bold mt-1">RUSH NOW</p>
          </motion.button>
        </div>
      ),
    },
    {
      title: 'Escáner',
      description: 'Convierte fotos en ejercicios',
      icon: '📸',
      color: 'from-rush-blue to-rush-purple',
      visual: (
        <div className="relative w-full h-full bg-gradient-to-br from-rush-dark to-rush-blue/30 p-6 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring' }}
            className="w-32 h-32 bg-gradient-to-br from-rush-blue to-rush-purple rounded-2xl flex items-center justify-center mb-4"
          >
            <span className="text-6xl">📸</span>
          </motion.div>
          <p className="text-center font-bold text-lg">Escanea tu ejercicio</p>
          <p className="text-center text-sm text-gray-400 mt-2">Toma una foto o sube una imagen</p>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="mt-4 px-6 py-2 bg-rush-blue/20 border border-rush-blue/50 rounded-full text-sm"
          >
            Procesando con IA...
          </motion.div>
        </div>
      ),
    },
    {
      title: 'Ejercicio',
      description: 'Problema matemático detectado',
      icon: '📝',
      color: 'from-rush-green to-rush-blue',
      visual: (
        <div className="relative w-full h-full bg-gradient-to-br from-rush-dark to-rush-green/20 p-6">
          <div className="bg-rush-card/80 rounded-xl p-6 mb-4">
            <p className="text-xs text-rush-green mb-2">Ejercicio detectado</p>
            <p className="text-lg font-bold mb-4">Resuelve la ecuación:</p>
            <div className="bg-rush-darker rounded-lg p-4 text-center">
              <p className="text-2xl font-mono">3x + 7 = 22</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['x = 3', 'x = 5', 'x = 7', 'x = 4'].map((option, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-rush-card/50 border border-rush-purple/30 rounded-lg p-3 text-center text-sm"
              >
                {option}
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Conversión a Juego',
      description: 'El ejercicio se transforma en desafío',
      icon: '✨',
      color: 'from-rush-yellow to-rush-orange',
      visual: (
        <div className="relative w-full h-full bg-gradient-to-br from-rush-dark to-rush-yellow/20 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-8xl mb-4 inline-block"
            >
              ✨
            </motion.div>
            <p className="text-xl font-bold mb-2">¡Ejercicio convertido!</p>
            <p className="text-sm text-gray-400">Listo para jugar</p>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="mt-4 inline-block px-6 py-2 bg-gradient-to-r from-rush-yellow to-rush-orange rounded-full font-bold"
            >
              ⚡ Quick Rush
            </motion.div>
          </motion.div>
        </div>
      ),
    },
    {
      title: 'Quick Rush',
      description: '10 preguntas rápidas',
      icon: '⚡',
      color: 'from-rush-orange to-rush-red',
      visual: (
        <div className="relative w-full h-full bg-gradient-to-br from-rush-dark to-rush-orange/30 p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="bg-rush-card/80 rounded-lg px-3 py-1">
              <p className="text-xs text-gray-400">Pregunta</p>
              <p className="font-bold">3/10</p>
            </div>
            <div className="bg-rush-card/80 rounded-lg px-3 py-1">
              <p className="text-xs text-gray-400">Tiempo</p>
              <p className="font-bold text-rush-orange">0:45</p>
            </div>
          </div>
          <div className="bg-rush-card/80 rounded-xl p-6 mb-4">
            <p className="text-lg font-bold text-center">¿Cuánto es 15 × 8?</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {['100', '120', '115', '130'].map((option, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                className="bg-rush-card/50 border-2 border-rush-purple/30 rounded-lg p-4 text-center font-bold"
              >
                {option}
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Respuesta Correcta',
      description: 'Feedback inmediato y recompensas',
      icon: '✅',
      color: 'from-rush-green to-rush-blue',
      visual: (
        <div className="relative w-full h-full bg-gradient-to-br from-rush-dark to-rush-green/30 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            className="text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: 3 }}
              className="text-8xl mb-4"
            >
              ✅
            </motion.div>
            <p className="text-2xl font-bold text-rush-green mb-4">¡Correcto!</p>
            <div className="flex gap-4 justify-center">
              <div className="bg-rush-card/80 rounded-lg px-4 py-2">
                <p className="text-xs text-gray-400">XP</p>
                <p className="font-bold text-rush-purple">+50</p>
              </div>
              <div className="bg-rush-card/80 rounded-lg px-4 py-2">
                <p className="text-xs text-gray-400">Monedas</p>
                <p className="font-bold text-rush-yellow">+25</p>
              </div>
              <div className="bg-rush-card/80 rounded-lg px-4 py-2">
                <p className="text-xs text-gray-400">Combo</p>
                <p className="font-bold text-rush-orange">x3</p>
              </div>
            </div>
          </motion.div>
        </div>
      ),
    },
    {
      title: 'Cuy Sabio',
      description: 'IA educativa que te ayuda',
      icon: '🐹',
      color: 'from-rush-purple to-rush-pink',
      visual: (
        <div className="relative w-full h-full bg-gradient-to-br from-rush-dark to-rush-purple/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-rush-purple to-rush-pink rounded-full flex items-center justify-center text-3xl">
              🐹
            </div>
            <div>
              <p className="font-bold">Cuy Sabio</p>
              <p className="text-xs text-gray-400">Asistente IA</p>
            </div>
          </div>
          <div className="bg-rush-card/80 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-300">
              "Para resolver 3x + 7 = 22, primero resta 7 de ambos lados..."
            </p>
          </div>
          <div className="space-y-2">
            {['💡 Dame una pista', '📚 Explícame', '🧠 Paso a paso'].map((btn, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="bg-rush-purple/20 border border-rush-purple/50 rounded-lg p-3 text-sm"
              >
                {btn}
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Progreso',
      description: 'Estadísticas y logros',
      icon: '📊',
      color: 'from-rush-blue to-rush-cyan',
      visual: (
        <div className="relative w-full h-full bg-gradient-to-br from-rush-dark to-rush-blue/30 p-6">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Partidas', value: '47', color: 'text-rush-orange' },
              { label: 'Aciertos', value: '78%', color: 'text-rush-green' },
              { label: 'Mejor combo', value: 'x12', color: 'text-rush-purple' },
              { label: 'Racha', value: '🔥 5', color: 'text-rush-yellow' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-rush-card/80 rounded-xl p-4 text-center"
              >
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
          <div className="bg-rush-card/80 rounded-xl p-4">
            <p className="text-sm font-bold mb-2">Actividad Semanal</p>
            <div className="flex items-end justify-between h-20 gap-2">
              {[40, 60, 30, 80, 50, 90, 70].map((height, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.1 }}
                  className="flex-1 bg-gradient-to-t from-rush-orange to-rush-yellow rounded-t"
                />
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tienda',
      description: 'Personaliza tu experiencia',
      icon: '🛒',
      color: 'from-rush-yellow to-rush-orange',
      visual: (
        <div className="relative w-full h-full bg-gradient-to-br from-rush-dark to-rush-yellow/20 p-6">
          <div className="flex justify-between items-center mb-4">
            <p className="font-bold text-lg">🛒 Tienda</p>
            <div className="flex gap-2">
              <div className="bg-rush-card/80 rounded-lg px-2 py-1 text-xs">
                🪙 1450
              </div>
              <div className="bg-rush-card/80 rounded-lg px-2 py-1 text-xs">
                💎 15
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'Cuy Gamer', price: '500', icon: '🐹' },
              { name: 'Cuy Dorado', price: '2000', icon: '👑' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="bg-rush-card/80 rounded-xl p-3"
              >
                <div className="text-4xl text-center mb-2">{item.icon}</div>
                <p className="text-xs font-bold text-center">{item.name}</p>
                <p className="text-xs text-center text-rush-yellow mt-1">🪙 {item.price}</p>
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Laboratorio IA',
      description: 'Crea contenido con IA',
      icon: '🤖',
      color: 'from-rush-purple to-rush-blue',
      visual: (
        <div className="relative w-full h-full bg-gradient-to-br from-rush-dark to-rush-purple/30 p-6">
          <p className="font-bold text-lg mb-4">🤖 Laboratorio IA</p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { icon: '🎨', label: 'Mundo' },
              { icon: '🎵', label: 'Audio' },
              { icon: '🐹', label: 'Mascota' },
            ].map((tool, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-rush-card/80 rounded-xl p-3 text-center"
              >
                <div className="text-3xl mb-1">{tool.icon}</div>
                <p className="text-xs">{tool.label}</p>
              </motion.div>
            ))}
          </div>
          <div className="bg-rush-card/80 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-2">Generando mundo...</p>
            <div className="w-full h-2 bg-rush-darker rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '75%' }}
                transition={{ duration: 2 }}
                className="h-full bg-gradient-to-r from-rush-purple to-rush-blue"
              />
            </div>
            <p className="text-xs text-rush-purple mt-2 text-right">75%</p>
          </div>
        </div>
      ),
    },
    {
      title: '¡Comienza Ahora!',
      description: 'Únete a Math Rush',
      icon: '⚡',
      color: 'from-rush-orange to-rush-yellow',
      visual: (
        <div className="relative w-full h-full bg-gradient-to-br from-rush-dark via-rush-orange/20 to-rush-dark flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl mb-4"
            >
              ⚡
            </motion.div>
            <h2 className="text-3xl font-black bg-gradient-to-r from-rush-orange to-rush-yellow bg-clip-text text-transparent mb-2">
              ¿Listo para el Rush?
            </h2>
            <p className="text-gray-400 mb-6">Aprende matemática jugando</p>
            <motion.button
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="px-8 py-3 bg-gradient-to-r from-rush-orange to-rush-orange-dark rounded-full font-bold shadow-lg shadow-rush-orange/50"
            >
              COMENZAR AHORA
            </motion.button>
          </motion.div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentStep < demoSteps.length - 1) {
            setCurrentStep((s) => s + 1);
            return 0;
          } else {
            setIsPlaying(false);
            return 100;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, currentStep, demoSteps.length]);

  const handlePlay = () => {
    if (currentStep === demoSteps.length - 1 && progress === 100) {
      setCurrentStep(0);
      setProgress(0);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep((s) => s + 1);
      setProgress(0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      setProgress(0);
    }
  };

  const handleClose = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setProgress(0);
    onClose();
  };

  if (!isOpen) return null;

  const currentDemoStep = demoSteps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-5xl bg-gradient-to-br from-rush-dark to-rush-purple/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="relative p-6 border-b border-rush-purple/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold bg-gradient-to-r from-rush-orange to-rush-yellow bg-clip-text text-transparent">
                Así funciona Math Rush
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Paso {currentStep + 1} de {demoSteps.length}: {currentDemoStep.title}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 bg-rush-card/50 hover:bg-rush-card rounded-full flex items-center justify-center transition-colors"
            >
              <span className="text-xl">✕</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Preview */}
            <div className="lg:col-span-2">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-rush-darker border-2 border-rush-purple/30">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                  >
                    {currentDemoStep.visual}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full h-2 bg-rush-darker rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-rush-orange to-rush-yellow"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Info Panel */}
            <div className="space-y-4">
              <div className="bg-rush-card/50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${currentDemoStep.color} rounded-xl flex items-center justify-center text-2xl`}>
                    {currentDemoStep.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{currentDemoStep.title}</h3>
                    <p className="text-xs text-gray-400">{currentDemoStep.description}</p>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="bg-rush-card/50 rounded-xl p-4">
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="w-10 h-10 bg-rush-darker hover:bg-rush-purple/30 disabled:opacity-30 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
                  >
                    <span>⏮</span>
                  </button>
                  {isPlaying ? (
                    <button
                      onClick={handlePause}
                      className="w-14 h-14 bg-gradient-to-br from-rush-orange to-rush-orange-dark hover:scale-105 rounded-full flex items-center justify-center transition-transform shadow-lg shadow-rush-orange/50"
                    >
                      <span className="text-2xl">⏸</span>
                    </button>
                  ) : (
                    <button
                      onClick={handlePlay}
                      className="w-14 h-14 bg-gradient-to-br from-rush-orange to-rush-orange-dark hover:scale-105 rounded-full flex items-center justify-center transition-transform shadow-lg shadow-rush-orange/50"
                    >
                      <span className="text-2xl ml-1">▶</span>
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    disabled={currentStep === demoSteps.length - 1}
                    className="w-10 h-10 bg-rush-darker hover:bg-rush-purple/30 disabled:opacity-30 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
                  >
                    <span>⏭</span>
                  </button>
                </div>
              </div>

              {/* Steps Overview */}
              <div className="bg-rush-card/50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-3">Secuencia completa:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {demoSteps.map((step, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                        i === currentStep
                          ? 'bg-rush-orange/20 border border-rush-orange/50'
                          : i < currentStep
                          ? 'bg-rush-green/10 border border-rush-green/30'
                          : 'bg-rush-darker/50'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        i === currentStep
                          ? 'bg-rush-orange text-white'
                          : i < currentStep
                          ? 'bg-rush-green text-white'
                          : 'bg-rush-purple/30 text-gray-400'
                      }`}>
                        {i < currentStep ? '✓' : i + 1}
                      </div>
                      <span className="text-xs">{step.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-rush-purple/20 bg-rush-darker/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              ¿Te gusta lo que ves?
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose}>
                Cerrar
              </Button>
              <Link to="/register">
                <Button variant="primary">
                  ⚡ Comenzar Ahora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Landing() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-rush-dark overflow-hidden">
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 hero-gradient">
        <FloatingNumbers />
        <Particles />
        
        {/* Speed lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-rush-orange/30 to-transparent"
              style={{
                width: `${Math.random() * 200 + 100}px`,
                top: `${Math.random() * 100}%`,
                left: '-200px',
              }}
              animate={{ x: ['0vw', '120vw'] }}
              transition={{ duration: Math.random() * 2 + 1, repeat: Infinity, delay: Math.random() * 3 }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-4xl"
        >
          {/* Mascots */}
          <div className="flex justify-center gap-4 mb-6">
            <motion.span
              className="text-6xl md:text-7xl"
              animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🐹
            </motion.span>
            <motion.span
              className="text-5xl md:text-6xl"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            >
              🦙
            </motion.span>
          </div>

          {/* Title */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black mb-4">
            <span className="bg-gradient-to-r from-rush-orange via-rush-yellow to-rush-orange bg-clip-text text-transparent">
              MATH
            </span>
            <span className="text-white ml-3">RUSH</span>
          </h1>

          {/* Slogan */}
          <p className="text-xl md:text-2xl font-bold text-rush-purple-light mb-3">
            Aprende. Juega. Supera tus límites.
          </p>
          <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto mb-8">
            Convierte tus ejercicios de matemática en desafíos, carreras y batallas.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="primary" size="xl" className="w-full sm:w-auto animate-pulse-glow">
                ⚡ EMPEZAR GRATIS
              </Button>
            </Link>
            <Button variant="outline" size="xl" className="w-full sm:w-auto" onClick={() => setShowDemo(true)}>
              ▶ VER CÓMO FUNCIONA
            </Button>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-10">
            <div className="text-center">
              <p className="text-2xl font-black text-rush-orange">5</p>
              <p className="text-xs text-gray-400">Modos de juego</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-rush-purple">IA</p>
              <p className="text-xs text-gray-400">Cuy Sabio</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-rush-yellow">∞</p>
              <p className="text-xs text-gray-400">Desafíos</p>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-gray-500 text-2xl">↓</span>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-3xl md:text-4xl font-display font-bold text-center mb-12"
          >
            ¿Cómo <span className="text-rush-orange">funciona</span>?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: '1', icon: '📸', title: 'ESCANEA', desc: 'Fotografía tu ejercicio' },
              { step: '2', icon: '🤖', title: 'CONVIERTE', desc: 'La IA lo transforma' },
              { step: '3', icon: '🎮', title: 'JUEGA', desc: 'Enfrenta desafíos' },
              { step: '4', icon: '🧠', title: 'APRENDE', desc: 'Entiende paso a paso' },
              { step: '5', icon: '📈', title: 'MEJORA', desc: 'Sube de nivel' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card-glass rounded-2xl p-5 text-center relative"
              >
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-rush-orange rounded-full flex items-center justify-center text-sm font-bold">
                  {item.step}
                </div>
                <span className="text-4xl mb-3 block">{item.icon}</span>
                <h3 className="font-bold text-rush-orange text-sm mb-1">{item.title}</h3>
                <p className="text-gray-400 text-xs">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GAME MODES */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-rush-card/30 to-transparent">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">
            Modos de <span className="text-rush-purple">Juego</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '⚡', name: 'Quick Rush', desc: '10 preguntas rápidas. Ideal para practicar.', color: 'from-rush-orange/20 to-rush-yellow/20' },
              { icon: '🔥', name: 'Time Attack', desc: 'Resuelve todas las que puedas contra el reloj.', color: 'from-red-500/20 to-rush-orange/20' },
              { icon: '💀', name: 'Boss Battle', desc: 'Enfrenta al jefe usando matemáticas.', color: 'from-rush-purple/20 to-rush-blue/20' },
              { icon: '♾️', name: 'Survival', desc: '5 vidas. ¿Cuánto puedes sobrevivir?', color: 'from-rush-green/20 to-rush-blue/20' },
              { icon: '⚔️', name: 'Duelo', desc: 'Compite contra otros jugadores en tiempo real.', color: 'from-rush-yellow/20 to-rush-green/20' },
              { icon: '📸', name: 'Escáner IA', desc: 'Escanea ejercicios y conviértelos en juegos.', color: 'from-rush-blue/20 to-rush-purple/20' },
            ].map((mode, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`card-glass rounded-2xl p-6 bg-gradient-to-br ${mode.color} hover:scale-105 transition-transform cursor-pointer`}
              >
                <span className="text-4xl mb-3 block">{mode.icon}</span>
                <h3 className="font-bold text-lg mb-1">{mode.name}</h3>
                <p className="text-gray-400 text-sm">{mode.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI SECTION */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
          >
            <span className="text-6xl mb-4 block">🐹</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Conoce al <span className="text-rush-orange">Cuy Sabio</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Tu asistente de IA que te explica paso a paso, te da pistas y te ayuda a entender, no solo a responder.
            </p>
            <div className="card-glass rounded-2xl p-6 max-w-md mx-auto text-left">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🐹</span>
                <div>
                  <p className="font-bold text-sm">Cuy Sabio</p>
                  <p className="text-xs text-gray-400">"No pasa nada. Vamos paso a paso."</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="bg-rush-orange/10 rounded-lg p-3 text-sm">💡 Dame una pista</div>
                <div className="bg-rush-purple/10 rounded-lg p-3 text-sm">📚 Explícame</div>
                <div className="bg-rush-blue/10 rounded-lg p-3 text-sm">🧠 Muéstrame el procedimiento</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PLANS */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-rush-card/30 to-transparent">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">
            Elige tu <span className="text-rush-yellow">Plan</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'FREE', price: 'S/ 0', features: ['Juegos básicos', '3 escaneos/día'], cta: 'Empezar' },
              { name: 'RUSH', price: 'S/ 4.90', features: ['Cuy Sabio IA', '10 escaneos/día', 'Skins Premium'], cta: 'Elegir Rush', popular: true },
              { name: 'LEGEND', price: 'S/ 9.90', features: ['Todo incluido', 'Modo Pre-U', 'Simulacros'], cta: 'Ser Leyenda' },
              { name: 'TEACHER', price: 'S/ 19.90', features: ['Dashboard docente', 'Clases', 'Reportes'], cta: 'Para Docentes' },
            ].map((plan, i) => (
              <div key={i} className={`card-glass rounded-2xl p-5 text-center ${plan.popular ? 'border-2 border-rush-orange shadow-lg shadow-rush-orange/20' : ''}`}>
                {plan.popular && <span className="text-xs bg-rush-orange text-white px-2 py-0.5 rounded-full font-bold">POPULAR</span>}
                <h3 className="font-display font-bold text-lg mt-2">{plan.name}</h3>
                <p className="text-2xl font-black my-3">{plan.price}<span className="text-sm text-gray-400">/mes</span></p>
                <ul className="text-sm text-gray-400 space-y-1 mb-4">
                  {plan.features.map((f, j) => <li key={j}>✓ {f}</li>)}
                </ul>
                <Link to="/register">
                  <Button variant={plan.popular ? 'primary' : 'outline'} size="sm" className="w-full">{plan.cta}</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEACHERS */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-3xl font-display font-bold mb-4">
              Área para <span className="text-rush-blue">Docentes</span>
            </h2>
            <p className="text-gray-400 mb-6">
              Crea clases, asigna actividades personalizadas y monitorea el progreso de tus estudiantes en tiempo real.
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>✓ Crear clases con código de acceso</li>
              <li>✓ Asignar actividades por tema y dificultad</li>
              <li>✓ Dashboard con analíticas detalladas</li>
              <li>✓ Reportes de rendimiento por estudiante</li>
            </ul>
          </div>
          <div className="flex-1 card-glass rounded-2xl p-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-rush-blue/10 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-rush-blue">📊</p>
                <p className="text-xs text-gray-400 mt-1">Analíticas</p>
              </div>
              <div className="bg-rush-green/10 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-rush-green">📝</p>
                <p className="text-xs text-gray-400 mt-1">Actividades</p>
              </div>
              <div className="bg-rush-purple/10 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-rush-purple">👥</p>
                <p className="text-xs text-gray-400 mt-1">Clases</p>
              </div>
              <div className="bg-rush-orange/10 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-rush-orange">📈</p>
                <p className="text-xs text-gray-400 mt-1">Reportes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
          >
            <span className="text-6xl mb-4 block">⚡</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              ¿Listo para entrar al <span className="text-rush-orange">Rush</span>?
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Únete a miles de estudiantes que ya aprenden matemática jugando.
            </p>
            <Link to="/register">
              <Button variant="primary" size="xl" className="animate-pulse-glow">
                ⚡ COMENZAR AHORA
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-4 border-t border-rush-purple/20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐹</span>
            <span className="font-display font-bold text-rush-orange">Math Rush</span>
          </div>
          <p className="text-gray-500 text-sm">© 2024 Math Rush. Aprende. Juega. Supera tus límites.</p>
          <div className="flex gap-4">
            <Link to="/login" className="text-gray-400 hover:text-white text-sm">Iniciar sesión</Link>
            <Link to="/register" className="text-gray-400 hover:text-white text-sm">Registro</Link>
          </div>
        </div>
      </footer>

      {/* Interactive Demo Modal */}
      <InteractiveDemoModal isOpen={showDemo} onClose={() => setShowDemo(false)} />
    </div>
  );
}
