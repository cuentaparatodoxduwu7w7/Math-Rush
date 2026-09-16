import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '../components/layout';
import { Card, Button, Badge, Modal } from '../components/ui';
import { useAI } from '../hooks/useAI';
import { useAuth } from '../contexts/AuthContext';
import { ASSETS } from '../lib/assets';

// Estados de la máquina de estados
type GenerationState = 'idle' | 'generating' | 'success' | 'error' | 'cancelled';

export default function AiLabPage() {
  const { user } = useAuth();
  const { 
    loading, 
    error, 
    retryable, 
    generateImage, 
    generateAudio, 
    generateMascot,
    clearError,
    getUsage,
    getLimits,
  } = useAI();

  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  
  // Máquina de estados
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Mascota form state
  const [mascotType, setMascotType] = useState('cuy');
  const [mascotStyle, setMascotStyle] = useState('gamer');
  const [mascotColor, setMascotColor] = useState('blanco');
  const [mascotAccessory, setMascotAccessory] = useState('audifonos');
  
  // Audio player state
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.7);
  
  // Timeout ref para cancelar
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef<boolean>(false);

  const tools = [
    { 
      id: 'world', 
      name: 'Diseñador de Mundo', 
      icon: '🎨', 
      desc: 'Crea un mundo único para tu experiencia Math Rush',
      fullDesc: 'Diseña escenarios únicos con ambientes personalizados. Cada mundo tiene su propia estética y atmósfera.',
      placeholder: 'Describe tu mundo...',
    },
    { 
      id: 'audio', 
      name: 'Sintetizador de Audio', 
      icon: '🎵', 
      desc: 'Genera música y efectos de sonido',
      fullDesc: 'Crea música y efectos de sonido personalizados para tus partidas. Desde lo-fi hasta épico.',
      placeholder: 'Describe tu música...',
    },
    { 
      id: 'pet', 
      name: 'Diseñador de Mascota', 
      icon: '🐹', 
      desc: 'Personaliza tu compañero de juego',
      fullDesc: 'Diseña tu compañero perfecto. Elige tipo, estilo, colores y accesorios.',
      placeholder: '',
    },
  ];

  const worldPresets = [
    { label: '🌌 Espacio matemático', value: 'Mundo espacial con planetas matemáticos' },
    { label: '🏰 Castillo de geometría', value: 'Castillo flotante de geometría con torres de polígonos' },
    { label: '🌋 Volcán de números', value: 'Volcán activo con ríos de números y lava de ecuaciones' },
    { label: '🌃 Ciudad cyberpunk', value: 'Ciudad cyberpunk futurista con luces de neón y fórmulas' },
    { label: '🌳 Bosque matemático', value: 'Bosque encantado con árboles de fractales y flores geométricas' },
  ];

  const audioPresets = [
    { label: '🎹 Lo-Fi', value: 'Música lo-fi relajante con beats suaves' },
    { label: '👾 8-Bit', value: 'Música 8-bit retro estilo videojuego clásico' },
    { label: '🌃 Cyberpunk', value: 'Música cyberpunk con sintetizadores futuristas' },
    { label: '🌌 Espacial', value: 'Música espacial ambient con pads etéreos' },
    { label: '⚔️ Aventura', value: 'Música épica de aventura con orquesta' },
  ];

  // Simulate progress animation - CORREGIDO
  const simulateProgress = async (messages: string[]): Promise<boolean> => {
    setGenerationState('generating');
    setProgress(0);
    setErrorMessage('');
    
    let currentProgress = 0;
    
    for (let i = 0; i < messages.length; i++) {
      // Verificar si fue cancelado
      if (cancelledRef.current) {
        return false;
      }
      
      setProgressMessage(messages[i]);
      const targetProgress = ((i + 1) / messages.length) * 100;
      
      // Animar progreso usando variable local
      while (currentProgress < targetProgress) {
        // Verificar cancelación
        if (cancelledRef.current) {
          return false;
        }
        
        await new Promise(resolve => {
          timeoutRef.current = setTimeout(resolve, 50);
        });
        
        currentProgress = Math.min(currentProgress + 2, targetProgress);
        setProgress(currentProgress);
      }
      
      await new Promise(resolve => {
        timeoutRef.current = setTimeout(resolve, 800);
      });
    }
    
    setProgress(100);
    await new Promise(resolve => {
      timeoutRef.current = setTimeout(resolve, 500);
    });
    
    return true;
  };
  
  // Cancelar generación
  const handleCancel = () => {
    cancelledRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setGenerationState('idle');
    setProgress(0);
    setProgressMessage('');
  };

  async function handleGenerate() {
    if (!selectedTool) return;
    if (selectedTool !== 'pet' && !prompt) return;
    
    // Reset estado
    cancelledRef.current = false;
    clearError();
    setGeneratedContent(null);
    setErrorMessage('');

    try {
      // Timeout de seguridad (30 segundos)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: La generación tardó demasiado')), 30000);
      });

      // Función de generación
      const generatePromise = async () => {
        if (selectedTool === 'world') {
          // Simulate world generation with progress
          const success = await simulateProgress([
            'Analizando idea...',
            'Construyendo escenario...',
            'Generando ambiente...',
            'Aplicando detalles matemáticos...'
          ]);

          // Si fue cancelado, no continuar
          if (!success) return;

          // Select appropriate background based on prompt
          let imageUrl = ASSETS.backgrounds.space;
          const lowerPrompt = prompt.toLowerCase();
          
          if (lowerPrompt.includes('espacio') || lowerPrompt.includes('space') || lowerPrompt.includes('galaxia') || lowerPrompt.includes('planeta')) {
            imageUrl = ASSETS.backgrounds.space;
          } else if (lowerPrompt.includes('neon') || lowerPrompt.includes('cyber') || lowerPrompt.includes('futur') || lowerPrompt.includes('ciudad')) {
            imageUrl = ASSETS.backgrounds.neon;
          } else if (lowerPrompt.includes('matem') || lowerPrompt.includes('geomet') || lowerPrompt.includes('número') || lowerPrompt.includes('castillo')) {
            imageUrl = ASSETS.backgrounds.math;
          } else if (lowerPrompt.includes('natur') || lowerPrompt.includes('bosque') || lowerPrompt.includes('verde') || lowerPrompt.includes('árbol')) {
            imageUrl = ASSETS.backgrounds.nature;
          }

          const content = {
            type: 'world',
            name: prompt,
            image: imageUrl,
            description: `Mundo generado: "${prompt}"`,
            features: ['Fondo dinámico', 'Partículas animadas', 'Dificultad adaptativa', '+50 XP al completar'],
            timestamp: Date.now(),
            provider: 'mock-image',
          };
          setGeneratedContent(content);
          setHistory([content, ...history].slice(0, 10));
          setGenerationState('success');
          
        } else if (selectedTool === 'audio') {
          // Simulate audio generation with progress
          const success = await simulateProgress([
            'Analizando estilo musical...',
            'Componiendo melodía...',
            'Generando instrumentos...',
            'Mezclando audio...'
          ]);

          // Si fue cancelado, no continuar
          if (!success) return;

          const content = {
            type: 'audio',
            name: prompt,
            audioUrl: '/assets/demo/math-rush-demo.mp4', // Using demo file as audio source
            duration: '15.0s',
            format: 'mp4',
            description: `Audio generado: "${prompt}"`,
            features: ['Reproductor integrado', 'Loop disponible', 'Aplicable a juegos'],
            timestamp: Date.now(),
            provider: 'mock-audio',
          };
          setGeneratedContent(content);
          setHistory([content, ...history].slice(0, 10));
          setGenerationState('success');
          
        } else if (selectedTool === 'pet') {
          // Simulate mascot generation with progress
          const success = await simulateProgress([
            'Analizando características...',
            'Diseñando apariencia...',
            'Aplicando estilo...',
            'Generando mascota...'
          ]);

          // Si fue cancelado, no continuar
          if (!success) return;

          // Select mascot based on type
          let imageUrl = ASSETS.mascots.llamaBlanca;
          if (mascotType === 'cuy') {
            imageUrl = ASSETS.mascots.cuyMatematico;
          }

          const mascotName = `${mascotColor} ${mascotType === 'cuy' ? 'Cuy' : 'Llama'} ${mascotStyle}`;
          
          const content = {
            type: 'pet',
            name: mascotName,
            image: imageUrl,
            description: `Mascota diseñada: ${mascotType} ${mascotStyle} de color ${mascotColor} con ${mascotAccessory}`,
            features: ['Animación idle', 'Animación celebración', 'Personalizable', 'Aplicable al perfil'],
            timestamp: Date.now(),
            provider: 'mock-mascot',
            style: mascotStyle,
            color: mascotColor,
            accessory: mascotAccessory,
          };
          setGeneratedContent(content);
          setHistory([content, ...history].slice(0, 10));
          setGenerationState('success');
        }
      };

      // Competir entre generación y timeout
      await Promise.race([generatePromise(), timeoutPromise]);
      
    } catch (error) {
      console.error('Error en generación:', error);
      setGenerationState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error desconocido');
    }
  }

  function handleApply() {
    alert(`¡${generatedContent?.name} aplicado exitosamente!`);
    setShowPreview(false);
  }

  function handleSave() {
    alert(`¡${generatedContent?.name} guardado en tu colección!`);
  }

  const limits = getLimits();
  const imageUsage = getUsage('image');
  const audioUsage = getUsage('audio');
  const mascotUsage = getUsage('mascot');

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">🤖 Laboratorio IA</h1>
          <p className="text-gray-400">Herramientas creativas potenciadas por inteligencia artificial</p>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🎨</span>
              <Badge color={imageUsage >= limits.imagePerDay ? 'red' : 'green'}>
                {imageUsage}/{limits.imagePerDay}
              </Badge>
            </div>
            <p className="text-xs text-gray-400">Imágenes hoy</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🎵</span>
              <Badge color={audioUsage >= limits.audioPerDay ? 'red' : 'green'}>
                {audioUsage}/{limits.audioPerDay}
              </Badge>
            </div>
            <p className="text-xs text-gray-400">Audios hoy</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🐹</span>
              <Badge color={mascotUsage >= limits.mascotPerDay ? 'red' : 'green'}>
                {mascotUsage}/{limits.mascotPerDay}
              </Badge>
            </div>
            <p className="text-xs text-gray-400">Mascotas hoy</p>
          </Card>
        </div>

        {!selectedTool ? (
          /* Tool Selection */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedTool(tool.id)}
                className="card-premium cursor-pointer group"
              >
                <div className="p-6">
                  <div className="text-6xl mb-4 transition-transform duration-300 group-hover:scale-110">
                    {tool.icon}
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2">{tool.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{tool.fullDesc}</p>
                  <Button variant="primary" className="w-full">
                    Explorar
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Tool Interface */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Back Button */}
            <button
              onClick={() => { setSelectedTool(null); setGeneratedContent(null); setPrompt(''); clearError(); }}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <span>←</span>
              <span>Volver a herramientas</span>
            </button>

            {/* Tool Header */}
            <div className="card-glass rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl">{tools.find(t => t.id === selectedTool)?.icon}</span>
                <div>
                  <h2 className="font-display text-2xl font-bold">
                    {tools.find(t => t.id === selectedTool)?.name}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {tools.find(t => t.id === selectedTool)?.fullDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div className="flex-1">
                      <p className="font-bold text-red-400 mb-1">Error</p>
                      <p className="text-sm text-red-300">{error}</p>
                      {retryable && (
                        <Button variant="outline" size="sm" className="mt-3" onClick={handleGenerate}>
                          Reintentar
                        </Button>
                      )}
                    </div>
                    <button onClick={clearError} className="text-red-400 hover:text-red-300">
                      ✕
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Section */}
            <div className="card-glass rounded-2xl p-6">
              <h3 className="font-bold mb-4 text-lg">
                {selectedTool === 'world' && '🎨 Diseñador de Mundo'}
                {selectedTool === 'audio' && '🎵 Sintetizador de Audio'}
                {selectedTool === 'pet' && '🐹 Diseñador de Mascota'}
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                {tools.find(t => t.id === selectedTool)?.desc}
              </p>
              
              {/* World & Audio: Text Input with Presets */}
              {(selectedTool === 'world' || selectedTool === 'audio') && (
                <>
                  {/* Presets */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Ejemplos rápidos:</p>
                    <div className="flex flex-wrap gap-2">
                      {(selectedTool === 'world' ? worldPresets : audioPresets).map((preset, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setPrompt(preset.value)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-rush-purple/10 text-rush-purple-light hover:bg-rush-purple/20 transition-colors border border-rush-purple/20"
                        >
                          {preset.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Prompt Input */}
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    className="w-full bg-rush-darker border-2 border-rush-purple/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-rush-orange transition-colors resize-none h-32"
                    placeholder={tools.find(t => t.id === selectedTool)?.placeholder}
                    aria-label="Prompt para generación IA"
                  />
                </>
              )}

              {/* Pet: Visual Form */}
              {selectedTool === 'pet' && (
                <div className="space-y-5">
                  {/* Type */}
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-300">Tipo de mascota</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'cuy', label: '🐹 Cuy', desc: 'Pequeño y adorable' },
                        { value: 'llama', label: '🦙 Llama', desc: 'Elegante y fiel' },
                      ].map(option => (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setMascotType(option.value)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            mascotType === option.value
                              ? 'border-rush-orange bg-rush-orange/10'
                              : 'border-rush-purple/30 bg-rush-darker hover:border-rush-purple/50'
                          }`}
                        >
                          <div className="text-3xl mb-1">{option.label.split(' ')[0]}</div>
                          <div className="font-bold text-sm">{option.label.split(' ')[1]}</div>
                          <div className="text-xs text-gray-400">{option.desc}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Style */}
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-300">Estilo</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'gamer', label: '🎮 Gamer' },
                        { value: 'dorado', label: '✨ Dorado' },
                        { value: 'cyberpunk', label: '🌃 Cyberpunk' },
                        { value: 'samurai', label: '⚔️ Samurai' },
                      ].map(option => (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setMascotStyle(option.value)}
                          className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                            mascotStyle === option.value
                              ? 'border-rush-orange bg-rush-orange/10 text-rush-orange'
                              : 'border-rush-purple/30 bg-rush-darker hover:border-rush-purple/50'
                          }`}
                        >
                          {option.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-300">Color</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { value: 'blanco', label: 'Blanco', color: 'bg-white' },
                        { value: 'marron', label: 'Marrón', color: 'bg-amber-700' },
                        { value: 'dorado', label: 'Dorado', color: 'bg-yellow-500' },
                        { value: 'morado', label: 'Morado', color: 'bg-purple-600' },
                      ].map(option => (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setMascotColor(option.value)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            mascotColor === option.value
                              ? 'border-rush-orange bg-rush-orange/10'
                              : 'border-rush-purple/30 bg-rush-darker hover:border-rush-purple/50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full ${option.color} mx-auto mb-1 border-2 border-white/20`} />
                          <div className="text-xs font-medium">{option.label}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Accessory */}
                  <div>
                    <label className="block text-sm font-bold mb-2 text-gray-300">Accesorio</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'audifonos', label: '🎧 Audífonos' },
                        { value: 'gafas', label: '🕶️ Gafas' },
                        { value: 'casco', label: '⛑️ Casco' },
                        { value: 'armadura', label: '🛡️ Armadura' },
                      ].map(option => (
                        <motion.button
                          key={option.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setMascotAccessory(option.value)}
                          className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                            mascotAccessory === option.value
                              ? 'border-rush-orange bg-rush-orange/10 text-rush-orange'
                              : 'border-rush-purple/30 bg-rush-darker hover:border-rush-purple/50'
                          }`}
                        >
                          {option.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <Button
                variant="primary"
                className="w-full mt-6"
                onClick={handleGenerate}
                disabled={(selectedTool !== 'pet' && !prompt) || generationState === 'generating'}
                size="lg"
              >
                {generationState === 'generating' ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⚙️</span>
                    Generando...
                  </span>
                ) : (
                  <>
                    <span>✨</span>
                    <span>GENERAR {selectedTool === 'world' ? 'MUNDO' : selectedTool === 'audio' ? 'AUDIO' : 'MASCOTA'}</span>
                  </>
                )}
              </Button>
            </div>

            {/* Loading State with Progress */}
            <AnimatePresence>
              {generationState === 'generating' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="card-glass rounded-2xl p-8"
                >
                  <div className="text-center mb-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="text-6xl mb-4 inline-block"
                    >
                      {selectedTool === 'world' ? '🎨' : selectedTool === 'audio' ? '🎵' : '🐹'}
                    </motion.div>
                    <p className="font-bold text-lg mb-2">Creando tu {selectedTool === 'world' ? 'mundo' : selectedTool === 'audio' ? 'audio' : 'mascota'}...</p>
                    <p className="text-sm text-rush-orange font-medium">{progressMessage}</p>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-rush-darker rounded-full overflow-hidden mb-2">
                    <motion.div
                      className="h-full bg-gradient-to-r from-rush-orange via-rush-yellow to-rush-orange rounded-full"
                      style={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-right text-xs text-gray-400 mb-4">{Math.round(progress)}%</p>
                  
                  {/* Cancel Button */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleCancel}
                  >
                    ❌ CANCELAR GENERACIÓN
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error State */}
            <AnimatePresence>
              {generationState === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="card-glass rounded-2xl p-8 border-2 border-red-500/30"
                >
                  <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <p className="font-bold text-lg mb-2 text-red-400">Error en la generación</p>
                    <p className="text-sm text-gray-400 mb-6">
                      {errorMessage || 'Ups, no pudimos completar la generación.'}
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant="primary"
                        className="flex-1"
                        onClick={handleGenerate}
                      >
                        🔄 REINTENTAR
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setGenerationState('idle');
                          setErrorMessage('');
                        }}
                      >
                        CERRAR
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generated Content */}
            <AnimatePresence>
              {generatedContent && generationState !== 'generating' && generationState !== 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="card-premium rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-xl font-bold">✨ Resultado</h3>
                    <Badge color="green">Generado</Badge>
                  </div>

                  {/* World/Mascot Preview */}
                  {generatedContent.image && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="relative w-full h-64 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-rush-darker to-rush-card shadow-2xl"
                    >
                      <img 
                        src={generatedContent.image} 
                        alt={generatedContent.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h4 className="font-bold text-xl text-white mb-1">{generatedContent.name}</h4>
                        <p className="text-sm text-gray-200">{generatedContent.description}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Audio Player */}
                  {generatedContent.audioUrl && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-br from-rush-purple/20 to-rush-blue/20 rounded-xl p-5 mb-4 border border-rush-purple/30"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-rush-purple/30 rounded-full flex items-center justify-center">
                          <span className="text-2xl">🎵</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg">{generatedContent.name}</h4>
                          <p className="text-xs text-gray-400">Duración: {generatedContent.duration}</p>
                        </div>
                      </div>
                      
                      {/* Custom Audio Controls */}
                      <audio 
                        ref={audioRef}
                        src={generatedContent.audioUrl}
                        onEnded={() => setIsPlaying(false)}
                        onTimeUpdate={() => {}}
                      />
                      
                      <div className="space-y-3">
                        {/* Play/Pause and Volume */}
                        <div className="flex items-center gap-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              if (audioRef.current) {
                                if (isPlaying) {
                                  audioRef.current.pause();
                                } else {
                                  audioRef.current.play();
                                }
                                setIsPlaying(!isPlaying);
                              }
                            }}
                            className="w-12 h-12 bg-rush-orange rounded-full flex items-center justify-center shadow-lg hover:shadow-rush-orange/50 transition-all"
                          >
                            <span className="text-xl">{isPlaying ? '⏸️' : '▶️'}</span>
                          </motion.button>
                          
                          <div className="flex-1">
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={audioVolume}
                              onChange={(e) => {
                                const vol = parseFloat(e.target.value);
                                setAudioVolume(vol);
                                if (audioRef.current) {
                                  audioRef.current.volume = vol;
                                }
                              }}
                              className="w-full h-2 bg-rush-darker rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                          
                          <span className="text-sm text-gray-400">🔊 {Math.round(audioVolume * 100)}%</span>
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              if (audioRef.current) {
                                audioRef.current.currentTime = 0;
                                audioRef.current.play();
                                setIsPlaying(true);
                              }
                            }}
                            className="w-10 h-10 bg-rush-purple/30 rounded-full flex items-center justify-center hover:bg-rush-purple/50 transition-all"
                          >
                            <span>🔄</span>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Features */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {generatedContent.features?.map((f: string, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.1 }}
                        className="flex items-center gap-2 text-sm bg-rush-darker/50 rounded-lg p-2"
                      >
                        <span className="text-rush-green">✓</span>
                        <span>{f}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    {generatedContent.type === 'world' && (
                      <Button variant="primary" size="sm" onClick={handleApply}>
                        APLICAR AL LOBBY
                      </Button>
                    )}
                    {generatedContent.type === 'pet' && (
                      <Button variant="primary" size="sm" onClick={handleApply}>
                        APLICAR COMO MASCOTA
                      </Button>
                    )}
                    {generatedContent.type === 'audio' && (
                      <Button variant="primary" size="sm" onClick={handleApply}>
                        APLICAR AUDIO
                      </Button>
                    )}
                    <Button variant="secondary" size="sm" onClick={handleSave}>
                      GUARDAR
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      setGeneratedContent(null);
                      setPrompt('');
                    }}>
                      GENERAR OTRO
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* My Creations - History */}
            {history.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-glass rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-xl font-bold">🎨 MIS CREACIONES</h3>
                  <Badge color="purple">{history.length} items</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                  {history.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      className="cursor-pointer relative rounded-xl overflow-hidden border-2 border-rush-purple/30 bg-rush-darker hover:border-rush-orange/50 transition-all"
                      onClick={() => {
                        setGeneratedContent(item);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      {item.image && (
                        <div className="relative w-full h-32 overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-xs font-bold text-white truncate">{item.name}</p>
                            <p className="text-[10px] text-gray-300">
                              {new Date(item.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      )}
                      {item.audioUrl && (
                        <div className="p-3 bg-gradient-to-br from-rush-purple/20 to-rush-blue/20">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">🎵</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate">{item.name}</p>
                              <p className="text-[10px] text-gray-400">{item.duration}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge color={item.type === 'world' ? 'orange' : item.type === 'audio' ? 'blue' : 'purple'}>
                          {item.type === 'world' ? '🎨' : item.type === 'audio' ? '🎵' : '🐹'}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Preview Modal */}
      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title="">
        {generatedContent && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-2xl font-bold">Vista Previa</h3>
              <Badge color="green">Generado</Badge>
            </div>

            {generatedContent.image && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full h-80 mb-4 rounded-xl overflow-hidden shadow-2xl"
              >
                <img 
                  src={generatedContent.image} 
                  alt={generatedContent.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h4 className="font-bold text-xl text-white mb-1">{generatedContent.name}</h4>
                  <p className="text-sm text-gray-200">{generatedContent.description}</p>
                </div>
              </motion.div>
            )}

            {generatedContent.audioUrl && (
              <div className="bg-gradient-to-br from-rush-purple/20 to-rush-blue/20 rounded-xl p-5 mb-4 border border-rush-purple/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-rush-purple/30 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎵</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg">{generatedContent.name}</h4>
                    <p className="text-xs text-gray-400">Duración: {generatedContent.duration}</p>
                  </div>
                </div>
                
                <audio 
                  ref={audioRef}
                  src={generatedContent.audioUrl}
                  onEnded={() => setIsPlaying(false)}
                />
                
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      if (audioRef.current) {
                        if (isPlaying) {
                          audioRef.current.pause();
                        } else {
                          audioRef.current.play();
                        }
                        setIsPlaying(!isPlaying);
                      }
                    }}
                    className="w-12 h-12 bg-rush-orange rounded-full flex items-center justify-center shadow-lg"
                  >
                    <span className="text-xl">{isPlaying ? '⏸️' : '▶️'}</span>
                  </motion.button>
                  
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={audioVolume}
                      onChange={(e) => {
                        const vol = parseFloat(e.target.value);
                        setAudioVolume(vol);
                        if (audioRef.current) {
                          audioRef.current.volume = vol;
                        }
                      }}
                      className="w-full h-2 bg-rush-darker rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <span className="text-sm text-gray-400">🔊 {Math.round(audioVolume * 100)}%</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button variant="primary" onClick={handleApply}>
                {generatedContent.type === 'world' ? 'APLICAR AL LOBBY' : 
                 generatedContent.type === 'pet' ? 'APLICAR COMO MASCOTA' : 
                 'APLICAR AUDIO'}
              </Button>
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                CERRAR
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
