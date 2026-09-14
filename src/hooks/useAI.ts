// ============================================================
// AI HOOK
// ============================================================
// React hook for using AI services in components.
// ============================================================

import { useState, useCallback } from 'react';
import { aiService } from '../services/ai/AIService';
import { GeneratedImage, GeneratedAudio, GeneratedMascot, AIProviderError } from '../services/ai/providers/types';
import { useAuth } from '../contexts/AuthContext';

export interface UseAIState {
  loading: boolean;
  error: string | null;
  retryable: boolean;
}

export function useAI() {
  const { user } = useAuth();
  const [state, setState] = useState<UseAIState>({
    loading: false,
    error: null,
    retryable: false,
  });

  const userId = user?.id || 'anonymous';
  const userPlan = user?.role === 'developer' ? 'developer' : 'free';

  const generateImage = useCallback(async (
    prompt: string,
    options?: { width?: number; height?: number; quality?: 'low' | 'medium' | 'high' }
  ): Promise<GeneratedImage | null> => {
    setState({ loading: true, error: null, retryable: false });
    
    try {
      const result = await aiService.generateImage(userId, userPlan, prompt, options);
      setState({ loading: false, error: null, retryable: false });
      return result;
    } catch (error) {
      const errorMessage = error instanceof AIProviderError 
        ? error.message 
        : 'Error al generar la imagen';
      const retryable = error instanceof AIProviderError ? error.retryable : true;
      
      setState({ loading: false, error: errorMessage, retryable });
      return null;
    }
  }, [userId, userPlan]);

  const generateAudio = useCallback(async (
    prompt: string,
    options?: { duration?: number; timeout?: number }
  ): Promise<GeneratedAudio | null> => {
    setState({ loading: true, error: null, retryable: false });
    
    try {
      const result = await aiService.generateAudio(userId, userPlan, prompt, options);
      setState({ loading: false, error: null, retryable: false });
      return result;
    } catch (error) {
      const errorMessage = error instanceof AIProviderError 
        ? error.message 
        : 'Error al generar el audio';
      const retryable = error instanceof AIProviderError ? error.retryable : true;
      
      setState({ loading: false, error: errorMessage, retryable });
      return null;
    }
  }, [userId, userPlan]);

  const generateMascot = useCallback(async (
    prompt: string,
    options?: { style?: string }
  ): Promise<GeneratedMascot | null> => {
    setState({ loading: true, error: null, retryable: false });
    
    try {
      const result = await aiService.generateMascot(userId, userPlan, prompt, options);
      setState({ loading: false, error: null, retryable: false });
      return result;
    } catch (error) {
      const errorMessage = error instanceof AIProviderError 
        ? error.message 
        : 'Error al generar la mascota';
      const retryable = error instanceof AIProviderError ? error.retryable : true;
      
      setState({ loading: false, error: errorMessage, retryable });
      return null;
    }
  }, [userId, userPlan]);

  const clearError = useCallback(() => {
    setState({ loading: false, error: null, retryable: false });
  }, []);

  const getUsage = useCallback((type: 'image' | 'audio' | 'mascot') => {
    return aiService.getUsage(userId, type);
  }, [userId]);

  const getLimits = useCallback(() => {
    return aiService.getLimits(userPlan);
  }, [userPlan]);

  return {
    ...state,
    generateImage,
    generateAudio,
    generateMascot,
    clearError,
    getUsage,
    getLimits,
  };
}
