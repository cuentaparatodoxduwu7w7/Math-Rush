import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '../components/layout';
import { Card, Button, Badge, Modal } from '../components/ui';
import { MOCK_PLANS } from '../lib/mockData';
import { useAuth } from '../contexts/AuthContext';

export default function PlansPage() {
  const { user, updateProfile, isDeveloper } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<typeof MOCK_PLANS[0] | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'processing' | 'success' | 'cancelled'>('idle');
  const [showTestMode, setShowTestMode] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  function handleSelectPlan(plan: typeof MOCK_PLANS[0]) {
    if (plan.id === 'free') return;
    setSelectedPlan(plan);
    setShowCheckout(true);
    setCheckoutStatus('idle');
  }

  async function handleCheckout() {
    setCheckoutStatus('processing');
    // Simular procesamiento de demo
    await new Promise(resolve => setTimeout(resolve, 2000));
    setCheckoutStatus('success');
    
    // Activar plan en modo demo
    if (selectedPlan) {
      setCurrentPlan(selectedPlan.id);
      if (selectedPlan.id === 'teacher') {
        updateProfile({ role: 'teacher' });
      }
    }
  }

  function handleCancel() {
    setCheckoutStatus('cancelled');
    setTimeout(() => {
      setShowCheckout(false);
      setCheckoutStatus('idle');
      setSelectedPlan(null);
    }, 1500);
  }

  function activateTestPlan(planId: string) {
    if (!isDeveloper) return;
    setCurrentPlan(planId);
    if (planId === 'teacher') {
      updateProfile({ role: 'teacher' });
    } else if (planId === 'free') {
      updateProfile({ role: 'student' });
    }
    setShowTestMode(false);
  }

  function resetToFree() {
    if (!isDeveloper) return;
    setCurrentPlan('free');
    updateProfile({ role: 'student' });
    setShowTestMode(false);
  }

  const planIcons: Record<string, string> = {
    free: '🆓',
    rush: '⚡',
    legend: '👑',
    teacher: '👨‍🏫',
  };

  const planColors: Record<string, string> = {
    free: 'from-gray-500/20 to-gray-600/20 border-gray-500/30',
    rush: 'from-rush-orange/20 to-rush-yellow/20 border-rush-orange/40',
    legend: 'from-rush-purple/20 to-pink-500/20 border-rush-purple/40',
    teacher: 'from-rush-blue/20 to-cyan-500/20 border-rush-blue/40',
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl font-bold mb-3">
              Elige tu <span className="bg-gradient-to-r from-rush-orange to-rush-yellow bg-clip-text text-transparent">Plan</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Desbloquea todo el poder de Math Rush y lleva tu aprendizaje al siguiente nivel
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <div className="mt-6 inline-flex items-center gap-3 card-glass rounded-full p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                billingCycle === 'monthly' ? 'bg-rush-orange text-white' : 'text-gray-400'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                billingCycle === 'yearly' ? 'bg-rush-orange text-white' : 'text-gray-400'
              }`}
            >
              Anual <Badge color="green">-20%</Badge>
            </button>
          </div>
        </div>

        {/* Current Plan Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 card-glass rounded-2xl p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-rush-orange to-rush-yellow rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                {planIcons[currentPlan]}
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Tu plan actual</p>
                <h3 className="font-display text-2xl font-bold">
                  {MOCK_PLANS.find(p => p.id === currentPlan)?.name}
                </h3>
                {currentPlan !== 'free' && (
                  <p className="text-xs text-rush-orange mt-1">
                    ✓ Plan premium activo
                  </p>
                )}
              </div>
            </div>
            {currentPlan !== 'free' && (
              <Badge color="orange">PREMIUM</Badge>
            )}
          </div>
        </motion.div>

        {/* Developer Banner */}
        {isDeveloper && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-gradient-to-r from-rush-orange/20 to-rush-purple/20 border border-rush-orange/30 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🛠️</span>
                <div>
                  <p className="font-bold text-rush-orange">Modo Developer Activo</p>
                  <p className="text-sm text-gray-400">Tienes acceso completo a todas las funciones de prueba</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowTestMode(true)}>
                🧪 Modo Pruebas
              </Button>
            </div>
          </motion.div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {MOCK_PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${planColors[plan.id]} border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                plan.highlighted ? 'ring-2 ring-rush-orange shadow-lg shadow-rush-orange/30' : ''
              }`}
            >
              {/* Popular Badge */}
              {plan.highlighted && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-rush-orange to-rush-yellow text-white text-xs font-bold text-center py-1.5">
                  ⭐ MÁS POPULAR
                </div>
              )}

              <div className={`p-6 ${plan.highlighted ? 'pt-10' : ''}`}>
                {/* Current Plan Badge */}
                {currentPlan === plan.id && (
                  <div className="absolute top-3 right-3">
                    <Badge color="green">✓ ACTUAL</Badge>
                  </div>
                )}

                {/* Icon */}
                <div className="text-5xl mb-4">{planIcons[plan.id]}</div>

                {/* Name */}
                <h3 className="font-display text-xl font-bold mb-2">{plan.name}</h3>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black">{plan.currency}</span>
                    <span className="text-4xl font-black">
                      {billingCycle === 'yearly' ? (plan.price * 0.8).toFixed(2) : plan.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {plan.period || billingCycle === 'yearly' ? '/mes (facturado anual)' : ''}
                  </p>
                  {billingCycle === 'yearly' && plan.price > 0 && (
                    <p className="text-xs text-rush-green mt-1">
                      Ahorras S/ {(plan.price * 12 * 0.2).toFixed(2)} al año
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6 min-h-[180px]">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-rush-green mt-0.5">✓</span>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={currentPlan === plan.id ? 'ghost' : plan.highlighted ? 'primary' : 'outline'}
                  className="w-full"
                  onClick={() => handleSelectPlan(plan)}
                  disabled={plan.id === 'free' || currentPlan === plan.id}
                >
                  {currentPlan === plan.id ? '✓ PLAN ACTUAL' : plan.id === 'free' ? 'PLAN BÁSICO' : 'ELEGIR PLAN'}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Payment Methods */}
        <Card className="p-6 text-center mb-6">
          <h3 className="font-bold text-lg mb-4">💳 Medios de Pago Disponibles</h3>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {[
              { icon: '🟣', name: 'Yape' },
              { icon: '🔵', name: 'Plin' },
              { icon: '💳', name: 'Visa' },
              { icon: '💳', name: 'Mastercard' },
              { icon: '💳', name: 'Amex' },
              { icon: '🏦', name: 'Banca Móvil' },
              { icon: '🏪', name: 'PagoEfectivo' },
            ].map((method, i) => (
              <div key={i} className="flex items-center gap-2 card-glass rounded-lg px-3 py-2">
                <span>{method.icon}</span>
                <span className="text-gray-300">{method.name}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-4">Procesado por Culqi · Todos los precios en Soles (S/)</p>
        </Card>

        {/* Billing History */}
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4">📋 Historial de Pagos</h3>
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-400">No tienes pagos registrados</p>
            <p className="text-xs text-gray-500 mt-1">Tu historial aparecerá aquí después de tu primera suscripción</p>
          </div>
        </Card>
      </div>

      {/* Checkout Modal */}
      <Modal isOpen={showCheckout} onClose={() => { setShowCheckout(false); setCheckoutStatus('idle'); }} title="">
        {selectedPlan && (
          <div>
            <AnimatePresence mode="wait">
              {checkoutStatus === 'idle' && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* Demo Badge */}
                  <div className="bg-rush-orange/10 border border-rush-orange/30 rounded-xl p-3 mb-5">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🧪</span>
                      <div>
                        <p className="font-bold text-rush-orange text-sm">CHECKOUT DE DEMOSTRACIÓN</p>
                        <p className="text-xs text-gray-400">Esta es una simulación. No se procesará ningún pago real.</p>
                      </div>
                    </div>
                  </div>

                  {/* Plan Summary */}
                  <div className="card-glass rounded-xl p-5 mb-5">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-4xl">{planIcons[selectedPlan.id]}</span>
                      <div>
                        <h3 className="font-display text-xl font-bold">{selectedPlan.name}</h3>
                        <p className="text-sm text-gray-400">Suscripción {billingCycle === 'yearly' ? 'anual' : 'mensual'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-rush-purple/20">
                      <span className="text-gray-400">Total:</span>
                      <span className="text-2xl font-black text-rush-orange">
                        {selectedPlan.currency} {billingCycle === 'yearly' ? (selectedPlan.price * 0.8).toFixed(2) : selectedPlan.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="mb-5">
                    <h4 className="font-bold text-sm mb-3">Incluye:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedPlan.features.slice(0, 6).map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm bg-rush-darker/50 rounded-lg p-2">
                          <span className="text-rush-green">✓</span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="card-glass rounded-xl p-4 mb-5">
                    <h4 className="font-bold text-sm mb-3">Método de Prueba</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">🧪 Modo Demo</span>
                      <span className="text-2xl">🧪</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <Button variant="primary" className="w-full mb-3" size="lg" onClick={handleCheckout}>
                    🧪 ACTIVAR EN MODO DEMO
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={handleCancel}>
                    Cancelar
                  </Button>
                </motion.div>
              )}

              {checkoutStatus === 'processing' && (
                <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="text-6xl mb-4 inline-block"
                  >
                    💳
                  </motion.div>
                  <p className="font-bold text-lg mb-2">Procesando pago...</p>
                  <p className="text-sm text-gray-400">Por favor espera un momento</p>
                </motion.div>
              )}

              {checkoutStatus === 'success' && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="text-6xl mb-4"
                  >
                    ✅
                  </motion.div>
                  <p className="font-display text-2xl font-bold text-rush-green mb-2">¡Plan Activado!</p>
                  <p className="text-sm text-gray-400 mb-2">
                    <span className="font-bold text-rush-orange">{selectedPlan?.name}</span> ha sido activado en modo demostración
                  </p>
                  <div className="bg-rush-orange/10 border border-rush-orange/30 rounded-xl p-3 mb-6">
                    <p className="text-xs text-rush-orange">
                      🧪 Esta es una activación de demostración. No se procesó ningún pago real.
                    </p>
                  </div>
                  <Button variant="primary" className="w-full" onClick={() => { setShowCheckout(false); setCheckoutStatus('idle'); navigate('/app'); }}>
                    Ir al Lobby
                  </Button>
                </motion.div>
              )}

              {checkoutStatus === 'cancelled' && (
                <motion.div key="cancelled" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                  <div className="text-6xl mb-4">❌</div>
                  <p className="font-bold text-red-400 mb-2">Pago Cancelado</p>
                  <p className="text-sm text-gray-400">No se procesó ningún cargo</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </Modal>

      {/* Developer Test Mode Modal */}
      <Modal isOpen={showTestMode} onClose={() => setShowTestMode(false)} title="🧪 Modo de Pruebas">
        <div className="space-y-4">
          <div className="bg-rush-orange/10 border border-rush-orange/30 rounded-xl p-3">
            <p className="text-xs text-rush-orange">
              ⚠️ Esta herramienta es solo para demostración. NO procesa pagos reales.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-3">Plan Actual</h4>
            <div className="card-glass rounded-xl p-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{planIcons[currentPlan]}</span>
                <div className="flex-1">
                  <p className="font-bold">{MOCK_PLANS.find(p => p.id === currentPlan)?.name}</p>
                  <p className="text-xs text-gray-400">
                    {currentPlan === 'free' ? 'Plan básico' : 'Plan premium activo'}
                  </p>
                </div>
                <Badge color={currentPlan === 'free' ? 'green' : 'orange'}>
                  {currentPlan === 'free' ? 'ACTIVO' : 'PREMIUM'}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-3">Cambiar Plan (Demo)</h4>
            <div className="space-y-2">
              <Button 
                variant={currentPlan === 'free' ? 'ghost' : 'outline'} 
                size="sm" 
                className="w-full" 
                onClick={() => activateTestPlan('free')}
                disabled={currentPlan === 'free'}
              >
                🆓 Activar FREE
              </Button>
              <Button 
                variant={currentPlan === 'rush' ? 'ghost' : 'outline'} 
                size="sm" 
                className="w-full" 
                onClick={() => activateTestPlan('rush')}
                disabled={currentPlan === 'rush'}
              >
                ⚡ Activar Rush Pass
              </Button>
              <Button 
                variant={currentPlan === 'legend' ? 'ghost' : 'outline'} 
                size="sm" 
                className="w-full" 
                onClick={() => activateTestPlan('legend')}
                disabled={currentPlan === 'legend'}
              >
                👑 Activar Legend Pass
              </Button>
              <Button 
                variant={currentPlan === 'teacher' ? 'ghost' : 'outline'} 
                size="sm" 
                className="w-full" 
                onClick={() => activateTestPlan('teacher')}
                disabled={currentPlan === 'teacher'}
              >
                👨‍🏫 Activar Teacher
              </Button>
            </div>
          </div>

          <div className="pt-3 border-t border-rush-purple/20">
            <h4 className="font-bold text-sm mb-3">Acciones Avanzadas</h4>
            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="w-full text-red-400 hover:text-red-300" onClick={resetToFree}>
                🔄 Restablecer cuenta a FREE
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
