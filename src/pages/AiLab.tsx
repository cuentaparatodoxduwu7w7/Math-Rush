import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '../components/layout';
import { Card, Button, Badge, Modal } from '../components/ui';
import { useAI } from '../hooks/useAI';
import { useAuth } from '../contexts/AuthContext';

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

  const tools = [
    { 
      id: 'world', 
      name: 'Diseñador de Mundo', 
      icon: '🎨', 
      desc: 'Crea mundos temáticos para jugar',
      fullDesc: 'Diseña escenarios únicos con ambientes personalizados. Cada mundo tiene su propia estética y atmósfera.',
      placeholder: 'Ej: Un castillo matemático flotando en el espacio, con planetas de cristal y símbolos de álgebra brillando...',
    },
    { 
      id: 'audio', 
      name: 'Sintetizador de Audio', 
      icon: '🎵', 
      desc: 'Genera efectos de sonido',
      fullDesc: 'Crea música y efectos de sonido personalizados para tus partidas. Desde lo-fi hasta épico.',
      placeholder: 'Ej: Una música lo-fi futurista con sonidos de monedas y sintetizadores suaves...',
    },
    { 
      id: 'pet', 
      name: 'Diseñador de Mascota', 
      icon: '🐹', 
      desc: 'Personaliza tu mascota',
      fullDesc: 'Diseña tu compañero perfecto. Elige estilo, colores, accesorios y personalidad.',
      placeholder: 'Ej: Cuy blanco y marrón con audífonos gamer, lentes futuristas y mochila espacial...',
    },
  ];

  const presets: Record<string, string[]> = {
    world: [
      'Mundo espacial con planetas matemáticos',
      'Bosque encantado de geometría',
      'Ciudad futurista de álgebra',
      'Océano de fracciones',
      'Desierto de ecuaciones',
      'Montaña de números primos'
    ],
    audio: [
      'Efecto de victoria épica',
      'Sonido de combo x5',
      'Música de fondo relajante',
      'Efecto de tiempo agotándose',
      'Melodía de menú principal',
      'Sonido de moneda recogida'
    ],
    pet: [
      'Cuy con armadura dorada',
      'Cuy astronauta',
      'Llama con gafas de sol',
      'Cuy samurái',
      'Cuy chef matemático',
      'Llama detective'
    ],
  };

  async function handleGenerate() {
    if (!prompt || !selectedTool) return;
    
    clearError();
    setGeneratedContent(null);

    let result;
    if (selectedTool === 'world') {
      result = await generateImage(prompt, { quality: 'high' });
      if (result) {
        const content = {
          type: 'world',
          name: prompt,
          image: result.url,
          description: `Mundo generado: "${prompt}"`,
          features: ['Fondo dinámico', 'Partículas animadas', 'Dificultad adaptativa', '+50 XP al completar'],
          timestamp: Date.now(),
          provider: result.provider,
        };
        setGeneratedContent(content);
        setHistory([content, ...history].slice(0, 10));
      }
    } else if (selectedTool === 'audio') {
      result = await generateAudio(prompt);
      if (result) {
        const content = {
          type: 'audio',
          name: prompt,
          audioUrl: result.url,
          duration: `${result.duration.toFixed(1)}s`,
          format: result.format,
          description: `Audio generado: "${prompt}"`,
          features: ['Reproductor integrado', 'Loop disponible', 'Descarga permitida', 'Aplicable a juegos'],
          timestamp: Date.now(),
          provider: result.provider,
        };
        setGeneratedContent(content);
        setHistory([content, ...history].slice(0, 10));
      }
    } else if (selectedTool === 'pet') {
      result = await generateMascot(prompt, { style: 'cartoon' });
      if (result) {
        const content = {
          type: 'pet',
          name: result.name,
          image: result.imageUrl,
          description: `Mascota diseñada: "${prompt}"`,
          features: ['Animación idle', 'Animación celebración', 'Personalizable', 'Aplicable al perfil'],
          timestamp: Date.now(),
          provider: result.provider,
        };
        setGeneratedContent(content);
        setHistory([content, ...history].slice(0, 10));
      }
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
              <h3 className="font-bold mb-3">Describe lo que quieres crear</h3>
              
              {/* Presets */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Ideas rápidas:</p>
                <div className="flex flex-wrap gap-2">
                  {presets[selectedTool]?.map((p, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPrompt(p)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-rush-purple/10 text-rush-purple-light hover:bg-rush-purple/20 transition-colors border border-rush-purple/20"
                    >
                      {p}
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

              <Button
                variant="primary"
                className="w-full mt-4"
                onClick={handleGenerate}
                disabled={!prompt || loading}
                size="lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">🤖</span>
                    Generando...
                  </span>
                ) : (
                  '✨ GENERAR'
                )}
              </Button>
            </div>

            {/* Loading State */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="card-glass rounded-2xl p-8 text-center"
                >
                  <div className="text-6xl mb-4 animate-bounce">🤖</div>
                  <p className="font-bold text-lg mb-2">Creando tu contenido...</p>
                  <p className="text-sm text-gray-400">La IA está trabajando en tu diseño</p>
                  <div className="mt-4 w-full h-2 bg-rush-darker rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-rush-orange to-rush-purple rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 3 }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generated Content */}
            <AnimatePresence>
              {generatedContent && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="card-premium rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-xl font-bold">✨ Resultado</h3>
                    <Badge color="green">Generado</Badge>
                  </div>

                  {/* Preview */}
                  {generatedContent.image && (
                    <div className="relative w-full h-64 mb-4 rounded-xl overflow-hidden bg-gradient-to-br from-rush-darker to-rush-card">
                      <img 
                        src={generatedContent.image} 
                        alt={generatedContent.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Audio Player */}
                  {generatedContent.audioUrl && (
                    <div className="bg-rush-darker rounded-xl p-4 mb-4">
                      <audio controls className="w-full">
                        <source src={generatedContent.audioUrl} type="audio/wav" />
                        Tu navegador no soporta audio.
                      </audio>
                    </div>
                  )}

                  <h4 className="font-bold text-lg mb-2">{generatedContent.name}</h4>
                  <p className="text-sm text-gray-400 mb-4">{generatedContent.description}</p>
                  
                  {/* Features */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {generatedContent.features?.map((f: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm bg-rush-darker/50 rounded-lg p-2">
                        <span className="text-rush-green">✓</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* Provider Info */}
                  <div className="bg-rush-darker/50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-500">
                      Generado por: <span className="text-rush-purple-light">{generatedContent.provider}</span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-3">
                    <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                      VER PREVIEW
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleApply}>
                      APLICAR
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleSave}>
                      GUARDAR
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* History */}
            {history.length > 0 && (
              <div className="card-glass rounded-2xl p-6">
                <h3 className="font-bold mb-4">📜 Historial de Generaciones</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {history.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-rush-darker/50 rounded-lg hover:bg-rush-darker transition-colors">
                      {item.image && (
                        <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge color="purple">{item.type}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Preview Modal */}
      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title="Preview Completo">
        {generatedContent && (
          <div>
            {generatedContent.image && (
              <img 
                src={generatedContent.image} 
                alt={generatedContent.name}
                className="w-full rounded-xl mb-4"
              />
            )}
            {generatedContent.audioUrl && (
              <audio controls className="w-full mb-4">
                <source src={generatedContent.audioUrl} type="audio/wav" />
              </audio>
            )}
            <h3 className="font-display text-xl font-bold mb-2">{generatedContent.name}</h3>
            <p className="text-sm text-gray-400 mb-4">{generatedContent.description}</p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="primary" onClick={handleApply}>
                APLICAR AL LOBBY
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
