import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { Card } from '../components/ui';
import { useGame } from '../contexts/GameContext';
import { GameMode, Difficulty } from '../lib/supabase';

export default function GamesPage() {
  const navigate = useNavigate();
  const { startGame } = useGame();

  const modes = [
    { id: 'quick_rush' as GameMode, icon: '⚡', name: 'Quick Rush', desc: '10 preguntas rápidas. Perfecto para practicar.', color: 'from-rush-orange/20 to-rush-yellow/20', difficulty: 'basico' as Difficulty },
    { id: 'time_attack' as GameMode, icon: '🔥', name: 'Time Attack', desc: 'Resuelve todas las que puedas en 60 segundos.', color: 'from-red-500/20 to-rush-orange/20', difficulty: 'basico' as Difficulty },
    { id: 'boss_battle' as GameMode, icon: '💀', name: 'Boss Battle', desc: 'Enfrenta al jefe. Cada respuesta correcta lo daña.', color: 'from-rush-purple/20 to-rush-blue/20', difficulty: 'intermedio' as Difficulty },
    { id: 'survival' as GameMode, icon: '♾️', name: 'Survival', desc: '5 vidas. Dificultad creciente. ¿Cuánto aguantas?', color: 'from-rush-green/20 to-rush-blue/20', difficulty: 'basico' as Difficulty },
    { id: 'duel' as GameMode, icon: '⚔️', name: 'Duelo', desc: 'Compite contra otro jugador. Próximamente.', color: 'from-rush-yellow/20 to-rush-green/20', difficulty: 'intermedio' as Difficulty },
  ];

  function handleStart(mode: GameMode, difficulty: Difficulty) {
    if (mode === 'duel') return; // Not yet implemented
    startGame(mode, difficulty);
    navigate(`/app/game/${mode}`);
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <h1 className="font-display text-2xl font-bold mb-2">🎮 Modos de Juego</h1>
        <p className="text-gray-400 text-sm mb-6">Elige cómo quieres entrenar hoy.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modes.map(mode => (
            <button
              key={mode.id}
              onClick={() => handleStart(mode.id, mode.difficulty)}
              disabled={mode.id === 'duel'}
              className={`card-glass rounded-2xl p-6 text-left bg-gradient-to-br ${mode.color} hover:scale-[1.02] transition-all ${mode.id === 'duel' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className="text-4xl mb-3 block">{mode.icon}</span>
              <h3 className="font-display font-bold text-lg mb-1">{mode.name}</h3>
              <p className="text-sm text-gray-400">{mode.desc}</p>
              {mode.id === 'duel' && (
                <span className="inline-block mt-2 text-xs bg-rush-purple/20 text-rush-purple-light px-2 py-0.5 rounded-full">Próximamente</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
