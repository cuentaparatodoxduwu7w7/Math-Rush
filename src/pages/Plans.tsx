import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { Card, Button, PlanCard, Badge, Modal } from '../components/ui';
import { MOCK_PLANS } from '../lib/mockData';
import { useAuth } from '../contexts/AuthContext';

export default function PlansPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<typeof MOCK_PLANS[0] | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  function handleSelectPlan(plan: typeof MOCK_PLANS[0]) {
    if (plan.id === 'free') return;
    setSelectedPlan(plan);
    setShowCheckout(true);
  }

  function handleCheckout() {
    // MOCK ONLY: In production, this would redirect to Culqi/payment provider
    // The actual payment flow requires:
    // 1. Backend Edge Function to create payment intent
    // 2. Culqi.js or payment provider SDK for card handling
    // 3. Webhook to confirm payment
    // 4. NEVER process cards or store card data on frontend
    navigate('/app/payment/success');
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">⭐ Elige tu Plan</h1>
          <p className="text-gray-400">Desbloquea todo el poder de Math Rush.</p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {MOCK_PLANS.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSelect={() => handleSelectPlan(plan)}
              currentPlan={user?.role === 'developer' ? 'developer' : 'free'}
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
      <Modal isOpen={showCheckout} onClose={() => setShowCheckout(false)} title="Confirmar compra">
        {selectedPlan && (
          <div>
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
                💳 PAGAR {selectedPlan.currency} {selectedPlan.price.toFixed(2)}
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Serás redirigido al proveedor de pago seguro.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
