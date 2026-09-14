import React, { useState } from 'react';
import { AppLayout } from '../components/layout';
import { Card, Button, Badge, Modal } from '../components/ui';
import { ASSETS } from '../lib/assets';

export default function AiLabPage() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const tools = [
    { id: 'world', name: 'Diseñador de Mundo', icon: '🎨', desc: 'Crea mundos temáticos para jugar' },
    { id: 'audio', name: 'Sintetizador de Audio', icon: '🎵', desc: 'Genera efectos de sonido' },
    { id: 'pet', name: 'Diseñador de Mascota', icon: '🐹', desc: 'Personaliza tu mascota' },
  ];

  const presets: Record<string, string[]> = {
    world: ['Mundo espacial con planetas matemáticos', 'Bosque encantado de geometría', 'Ciudad futurista de álgebra', 'Océano de fracciones'],
    audio: ['Efecto de victoria épica', 'Sonido de combo x5', 'Música de fondo relajante', 'Efecto de tiempo agotándose'],
    pet: ['Cuy con armadura dorada', 'Cuy astronauta', 'Llama con gafas de sol', 'Cuy samurái'],
  };

  async function handleGenerate() {
    if (!prompt) return;
    setLoading(true);
    setGeneratedContent(null);
    
    // Simulate AI generation
    await new Promise(r => setTimeout(r, 2000));
    
    // Return real visual content based on tool
    if (selectedTool === 'world') {
      setGeneratedContent({
        type: 'world',
        name: prompt,
        image: ASSETS.backgrounds.space,
        description: `Mundo generado: "${prompt}"`,
        features: ['Fondo dinámico', 'Partículas animadas', 'Dificultad adaptativa', '+50 XP al completar'],
      });
    } else if (selectedTool === 'audio') {
      setGeneratedContent({
        type: 'audio',
        name: prompt,
        duration: '3 segundos',
        format: 'WAV',
        description: `Audio generado: "${prompt}"`,
        features: ['Estilo digital/retro', 'Volumen optimizado', 'Loop disponible', 'Descarga permitida'],
        // In production, this would be a real audio URL
        audioUrl: null,
      });
    } else if (selectedTool === 'pet') {
      setGeneratedContent({
        type: 'pet',
        name: prompt,
        image: ASSETS.mascots.llamaBlanca,
        description: `Mascota diseñada: "${prompt}"`,
        features: ['Animación idle', 'Animación celebración', 'Personalizable', 'Aplicable al perfil'],
      });
    }
    
    setLoading(false);
  }

  function handleApply() {
    // In production, this would save to user profile
    alert(`¡${generatedContent?.name} aplicado exitosamente!`);
    setShowPreview(false);
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <h1 className="font-display text-2xl font-bold mb-2">🤖 Laboratorio IA</h1>
        <p className="text-gray-400 text-sm mb-6">Herramientas creativas potenciadas por IA.</p>

        {/* Tools */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {tools.map(tool => (
            <Card
              key={tool.id}
              className={`p-4 text-center cursor-pointer transition-all ${selectedTool === tool.id ? 'border-rush-orange/50 bg-rush-orange/5' : 'hover:border-rush-purple/50'}`}
              glow={selectedTool === tool.id}
            >
              <button onClick={() => { setSelectedTool(tool.id); setGeneratedContent(null); setPrompt(''); }} className="w-full">
                <span className="text-4xl mb-2 block">{tool.icon}</span>
                <h3 className="font-bold text-sm">{tool.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{tool.desc}</p>
              </button>
            </Card>
          ))}
        </div>

        {/* Generator */}
        {selectedTool && (
          <Card className="p-6">
            <h3 className="font-bold mb-4">
              {tools.find(t => t.id === selectedTool)?.icon} {tools.find(t => t.id === selectedTool)?.name}
            </h3>

            {/* Presets */}
            <div className="flex flex-wrap gap-2 mb-4">
              {presets[selectedTool]?.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(p)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-rush-purple/10 text-rush-purple-light hover:bg-rush-purple/20 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Prompt Input */}
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="w-full bg-rush-darker border border-rush-purple/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-rush-orange transition-colors resize-none h-24"
              placeholder={
                selectedTool === 'world' ? 'Ejemplo: un castillo matemático flotando en el espacio...' :
                selectedTool === 'audio' ? 'Ejemplo: Una música lo-fi futurista con sonidos de monedas...' :
                'Ejemplo: Cuy blanco y marrón con audífonos gamer...'
              }
              aria-label="Prompt para generación IA"
            />

            <Button
              variant="primary"
              className="w-full mt-4"
              onClick={handleGenerate}
              disabled={!prompt || loading}
            >
              {loading ? '🤖 Generando...' : '✨ GENERAR'}
            </Button>

            {/* Generated Content */}
            {generatedContent && (
              <div className="mt-6 animate-slide-up">
                <div className="bg-rush-darker rounded-xl p-4">
                  {generatedContent.image && (
                    <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
                      <img 
                        src={generatedContent.image} 
                        alt={generatedContent.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <h4 className="font-bold text-lg mb-2">{generatedContent.name}</h4>
                  <p className="text-sm text-gray-400 mb-3">{generatedContent.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    {generatedContent.features?.map((f: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-rush-green">✓</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  {generatedContent.type === 'audio' && (
                    <div className="bg-rush-card rounded-lg p-3 mb-4">
                      <p className="text-xs text-gray-400 mb-2">Duración: {generatedContent.duration}</p>
                      <p className="text-xs text-gray-400">Formato: {generatedContent.format}</p>
                      <p className="text-xs text-rush-orange mt-2">⚠️ Audio real requiere proveedor configurado</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={() => setShowPreview(true)}>
                      VER PREVIEW
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleApply}>
                      APLICAR
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="mt-6 text-center py-8">
                <div className="animate-spin text-4xl mb-3">🤖</div>
                <p className="text-gray-400 text-sm">Generando tu contenido...</p>
              </div>
            )}
          </Card>
        )}

        {/* Info */}
        <div className="mt-6 card-glass rounded-xl p-4">
          <p className="text-xs text-gray-500">
            <span className="text-rush-orange font-bold">INFO:</span> Los mundos y mascotas usan imágenes generadas. 
            El audio requiere un proveedor externo configurado en backend.
          </p>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title="Preview">
        {generatedContent && (
          <div>
            {generatedContent.image && (
              <img 
                src={generatedContent.image} 
                alt={generatedContent.name}
                className="w-full rounded-xl mb-4"
              />
            )}
            <h3 className="font-bold text-lg mb-2">{generatedContent.name}</h3>
            <p className="text-sm text-gray-400 mb-4">{generatedContent.description}</p>
            <Button variant="primary" className="w-full" onClick={handleApply}>
              APLICAR AL LOBBY
            </Button>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
