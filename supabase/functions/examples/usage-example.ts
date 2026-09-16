// ============================================================
// Example: Using the World Designer Edge Function
// ============================================================
// This file shows how to call the Edge Function from the frontend
// ============================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================
// Types
// ============================================================

interface WorldTheme {
  id: string;
  name: string;
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
  decorations?: Array<{
    type: string;
    position: { x: number; y: number };
    size?: { width: number; height: number };
    svg?: string;
    animation?: string;
  }>;
  animations?: Record<string, any>;
  layout?: Record<string, any>;
  minigame?: {
    type: string;
    theme: string;
    difficulty: string;
    rules?: any;
    content: any;
  };
  expires_at: string;
}

interface GenerateWorldResponse {
  success: boolean;
  world_theme: WorldTheme;
  metadata: {
    duration: number;
    attempts_remaining: number;
    tokens_used: number;
  };
}

interface GenerateWorldOptions {
  useToken?: boolean;
  includeMinigame?: boolean;
  difficulty?: 'principiante' | 'basico' | 'intermedio' | 'avanzado';
}

// ============================================================
// Main Function
// ============================================================

export async function generateWorldTheme(
  prompt: string,
  options: GenerateWorldOptions = {}
): Promise<GenerateWorldResponse> {
  // 1. Get current session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    throw new Error('Not authenticated');
  }

  // 2. Call Edge Function
  const response = await fetch(
    `${supabaseUrl}/functions/v1/generate-world-theme`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        useToken: options.useToken || false,
        includeMinigame: options.includeMinigame || false,
        difficulty: options.difficulty || 'basico',
      }),
    }
  );

  // 3. Handle response
  if (!response.ok) {
    const error = await response.json();
    
    switch (error.error) {
      case 'UNAUTHORIZED':
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      
      case 'INVALID_PROMPT':
        throw new Error(error.message);
      
      case 'LIMIT_EXCEEDED':
        throw new Error(
          `Has usado todos tus intentos. Intentos restantes: ${error.attempts_remaining}. ` +
          `Puedes usar tokens para intentos extra.`
        );
      
      case 'INSUFFICIENT_TOKENS':
        throw new Error(
          `Necesitas ${error.required} tokens pero solo tienes ${error.current_balance}. ` +
          `Puedes comprar más tokens con gemas.`
        );
      
      case 'AI_PROVIDER_NOT_CONFIGURED':
        throw new Error(
          'El servicio de IA no está configurado. Por favor, contacta al administrador.'
        );
      
      case 'AI_GENERATION_FAILED':
        throw new Error(
          'No se pudo generar el tema. Por favor, intenta nuevamente.'
        );
      
      case 'INVALID_AI_RESPONSE':
        throw new Error(
          'La IA generó una respuesta inválida. Por favor, intenta con un prompt diferente.'
        );
      
      default:
        throw new Error(error.message || 'Error desconocido');
    }
  }

  // 4. Parse and return response
  const data: GenerateWorldResponse = await response.json();
  
  return data;
}

// ============================================================
// Usage Examples
// ============================================================

/**
 * Example 1: Basic world generation
 */
export async function example1_BasicGeneration() {
  try {
    const result = await generateWorldTheme(
      'Un mundo espacial con planetas matemáticos y estrellas brillantes'
    );
    
    console.log('World generated:', result.world_theme.name);
    console.log('Expires at:', result.world_theme.expires_at);
    console.log('Attempts remaining:', result.metadata.attempts_remaining);
    
    return result.world_theme;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 2: Generation with minigame
 */
export async function example2_WithMinigame() {
  try {
    const result = await generateWorldTheme(
      'Un castillo medieval con torres de geometría',
      {
        includeMinigame: true,
        difficulty: 'intermedio',
      }
    );
    
    console.log('World:', result.world_theme.name);
    console.log('Minigame:', result.world_theme.minigame?.theme);
    console.log('Questions:', result.world_theme.minigame?.content.questions.length);
    
    return result.world_theme;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 3: Using tokens
 */
export async function example3_UsingTokens() {
  try {
    const result = await generateWorldTheme(
      'Un océano de fracciones con olas de números',
      {
        useToken: true,
      }
    );
    
    console.log('World:', result.world_theme.name);
    console.log('Tokens used:', result.metadata.tokens_used);
    
    return result.world_theme;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

/**
 * Example 4: Complete example with error handling
 */
export async function example4_CompleteExample() {
  const prompt = 'Un bosque mágico con árboles de fractales';
  
  try {
    // Try to generate with regular attempt
    const result = await generateWorldTheme(prompt, {
      includeMinigame: true,
      difficulty: 'basico',
    });
    
    console.log('✅ World generated successfully');
    console.log('Name:', result.world_theme.name);
    console.log('Colors:', result.world_theme.theme);
    console.log('Background type:', result.world_theme.background.type);
    console.log('Decorations:', result.world_theme.decorations?.length || 0);
    console.log('Has minigame:', !!result.world_theme.minigame);
    console.log('Expires:', new Date(result.world_theme.expires_at).toLocaleString());
    console.log('Attempts remaining:', result.metadata.attempts_remaining);
    
    return result;
    
  } catch (error) {
    console.error('❌ Error generating world:', error.message);
    
    // If limit exceeded, offer to use tokens
    if (error.message.includes('Has usado todos tus intentos')) {
      console.log('💡 Intenta usar tokens para generar más mundos');
      
      try {
        const tokenResult = await generateWorldTheme(prompt, {
          useToken: true,
          includeMinigame: true,
          difficulty: 'basico',
        });
        
        console.log('✅ World generated with tokens');
        console.log('Tokens used:', tokenResult.metadata.tokens_used);
        
        return tokenResult;
        
      } catch (tokenError) {
        console.error('❌ Error using tokens:', tokenError.message);
        
        if (tokenError.message.includes('Necesitas')) {
          console.log('💡 Compra más tokens con gemas en la tienda');
        }
      }
    }
  }
}

// ============================================================
// React Hook Example
// ============================================================

/**
 * Custom hook for using the World Designer
 */
export function useWorldDesigner() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [worldTheme, setWorldTheme] = useState<WorldTheme | null>(null);

  const generate = async (prompt: string, options?: GenerateWorldOptions) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await generateWorldTheme(prompt, options);
      setWorldTheme(result.world_theme);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    worldTheme,
    generate,
  };
}

// Import React hooks
import { useState } from 'react';
