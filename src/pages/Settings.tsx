import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { Card, Button } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <h1 className="font-display text-2xl font-bold mb-6">⚙️ Configuración</h1>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-bold mb-3">Cuenta</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Email</span>
                <span>{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Nickname</span>
                <span>{user?.nickname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rol</span>
                <span className="capitalize">{user?.role}</span>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-bold mb-3">Preferencias</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Notificaciones</span>
                <div className="w-10 h-6 bg-rush-orange rounded-full relative cursor-pointer">
                  <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sonido</span>
                <div className="w-10 h-6 bg-rush-orange rounded-full relative cursor-pointer">
                  <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Modo reducido de movimiento</span>
                <div className="w-10 h-6 bg-rush-purple/30 rounded-full relative cursor-pointer">
                  <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-bold mb-3">Privacidad</h3>
            <div className="space-y-3 text-sm">
              <button className="w-full text-left text-rush-orange hover:underline">Cambiar contraseña</button>
              <button className="w-full text-left text-rush-orange hover:underline">Gestionar conexiones (Google)</button>
              <button className="w-full text-left text-red-400 hover:underline">Eliminar cuenta</button>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-bold mb-3">Información</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>Versión: 1.0.0 (MVP)</p>
              <p>Math Rush © 2024</p>
              <p className="text-xs">Aprende. Juega. Supera tus límites.</p>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
