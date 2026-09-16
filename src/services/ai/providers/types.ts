// ============================================================
// AI PROVIDER INTERFACES
// ============================================================
// These interfaces define the contract for AI generation providers.
// Each provider must implement these methods.
// ============================================================

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  width: number;
  height: number;
  format: string;
  createdAt: string;
  provider: string;
  metadata?: Record<string, any>;
}

export interface GeneratedAudio {
  id: string;
  url: string;
  prompt: string;
  duration: number;
  format: string;
  createdAt: string;
  provider: string;
  metadata?: Record<string, any>;
}

export interface GeneratedMascot {
  id: string;
  imageUrl: string;
  name: string;
  prompt: string;
  style: string;
  createdAt: string;
  provider: string;
  metadata?: Record<string, any>;
}

export interface GenerationOptions {
  width?: number;
  height?: number;
  quality?: 'low' | 'medium' | 'high';
  style?: string;
  timeout?: number;
}

export interface ImageGenerationProvider {
  readonly name: string;
  readonly isConfigured: boolean;
  
  generateImage(
    prompt: string,
    options?: GenerationOptions
  ): Promise<GeneratedImage>;
  
  getStatus(): Promise<{
    available: boolean;
    message: string;
    limits?: {
      requestsPerMinute: number;
      requestsPerDay: number;
    };
  }>;
}

export interface AudioGenerationProvider {
  readonly name: string;
  readonly isConfigured: boolean;
  
  generateAudio(
    prompt: string,
    options?: GenerationOptions
  ): Promise<GeneratedAudio>;
  
  getStatus(): Promise<{
    available: boolean;
    message: string;
    limits?: {
      secondsPerMonth: number;
      requestsPerDay: number;
    };
  }>;
}

export interface MascotGenerationProvider {
  readonly name: string;
  readonly isConfigured: boolean;
  
  generateMascot(
    prompt: string,
    options?: GenerationOptions
  ): Promise<GeneratedMascot>;
  
  getStatus(): Promise<{
    available: boolean;
    message: string;
    limits?: {
      requestsPerDay: number;
    };
  }>;
}

// ============================================================
// ERROR TYPES
// ============================================================

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly code: string,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}

export class RateLimitError extends AIProviderError {
  constructor(provider: string, public readonly retryAfter?: number) {
    super(
      `Rate limit exceeded for ${provider}`,
      provider,
      'RATE_LIMIT_EXCEEDED',
      true
    );
    this.name = 'RateLimitError';
  }
}

export class TimeoutError extends AIProviderError {
  constructor(provider: string, timeout: number) {
    super(
      `Request timeout after ${timeout}ms for ${provider}`,
      provider,
      'TIMEOUT',
      true
    );
    this.name = 'TimeoutError';
  }
}

export class ProviderNotConfiguredError extends AIProviderError {
  constructor(provider: string) {
    super(
      `Provider ${provider} is not configured`,
      provider,
      'NOT_CONFIGURED',
      false
    );
    this.name = 'ProviderNotConfiguredError';
  }
}

export class InsufficientCreditsError extends AIProviderError {
  constructor(provider: string) {
    super(
      `Insufficient credits for ${provider}`,
      provider,
      'INSUFFICIENT_CREDITS',
      false
    );
    this.name = 'InsufficientCreditsError';
  }
}
