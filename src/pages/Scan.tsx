import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '../components/layout';
import { Button, Card, Badge } from '../components/ui';
import { soundService } from '../services/soundService';

// Ejercicios predeterminados para demo
const DEMO_EXERCISES = [
  {
    id: 1,
    topic: 'Álgebra',
    difficulty: 'Intermedia',
    question: 'Resuelve: 3x + 7 = 22',
    options: ['x = 3', 'x = 5', 'x = 7', 'x = 4'],
    correct: 1,
  },
  {
    id: 2,
    topic: 'Aritmética',
    difficulty: 'Básica',
    question: '¿Cuánto es 15 × 8?',
    options: ['100', '120', '115', '130'],
    correct: 1,
  },
  {
    id: 3,
    topic: 'Geometría',
    difficulty: 'Intermedia',
    question: 'Área de un triángulo con base 10 y altura 6',
    options: ['60', '30', '16', '36'],
    correct: 1,
  },
];

export default function ScanPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'transitioning' | 'failed'>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [detectedExercise, setDetectedExercise] = useState<typeof DEMO_EXERCISES[0] | null>(null);

  const processingMessages = [
    { progress: 25, message: 'Detectando números...' },
    { progress: 48, message: 'Identificando operación...' },
    { progress: 76, message: 'Analizando dificultad...' },
    { progress: 100, message: 'Preparando Rush...' },
  ];

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setStatus('failed');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setStatus('failed');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      simulateProcessing();
    };
    reader.readAsDataURL(file);
  }

  function simulateProcessing() {
    setStatus('uploading');
    soundService.click();
    
    setTimeout(() => {
      setStatus('processing');
      setProgress(0);
      
      // Simular progreso con mensajes
      processingMessages.forEach((item, index) => {
        setTimeout(() => {
          setProgress(item.progress);
          setCurrentMessage(item.message);
          soundService.countdown();
          
          // Al llegar al 100%, completar
          if (item.progress === 100) {
            setTimeout(() => {
              // Seleccionar ejercicio aleatorio
              const randomExercise = DEMO_EXERCISES[Math.floor(Math.random() * DEMO_EXERCISES.length)];
              setDetectedExercise(randomExercise);
              setStatus('completed');
              soundService.correct();
            }, 800);
          }
        }, index * 1200);
      });
    }, 1500);
  }

  function handleConvertToRush() {
    soundService.rush();
    setStatus('transitioning');
    
    // Transición animada antes de navegar al juego
    setTimeout(() => {
      navigate('/app/game/quick_rush');
    }, 2000);
  }

  function handleReset() {
    setStatus('idle');
    setPreview(null);
    setProgress(0);
    setCurrentMessage('');
    setDetectedExercise(null);
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-rush-orange to-rush-yellow bg-clip-text text-transparent">
            📸 Escanear Ejercicio
          </h1>
          <p className="text-gray-400">Convierte tu tarea en un desafío de juego</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Estado Idle - Pantalla Principal */}
          {status === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Área de Escaneo */}
              <label className="block cursor-pointer group">
                <div className="relative card-elevated rounded-3xl p-12 text-center border-2 border-dashed border-rush-purple/30 hover:border-rush-orange/50 transition-all overflow-hidden">
                  {/* Marco visual animado */}
                  <div className="absolute inset-4 border-2 border-rush-orange/20 rounded-2xl pointer-events-none">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-rush-orange rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-rush-orange rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-rush-orange rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-rush-orange rounded-br-lg" />
                  </div>

                  {/* Icono y texto */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-7xl mb-4 block">📷</span>
                  </motion.div>
                  <p className="font-bold text-xl mb-2">Escanea tu ejercicio</p>
                  <p className="text-sm text-gray-400 mb-6">Toma una foto o sube una imagen</p>
                  
                  <Button variant="primary" size="lg" className="relative z-10">
                    📸 ESCANEAR
                  </Button>
                  
                  <input 
                    type="file" 
                    accept="image/*,.pdf" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={handleFile} 
                    aria-label="Subir archivo" 
                  />
                </div>
              </label>

              {/* Opciones de entrada */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 text-center hover:border-rush-orange/50 transition-all cursor-pointer">
                  <span className="text-3xl mb-2 block">📷</span>
                  <p className="text-sm font-medium">Cámara</p>
                </Card>
                <Card className="p-4 text-center hover:border-rush-orange/50 transition-all cursor-pointer">
                  <span className="text-3xl mb-2 block">🖼️</span>
                  <p className="text-sm font-medium">Galería</p>
                </Card>
                <Card className="p-4 text-center hover:border-rush-orange/50 transition-all cursor-pointer">
                  <span className="text-3xl mb-2 block">📄</span>
                  <p className="text-sm font-medium">PDF</p>
                </Card>
              </div>

              {/* Info */}
              <div className="card-glass rounded-xl p-4">
                <p className="text-xs text-gray-500 text-center">
                  Formatos soportados: JPG, PNG, PDF · Máximo 10MB
                </p>
              </div>
            </motion.div>
          )}

          {/* Estado Uploading */}
          {status === 'uploading' && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="p-8 text-center card-elevated">
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  📤
                </motion.div>
                <p className="font-bold text-xl mb-2">Subiendo archivo...</p>
                <div className="w-full h-3 bg-rush-darker rounded-full mt-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '66%' }}
                    transition={{ duration: 1.5 }}
                    className="h-full bg-gradient-to-r from-rush-orange to-rush-yellow rounded-full"
                  />
                </div>
              </Card>
            </motion.div>
          )}

          {/* Estado Processing - Con línea láser */}
          {status === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="p-8 text-center card-elevated relative overflow-hidden">
                {/* Preview de imagen con línea láser */}
                {preview && (
                  <div className="relative mb-6 rounded-xl overflow-hidden">
                    <img src={preview} alt="Preview" className="w-full max-h-64 object-contain" />
                    
                    {/* Línea láser animada */}
                    <motion.div
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rush-orange to-transparent shadow-lg shadow-rush-orange/50"
                      animate={{
                        top: ['0%', '100%', '0%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                    
                    {/* Overlay oscuro */}
                    <div className="absolute inset-0 bg-black/40" />
                  </div>
                )}

                {/* Icono de análisis */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="text-6xl mb-4 inline-block"
                >
                  🤖
                </motion.div>

                {/* Mensaje actual */}
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentMessage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="font-bold text-xl mb-2"
                  >
                    {currentMessage || 'ANALIZANDO EJERCICIO...'}
                  </motion.p>
                </AnimatePresence>

                {/* Barra de progreso */}
                <div className="w-full h-4 bg-rush-darker rounded-full mt-6 overflow-hidden relative">
                  <motion.div
                    className="h-full bg-gradient-to-r from-rush-orange via-rush-yellow to-rush-orange rounded-full relative"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Efecto de brillo */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </motion.div>
                </div>

                {/* Porcentaje */}
                <motion.p
                  key={progress}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-black text-rush-orange mt-4"
                >
                  {progress}%
                </motion.p>
              </Card>
            </motion.div>
          )}

          {/* Estado Completed - Resultado */}
          {status === 'completed' && detectedExercise && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              {/* Preview de imagen */}
              {preview && (
                <Card className="p-2 card-elevated">
                  <img src={preview} alt="Preview" className="w-full rounded-xl max-h-64 object-contain" />
                </Card>
              )}

              {/* Resultado del análisis */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-8 text-center card-elevated">
                  {/* Icono de éxito */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', duration: 0.8 }}
                    className="text-7xl mb-4 inline-block"
                  >
                    ✅
                  </motion.div>

                  <h3 className="font-display text-3xl font-black bg-gradient-to-r from-rush-green to-emerald-500 bg-clip-text text-transparent mb-6">
                    EJERCICIO DETECTADO
                  </h3>

                  {/* Información detectada */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-rush-darker rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">Tema</p>
                      <p className="text-xl font-bold text-rush-purple">{detectedExercise.topic}</p>
                    </div>
                    <div className="bg-rush-darker rounded-xl p-4">
                      <p className="text-xs text-gray-400 mb-1">Dificultad</p>
                      <p className="text-xl font-bold text-rush-orange">{detectedExercise.difficulty}</p>
                    </div>
                  </div>

                  {/* Pregunta detectada */}
                  <div className="bg-rush-darker rounded-xl p-4 mb-6">
                    <p className="text-xs text-gray-400 mb-2">Pregunta detectada:</p>
                    <p className="text-lg font-bold">{detectedExercise.question}</p>
                  </div>

                  {/* Botones de acción */}
                  <div className="space-y-3">
                    <Button 
                      variant="primary" 
                      size="lg" 
                      className="w-full"
                      onClick={handleConvertToRush}
                    >
                      ⚡ CONVERTIR EN RUSH
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleReset}
                    >
                      Escanear otro
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {/* Estado Transitioning - Transición al juego */}
          {status === 'transitioning' && (
            <motion.div
              key="transitioning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[60vh] flex items-center justify-center"
            >
              <div className="text-center">
                {/* Animación de transformación */}
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    rotate: [0, 360, 720],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-8xl mb-6 inline-block"
                >
                  ⚡
                </motion.div>

                <motion.h2
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="font-display text-5xl font-black bg-gradient-to-r from-rush-orange via-rush-yellow to-rush-orange bg-clip-text text-transparent mb-4"
                >
                  RUSH START
                </motion.h2>

                <p className="text-xl text-gray-400">Convirtiendo ejercicio en juego...</p>

                {/* Partículas */}
                <div className="relative mt-8">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-rush-orange rounded-full"
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
                        duration: 1.5,
                        repeat: Infinity,
                        delay: Math.random() * 1,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Estado Failed */}
          {status === 'failed' && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="p-8 text-center card-elevated">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-6xl mb-4"
                >
                  ❌
                </motion.div>
                <h3 className="font-bold text-xl mb-2">Error al procesar</h3>
                <p className="text-sm text-gray-400 mb-6">Verifica el tipo y tamaño del archivo.</p>
                <Button variant="primary" onClick={handleReset}>
                  Intentar de nuevo
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info sobre OCR */}
        {status === 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 card-glass rounded-xl p-4"
          >
            <p className="text-xs text-gray-500 text-center">
              <span className="text-rush-orange font-bold">DEMO:</span> Esta es una demostración del escáner. 
              En producción, se utiliza OCR con IA para detectar ejercicios reales.
            </p>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
