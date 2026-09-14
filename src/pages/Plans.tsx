import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppLayout } from '../components/layout';
import { Card, Button, PlanCard, Badge, Modal } from '../components/ui';
import { MOCK_PLANS } from '../lib/mockData';
import { useAuth } from '../contexts/AuthContext';

export default function PlansPage() {
  const { user, updateProfile, isDeveloper } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<typeof MOCK_PLANS[0] | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'processing' | 'success' | 'failed' | 'cancelled'>('idle');
  const [showTestMode, setShowTestMode] = useState(false);

  function handleSelectPlan(plan: typeof MOCK_PLANS[0]) {
    if (plan.id === 'free') return;
    setSelectedPlan(plan);
    setShowCheckout(true);
    setCheckoutStatus('idle');
  }

  async function handleCheckout() {
    setCheckoutStatus('processing');
    
    // MOCK: Simulate payment processing
    // In production, this would redirect to Culqi/payment provider
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate success
    setCheckoutStatus('success');
    
    // Update user plan (MOCK - in production this comes from backend webhook)
    if (user && selectedPlan) {
      updateProfile({ 
        role: selectedPlan.id === 'teacher' ? 'teacher' : user.role 
      });
    }
  }

  function handleCancel() {
    setCheckoutStatus('cancelled');
    setTimeout(() => {
      setShowCheckout(false);
      setCheckoutStatus('idle');
    }, 1500);
  }

  // Developer Test Mode Functions
  function activateTestPlan(planId: string) {
    if (!isDeveloper) return;
    
    const planNames: Record<string, string> = {
      'rush': 'Rush',
      'legend': 'Legend',
      'teacher': 'Teacher',
    };
    
    alert(`[MODO PRUEBAS] Plan ${planNames[planId]} activado.\n\nEste es un modo de prueba para developer.\nNo se procesó ningún pago real.`);
    
    if (planId === 'teacher') {
      updateProfile({ role: 'teacher' });
    }
  }

  function resetToFree() {
    if (!isDeveloper) return;
    alert('[MODO PRUEBAS] Volviendo a plan FREE.\n\nNo se procesó ningún reembolso real.');
    updateProfile({ role: 'student' });
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">⭐ Elige tu Plan</h1>
          <p className="text-gray-400">Desbloquea todo el poder de Math Rush.</p>
        </div>

        {/* Developer Test Mode Banner */}
        {isDeveloper && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-r from-rush-orange/20 to-rush-purple/20 border border-rush-orange/30 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-rush-orange">🛠️ Modo Developer Activo</p>
                <p className="text-xs text-gray-400">Tienes acceso completo a todas las funciones de prueba.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowTestMode(true)}>
                Modo Pruebas
              </Button>
            </div>
          </motion.div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {MOCK_PLANS.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSelect={() => handleSelectPlan(plan)}
              currentPlan={isDeveloper ? 'developer' : 'free'}
            />
          ))}
        </div>

        {/* Payment Info */}
        <Card className="p-5 text-center">
          <h3 className="font-bold mb-2">💳 Medios de Pago Disponibles</h3>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-400">
            <span>🟣 Yape</span>
            <span>🔵 Plin</span>
            <span>💳 Visa</span>
            <span>💳 Mastercard</span>
            <span>💳 American Express</span>
            <span>🏦 Banca Móvil</span>
            <span>🏪 PagoEfectivo</span>
          </div>
          <p className="text-xs text-gray-500 mt-3">Procesado por Culqi · Todos los precios en Soles (S/)</p>
        </Card>

        {/* Billing History */}
        <Card className="mt-6 p-5">
          <h3 className="font-bold mb-3">📋 Mis Pagos</h3>
          <div className="text-center py-4">
            <p className="text-gray-400 text-sm">No tienes pagos registrados.</p>
            <p className="text-xs text-gray-500 mt-1">Tu historial de pagos aparecerá aquí.</p>
          </div>
        </Card>

        {/* Info */}
        <div className="mt-6 card-glass rounded-xl p-4">
          <p className="text-xs text-gray-500">
            <span className="text-rush-orange font-bold">CONFIGURACIÓN PENDIENTE:</span> Para activar pagos reales se requiere:
            <br />• Cuenta de comercio en Culqi
            <br />• Culqi publicKey (frontend) + secretKey (backend)
            <br />• Webhook URL configurada en panel de Culqi
            <br />• Edge Function para procesar webhooks
            <br />• NUNCA almacenar datos de tarjeta en nuestra base de datos
          </p>
        </div>
      </div>

      {/* Checkout Modal */}
      <Modal isOpen={showCheckout} onClose={() => { setShowCheckout(false); setCheckoutStatus('idle'); }} title="Confirmar compra">
        {selectedPlan && (
          <div>
            {checkoutStatus === 'idle' && (
              <>
                <div className="text-center mb-6">
                  <h3 className="font-display text-xl font-bold">{selectedPlan.name}</h3>
                  <p className="text-3xl font-black text-rush-orange mt-2">
                    {selectedPlan.currency} {selectedPlan.price.toFixed(2)}
                    <span className="text-sm text-gray-400">{selectedPlan.period}</span>
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  <h4 className="font-medium text-sm text-gray-400">Beneficios incluidos:</h4>
                  {selectedPlan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-rush-green">✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <Button variant="primary" className="w-full" onClick={handleCheckout}>
                    💳 CONTINUAR AL PAGO
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={handleCancel}>
                    Cancelar
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Serás redirigido al proveedor de pago seguro.
                  </p>
                </div>
              </>
            )}

            {checkoutStatus === 'processing' && (
              <div className="text-center py-8">
                <div className="animate-spin text-4xl mb-4">💳</div>
                <p className="font-bold mb-2">Procesando pago...</p>
                <p className="text-sm text-gray-400">Por favor espera</p>
              </div>
            )}

            {checkoutStatus === 'success' && (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <p className="font-bold text-rush-green mb-2">¡Pago Exitoso!</p>
                <p className="text-sm text-gray-400 mb-4">Tu suscripción ha sido activada.</p>
                <Button variant="primary" className="w-full" onClick={() => { setShowCheckout(false); setCheckoutStatus('idle'); navigate('/app'); }}>
                  Ir al Lobby
                </Button>
              </div>
            )}

            {checkoutStatus === 'cancelled' && (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">❌</div>
                <p className="font-bold text-red-400 mb-2">Pago Cancelado</p>
                <p className="text-sm text-gray-400">No se procesó ningún cargo.</p>
              </div>
            )}

            {checkoutStatus === 'failed' && (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">⚠️</div>
                <p className="font-bold text-red-400 mb-2">Error en el Pago</p>
                <p className="text-sm text-gray-400 mb-4">Ups, algo salió mal. Intenta nuevamente.</p>
                <Button variant="primary" className="w-full" onClick={() => setCheckoutStatus('idle')}>
                  Reintentar
                </Button>
              </div>
            )}
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

          <div className="text-xs text-gray-500 pt-2 border-t border-rush-purple/20">
            <p>Separación clara:</p>
            <p>• REAL PAYMENT → Culqi/Webhook</p>
            <p>• DEVELOPER TEST → Solo frontend mock</p>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
