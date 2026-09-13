import React, { useState } from 'react';
import { AppLayout } from '../components/layout';
import { Button, Card, Badge, EmptyState } from '../components/ui';

export default function ScanPage() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'failed'>('idle');
  const [preview, setPreview] = useState<string | null>(null);

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
    setTimeout(() => {
      setStatus('processing');
      setTimeout(() => {
        setStatus('completed');
      }, 2000);
    }, 1500);
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <h1 className="font-display text-2xl font-bold mb-2">📸 Escanear Ejercicio</h1>
        <p className="text-gray-400 text-sm mb-6">Convierte tu tarea en un desafío de juego.</p>

        {status === 'idle' && (
          <div className="space-y-4">
            <label className="block">
              <div className="card-glass rounded-2xl p-8 text-center cursor-pointer hover:border-rush-orange/50 transition-all border-2 border-dashed border-rush-purple/30">
                <span className="text-5xl mb-3 block">📷</span>
                <p className="font-bold mb-1">Tomar foto o subir imagen</p>
                <p className="text-xs text-gray-400">JPG, PNG, PDF · Máx 10MB</p>
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFile} aria-label="Subir archivo" />
              </div>
            </label>
            
            <div className="grid grid-cols-3 gap-3">
              <Card className="p-3 text-center">
                <span className="text-2xl">📷</span>
                <p className="text-xs text-gray-400 mt-1">Cámara</p>
              </Card>
              <Card className="p-3 text-center">
                <span className="text-2xl">🖼️</span>
                <p className="text-xs text-gray-400 mt-1">Galería</p>
              </Card>
              <Card className="p-3 text-center">
                <span className="text-2xl">📄</span>
                <p className="text-xs text-gray-400 mt-1">PDF</p>
              </Card>
            </div>
          </div>
        )}

        {status === 'uploading' && (
          <Card className="p-8 text-center">
            <div className="animate-bounce text-4xl mb-4">📤</div>
            <p className="font-bold">Subiendo archivo...</p>
            <div className="w-full h-2 bg-rush-darker rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-rush-orange rounded-full animate-pulse w-2/3" />
            </div>
          </Card>
        )}

        {status === 'processing' && (
          <Card className="p-8 text-center">
            <div className="animate-spin text-4xl mb-4">🤖</div>
            <p className="font-bold">La IA está analizando tu ejercicio...</p>
            <p className="text-sm text-gray-400 mt-2">Generando preguntas personalizadas</p>
            <div className="w-full h-2 bg-rush-darker rounded-full mt-4 overflow-hidden">
              <div className="h-full bg-rush-purple rounded-full animate-pulse w-1/2" />
            </div>
          </Card>
        )}

        {status === 'completed' && (
          <div className="space-y-4">
            {preview && (
              <Card className="p-2">
                <img src={preview} alt="Preview" className="w-full rounded-xl max-h-64 object-contain" />
              </Card>
            )}
            <Card className="p-6 text-center">
              <span className="text-4xl mb-3 block">✅</span>
              <h3 className="font-bold text-lg mb-1">¡Ejercicio detectado!</h3>
              <p className="text-sm text-gray-400 mb-4">Tema: Álgebra · Dificultad: Intermedio</p>
              <div className="space-y-2">
                <Button variant="primary" className="w-full">⚡ JUGAR AHORA</Button>
                <Button variant="outline" className="w-full" onClick={() => { setStatus('idle'); setPreview(null); }}>Escanear otro</Button>
              </div>
            </Card>
          </div>
        )}

        {status === 'failed' && (
          <Card className="p-8 text-center">
            <span className="text-4xl mb-3 block">❌</span>
            <h3 className="font-bold mb-1">Error al procesar</h3>
            <p className="text-sm text-gray-400 mb-4">Verifica el tipo y tamaño del archivo.</p>
            <Button variant="primary" onClick={() => { setStatus('idle'); setPreview(null); }}>Intentar de nuevo</Button>
          </Card>
        )}

        {/* Info */}
        <div className="mt-6 card-glass rounded-xl p-4">
          <p className="text-xs text-gray-500">
            <span className="text-rush-orange font-bold">MOCK ONLY:</span> En producción, los archivos se suben a Supabase Storage y son procesados por Edge Functions con IA.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
