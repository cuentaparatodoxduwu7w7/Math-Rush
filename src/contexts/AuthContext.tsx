import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, Profile, UserRole } from '../lib/supabase';
import { getUserEntitlements, trackEvent } from '../lib/gameEngine';
import type { UserEntitlements } from '../lib/supabase';

// ============================================================
// AUTH CONTEXT
// ============================================================
// Preparado para Supabase Auth.
// Cuando VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén configuradas,
// la autenticación funcionará con Supabase real.
// 
// Google OAuth: Requiere configuración en Supabase Dashboard:
// 1. Ir a Authentication > Providers > Google
// 2. Configurar Client ID y Client Secret (del Google Cloud Console)
// 3. Agregar la URL de redirect en Google Cloud Console
// 4. NO colocar el Client Secret en el frontend
// ============================================================

interface AuthContextType {
  user: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string, nickname: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  entitlements: UserEntitlements;
}

const AuthContext = createContext<AuthContextType | null>(null);

// MOCK user for development when Supabase is not configured
const MOCK_USER: Profile = {
  id: 'mock-user-001',
  email: 'demo@mathrush.com',
  nickname: 'CuyGamer',
  avatar_url: null,
  role: 'student' as UserRole,
  grade: '3.º secundaria',
  math_level: 'intermedio',
  goal: 'Mejorar notas',
  level: 12,
  xp: 3200,
  coins: 1450,
  gems: 15,
  streak: 5,
  last_active: new Date().toISOString(),
  onboarding_completed: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';

  useEffect(() => {
    async function initAuth() {
      if (!isSupabaseConfigured) {
        // MOCK MODE: Use mock user for development
        setUser(MOCK_USER);
        setIsLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await loadProfile(session.user.id);
        }
      } catch {
        // If Supabase is not reachable, use mock
        setUser(MOCK_USER);
      }
      setIsLoading(false);
    }

    initAuth();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setUser(null);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  async function loadProfile(userId: string) {
    if (!isSupabaseConfigured) {
      setUser(MOCK_USER);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        // Profile doesn't exist yet, create it
        setUser(MOCK_USER);
      } else {
        setUser(data as Profile);
      }
    } catch {
      setUser(MOCK_USER);
    }
  }

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    trackEvent('login', { method: 'email' });
    
    if (!isSupabaseConfigured) {
      setUser(MOCK_USER);
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: 'Correo o contraseña incorrectos.' };
      return { error: null };
    } catch {
      return { error: 'Ups, algo salió mal. Intenta nuevamente.' };
    }
  }, [isSupabaseConfigured]);

  const signUpWithEmail = useCallback(async (email: string, password: string, nickname: string) => {
    trackEvent('signup', { method: 'email' });
    
    if (!isSupabaseConfigured) {
      setUser({ ...MOCK_USER, email, nickname, onboarding_completed: false });
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nickname } },
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch {
      return { error: 'Ups, algo salió mal. Intenta nuevamente.' };
    }
  }, [isSupabaseConfigured]);

  const signInWithGoogle = useCallback(async () => {
    trackEvent('google_login');
    
    if (!isSupabaseConfigured) {
      // MOCK: Simulate Google login
      setUser({ ...MOCK_USER, email: 'user@gmail.com' });
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) return { error: 'No se pudo conectar con Google.' };
      return { error: null };
    } catch {
      return { error: 'Ups, algo salió mal. Intenta nuevamente.' };
    }
  }, [isSupabaseConfigured]);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
  }, [isSupabaseConfigured]);

  const resetPassword = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) return { error: 'No se pudo enviar el correo.' };
      return { error: null };
    } catch {
      return { error: 'Ups, algo salió mal. Intenta nuevamente.' };
    }
  }, [isSupabaseConfigured]);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (user) {
      const updatedUser = { ...user, ...updates, updated_at: new Date().toISOString() };
      setUser(updatedUser);

      if (isSupabaseConfigured) {
        await supabase.from('profiles').update(updates).eq('id', user.id);
      }
    }
  }, [user, isSupabaseConfigured]);

  const entitlements = getUserEntitlements(
    user?.role || 'student',
    user?.role === 'developer' ? 'developer' : 'free'
  );

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
      resetPassword,
      updateProfile,
      entitlements,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
