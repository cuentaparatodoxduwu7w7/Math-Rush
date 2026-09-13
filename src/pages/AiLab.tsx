import React, { useState } from 'react';
import { AppLayout } from '../components/layout';
import { Card, Button, Badge } from '../components/ui';

export default function AiLabPage() {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

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
    setResult('');
    // MOCK: Simulate AI generation
    await new Promise(r => setTimeout(r, 2000));
    const mockResults: Record<string, string> = {
      world: `🌌 Mundo generado: "${prompt}"\n\n• Fondo: Gradiente espacial con estrellas\n• Elementos: Planetas con ecuaciones flotantes\n• Dificultad: Adaptativa\n• Recompensa: +50 XP al completar`,
      audio: `🎵 Audio generado: "${prompt}"\n\n• Duración: 3 segundos\n• Formato: WAV\n• Estilo: Digital/retro\n• Volumen: Optimizado para móvil`,
      pet: `🐹 Mascota diseñada: "${prompt}"\n\n• Accesorio: Personalizado según prompt\n• Animación: Idle + Celebración\n• Colores: Según descripción\n• Estado: Preview disponible`,
    };
    setResult(mockResults[selectedTool || 'world']);
    setLoading(false);
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
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
              <button onClick={() => { setSelectedTool(tool.id); setResult(''); setPrompt(''); }} className="w-full">
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
              placeholder="Describe lo que quieres crear..."
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

            {/* Result */}
            {result && (
              <div className="mt-4 bg-rush-darker rounded-xl p-4">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">{result}</pre>
              </div>
            )}
          </Card>
        )}

        {/* Info */}
        <div className="mt-6 card-glass rounded-xl p-4">
          <p className="text-xs text-gray-500">
            <span className="text-rush-orange font-bold">MOCK ONLY:</span> Para MVP se usan presets. La generación real requiere un proveedor de IA conectado (Edge Function).
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
