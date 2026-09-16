import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { Card, Button, Badge, EmptyState } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: '📊 Resumen' },
    { id: 'users', label: '👥 Usuarios' },
    { id: 'content', label: '📝 Contenido' },
    { id: 'payments', label: '💳 Pagos' },
    { id: 'analytics', label: '📈 Analíticas' },
  ];

  if (user?.role === 'developer') {
    tabs.push({ id: 'developer', label: '🛠️ Developer' });
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold">🛡️ Panel Administrativo</h1>
            <p className="text-gray-400 text-sm">
              {user?.role === 'developer' ? 'Modo Developer — Acceso total' : 'Administración del sistema'}
            </p>
          </div>
          <Link to="/app">
            <Button variant="ghost" size="sm">← Volver</Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-rush-orange text-white' : 'bg-rush-card text-gray-400 hover:text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-rush-blue">1,247</p>
                <p className="text-xs text-gray-400">Usuarios</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-rush-green">89</p>
                <p className="text-xs text-gray-400">Activos hoy</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-rush-orange">3,456</p>
                <p className="text-xs text-gray-400">Partidas</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-rush-purple">S/ 2,340</p>
                <p className="text-xs text-gray-400">Ingresos/mes</p>
              </Card>
            </div>
            <Card className="p-5">
              <h3 className="font-bold mb-3">Actividad Reciente</h3>
              <div className="space-y-2">
                {[
                  { event: 'Nuevo usuario registrado', time: 'Hace 2 min', type: 'user' },
                  { event: 'Partida completada (Boss Battle)', time: 'Hace 5 min', type: 'game' },
                  { event: 'Suscripción Rush activada', time: 'Hace 12 min', type: 'payment' },
                  { event: 'Escaneo completado', time: 'Hace 15 min', type: 'scan' },
                  { event: 'Logro desbloqueado: Velocista', time: 'Hace 20 min', type: 'achievement' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-rush-purple/10 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.type === 'user' ? '👤' : item.type === 'game' ? '🎮' : item.type === 'payment' ? '💳' : item.type === 'scan' ? '📸' : '🏆'}</span>
                      <span className="text-sm">{item.event}</span>
                    </div>
                    <span className="text-xs text-gray-500">{item.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div>
            <Card className="p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Usuarios</h3>
                <input type="search" placeholder="Buscar..." className="bg-rush-darker border border-rush-purple/30 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-rush-orange" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-rush-purple/20">
                      <th className="pb-2">Usuario</th>
                      <th className="pb-2">Rol</th>
                      <th className="pb-2">Nivel</th>
                      <th className="pb-2">Plan</th>
                      <th className="pb-2">Registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'CuyGamer', role: 'student', level: 12, plan: 'free', date: '2024-01-15' },
                      { name: 'LlamaPro', role: 'student', level: 25, plan: 'rush', date: '2024-02-20' },
                      { name: 'MathTeacher', role: 'teacher', level: 30, plan: 'teacher', date: '2024-01-01' },
                      { name: 'AdminUser', role: 'admin', level: 50, plan: 'legend', date: '2023-12-01' },
                    ].map((u, i) => (
                      <tr key={i} className="border-b border-rush-purple/10">
                        <td className="py-3 font-medium">{u.name}</td>
                        <td className="py-3"><Badge color={u.role === 'admin' ? 'red' : u.role === 'teacher' ? 'blue' : 'purple'}>{u.role}</Badge></td>
                        <td className="py-3">{u.level}</td>
                        <td className="py-3"><Badge color={u.plan === 'legend' ? 'yellow' : u.plan === 'rush' ? 'orange' : 'green'}>{u.plan}</Badge></td>
                        <td className="py-3 text-gray-400">{u.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Content */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="font-bold mb-3">Gestión de Contenido</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Preguntas', count: 450, icon: '❓' },
                  { label: 'Temas', count: 6, icon: '📚' },
                  { label: 'Bosses', count: 8, icon: '👹' },
                  { label: 'Logros', count: 24, icon: '🏆' },
                ].map((item, i) => (
                  <div key={i} className="bg-rush-darker rounded-xl p-4 text-center">
                    <span className="text-2xl">{item.icon}</span>
                    <p className="font-bold text-lg mt-1">{item.count}</p>
                    <p className="text-xs text-gray-400">{item.label}</p>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="font-bold mb-3">Preguntas Recientes</h3>
              <div className="space-y-2">
                {['¿Cuánto es 15 × 8?', 'Resuelve: 3x + 7 = 22', 'Área de triángulo base 10, altura 6'].map((q, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-rush-purple/10 last:border-0">
                    <span className="text-sm">{q}</span>
                    <Badge color="purple">Activa</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Payments */}
        {activeTab === 'payments' && (
          <Card className="p-5">
            <h3 className="font-bold mb-3">Transacciones</h3>
            <div className="space-y-2">
              {[
                { user: 'LlamaPro', amount: 'S/ 4.90', plan: 'Rush', status: 'success', date: '2024-12-01' },
                { user: 'MathKing', amount: 'S/ 9.90', plan: 'Legend', status: 'success', date: '2024-11-28' },
                { user: 'TeacherA', amount: 'S/ 19.90', plan: 'Teacher', status: 'pending', date: '2024-11-25' },
              ].map((t, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-rush-purple/10 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{t.user}</p>
                    <p className="text-xs text-gray-400">{t.plan} · {t.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{t.amount}</p>
                    <Badge color={t.status === 'success' ? 'green' : 'yellow'}>{t.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Analytics */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="font-bold mb-3">Modos más jugados</h3>
              {[
                { mode: 'Quick Rush', pct: 45 },
                { mode: 'Survival', pct: 25 },
                { mode: 'Boss Battle', pct: 18 },
                { mode: 'Time Attack', pct: 12 },
              ].map((m, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{m.mode}</span>
                    <span className="text-gray-400">{m.pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-rush-darker rounded-full overflow-hidden">
                    <div className="h-full bg-rush-orange rounded-full" style={{ width: `${m.pct}%` }} />
                  </div>
                </div>
              ))}
            </Card>
            <Card className="p-5">
              <h3 className="font-bold mb-3">Temas más difíciles</h3>
              {[
                { topic: 'Trigonometría', pct: 35 },
                { topic: 'Álgebra avanzada', pct: 42 },
                { topic: 'Geometría', pct: 55 },
                { topic: 'Probabilidad', pct: 48 },
              ].map((t, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t.topic}</span>
                    <span className="text-gray-400">{t.pct}% error</span>
                  </div>
                  <div className="w-full h-2 bg-rush-darker rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${t.pct}%` }} />
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* Developer Tab */}
        {activeTab === 'developer' && user?.role === 'developer' && (
          <div className="space-y-4">
            <Card className="p-5 border-rush-orange/30">
              <h3 className="font-bold mb-3 text-rush-orange">🛠️ Panel Developer</h3>
              <p className="text-sm text-gray-400 mb-4">Acceso ilimitado dentro de Math Rush. No usar para evadir pagos externos.</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-rush-darker rounded-xl p-3">
                  <p className="text-xs text-gray-400">Entitlements activos</p>
                  <p className="font-bold text-rush-green">Todos ✓</p>
                </div>
                <div className="bg-rush-darker rounded-xl p-3">
                  <p className="text-xs text-gray-400">Skins desbloqueadas</p>
                  <p className="font-bold text-rush-green">Todas ✓</p>
                </div>
                <div className="bg-rush-darker rounded-xl p-3">
                  <p className="text-xs text-gray-400">IA requests</p>
                  <p className="font-bold text-rush-green">Ilimitados ✓</p>
                </div>
                <div className="bg-rush-darker rounded-xl p-3">
                  <p className="text-xs text-gray-400">Escaneos</p>
                  <p className="font-bold text-rush-green">Ilimitados ✓</p>
                </div>
              </div>
            </Card>
            <Card className="p-5">
              <h3 className="font-bold mb-3">Configuración del Sistema</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-rush-purple/10">
                  <span className="text-gray-400">Supabase conectado</span>
                  <Badge color="yellow">MOCK MODE</Badge>
                </div>
                <div className="flex justify-between py-2 border-b border-rush-purple/10">
                  <span className="text-gray-400">Google OAuth</span>
                  <Badge color="yellow">PENDIENTE CONFIG</Badge>
                </div>
                <div className="flex justify-between py-2 border-b border-rush-purple/10">
                  <span className="text-gray-400">Proveedor de pagos (Culqi)</span>
                  <Badge color="yellow">PENDIENTE CONFIG</Badge>
                </div>
                <div className="flex justify-between py-2 border-b border-rush-purple/10">
                  <span className="text-gray-400">IA Provider</span>
                  <Badge color="yellow">MOCK MODE</Badge>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Feature: ads_enabled</span>
                  <Badge color="green">false</Badge>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
