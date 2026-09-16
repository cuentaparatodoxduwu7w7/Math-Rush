import React from 'react';
import { AppLayout } from '../components/layout';
import { Card, Badge, XPBar, Avatar } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { getLevelInfo } from '../lib/mockData';

export default function ProgressPage() {
  const { user } = useAuth();
  if (!user) return null;

  const levelInfo = getLevelInfo(user.xp);

  const stats = {
    gamesPlayed: 47,
    correctAnswers: 312,
    wrongAnswers: 88,
    accuracy: 78,
    avgTime: 8.5,
    totalXP: user.xp,
    bestCombo: 12,
    currentStreak: user.streak,
  };

  const weeklyData = [
    { day: 'Lun', xp: 120 },
    { day: 'Mar', xp: 80 },
    { day: 'Mié', xp: 200 },
    { day: 'Jue', xp: 150 },
    { day: 'Vie', xp: 90 },
    { day: 'Sáb', xp: 300 },
    { day: 'Dom', xp: 0 },
  ];

  const maxXp = Math.max(...weeklyData.map(d => d.xp));

  const strongTopics = ['Aritmética', 'Estadística'];
  const weakTopics = ['Trigonometría', 'Geometría'];

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <h1 className="font-display text-2xl font-bold mb-6">📊 Tu Progreso</h1>

        {/* Profile Summary */}
        <Card className="mb-6 p-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar name={user.nickname} level={levelInfo.level} size="xl" />
            <div className="flex-1">
              <h2 className="font-bold text-xl">{user.nickname}</h2>
              <Badge color="orange">Nv. {levelInfo.level} — {levelInfo.name}</Badge>
              <div className="mt-3">
                <XPBar current={user.xp} max={levelInfo.nextLevelXp} level={levelInfo.level} name={levelInfo.name} />
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-rush-orange">{stats.gamesPlayed}</p>
            <p className="text-xs text-gray-400">Partidas</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-rush-green">{stats.accuracy}%</p>
            <p className="text-xs text-gray-400">Aciertos</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-rush-purple">{stats.bestCombo}</p>
            <p className="text-xs text-gray-400">Mejor combo</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-rush-yellow">🔥 {stats.currentStreak}</p>
            <p className="text-xs text-gray-400">Racha</p>
          </Card>
        </div>

        {/* Weekly Activity */}
        <Card className="mb-6 p-5">
          <h3 className="font-bold mb-4">Actividad Semanal</h3>
          <div className="flex items-end justify-between gap-2 h-32">
            {weeklyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-rush-darker rounded-t-lg relative" style={{ height: '100%' }}>
                  <div
                    className="absolute bottom-0 w-full bg-gradient-to-t from-rush-orange to-rush-yellow rounded-t-lg transition-all"
                    style={{ height: `${maxXp > 0 ? (d.xp / maxXp) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-500">{d.day}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Topics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="font-bold mb-3 text-rush-green">💪 Temas Fuertes</h3>
            <div className="space-y-2">
              {strongTopics.map(t => (
                <div key={t} className="flex items-center gap-2 bg-rush-green/10 rounded-lg p-2">
                  <span className="text-rush-green">✓</span>
                  <span className="text-sm">{t}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-5">
            <h3 className="font-bold mb-3 text-rush-orange">📝 Temas a Mejorar</h3>
            <div className="space-y-2">
              {weakTopics.map(t => (
                <div key={t} className="flex items-center gap-2 bg-rush-orange/10 rounded-lg p-2">
                  <span className="text-rush-orange">→</span>
                  <span className="text-sm">{t}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Additional Stats */}
        <Card className="mt-6 p-5">
          <h3 className="font-bold mb-3">Estadísticas Detalladas</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Respuestas correctas</span>
              <span className="font-bold text-rush-green">{stats.correctAnswers}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Respuestas incorrectas</span>
              <span className="font-bold text-red-400">{stats.wrongAnswers}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Tiempo promedio</span>
              <span className="font-bold">{stats.avgTime}s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">XP Total</span>
              <span className="font-bold text-rush-purple">{stats.totalXP.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
