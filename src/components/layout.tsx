import React from 'react';
import { NavLink, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Skeleton } from './ui';

// ============================================================
// BOTTOM NAVIGATION (Mobile)
// ============================================================
export function BottomNav() {
  const location = useLocation();
  const isGameplay = location.pathname.includes('/game/');
  
  if (isGameplay) return null;

  const links = [
    { to: '/app', icon: '🏠', label: 'Inicio' },
    { to: '/app/games', icon: '🎮', label: 'Juegos' },
    { to: '/app/progress', icon: '📊', label: 'Progreso' },
    { to: '/app/shop', icon: '🛒', label: 'Tienda' },
    { to: '/app/profile', icon: '👤', label: 'Perfil' },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden" 
      aria-label="Navegación principal"
      style={{
        background: 'linear-gradient(180deg, rgba(15, 10, 30, 0.95) 0%, rgba(15, 10, 30, 0.99) 100%)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(139, 92, 246, 0.2)',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                isActive 
                  ? 'text-rush-orange scale-110 bg-rush-orange/10' 
                  : 'text-gray-400 hover:text-white'
              }`
            }
          >
            <span className="text-xl">{link.icon}</span>
            <span className="text-[10px] font-medium">{link.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

// ============================================================
// SIDEBAR (Desktop)
// ============================================================
export function Sidebar() {
  const location = useLocation();
  const isGameplay = location.pathname.includes('/game/');
  
  if (isGameplay) return null;

  const links = [
    { to: '/app', icon: '🏠', label: 'Lobby' },
    { to: '/app/scan', icon: '📸', label: 'Escanear' },
    { to: '/app/games', icon: '🎮', label: 'Juegos' },
    { to: '/app/library', icon: '📚', label: 'Biblioteca' },
    { to: '/app/progress', icon: '📊', label: 'Progreso' },
    { to: '/app/shop', icon: '🛒', label: 'Tienda' },
    { to: '/app/ai-lab', icon: '🤖', label: 'Lab IA' },
    { to: '/app/profile', icon: '👤', label: 'Perfil' },
    { to: '/app/plans', icon: '⭐', label: 'Planes' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen p-4 fixed left-0 top-0 z-30" style={{
      background: 'linear-gradient(180deg, rgba(26, 18, 48, 0.95) 0%, rgba(15, 10, 30, 0.98) 100%)',
      borderRight: '1px solid rgba(139, 92, 246, 0.15)',
      backdropFilter: 'blur(20px)',
    }}>
      <div className="flex items-center gap-3 mb-8 px-2 py-2">
        <div className="w-10 h-10 bg-gradient-to-br from-rush-orange to-rush-yellow rounded-xl flex items-center justify-center shadow-lg shadow-rush-orange/30">
          <span className="text-xl">🐹</span>
        </div>
        <h1 className="font-display font-bold text-xl bg-gradient-to-r from-rush-orange to-rush-yellow bg-clip-text text-transparent">MATH RUSH</h1>
      </div>
      <nav className="flex-1 space-y-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-rush-orange/20 to-rush-orange/5 text-rush-orange border border-rush-orange/30 shadow-lg shadow-rush-orange/10' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <span className="text-lg">{link.icon}</span>
            <span className="font-medium text-sm">{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-rush-purple/20">
        <NavLink to="/app/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all">
          <span>⚙️</span>
          <span className="font-medium text-sm">Configuración</span>
        </NavLink>
      </div>
    </aside>
  );
}

// ============================================================
// PROTECTED ROUTE
// ============================================================
export function ProtectedRoute({ children, requireRole }: { children: React.ReactNode; requireRole?: string[] }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🐹</div>
          <Skeleton className="w-48 h-4 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireRole && user && !requireRole.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card-glass rounded-2xl p-8 text-center max-w-md">
          <span className="text-5xl mb-4 block">🔒</span>
          <h2 className="text-xl font-bold mb-2">Acceso Restringido</h2>
          <p className="text-gray-400">No tienes permiso para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ============================================================
// APP LAYOUT
// ============================================================
export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-rush-dark">
      <Sidebar />
      <main className="md:ml-64 pb-20 md:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
