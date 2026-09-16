// ============================================================
// MOCK AI PROVIDER
// ============================================================
// This provider is used for development and testing.
// It returns pre-generated assets and simulates API behavior.
// ============================================================

import {
  ImageGenerationProvider,
  AudioGenerationProvider,
  MascotGenerationProvider,
  GeneratedImage,
  GeneratedAudio,
  GeneratedMascot,
  GenerationOptions,
} from './types';
import { ASSETS } from '../../../lib/assets';

// Simulated delay for realistic behavior
const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Cache for generated content
const cache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// ============================================================
// MOCK IMAGE PROVIDER
// ============================================================

export class MockImageProvider implements ImageGenerationProvider {
  readonly name = 'mock-image';
  readonly isConfigured = true;

  private requestCount = 0;
  private readonly maxRequestsPerMinute = 10;

  async generateImage(
    prompt: string,
    options?: GenerationOptions
  ): Promise<GeneratedImage> {
    // Check cache
    const cacheKey = `image:${prompt}:${JSON.stringify(options)}`;
    const cached = getCached<GeneratedImage>(cacheKey);
    if (cached) return cached;

    // Rate limiting
    if (this.requestCount >= this.maxRequestsPerMinute) {
      throw new Error('Rate limit exceeded. Please wait before generating more images.');
    }
    this.requestCount++;
    setTimeout(() => this.requestCount--, 60000);

    // Simulate API delay
    await simulateDelay(2000 + Math.random() * 1000);

    // Select appropriate asset based on prompt keywords
    let imageUrl = ASSETS.backgrounds.space;
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('espacio') || lowerPrompt.includes('space') || lowerPrompt.includes('galaxia')) {
      imageUrl = ASSETS.backgrounds.space;
    } else if (lowerPrompt.includes('neon') || lowerPrompt.includes('cyber') || lowerPrompt.includes('futur')) {
      imageUrl = ASSETS.backgrounds.neon;
    } else if (lowerPrompt.includes('matem') || lowerPrompt.includes('geomet') || lowerPrompt.includes('número')) {
      imageUrl = ASSETS.backgrounds.math;
    } else if (lowerPrompt.includes('natur') || lowerPrompt.includes('bosque') || lowerPrompt.includes('verde')) {
      imageUrl = ASSETS.backgrounds.nature;
    }

    const result: GeneratedImage = {
      id: `mock-img-${Date.now()}`,
      url: imageUrl,
      prompt,
      width: options?.width || 1024,
      height: options?.height || 1024,
      format: 'png',
      createdAt: new Date().toISOString(),
      provider: this.name,
      metadata: {
        mock: true,
        quality: options?.quality || 'medium',
      },
    };

    setCache(cacheKey, result);
    return result;
  }

  async getStatus() {
    return {
      available: true,
      message: 'Mock provider active. Using pre-generated assets.',
      limits: {
        requestsPerMinute: this.maxRequestsPerMinute,
        requestsPerDay: 100,
      },
    };
  }
}

// ============================================================
// MOCK AUDIO PROVIDER
// ============================================================

export class MockAudioProvider implements AudioGenerationProvider {
  readonly name = 'mock-audio';
  readonly isConfigured = true;

  private requestCount = 0;
  private readonly maxRequestsPerMinute = 5;

  async generateAudio(
    prompt: string,
    options?: GenerationOptions
  ): Promise<GeneratedAudio> {
    // Check cache
    const cacheKey = `audio:${prompt}:${JSON.stringify(options)}`;
    const cached = getCached<GeneratedAudio>(cacheKey);
    if (cached) return cached;

    // Rate limiting
    if (this.requestCount >= this.maxRequestsPerMinute) {
      throw new Error('Rate limit exceeded. Please wait before generating more audio.');
    }
    this.requestCount++;
    setTimeout(() => this.requestCount--, 60000);

    // Simulate API delay (audio takes longer)
    await simulateDelay(3000 + Math.random() * 2000);

    // Mock audio - in production this would be a real audio file URL
    const result: GeneratedAudio = {
      id: `mock-audio-${Date.now()}`,
      url: '', // No real audio in mock mode
      prompt,
      duration: 3 + Math.random() * 5,
      format: 'wav',
      createdAt: new Date().toISOString(),
      provider: this.name,
      metadata: {
        mock: true,
        note: 'Audio generation requires external provider configuration',
      },
    };

    setCache(cacheKey, result);
    return result;
  }

  async getStatus() {
    return {
      available: true,
      message: 'Mock provider active. Real audio requires external provider.',
      limits: {
        secondsPerMonth: 300,
        requestsPerDay: 50,
      },
    };
  }
}

// ============================================================
// MOCK MASCOT PROVIDER
// ============================================================

export class MockMascotProvider implements MascotGenerationProvider {
  readonly name = 'mock-mascot';
  readonly isConfigured = true;

  private requestCount = 0;
  private readonly maxRequestsPerMinute = 8;

  async generateMascot(
    prompt: string,
    options?: GenerationOptions
  ): Promise<GeneratedMascot> {
    // Check cache
    const cacheKey = `mascot:${prompt}:${JSON.stringify(options)}`;
    const cached = getCached<GeneratedMascot>(cacheKey);
    if (cached) return cached;

    // Rate limiting
    if (this.requestCount >= this.maxRequestsPerMinute) {
      throw new Error('Rate limit exceeded. Please wait before generating more mascots.');
    }
    this.requestCount++;
    setTimeout(() => this.requestCount--, 60000);

    // Simulate API delay
    await simulateDelay(2500 + Math.random() * 1500);

    // Select mascot based on prompt
    let imageUrl = ASSETS.mascots.llamaBlanca;
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('llama')) {
      imageUrl = ASSETS.mascots.llamaBlanca;
    } else if (lowerPrompt.includes('cuy') || lowerPrompt.includes('hamster') || lowerPrompt.includes('guinea')) {
      imageUrl = ASSETS.mascots.cuyMatematico;
    }

    const result: GeneratedMascot = {
      id: `mock-mascot-${Date.now()}`,
      imageUrl,
      name: prompt.split(' ').slice(0, 3).join(' '),
      prompt,
      style: options?.style || 'cartoon',
      createdAt: new Date().toISOString(),
      provider: this.name,
      metadata: {
        mock: true,
      },
    };

    setCache(cacheKey, result);
    return result;
  }

  async getStatus() {
    return {
      available: true,
      message: 'Mock provider active. Using pre-generated mascot assets.',
      limits: {
        requestsPerDay: 80,
      },
    };
  }
}
