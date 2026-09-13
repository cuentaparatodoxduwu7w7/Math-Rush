import React, { useState } from 'react';
import { AppLayout } from '../components/layout';
import { Card, Badge, Button, EmptyState } from '../components/ui';

const TOPICS = [
  { id: 'arithmetic', name: 'Aritmética', icon: '🔢', progress: 65, total: 50, completed: 32 },
  { id: 'algebra', name: 'Álgebra', icon: '📐', progress: 40, total: 60, completed: 24 },
  { id: 'geometry', name: 'Geometría', icon: '📏', progress: 25, total: 40, completed: 10 },
  { id: 'trigonometry', name: 'Trigonometría', icon: '📊', progress: 10, total: 30, completed: 3 },
  { id: 'statistics', name: 'Estadística', icon: '📈', progress: 50, total: 25, completed: 12 },
  { id: 'probability', name: 'Probabilidad', icon: '🎲', progress: 15, total: 20, completed: 3 },
];

export default function LibraryPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <h1 className="font-display text-2xl font-bold mb-2">📚 Biblioteca</h1>
        <p className="text-gray-400 text-sm mb-6">Explora temas y mejora en cada área.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TOPICS.map(topic => (
            <Card
              key={topic.id}
              className={`cursor-pointer hover:border-rush-orange/50 transition-all ${selectedTopic === topic.id ? 'border-rush-orange/50' : ''}`}
              glow={selectedTopic === topic.id}
            >
              <div onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{topic.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold">{topic.name}</h3>
                    <p className="text-xs text-gray-400">{topic.completed}/{topic.total} ejercicios</p>
                  </div>
                  <Badge color={topic.progress > 50 ? 'green' : topic.progress > 25 ? 'yellow' : 'purple'}>
                    {topic.progress}%
                  </Badge>
                </div>
                <div className="w-full h-2 bg-rush-darker rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${topic.progress > 50 ? 'bg-rush-green' : topic.progress > 25 ? 'bg-rush-yellow' : 'bg-rush-purple'}`}
                    style={{ width: `${topic.progress}%` }}
                  />
                </div>
              </div>

              {selectedTopic === topic.id && (
                <div className="mt-4 pt-4 border-t border-rush-purple/20">
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm">⚡ Practicar</Button>
                    <Button variant="ghost" size="sm">Ver ejercicios</Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
