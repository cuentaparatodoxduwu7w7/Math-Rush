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
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'processing' | 'success' | 'failed' | 'cancelled'>('idle');
  const [showTestMode, setShowTestMode] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  function handleSelectPlan(plan: typeof MOCK_PLANS[0]) {
    if (plan.id === 'free') return;
    setSelectedPlan(plan);
    setShowCheckout(true);
    setCheckoutStatus('idle');
  }

  async function handleCheckout() {
    setCheckoutStatus('processing');
    await new Promise(resolve => setTimeout(resolve, 2000));
    setCheckoutStatus('success');
    if (user && selectedPlan) {
      updateProfile({ role: selectedPlan.id === 'teacher' ? 'teacher' : user.role });
    }
  }

  function handleCancel() {
    setCheckoutStatus('cancelled');
    setTimeout(() => {
      setShowCheckout(false);
      setCheckoutStatus('idle');
    }, 1500);
  }

  function activateTestPlan(planId: string) {
    if (!isDeveloper) return;
    const planNames: Record<string, string> = { 'rush': 'Rush', 'legend': 'Legend', 'teacher': 'Teacher' };
    alert(`[MODO PRUEBAS] Plan ${planNames[planId]} activado.\n\nEste es un modo de prueba para developer.\nNo se procesó ningún pago real.`);
    if (planId === 'teacher') updateProfile({ role: 'teacher' });
  }

  function resetToFree() {
    if (!isDeveloper) return;
    alert('[MODO PRUEBAS] Volviendo a plan FREE.');
    updateProfile({ role: 'student' });
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
                Modo Pruebas
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
                  variant={plan.highlighted ? 'primary' : 'outline'}
                  className="w-full"
                  onClick={() => handleSelectPlan(plan)}
                  disabled={plan.id === 'free'}
                >
                  {plan.id === 'free' ? 'PLAN ACTUAL' : 'ELEGIR PLAN'}
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
                    <h4 className="font-bold text-sm mb-3">Método de Pago</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Serás redirigido a Culqi</span>
                      <span className="text-2xl">💳</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <Button variant="primary" className="w-full mb-3" size="lg" onClick={handleCheckout}>
                    CONTINUAR AL PAGO
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
                  <p className="font-display text-2xl font-bold text-rush-green mb-2">¡Pago Exitoso!</p>
                  <p className="text-sm text-gray-400 mb-6">Tu suscripción ha sido activada</p>
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

              {checkoutStatus === 'failed' && (
                <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
                  <div className="text-6xl mb-4">⚠️</div>
                  <p className="font-bold text-red-400 mb-2">Error en el Pago</p>
                  <p className="text-sm text-gray-400 mb-4">Ups, algo salió mal. Intenta nuevamente.</p>
                  <Button variant="primary" className="w-full" onClick={() => setCheckoutStatus('idle')}>
                    Reintentar
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </Modal>

      {/* Developer Test Mode Modal */}
      <Modal isOpen={showTestMode} onClose={() => setShowTestMode(false)} title="🛠️ Modo de Pruebas Developer">
        <div className="space-y-4">
          <div className="bg-rush-orange/10 border border-rush-orange/30 rounded-xl p-3">
            <p className="text-xs text-rush-orange">
              ⚠️ Este es un modo de prueba interno. NO procesa pagos reales.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-2">Activar Plan (Prueba)</h4>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full" onClick={() => activateTestPlan('rush')}>
                Activar Rush Pass
              </Button>
              <Button variant="outline" size="sm" className="w-full" onClick={() => activateTestPlan('legend')}>
                Activar Legend Pass
              </Button>
              <Button variant="outline" size="sm" className="w-full" onClick={() => activateTestPlan('teacher')}>
                Activar Teacher
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-2">Resetear</h4>
            <Button variant="ghost" size="sm" className="w-full" onClick={resetToFree}>
              Volver a FREE
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
