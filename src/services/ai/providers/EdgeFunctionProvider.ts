// ============================================================
// SUPABASE EDGE FUNCTION PROVIDER
// ============================================================
// This provider communicates with Supabase Edge Functions.
// API keys are stored in Edge Function secrets, NOT in frontend.
// ============================================================

import { supabase } from '../../../lib/supabase';
import {
  ImageGenerationProvider,
  AudioGenerationProvider,
  MascotGenerationProvider,
  GeneratedImage,
  GeneratedAudio,
  GeneratedMascot,
  GenerationOptions,
  AIProviderError,
  TimeoutError,
  RateLimitError,
  ProviderNotConfiguredError,
} from './types';

// ============================================================
// EDGE FUNCTION CALLER
// ============================================================

async function callEdgeFunction<T>(
  functionName: string,
  body: Record<string, any>,
  timeout: number = 30000
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: JSON.stringify(body),
    });

    clearTimeout(timeoutId);

    if (error) {
      throw new AIProviderError(
        error.message || 'Edge function error',
        functionName,
        'EDGE_FUNCTION_ERROR',
        true
      );
    }

    if (data?.error) {
      if (data.error.code === 'RATE_LIMIT') {
        throw new RateLimitError(functionName, data.error.retryAfter);
      }
      if (data.error.code === 'NOT_CONFIGURED') {
        throw new ProviderNotConfiguredError(functionName);
      }
      throw new AIProviderError(
        data.error.message,
        functionName,
        data.error.code || 'UNKNOWN_ERROR',
        data.error.retryable || false
      );
    }

    return data as T;
  } catch (err) {
    clearTimeout(timeoutId);
    
    if (err instanceof AIProviderError) throw err;
    
    if (err instanceof Error && err.name === 'AbortError') {
      throw new TimeoutError(functionName, timeout);
    }
    
    throw new AIProviderError(
      err instanceof Error ? err.message : 'Unknown error',
      functionName,
      'UNKNOWN_ERROR',
      true
    );
  }
}

// ============================================================
// EDGE FUNCTION IMAGE PROVIDER
// ============================================================

export class EdgeFunctionImageProvider implements ImageGenerationProvider {
  readonly name = 'edge-function-image';
  readonly isConfigured = true;

  async generateImage(
    prompt: string,
    options?: GenerationOptions
  ): Promise<GeneratedImage> {
    const response = await callEdgeFunction<{
      id: string;
      url: string;
      prompt: string;
      width: number;
      height: number;
      format: string;
      createdAt: string;
    }>('generate-image', {
      prompt,
      width: options?.width || 1024,
      height: options?.height || 1024,
      quality: options?.quality || 'medium',
    }, options?.timeout || 60000);

    return {
      ...response,
      provider: this.name,
    };
  }

  async getStatus() {
    try {
      const status = await callEdgeFunction<{
        available: boolean;
        message: string;
        limits: { requestsPerMinute: number; requestsPerDay: number };
      }>('ai-status', { provider: 'image' });
      return status;
    } catch {
      return {
        available: false,
        message: 'Unable to check status. Edge function may not be deployed.',
      };
    }
  }
}

// ============================================================
// EDGE FUNCTION AUDIO PROVIDER
// ============================================================

export class EdgeFunctionAudioProvider implements AudioGenerationProvider {
  readonly name = 'edge-function-audio';
  readonly isConfigured = true;

  async generateAudio(
    prompt: string,
    options?: GenerationOptions
  ): Promise<GeneratedAudio> {
    const response = await callEdgeFunction<{
      id: string;
      url: string;
      prompt: string;
      duration: number;
      format: string;
      createdAt: string;
    }>('generate-audio', {
      prompt,
      duration: 5,
      format: 'wav',
    }, options?.timeout || 90000);

    return {
      ...response,
      provider: this.name,
    };
  }

  async getStatus() {
    try {
      const status = await callEdgeFunction<{
        available: boolean;
        message: string;
        limits: { secondsPerMonth: number; requestsPerDay: number };
      }>('ai-status', { provider: 'audio' });
      return status;
    } catch {
      return {
        available: false,
        message: 'Unable to check status. Edge function may not be deployed.',
      };
    }
  }
}

// ============================================================
// EDGE FUNCTION MASCOT PROVIDER
// ============================================================

export class EdgeFunctionMascotProvider implements MascotGenerationProvider {
  readonly name = 'edge-function-mascot';
  readonly isConfigured = true;

  async generateMascot(
    prompt: string,
    options?: GenerationOptions
  ): Promise<GeneratedMascot> {
    const response = await callEdgeFunction<{
      id: string;
      imageUrl: string;
      name: string;
      prompt: string;
      style: string;
      createdAt: string;
    }>('generate-mascot', {
      prompt,
      style: options?.style || 'cartoon',
    }, options?.timeout || 60000);

    return {
      ...response,
      provider: this.name,
    };
  }

  async getStatus() {
    try {
      const status = await callEdgeFunction<{
        available: boolean;
        message: string;
        limits: { requestsPerDay: number };
      }>('ai-status', { provider: 'mascot' });
      return status;
    } catch {
      return {
        available: false,
        message: 'Unable to check status. Edge function may not be deployed.',
      };
    }
  }
}
