import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { Card, Badge, Avatar, Button } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { getLevelInfo, MOCK_ACHIEVEMENTS } from '../lib/mockData';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const levelInfo = getLevelInfo(user.xp);
  const unlockedAchievements = ['a1', 'a2']; // Mock: first two unlocked

  async function handleLogout() {
    await signOut();
    navigate('/');
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-3xl mx-auto">
        {/* Profile Header */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <Avatar name={user.nickname} level={levelInfo.level} size="xl" />
            <div className="flex-1">
              <h2 className="font-display text-2xl font-bold">{user.nickname}</h2>
              <p className="text-sm text-gray-400">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge color="orange">Nv. {levelInfo.level}</Badge>
                <Badge color="purple">{levelInfo.name}</Badge>
                <Badge color="blue">{user.role}</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="p-4 text-center">
            <p className="text-xl font-bold text-rush-purple">{user.xp.toLocaleString()}</p>
            <p className="text-xs text-gray-400">XP Total</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xl font-bold text-rush-yellow">{user.coins.toLocaleString()}</p>
            <p className="text-xs text-gray-400">🪙 Monedas</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xl font-bold text-rush-blue">{user.gems}</p>
            <p className="text-xs text-gray-400">💎 Gemas</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xl font-bold text-rush-orange">🔥 {user.streak}</p>
            <p className="text-xs text-gray-400">Racha</p>
          </Card>
        </div>

        {/* Info */}
        <Card className="p-5 mb-6">
          <h3 className="font-bold mb-3">Información</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Grado</span>
              <span className="font-medium">{user.grade || 'No definido'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Nivel matemático</span>
              <span className="font-medium">{user.math_level || 'No definido'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Objetivo</span>
              <span className="font-medium">{user.goal || 'No definido'}</span>
            </div>
          </div>
        </Card>

        {/* Achievements */}
        <Card className="p-5 mb-6">
          <h3 className="font-bold mb-3">🏆 Logros</h3>
          <div className="space-y-2">
            {MOCK_ACHIEVEMENTS.map(a => (
              <div key={a.id} className={`flex items-center gap-3 p-2 rounded-lg ${unlockedAchievements.includes(a.id) ? 'bg-rush-orange/5' : 'opacity-50'}`}>
                <span className="text-2xl">{a.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{a.name}</p>
                  <p className="text-xs text-gray-400">{a.description}</p>
                </div>
                {unlockedAchievements.includes(a.id) && <span className="text-rush-green">✓</span>}
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Link to="/app/settings">
            <Card className="p-4 flex items-center gap-3 hover:border-rush-purple/50 transition-all cursor-pointer">
              <span className="text-xl">⚙️</span>
              <span className="font-medium text-sm">Configuración</span>
              <span className="ml-auto text-gray-500">→</span>
            </Card>
          </Link>
          <Link to="/app/plans">
            <Card className="p-4 flex items-center gap-3 hover:border-rush-orange/50 transition-all cursor-pointer">
              <span className="text-xl">⭐</span>
              <span className="font-medium text-sm">Mis Planes</span>
              <span className="ml-auto text-gray-500">→</span>
            </Card>
          </Link>
          {user.role === 'teacher' && (
            <Link to="/teacher">
              <Card className="p-4 flex items-center gap-3 hover:border-rush-blue/50 transition-all cursor-pointer">
                <span className="text-xl">👨‍🏫</span>
                <span className="font-medium text-sm">Panel Docente</span>
                <span className="ml-auto text-gray-500">→</span>
              </Card>
            </Link>
          )}
          {(user.role === 'admin' || user.role === 'developer') && (
            <Link to="/admin">
              <Card className="p-4 flex items-center gap-3 hover:border-rush-red/50 transition-all cursor-pointer">
                <span className="text-xl">🛡️</span>
                <span className="font-medium text-sm">Panel Admin</span>
                <span className="ml-auto text-gray-500">→</span>
              </Card>
            </Link>
          )}
          <Button variant="danger" className="w-full" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
