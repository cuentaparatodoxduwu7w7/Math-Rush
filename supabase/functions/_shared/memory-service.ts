// ============================================================
// Memory Service for World Designer
// ============================================================
// Handles memory storage, retrieval, and learning
// ============================================================

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface MemoryEntry {
  id?: string;
  user_id: string;
  memory_type: 'private' | 'global';
  category: string;
  content: any;
  confidence_score?: number;
  usage_count?: number;
  is_approved?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MemoryContext {
  userPreferences: {
    preferredColors?: string[];
    preferredStyles?: string[];
    preferredAnimations?: string[];
    preferredThemes?: string[];
  };
  recentGenerations: Array<{
    prompt: string;
    theme_name: string;
    colors: any;
    style: string;
    timestamp: string;
  }>;
  globalKnowledge: Array<{
    category: string;
    content: any;
    confidence: number;
  }>;
  feedbackPatterns: {
    likedStyles: string[];
    dislikedStyles: string[];
    preferredComplexity: string;
  };
}

export class MemoryService {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseServiceKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  // ============================================================
  // MEMORY RETRIEVAL
  // ============================================================

  async getMemoryContext(userId: string, prompt: string): Promise<MemoryContext> {
    // Get all memory components in parallel
    const [preferences, recentGenerations, globalKnowledge, feedbackPatterns] = await Promise.all([
      this.getUserPreferences(userId),
      this.getRecentGenerations(userId, prompt),
      this.getApprovedGlobalKnowledge(prompt),
      this.getFeedbackPatterns(userId),
    ]);

    return {
      userPreferences: preferences,
      recentGenerations,
      globalKnowledge,
      feedbackPatterns,
    };
  }

  private async getUserPreferences(userId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('world_preferences')
      .select('preferred_colors, preferred_styles, preferred_animations, preferred_themes')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return {
        preferredColors: [],
        preferredStyles: [],
        preferredAnimations: [],
        preferredThemes: [],
      };
    }

    return {
      preferredColors: data.preferred_colors || [],
      preferredStyles: data.preferred_styles || [],
      preferredAnimations: data.preferred_animations || [],
      preferredThemes: data.preferred_themes || [],
    };
  }

  private async getRecentGenerations(userId: string, prompt: string, limit: number = 5): Promise<any[]> {
    // Extract keywords from prompt for relevance
    const keywords = this.extractKeywords(prompt);

    const { data, error } = await this.supabase
      .from('world_themes')
      .select('name, prompt, colors, background, created_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20); // Get more to filter by relevance

    if (error || !data) return [];

    // Filter by relevance to current prompt
    const relevant = data
      .map(theme => ({
        prompt: theme.prompt,
        theme_name: theme.name,
        colors: theme.colors,
        style: this.detectStyle(theme.colors, theme.background),
        timestamp: theme.created_at,
        relevance: this.calculateRelevance(theme.prompt, keywords),
      }))
      .filter(item => item.relevance > 0.3)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);

    return relevant;
  }

  private async getApprovedGlobalKnowledge(prompt: string, limit: number = 5): Promise<any[]> {
    const keywords = this.extractKeywords(prompt);

    const { data, error } = await this.supabase
      .from('ai_memory')
      .select('category, content, confidence_score')
      .eq('memory_type', 'global')
      .eq('is_approved', true)
      .order('confidence_score', { ascending: false })
      .limit(50); // Get more to filter by relevance

    if (error || !data) return [];

    // Filter by relevance
    const relevant = data
      .map(item => ({
        category: item.category,
        content: item.content,
        confidence: item.confidence_score,
        relevance: this.calculateRelevance(JSON.stringify(item.content), keywords),
      }))
      .filter(item => item.relevance > 0.2)
      .sort((a, b) => b.relevance * b.confidence - a.relevance * a.confidence)
      .slice(0, limit);

    return relevant;
  }

  private async getFeedbackPatterns(userId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('ai_feedback')
      .select('rating, content_type, content_id, metadata')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) {
      return {
        likedStyles: [],
        dislikedStyles: [],
        preferredComplexity: 'medium',
      };
    }

    // Analyze feedback patterns
    const highRated = data.filter(f => f.rating >= 4);
    const lowRated = data.filter(f => f.rating <= 2);

    return {
      likedStyles: this.extractStylesFromFeedback(highRated),
      dislikedStyles: this.extractStylesFromFeedback(lowRated),
      preferredComplexity: this.detectPreferredComplexity(data),
    };
  }

  // ============================================================
  // MEMORY STORAGE
  // ============================================================

  async storeGenerationMemory(
    userId: string,
    prompt: string,
    result: any,
    metadata: any = {}
  ): Promise<void> {
    // Store in private memory
    await this.supabase.from('ai_memory').insert({
      user_id: userId,
      memory_type: 'private',
      category: 'generation',
      content: {
        prompt,
        theme_name: result.name,
        colors: result.theme,
        style: this.detectStyle(result.theme, result.background),
        complexity: this.detectComplexity(result),
        timestamp: new Date().toISOString(),
      },
      confidence_score: 1.0,
      usage_count: 0,
    });

    // Update user preferences based on this generation
    await this.updateUserPreferences(userId, result);
  }

  async storeFeedback(
    userId: string,
    worldThemeId: string,
    rating: number,
    comment?: string,
    metadata: any = {}
  ): Promise<void> {
    // Store feedback
    await this.supabase.from('ai_feedback').insert({
      user_id: userId,
      content_type: 'world_theme',
      content_id: worldThemeId,
      rating,
      comment,
      metadata,
    });

    // If high rating, consider for global knowledge
    if (rating >= 4) {
      await this.considerForGlobalKnowledge(userId, worldThemeId);
    }

    // Update feedback patterns
    await this.updateFeedbackPatterns(userId, worldThemeId, rating);
  }

  private async updateUserPreferences(userId: string, result: any): Promise<void> {
    // Get current preferences
    const { data: current } = await this.supabase
      .from('world_preferences')
      .select('preferred_colors, preferred_styles, preferred_animations, preferred_themes')
      .eq('user_id', userId)
      .single();

    const currentPrefs = current || {
      preferred_colors: [],
      preferred_styles: [],
      preferred_animations: [],
      preferred_themes: [],
    };

    // Extract new preferences from result
    const newColors = this.extractColors(result.theme);
    const newStyle = this.detectStyle(result.theme, result.background);
    const newTheme = this.detectThemeCategory(result.name, result.prompt);

    // Update preferences (keep last 10 of each)
    const updatedPrefs = {
      preferred_colors: [...new Set([...(currentPrefs.preferred_colors || []), ...newColors])].slice(-10),
      preferred_styles: [...new Set([...(currentPrefs.preferred_styles || []), newStyle])].slice(-10),
      preferred_animations: currentPrefs.preferred_animations || [],
      preferred_themes: [...new Set([...(currentPrefs.preferred_themes || []), newTheme])].slice(-10),
    };

    // Upsert preferences
    await this.supabase.from('world_preferences').upsert({
      user_id: userId,
      ...updatedPrefs,
      last_updated: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });
  }

  private async considerForGlobalKnowledge(userId: string, worldThemeId: string): Promise<void> {
    // Get the world theme
    const { data: theme } = await this.supabase
      .from('world_themes')
      .select('name, prompt, colors, background, decorations')
      .eq('id', worldThemeId)
      .single();

    if (!theme) return;

    // Check if similar knowledge already exists
    const style = this.detectStyle(theme.colors, theme.background);
    const { data: existing } = await this.supabase
      .from('ai_memory')
      .select('id')
      .eq('memory_type', 'global')
      .eq('category', 'style_example')
      .contains('content', { style })
      .limit(1);

    // Only add if not already present
    if (!existing || existing.length === 0) {
      await this.supabase.from('ai_memory').insert({
        user_id: userId, // Track who contributed
        memory_type: 'global',
        category: 'style_example',
        content: {
          style,
          colors: theme.colors,
          background_type: theme.background?.type,
          description: `Example of ${style} style`,
          contributed_by: userId,
          timestamp: new Date().toISOString(),
        },
        confidence_score: 0.5, // Start with low confidence
        is_approved: false, // Requires admin approval
        usage_count: 0,
      });
    }
  }

  private async updateFeedbackPatterns(userId: string, worldThemeId: string, rating: number): Promise<void> {
    // Get the theme to analyze what was liked/disliked
    const { data: theme } = await this.supabase
      .from('world_themes')
      .select('colors, background, decorations')
      .eq('id', worldThemeId)
      .single();

    if (!theme) return;

    const style = this.detectStyle(theme.colors, theme.background);
    const complexity = this.detectComplexity(theme);

    // Store pattern in private memory
    await this.supabase.from('ai_memory').insert({
      user_id: userId,
      memory_type: 'private',
      category: rating >= 4 ? 'liked_pattern' : 'disliked_pattern',
      content: {
        style,
        complexity,
        rating,
        timestamp: new Date().toISOString(),
      },
      confidence_score: 1.0,
      usage_count: 0,
    });
  }

  // ============================================================
  // HELPER METHODS
  // ============================================================

  private extractKeywords(prompt: string): string[] {
    // Simple keyword extraction
    const stopWords = new Set(['el', 'la', 'los', 'las', 'un', 'una', 'con', 'de', 'del', 'en', 'y', 'o', 'a']);
    
    return prompt
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 10);
  }

  private calculateRelevance(text: string, keywords: string[]): number {
    const lowerText = text.toLowerCase();
    const matches = keywords.filter(keyword => lowerText.includes(keyword));
    return matches.length / keywords.length;
  }

  private detectStyle(colors: any, background: any): string {
    // Simple style detection based on colors
    const primary = colors?.primary || '#000000';
    
    if (primary.includes('ff') || primary.includes('FF')) return 'vibrant';
    if (primary.includes('00') && primary.length === 7) return 'dark';
    if (background?.type === 'svg') return 'geometric';
    if (background?.type === 'gradient') return 'gradient';
    
    return 'neutral';
  }

  private detectComplexity(theme: any): string {
    const decorationsCount = theme.decorations?.length || 0;
    const animationsCount = Object.keys(theme.animations || {}).length;
    
    if (decorationsCount > 10 || animationsCount > 5) return 'high';
    if (decorationsCount > 5 || animationsCount > 2) return 'medium';
    return 'low';
  }

  private detectThemeCategory(name: string, prompt: string): string {
    const text = `${name} ${prompt}`.toLowerCase();
    
    if (text.includes('espacio') || text.includes('space') || text.includes('galaxia')) return 'space';
    if (text.includes('bosque') || text.includes('forest') || text.includes('naturaleza')) return 'nature';
    if (text.includes('castillo') || text.includes('castle') || text.includes('medieval')) return 'medieval';
    if (text.includes('cyber') || text.includes('futur') || text.includes('neon')) return 'cyberpunk';
    if (text.includes('oceano') || text.includes('mar') || text.includes('agua')) return 'ocean';
    
    return 'abstract';
  }

  private extractColors(theme: any): string[] {
    if (!theme) return [];
    
    return [
      theme.primary,
      theme.secondary,
      theme.accent,
      theme.background,
    ].filter(Boolean);
  }

  private extractStylesFromFeedback(feedback: any[]): string[] {
    // This would need to fetch the themes and extract styles
    // For now, return empty array
    return [];
  }

  private detectPreferredComplexity(feedback: any[]): string {
    const avgRating = feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length;
    
    if (avgRating >= 4) return 'high';
    if (avgRating >= 3) return 'medium';
    return 'low';
  }
}
