import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface WorldDesignerLimits {
  attempts_remaining: number;
  attempts_limit: number;
  period_end: string;
  renewal_type: 'weekly' | 'monthly';
  tokens_balance: number;
  token_cost: number;
  can_use_tokens: boolean;
}

export interface WorldTheme {
  id: string;
  name: string;
  prompt: string;
  theme: {
    background: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    panel?: string;
    border?: string;
    glow?: string;
  };
  background: {
    type: 'svg' | 'gradient' | 'pattern';
    value: string;
  };
  decorations?: any[];
  animations?: Record<string, any>;
  layout?: Record<string, any>;
  minigame?: any;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export interface WorldDesignerState {
  limits: WorldDesignerLimits | null;
  currentTheme: WorldTheme | null;
  history: WorldTheme[];
  loading: boolean;
  error: string | null;
  generating: boolean;
}

export function useWorldDesigner() {
  const [state, setState] = useState<WorldDesignerState>({
    limits: null,
    currentTheme: null,
    history: [],
    loading: false,
    error: null,
    generating: false,
  });

  const fetchLimits = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No autenticado');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-world-limits`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener límites');
      }

      const responseData = await response.json();
      setState(prev => ({ ...prev, limits: responseData.limits, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }));
    }
  }, []);

  const fetchThemes = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-user-worlds`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al obtener temas');
      }

      const responseData = await response.json();
      setState(prev => ({
        ...prev,
        currentTheme: responseData.current_theme,
        history: responseData.history || [],
      }));
    } catch (error) {
      console.error('Error fetching themes:', error);
    }
  }, []);

  const generateWorld = useCallback(async (
    prompt: string,
    options?: {
      useToken?: boolean;
      includeMinigame?: boolean;
      difficulty?: 'principiante' | 'basico' | 'intermedio' | 'avanzado';
    }
  ) => {
    setState(prev => ({ ...prev, generating: true, error: null }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No autenticado');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-world-theme`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            useToken: options?.useToken || false,
            includeMinigame: options?.includeMinigame || false,
            difficulty: options?.difficulty || 'basico',
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        
        if (errorData.error === 'LIMIT_EXCEEDED') {
          throw new Error(`Sin intentos disponibles. Próxima renovación: ${new Date(errorData.period_end).toLocaleString()}`);
        }
        if (errorData.error === 'INSUFFICIENT_TOKENS') {
          throw new Error(`Tokens insuficientes. Necesitas ${errorData.required} tokens pero solo tienes ${errorData.current_balance}`);
        }
        if (errorData.error === 'AI_PROVIDER_NOT_CONFIGURED') {
          throw new Error('La IA no está configurada. Contacta al administrador.');
        }
        
        throw new Error(errorData.message || 'Error al generar tema');
      }

      const responseData = await response.json();
      
      setState(prev => ({
        ...prev,
        generating: false,
        currentTheme: responseData.world_theme,
        limits: prev.limits ? {
          ...prev.limits,
          attempts_remaining: responseData.metadata.attempts_remaining,
          tokens_balance: prev.limits.tokens_balance - responseData.metadata.tokens_used,
        } : null,
        history: [responseData.world_theme, ...prev.history].slice(0, 20),
      }));

      return responseData.world_theme;
    } catch (error) {
      setState(prev => ({
        ...prev,
        generating: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }));
      throw error;
    }
  }, []);

  const applyTheme = useCallback(async (themeId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No autenticado');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/apply-world-theme`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ theme_id: themeId }),
        }
      );

      if (!response.ok) {
        throw new Error('Error al aplicar tema');
      }

      const responseData = await response.json();
      setState(prev => ({ ...prev, currentTheme: responseData.world_theme }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }));
      throw error;
    }
  }, []);

  const restoreDefault = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No autenticado');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/restore-default-theme`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al restaurar tema predeterminado');
      }

      setState(prev => ({ ...prev, currentTheme: null }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error desconocido',
      }));
      throw error;
    }
  }, []);

  const submitFeedback = useCallback(async (
    themeId: string,
    rating: number,
    comment?: string,
    accepted?: boolean
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No autenticado');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-feedback`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            world_theme_id: themeId,
            rating,
            comment,
            accepted,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Error al enviar feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  }, []);

  const initialize = useCallback(async () => {
    await Promise.all([fetchLimits(), fetchThemes()]);
  }, [fetchLimits, fetchThemes]);

  return {
    ...state,
    fetchLimits,
    fetchThemes,
    generateWorld,
    applyTheme,
    restoreDefault,
    submitFeedback,
    initialize,
    clearError: () => setState(prev => ({ ...prev, error: null })),
  };
}
