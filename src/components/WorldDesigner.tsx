import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Badge, Modal } from '../components/ui';
import { useWorldDesigner, WorldTheme } from '../hooks/useWorldDesigner';

interface WorldDesignerProps {
  onClose?: () => void;
}

export default function WorldDesigner({ onClose }: WorldDesignerProps) {
  const {
    limits,
    currentTheme,
    history,
    loading,
    error,
    generating,
    generateWorld,
    applyTheme,
    restoreDefault,
    submitFeedback,
    initialize,
    clearError,
  } = useWorldDesigner();

  const [prompt, setPrompt] = useState('');
  const [useToken, setUseToken] = useState(false);
  const [includeMinigame, setIncludeMinigame] = useState(false);
  const [difficulty, setDifficulty] = useState<'principiante' | 'basico' | 'intermedio' | 'avanzado'>('basico');
  const [showHistory, setShowHistory] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<WorldTheme | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Inicializar al montar
  useEffect(() => {
    initialize();
  }, [initialize]);

  const presets = [
    { label: '🌌 Espacio matemático', value: 'Mundo espacial con planetas matemáticos y estrellas brillantes' },
    { label: '🏰 Castillo de geometría', value: 'Castillo flotante de geometría con torres de polígonos y puentes de ecuaciones' },
    { label: '🌋 Volcán de números', value: 'Volcán activo con ríos de números y lava de ecuaciones matemáticas' },
    { label: '🌃 Ciudad cyberpunk', value: 'Ciudad cyberpunk futurista con luces de neón y fórmulas matemáticas flotantes' },
    { label: '🌳 Bosque matemático', value: 'Bosque encantado con árboles de fractales y flores geométricas' },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      await generateWorld(prompt, {
        useToken,
        includeMinigame,
        difficulty,
      });
      setPrompt('');
    } catch (error) {
      // Error ya está en el estado
    }
  };

  const handleApply = async (theme: WorldTheme) => {
    try {
      await applyTheme(theme.id);
      setShowPreview(false);
      setSelectedTheme(null);
    } catch (error) {
      // Error ya está en el estado
    }
  };

  const handleRestoreDefault = async () => {
    try {
      await restoreDefault();
    } catch (error) {
      // Error ya está en el estado
    }
  };

  const handleFeedback = async (themeId: string, rating: number, comment?: string) => {
    await submitFeedback(themeId, rating, comment, true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expirado';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} día${days > 1 ? 's' : ''}`;
    return `${hours} hora${hours > 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Header de la IA */}
      <Card className="p-6 bg-gradient-to-br from-rush-purple/20 to-rush-blue/20 border-rush-purple/30">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-rush-purple to-rush-blue rounded-2xl flex items-center justify-center text-3xl shadow-lg">
            🎨
          </div>
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold mb-1">Diseñador de Mundo</h2>
            <p className="text-sm text-gray-400 mb-3">
              Crea mundos únicos y personalizados para tu experiencia Math Rush. La IA aprende de tus preferencias.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge color="purple">IA Avanzada</Badge>
              <Badge color="blue">Memoria</Badge>
              <Badge color="green">Personalizable</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Estado de límites y tokens */}
      {loading ? (
        <Card className="p-6 text-center">
          <div className="animate-spin text-4xl mb-2">⚙️</div>
          <p className="text-gray-400">Cargando información...</p>
        </Card>
      ) : error && !limits ? (
        <Card className="p-6 border-red-500/30 bg-red-500/10">
          <div className="text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="font-bold text-red-400 mb-2">Error</p>
            <p className="text-sm text-gray-400 mb-4">{error}</p>
            <Button variant="outline" onClick={initialize}>
              Reintentar
            </Button>
          </div>
        </Card>
      ) : limits ? (
        <>
          {/* Panel de información */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Intentos */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-gray-400">INTENTOS DISPONIBLES</h3>
                <Badge color={limits.attempts_remaining > 0 ? 'green' : 'red'}>
                  {limits.renewal_type === 'weekly' ? 'SEMANAL' : 'MENSUAL'}
                </Badge>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-black text-rush-orange">{limits.attempts_remaining}</span>
                <span className="text-lg text-gray-400">/ {limits.attempts_limit}</span>
              </div>
              <div className="w-full h-2 bg-rush-darker rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-rush-orange to-rush-yellow rounded-full transition-all"
                  style={{ width: `${(limits.attempts_remaining / limits.attempts_limit) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">
                Próxima renovación: {formatDate(limits.period_end)}
              </p>
            </Card>

            {/* Tokens */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-gray-400">TOKENS DISPONIBLES</h3>
                <Badge color="purple">EXTRA</Badge>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-black text-rush-purple">{limits.tokens_balance}</span>
                <span className="text-lg text-gray-400">tokens</span>
              </div>
              <div className="space-y-1 text-xs text-gray-500">
                <p>• 1 token = 1 intento (otras IAs)</p>
                <p>• {limits.token_cost} tokens = 1 intento (esta IA)</p>
              </div>
            </Card>
          </div>

          {/* Tema activo */}
          {currentTheme && (
            <Card className="p-5 border-rush-green/30 bg-rush-green/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✨</span>
                  <h3 className="font-bold">Tema Activo</h3>
                </div>
                <Badge color="green">ACTIVO</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-lg mb-1">{currentTheme.name}</p>
                  <p className="text-sm text-gray-400">
                    Activo hasta: {formatDate(currentTheme.expires_at)} ({getTimeRemaining(currentTheme.expires_at)})
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleRestoreDefault}>
                  Restaurar Default
                </Button>
              </div>
            </Card>
          )}

          {/* Formulario de generación */}
          <Card className="p-6">
            <h3 className="font-bold text-lg mb-4">Crear Nuevo Mundo</h3>

            {/* Presets */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Ideas rápidas:</p>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => setPrompt(preset.value)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-rush-purple/10 text-rush-purple-light hover:bg-rush-purple/20 transition-colors border border-rush-purple/20"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt */}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-rush-darker border-2 border-rush-purple/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-rush-orange transition-colors resize-none h-32 mb-4"
              placeholder="Describe tu mundo ideal... Ej: Un castillo medieval con torres de geometría y fosos de ecuaciones"
            />

            {/* Opciones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Usar token */}
              <label className="flex items-center gap-3 p-3 bg-rush-darker rounded-xl cursor-pointer hover:bg-rush-darker/80 transition-colors">
                <input
                  type="checkbox"
                  checked={useToken}
                  onChange={(e) => setUseToken(e.target.checked)}
                  disabled={limits.attempts_remaining > 0}
                  className="w-5 h-5 rounded"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">Usar Token</p>
                  <p className="text-xs text-gray-500">
                    {limits.token_cost} tokens ({limits.tokens_balance} disponibles)
                  </p>
                </div>
              </label>

              {/* Incluir mini-juego */}
              <label className="flex items-center gap-3 p-3 bg-rush-darker rounded-xl cursor-pointer hover:bg-rush-darker/80 transition-colors">
                <input
                  type="checkbox"
                  checked={includeMinigame}
                  onChange={(e) => setIncludeMinigame(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">Incluir Mini-juego</p>
                  <p className="text-xs text-gray-500">Genera preguntas matemáticas</p>
                </div>
              </label>

              {/* Dificultad */}
              <div className="p-3 bg-rush-darker rounded-xl">
                <label className="block text-sm font-medium mb-2">Dificultad</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full bg-rush-card border border-rush-purple/30 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-rush-orange"
                >
                  <option value="principiante">Principiante</option>
                  <option value="basico">Básico</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
              <Button
                variant="primary"
                className="flex-1"
                size="lg"
                onClick={handleGenerate}
                disabled={!prompt.trim() || generating || (limits.attempts_remaining === 0 && !useToken)}
              >
                {generating ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⚙️</span>
                    Generando...
                  </span>
                ) : (
                  '✨ CREAR MUNDO'
                )}
              </Button>
              {history.length > 0 && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowHistory(true)}
                >
                  📜 Historial
                </Button>
              )}
            </div>

            {/* Mensaje si no hay intentos */}
            {limits.attempts_remaining === 0 && !useToken && (
              <div className="mt-4 p-3 bg-rush-orange/10 border border-rush-orange/30 rounded-xl">
                <p className="text-sm text-rush-orange">
                  💡 Sin intentos disponibles. Puedes usar {limits.token_cost} tokens para generar un mundo extra.
                </p>
              </div>
            )}
          </Card>

          {/* Error */}
          {error && (
            <Card className="p-4 border-red-500/30 bg-red-500/10">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <p className="font-bold text-red-400 mb-1">Error</p>
                  <p className="text-sm text-gray-300">{error}</p>
                </div>
                <button onClick={clearError} className="text-red-400 hover:text-red-300">
                  ✕
                </button>
              </div>
            </Card>
          )}
        </>
      ) : null}

      {/* Modal de historial */}
      <Modal isOpen={showHistory} onClose={() => setShowHistory(false)} title="Historial de Mundos">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No hay mundos generados aún</p>
          ) : (
            history.map((theme) => (
              <div
                key={theme.id}
                onClick={() => {
                  setSelectedTheme(theme);
                  setShowPreview(true);
                  setShowHistory(false);
                }}
                className="cursor-pointer"
              >
                <Card className="p-4 hover:border-rush-orange/50 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-bold mb-1">{theme.name}</p>
                      <p className="text-xs text-gray-400">{formatDate(theme.created_at)}</p>
                    </div>
                    <Badge color={theme.is_active ? 'green' : 'gray'}>
                      {theme.is_active ? 'ACTIVO' : 'EXPIRADO'}
                    </Badge>
                  </div>
                </Card>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Modal de preview */}
      <Modal isOpen={showPreview} onClose={() => { setShowPreview(false); setSelectedTheme(null); }}>
        {selectedTheme && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-2xl font-bold mb-2">{selectedTheme.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{selectedTheme.prompt}</p>
            </div>

            {/* Preview de colores */}
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(selectedTheme.theme).map(([key, color]) => (
                <div key={key} className="text-center">
                  <div
                    className="w-full h-16 rounded-lg mb-1 border border-white/10"
                    style={{ backgroundColor: color }}
                  />
                  <p className="text-xs text-gray-400 capitalize">{key}</p>
                </div>
              ))}
            </div>

            {/* Info */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Creado:</span>
                <span>{formatDate(selectedTheme.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Expira:</span>
                <span>{formatDate(selectedTheme.expires_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Estado:</span>
                <Badge color={selectedTheme.is_active ? 'green' : 'gray'}>
                  {selectedTheme.is_active ? 'ACTIVO' : 'EXPIRADO'}
                </Badge>
              </div>
            </div>

            {/* Feedback */}
            <div className="pt-4 border-t border-rush-purple/20">
              <p className="text-sm font-bold mb-2">¿Te gustó este mundo?</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleFeedback(selectedTheme.id, rating)}
                    className="text-2xl hover:scale-110 transition-transform"
                  >
                    {rating <= 3 ? '⭐' : '⭐'}
                  </button>
                ))}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => handleApply(selectedTheme)}
                disabled={!selectedTheme.is_active}
              >
                Aplicar al Lobby
              </Button>
              <Button
                variant="outline"
                onClick={() => { setShowPreview(false); setSelectedTheme(null); }}
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
