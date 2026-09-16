// ============================================================
// AI SERVICE
// ============================================================
// Main AI service that manages providers, rate limiting,
// caching, and usage tracking.
// ============================================================

import {
  ImageGenerationProvider,
  AudioGenerationProvider,
  MascotGenerationProvider,
  GeneratedImage,
  GeneratedAudio,
  GeneratedMascot,
  GenerationOptions,
  AIProviderError,
  ProviderNotConfiguredError,
} from './providers/types';
import {
  MockImageProvider,
  MockAudioProvider,
  MockMascotProvider,
} from './providers/MockProvider';
import {
  EdgeFunctionImageProvider,
  EdgeFunctionAudioProvider,
  EdgeFunctionMascotProvider,
} from './providers/EdgeFunctionProvider';

// ============================================================
// USER LIMITS BY PLAN
// ============================================================

export interface UserAILimits {
  imagePerDay: number;
  audioPerDay: number;
  mascotPerDay: number;
  isDeveloper: boolean;
}

const PLAN_LIMITS: Record<string, UserAILimits> = {
  free: {
    imagePerDay: 3,
    audioPerDay: 1,
    mascotPerDay: 2,
    isDeveloper: false,
  },
  rush: {
    imagePerDay: 20,
    audioPerDay: 10,
    mascotPerDay: 15,
    isDeveloper: false,
  },
  legend: {
    imagePerDay: 50,
    audioPerDay: 30,
    mascotPerDay: 40,
    isDeveloper: false,
  },
  teacher: {
    imagePerDay: 100,
    audioPerDay: 50,
    mascotPerDay: 80,
    isDeveloper: false,
  },
  developer: {
    imagePerDay: 9999,
    audioPerDay: 9999,
    mascotPerDay: 9999,
    isDeveloper: true,
  },
};

// ============================================================
// USAGE TRACKER
// ============================================================

class UsageTracker {
  private usage: Record<string, number> = {};
  private lastReset = Date.now();
  private readonly RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

  private resetIfNeeded(): void {
    if (Date.now() - this.lastReset > this.RESET_INTERVAL) {
      this.usage = {};
      this.lastReset = Date.now();
    }
  }

  getUsage(userId: string, type: string): number {
    this.resetIfNeeded();
    return this.usage[`${userId}:${type}`] || 0;
  }

  incrementUsage(userId: string, type: string): void {
    this.resetIfNeeded();
    const key = `${userId}:${type}`;
    this.usage[key] = (this.usage[key] || 0) + 1;
  }

  canGenerate(userId: string, type: string, limit: number): boolean {
    if (limit >= 9999) return true; // Developer or unlimited
    return this.getUsage(userId, type) < limit;
  }

  async logUsageToDatabase(
    userId: string,
    type: string,
    provider: string,
    prompt: string
  ): Promise<void> {
    // In production, this would call Supabase to log usage
    // For now, we'll just track locally
    console.log('[AI Usage]', { userId, type, provider, prompt: prompt.substring(0, 50) });
    
    // TODO: Implement actual database logging
    // await supabase.from('ai_usage').insert({
    //   user_id: userId,
    //   type,
    //   provider,
    //   prompt,
    //   created_at: new Date().toISOString(),
    // });
  }
}

// ============================================================
// AI SERVICE
// ============================================================

export class AIService {
  private imageProvider: ImageGenerationProvider;
  private audioProvider: AudioGenerationProvider;
  private mascotProvider: MascotGenerationProvider;
  private usageTracker: UsageTracker;

  constructor(useMock: boolean = true) {
    if (useMock) {
      this.imageProvider = new MockImageProvider();
      this.audioProvider = new MockAudioProvider();
      this.mascotProvider = new MockMascotProvider();
    } else {
      this.imageProvider = new EdgeFunctionImageProvider();
      this.audioProvider = new EdgeFunctionAudioProvider();
      this.mascotProvider = new EdgeFunctionMascotProvider();
    }
    this.usageTracker = new UsageTracker();
  }

  // ============================================================
  // IMAGE GENERATION
  // ============================================================

  async generateImage(
    userId: string,
    userPlan: string,
    prompt: string,
    options?: GenerationOptions
  ): Promise<GeneratedImage> {
    const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free;

    // Check limits (skip for developer)
    if (!limits.isDeveloper && !this.usageTracker.canGenerate(userId, 'image', limits.imagePerDay)) {
      throw new AIProviderError(
        `Daily image limit reached (${limits.imagePerDay}). Upgrade your plan for more.`,
        this.imageProvider.name,
        'LIMIT_EXCEEDED',
        false
      );
    }

    try {
      const result = await this.imageProvider.generateImage(prompt, options);
      
      // Track usage
      this.usageTracker.incrementUsage(userId, 'image');
      await this.usageTracker.logUsageToDatabase(userId, 'image', this.imageProvider.name, prompt);

      return result;
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      throw new AIProviderError(
        error instanceof Error ? error.message : 'Unknown error',
        this.imageProvider.name,
        'GENERATION_FAILED',
        true
      );
    }
  }

  // ============================================================
  // AUDIO GENERATION
  // ============================================================

  async generateAudio(
    userId: string,
    userPlan: string,
    prompt: string,
    options?: GenerationOptions
  ): Promise<GeneratedAudio> {
    const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free;

    // Check limits
    if (!limits.isDeveloper && !this.usageTracker.canGenerate(userId, 'audio', limits.audioPerDay)) {
      throw new AIProviderError(
        `Daily audio limit reached (${limits.audioPerDay}). Upgrade your plan for more.`,
        this.audioProvider.name,
        'LIMIT_EXCEEDED',
        false
      );
    }

    try {
      const result = await this.audioProvider.generateAudio(prompt, options);
      
      // Track usage
      this.usageTracker.incrementUsage(userId, 'audio');
      await this.usageTracker.logUsageToDatabase(userId, 'audio', this.audioProvider.name, prompt);

      return result;
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      throw new AIProviderError(
        error instanceof Error ? error.message : 'Unknown error',
        this.audioProvider.name,
        'GENERATION_FAILED',
        true
      );
    }
  }

  // ============================================================
  // MASCOT GENERATION
  // ============================================================

  async generateMascot(
    userId: string,
    userPlan: string,
    prompt: string,
    options?: GenerationOptions
  ): Promise<GeneratedMascot> {
    const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free;

    // Check limits
    if (!limits.isDeveloper && !this.usageTracker.canGenerate(userId, 'mascot', limits.mascotPerDay)) {
      throw new AIProviderError(
        `Daily mascot limit reached (${limits.mascotPerDay}). Upgrade your plan for more.`,
        this.mascotProvider.name,
        'LIMIT_EXCEEDED',
        false
      );
    }

    try {
      const result = await this.mascotProvider.generateMascot(prompt, options);
      
      // Track usage
      this.usageTracker.incrementUsage(userId, 'mascot');
      await this.usageTracker.logUsageToDatabase(userId, 'mascot', this.mascotProvider.name, prompt);

      return result;
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      throw new AIProviderError(
        error instanceof Error ? error.message : 'Unknown error',
        this.mascotProvider.name,
        'GENERATION_FAILED',
        true
      );
    }
  }

  // ============================================================
  // STATUS & UTILS
  // ============================================================

  async getStatus(): Promise<{
    image: { provider: string; available: boolean; message: string };
    audio: { provider: string; available: boolean; message: string };
    mascot: { provider: string; available: boolean; message: string };
  }> {
    const [imageStatus, audioStatus, mascotStatus] = await Promise.all([
      this.imageProvider.getStatus(),
      this.audioProvider.getStatus(),
      this.mascotProvider.getStatus(),
    ]);

    return {
      image: { provider: this.imageProvider.name, ...imageStatus },
      audio: { provider: this.audioProvider.name, ...audioStatus },
      mascot: { provider: this.mascotProvider.name, ...mascotStatus },
    };
  }

  getUsage(userId: string, type: 'image' | 'audio' | 'mascot'): number {
    return this.usageTracker.getUsage(userId, type);
  }

  getLimits(userPlan: string): UserAILimits {
    return PLAN_LIMITS[userPlan] || PLAN_LIMITS.free;
  }
}

// ============================================================
// SINGLETON INSTANCE
// ============================================================

// Use mock provider in development, edge functions in production
const useMock = !import.meta.env.VITE_SUPABASE_URL || 
                import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co';

export const aiService = new AIService(useMock);
