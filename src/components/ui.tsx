import React from 'react';
import { motion } from 'framer-motion';

// ============================================================
// REUSABLE UI COMPONENTS
// ============================================================

// Button
export function Button({ 
  children, variant = 'primary', size = 'md', className = '', disabled = false, ...props 
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  disabled?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants = {
    primary: 'btn-primary text-white font-bold',
    secondary: 'btn-secondary text-white font-bold',
    ghost: 'bg-transparent text-white hover:bg-white/10 font-medium',
    danger: 'bg-red-500 hover:bg-red-600 text-white font-bold',
    outline: 'border-2 border-rush-purple text-rush-purple hover:bg-rush-purple/10 font-bold',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-7 py-3.5 text-base rounded-xl',
    xl: 'px-10 py-5 text-lg rounded-2xl',
  };

  return (
    <button
      className={`${variants[variant]} ${sizes[size]} transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

// Card
export function Card({ children, className = '', glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) {
  return (
    <div className={`card-glass rounded-2xl p-5 ${glow ? 'shadow-lg shadow-rush-purple/20' : ''} ${className}`}>
      {children}
    </div>
  );
}

// Badge
export function Badge({ children, color = 'purple' }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    purple: 'bg-rush-purple/20 text-rush-purple-light border-rush-purple/30',
    orange: 'bg-rush-orange/20 text-rush-orange-light border-rush-orange/30',
    green: 'bg-rush-green/20 text-rush-green border-rush-green/30',
    blue: 'bg-rush-blue/20 text-rush-blue-light border-rush-blue/30',
    yellow: 'bg-rush-yellow/20 text-rush-yellow border-rush-yellow/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[color] || colors.purple}`}>
      {children}
    </span>
  );
}

// XP Bar
export function XPBar({ current, max, level, name, className = '' }: { current: number; max: number; level: number; name: string; className?: string }) {
  const progress = Math.min((current / max) * 100, 100);
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-bold text-rush-orange">Nv. {level} — {name}</span>
        <span className="text-xs text-gray-400">{current}/{max} XP</span>
      </div>
      <div className="w-full h-3 bg-rush-darker rounded-full overflow-hidden border border-rush-purple/20">
        <motion.div
          className="h-full bg-gradient-to-r from-rush-orange to-rush-yellow rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// Timer
export function Timer({ seconds, total, variant = 'default' }: { seconds: number; total?: number; variant?: 'default' | 'urgent' | 'circular' }) {
  const isUrgent = seconds <= 5;
  const progress = total ? (seconds / total) * 100 : 100;

  if (variant === 'circular') {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;
    return (
      <div className="relative w-16 h-16">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(139,92,246,0.2)" strokeWidth="4" />
          <circle cx="32" cy="32" r={radius} fill="none" stroke={isUrgent ? '#ef4444' : '#f97316'} strokeWidth="4"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            className="transition-all duration-1000" />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center font-bold text-lg ${isUrgent ? 'text-red-400' : 'text-white'}`}>
          {seconds}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg ${isUrgent ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-rush-card text-white'}`}>
      <span>⏱️</span>
      <span>{seconds}s</span>
    </div>
  );
}

// Lives
export function Lives({ count, max = 5 }: { count: number; max?: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`text-xl transition-all ${i < count ? 'scale-100' : 'scale-75 opacity-30'}`}>
          {i < count ? '❤️' : '🖤'}
        </span>
      ))}
    </div>
  );
}

// Combo Counter
export function ComboCounter({ combo }: { combo: number }) {
  if (combo < 2) return null;
  return (
    <motion.div
      key={combo}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-rush-orange to-rush-yellow rounded-full"
    >
      <span className="text-sm font-black text-white">🔥 x{combo}</span>
    </motion.div>
  );
}

// Boss Health Bar
export function BossHealthBar({ current, max, name, emoji }: { current: number; max: number; name: string; emoji: string }) {
  const progress = (current / max) * 100;
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">{emoji}</span>
        <span className="font-bold text-red-400 text-sm">{name}</span>
        <span className="text-xs text-gray-400 ml-auto">{current}/{max} HP</span>
      </div>
      <div className="w-full h-4 bg-rush-darker rounded-full overflow-hidden border border-red-500/30">
        <motion.div
          className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

// Player Health Bar
export function PlayerHealthBar({ current, max = 100 }: { current: number; max?: number }) {
  const progress = (current / max) * 100;
  const color = progress > 50 ? 'from-green-500 to-green-400' : progress > 25 ? 'from-yellow-500 to-yellow-400' : 'from-red-500 to-red-400';
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">🐹</span>
        <span className="font-bold text-green-400 text-sm">Tú</span>
        <span className="text-xs text-gray-400 ml-auto">{current}/{max} HP</span>
      </div>
      <div className="w-full h-4 bg-rush-darker rounded-full overflow-hidden border border-green-500/30">
        <motion.div
          className={`h-full bg-gradient-to-r ${color} rounded-full`}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

// Modal
export function Modal({ isOpen, onClose, children, title }: { isOpen: boolean; onClose: () => void; children: React.ReactNode; title?: string }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative card-glass rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {title && <h3 className="text-xl font-bold mb-4 font-display">{title}</h3>}
        {children}
      </motion.div>
    </div>
  );
}

// Skeleton Loader
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-rush-surface rounded-lg ${className}`} />;
}

// Avatar
export function Avatar({ src, name, size = 'md', level }: { src?: string | null; name: string; size?: 'sm' | 'md' | 'lg' | 'xl'; level?: number }) {
  const sizes = { sm: 'w-8 h-8 text-sm', md: 'w-12 h-12 text-lg', lg: 'w-16 h-16 text-2xl', xl: 'w-24 h-24 text-4xl' };
  return (
    <div className="relative">
      <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-rush-orange to-rush-purple flex items-center justify-center font-bold border-2 border-rush-purple/50 overflow-hidden`}>
        {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : <span>🐹</span>}
      </div>
      {level && (
        <div className="absolute -bottom-1 -right-1 bg-rush-orange text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-rush-dark">
          {level}
        </div>
      )}
    </div>
  );
}

// Plan Card
export function PlanCard({ plan, onSelect, currentPlan }: { plan: { id: string; name: string; price: number; currency: string; period: string; features: string[]; highlighted: boolean }; onSelect: () => void; currentPlan?: string }) {
  const isCurrent = currentPlan === plan.id;
  return (
    <div className={`relative rounded-2xl p-6 border-2 transition-all ${plan.highlighted ? 'border-rush-orange bg-gradient-to-b from-rush-orange/10 to-rush-card shadow-lg shadow-rush-orange/20' : 'border-rush-purple/30 bg-rush-card hover:border-rush-purple/60'}`}>
      {plan.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rush-orange text-white text-xs font-bold px-3 py-1 rounded-full">
          ⭐ POPULAR
        </div>
      )}
      <h3 className="font-display font-bold text-lg mb-1">{plan.name}</h3>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-3xl font-black">{plan.currency} {plan.price.toFixed(2)}</span>
        <span className="text-gray-400 text-sm">{plan.period}</span>
      </div>
      <ul className="space-y-2 mb-6">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
            <span className="text-rush-green">✓</span> {f}
          </li>
        ))}
      </ul>
      <Button
        variant={isCurrent ? 'ghost' : plan.highlighted ? 'primary' : 'outline'}
        className="w-full"
        disabled={isCurrent}
        onClick={onSelect}
      >
        {isCurrent ? '✓ PLAN ACTUAL' : 'ELEGIR PLAN'}
      </Button>
    </div>
  );
}

// Achievement Card
export function AchievementCard({ achievement, unlocked }: { achievement: { name: string; description: string; icon: string; xp_reward: number; coins_reward: number }; unlocked: boolean }) {
  return (
    <div className={`card-glass rounded-xl p-4 flex items-center gap-3 ${unlocked ? '' : 'opacity-50'}`}>
      <span className="text-3xl">{achievement.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate">{achievement.name}</p>
        <p className="text-xs text-gray-400 truncate">{achievement.description}</p>
        <div className="flex gap-2 mt-1">
          <span className="text-xs text-rush-purple">+{achievement.xp_reward} XP</span>
          <span className="text-xs text-rush-yellow">+{achievement.coins_reward} 🪙</span>
        </div>
      </div>
      {unlocked && <span className="text-rush-green text-lg">✓</span>}
    </div>
  );
}

// Empty State
export function EmptyState({ icon, title, description, action }: { icon: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-4 max-w-xs">{description}</p>
      {action}
    </div>
  );
}
