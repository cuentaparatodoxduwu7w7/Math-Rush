import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../components/ui';

export function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 hero-gradient">
      <Card className="p-8 text-center max-w-md w-full">
        <span className="text-6xl mb-4 block">🎉</span>
        <h1 className="font-display text-2xl font-bold mb-2 text-rush-green">¡Pago Exitoso!</h1>
        <p className="text-gray-400 mb-6">Tu suscripción ha sido activada. Ahora tienes acceso a todas las funciones Premium.</p>
        <div className="space-y-3">
          <Link to="/app">
            <Button variant="primary" className="w-full">⚡ IR AL LOBBY</Button>
          </Link>
          <Link to="/app/profile">
            <Button variant="outline" className="w-full">Ver mi perfil</Button>
          </Link>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Se ha enviado un comprobante a tu correo electrónico.
        </p>
      </Card>
    </div>
  );
}

export function PaymentCancelledPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 hero-gradient">
      <Card className="p-8 text-center max-w-md w-full">
        <span className="text-6xl mb-4 block">😔</span>
        <h1 className="font-display text-2xl font-bold mb-2">Pago Cancelado</h1>
        <p className="text-gray-400 mb-6">No se procesó ningún cargo. Puedes intentar nuevamente cuando quieras.</p>
        <div className="space-y-3">
          <Link to="/app/plans">
            <Button variant="primary" className="w-full">Ver Planes</Button>
          </Link>
          <Link to="/app">
            <Button variant="ghost" className="w-full">Volver al Lobby</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export function AuthCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin text-4xl mb-4">🐹</div>
        <p className="text-gray-400">Verificando tu cuenta...</p>
      </div>
    </div>
  );
}
