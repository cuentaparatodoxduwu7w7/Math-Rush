import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppLayout } from '../components/layout';
import { Card, Button, Badge, Modal } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_SHOP_ITEMS } from '../lib/mockData';

export default function DeveloperPanel() {
  const { user, isDeveloper, developerPlan, setDeveloperPlan, updateProfile, entitlements } = useAuth();
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  if (!isDeveloper) {
    return (
      <AppLayout>
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-2">Acceso Restringido</h2>
            <p className="text-gray-400 mb-6">
              Esta sección está disponible solo para desarrolladores autorizados.
            </p>
            <Button variant="primary" onClick={() => navigate('/app')}>
              Volver al Lobby
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const plans = [
    { id: 'free', name: 'FREE', icon: '🆓', color: 'from-gray-500/20 to-gray-600/20 border-gray-500/30' },
    { id: 'rush', name: 'MATH RUSH PASS', icon: '⚡', color: 'from-rush-orange/20 to-rush-yellow/20 border-rush-orange/40' },
    { id: 'legend', name: 'LEGEND PASS', icon: '👑', color: 'from-rush-purple/20 to-pink-500/20 border-rush-purple/40' },
    { id: 'teacher', name: 'TEACHER', icon: '👨‍🏫', color: 'from-rush-blue/20 to-cyan-500/20 border-rush-blue/40' },
  ];

  const handlePlanChange = (planId: string) => {
    setSelectedPlan(planId);
    setShowConfirmModal(true);
  };

  const confirmPlanChange = () => {
    setDeveloperPlan(selectedPlan as any);
    setShowConfirmModal(false);
  };

  const handleResetAccount = () => {
    updateProfile({
      xp: 0,
      coins: 0,
      gems: 0,
      streak: 0,
      level: 1,
    });
    setDeveloperPlan('free');
  };

  const handleMaxResources = () => {
    updateProfile({
      xp: 999999,
      coins: 999999,
      gems: 9999,
      level: 50,
    });
  };

  const unlockedFeatures = [
    { name: 'Escáner básico (3/día)', unlocked: entitlements.canScan && entitlements.scanLimit === 3, icon: '📸' },
    { name: 'Escáner premium (10/día)', unlocked: entitlements.canScan && entitlements.scanLimit === 10, icon: '📸' },
    { name: 'Escáner ilimitado', unlocked: entitlements.canScan && entitlements.scanLimit >= 999, icon: '📸' },
    { name: 'Cuy Sabio (IA)', unlocked: entitlements.canUseAI, icon: '🧠' },
    { name: 'Sin anuncios', unlocked: entitlements.canRemoveAds, icon: '🚫' },
    { name: 'Todas las skins', unlocked: entitlements.canUseAllSkins, icon: '👕' },
    { name: 'Modo Pre-U', unlocked: entitlements.canAccessPreU, icon: '🎓' },
    { name: 'Simulacros', unlocked: entitlements.canAccessSimulations, icon: '📝' },
    { name: 'Estadísticas avanzadas', unlocked: entitlements.canAccessAdvancedStats, icon: '📊' },
    { name: 'Modo Duelo', unlocked: entitlements.canAccessDuel, icon: '⚔️' },
    { name: 'Panel docente', unlocked: entitlements.canAccessTeacherTools, icon: '👨‍🏫' },
    { name: 'Panel admin', unlocked: entitlements.canAccessAdmin, icon: '🛡️' },
    { name: 'Panel developer', unlocked: entitlements.canAccessDeveloper, icon: '🛠️' },
  ];

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-rush-orange to-rush-purple rounded-2xl flex items-center justify-center text-3xl shadow-lg">
              🛠️
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">Panel Developer</h1>
              <p className="text-gray-400">
                Modo de pruebas activo · Plan: <span className="text-rush-orange font-bold">{developerPlan.toUpperCase()}</span>
              </p>
            </div>
          </div>
          <div className="bg-rush-orange/10 border border-rush-orange/30 rounded-xl p-4">
            <p className="text-sm text-rush-orange">
              ⚠️ Este es un panel de desarrollo interno. Los cambios aquí no afectan pagos reales ni datos de producción.
            </p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-rush-purple mb-1">{user?.xp.toLocaleString()}</p>
            <p className="text-xs text-gray-400">XP Total</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-rush-yellow mb-1">{user?.coins.toLocaleString()}</p>
            <p className="text-xs text-gray-400">🪙 Monedas</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-rush-blue mb-1">{user?.gems}</p>
            <p className="text-xs text-gray-400">💎 Gemas</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-3xl font-bold text-rush-orange mb-1">🔥 {user?.streak}</p>
            <p className="text-xs text-gray-400">Racha</p>
          </Card>
        </div>

        {/* Plan Selector */}
        <Card className="p-6 mb-6">
          <h2 className="font-display text-xl font-bold mb-4">Cambiar Plan de Prueba</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <motion.button
                key={plan.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePlanChange(plan.id)}
                className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${plan.color} border-2 p-5 text-left transition-all ${
                  developerPlan === plan.id ? 'ring-2 ring-rush-orange shadow-lg shadow-rush-orange/30' : ''
                }`}
              >
                {developerPlan === plan.id && (
                  <div className="absolute top-2 right-2">
                    <Badge color="green">✓ ACTIVO</Badge>
                  </div>
                )}
                <div className="text-4xl mb-2">{plan.icon}</div>
                <h3 className="font-bold text-sm mb-1">{plan.name}</h3>
                <p className="text-xs text-gray-400">
                  {plan.id === 'free' && 'Plan básico'}
                  {plan.id === 'rush' && 'Plan premium'}
                  {plan.id === 'legend' && 'Plan legendario'}
                  {plan.id === 'teacher' && 'Para docentes'}
                </p>
              </motion.button>
            ))}
          </div>
        </Card>

        {/* Unlocked Features */}
        <Card className="p-6 mb-6">
          <h2 className="font-display text-xl font-bold mb-4">Funciones Desbloqueadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unlockedFeatures.map((feature, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  feature.unlocked ? 'bg-rush-green/10 border border-rush-green/30' : 'bg-gray-500/10 border border-gray-500/30 opacity-50'
                }`}
              >
                <span className="text-2xl">{feature.icon}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm">{feature.name}</p>
                </div>
                {feature.unlocked ? (
                  <span className="text-rush-green text-xl">✓</span>
                ) : (
                  <span className="text-gray-500 text-xl">✗</span>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Inventory Access */}
        <Card className="p-6 mb-6">
          <h2 className="font-display text-xl font-bold mb-4">Inventario Completo</h2>
          <p className="text-sm text-gray-400 mb-4">
            Como developer, tienes acceso a todos los items de la tienda:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-rush-orange/10 border border-rush-orange/30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-rush-orange mb-1">
                {MOCK_SHOP_ITEMS.filter(i => i.category === 'skin').length}
              </p>
              <p className="text-xs text-gray-400">Skins</p>
            </div>
            <div className="bg-rush-purple/10 border border-rush-purple/30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-rush-purple mb-1">
                {MOCK_SHOP_ITEMS.filter(i => i.category === 'pet').length}
              </p>
              <p className="text-xs text-gray-400">Mascotas</p>
            </div>
            <div className="bg-rush-blue/10 border border-rush-blue/30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-rush-blue mb-1">
                {MOCK_SHOP_ITEMS.filter(i => i.category === 'background').length}
              </p>
              <p className="text-xs text-gray-400">Fondos</p>
            </div>
            <div className="bg-rush-green/10 border border-rush-green/30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-rush-green mb-1">
                {MOCK_SHOP_ITEMS.filter(i => i.category === 'effect').length}
              </p>
              <p className="text-xs text-gray-400">Efectos</p>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => navigate('/app/shop')}>
            Ir a la Tienda
          </Button>
        </Card>

        {/* AI Usage */}
        <Card className="p-6 mb-6">
          <h2 className="font-display text-xl font-bold mb-4">Laboratorio IA</h2>
          <div className="bg-rush-green/10 border border-rush-green/30 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🤖</span>
              <div className="flex-1">
                <p className="font-bold text-rush-green">Uso Ilimitado</p>
                <p className="text-xs text-gray-400">Como developer, no tienes límites en el laboratorio IA</p>
              </div>
              <Badge color="green">∞</Badge>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => navigate('/app/ai-lab')}>
            Ir al Laboratorio IA
          </Button>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="font-display text-xl font-bold mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="primary" onClick={handleMaxResources}>
              ⚡ Max Recursos (999,999)
            </Button>
            <Button variant="outline" onClick={handleResetAccount}>
              🔄 Resetear Cuenta
            </Button>
            <Button variant="outline" onClick={() => navigate('/app/games')}>
              🎮 Ir a Juegos
            </Button>
            <Button variant="outline" onClick={() => navigate('/app/progress')}>
              📊 Ver Progreso
            </Button>
          </div>
        </Card>

        {/* Info */}
        <div className="mt-6 card-glass rounded-xl p-4">
          <p className="text-xs text-gray-500">
            <span className="text-rush-orange font-bold">NOTA:</span> Este panel es solo para desarrollo y pruebas.
            Los cambios aquí no afectan pagos reales, suscripciones externas ni datos de producción.
            El acceso ilimitado del developer es solamente interno de Math Rush.
          </p>
        </div>
      </div>

      {/* Confirm Plan Change Modal */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirmar Cambio de Plan">
        <div className="text-center">
          <div className="text-5xl mb-4">
            {plans.find(p => p.id === selectedPlan)?.icon}
          </div>
          <h3 className="font-display text-xl font-bold mb-2">
            ¿Activar {plans.find(p => p.id === selectedPlan)?.name}?
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            Este cambio es solo para pruebas en modo developer.
          </p>
          <div className="bg-rush-orange/10 border border-rush-orange/30 rounded-xl p-3 mb-6">
            <p className="text-xs text-rush-orange">
              🧪 Esto no procesará ningún pago real
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setShowConfirmModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" className="flex-1" onClick={confirmPlanChange}>
              Activar
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
