// ============================================================
// Memory Learning Service
// ============================================================
// Analyzes generations and feedback to learn user preferences
// ============================================================

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface LearningInsight {
  type: 'preference' | 'pattern' | 'style' | 'complexity';
  category: string;
  content: any;
  confidence: number;
  source: string;
}

export class MemoryLearningService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  // ============================================================
  // LEARN FROM GENERATION
  // ============================================================

  async learnFromGeneration(
    userId: string,
    prompt: string,
    result: any,
    wasAccepted: boolean
  ): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = [];

    if (!wasAccepted) {
      // User didn't accept this generation, learn what to avoid
      insights.push(...await this.analyzeRejectedGeneration(prompt, result));
    } else {
      // User accepted, learn preferences
      insights.push(...await this.analyzeAcceptedGeneration(prompt, result));
    }

    // Store insights in memory
    for (const insight of insights) {
      await this.storeInsight(userId, insight);
    }

    return insights;
  }

  private async analyzeAcceptedGeneration(prompt: string, result: any): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = [];

    // Extract style
    const style = this.detectStyle(result.theme, result.background);
    insights.push({
      type: 'style',
      category: 'preferred_style',
      content: { style, prompt_snippet: prompt.substring(0, 100) },
      confidence: 0.8,
      source: 'accepted_generation',
    });

    // Extract color preferences
    const colors = this.extractColorPalette(result.theme);
    if (colors.length > 0) {
      insights.push({
        type: 'preference',
        category: 'color_palette',
        content: { colors, mood: this.detectMood(colors) },
        confidence: 0.7,
        source: 'accepted_generation',
      });
    }

    // Extract complexity preference
    const complexity = this.analyzeComplexity(result);
    insights.push({
      type: 'complexity',
      category: 'preferred_complexity',
      content: { complexity, decorations_count: result.decorations?.length || 0 },
      confidence: 0.6,
      source: 'accepted_generation',
    });

    // Extract theme category
    const themeCategory = this.detectThemeCategory(prompt, result.name);
    insights.push({
      type: 'preference',
      category: 'theme_category',
      content: { category: themeCategory, prompt_snippet: prompt.substring(0, 100) },
      confidence: 0.7,
      source: 'accepted_generation',
    });

    return insights;
  }

  private async analyzeRejectedGeneration(prompt: string, result: any): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = [];

    // Analyze what might have caused rejection
    const style = this.detectStyle(result.theme, result.background);
    insights.push({
      type: 'style',
      category: 'disliked_style',
      content: { style, prompt_snippet: prompt.substring(0, 100) },
      confidence: 0.5, // Lower confidence for rejections
      source: 'rejected_generation',
    });

    // Check if complexity was too high/low
    const complexity = this.analyzeComplexity(result);
    if (complexity === 'high') {
      insights.push({
        type: 'complexity',
        category: 'disliked_complexity',
        content: { complexity: 'high', reason: 'too_complex' },
        confidence: 0.4,
        source: 'rejected_generation',
      });
    }

    return insights;
  }

  // ============================================================
  // LEARN FROM FEEDBACK
  // ============================================================

  async learnFromFeedback(
    userId: string,
    worldThemeId: string,
    rating: number,
    comment?: string
  ): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = [];

    // Get the world theme
    const { data: theme } = await this.supabase
      .from('world_themes')
      .select('name, prompt, colors, background, decorations, animations')
      .eq('id', worldThemeId)
      .single();

    if (!theme) return insights;

    // Analyze based on rating
    if (rating >= 4) {
      // Positive feedback
      insights.push(...await this.analyzePositiveFeedback(theme, comment));
    } else if (rating <= 2) {
      // Negative feedback
      insights.push(...await this.analyzeNegativeFeedback(theme, comment));
    }

    // Store insights
    for (const insight of insights) {
      await this.storeInsight(userId, insight);
    }

    return insights;
  }

  private async analyzePositiveFeedback(theme: any, comment?: string): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = [];

    // Extract what was liked
    const style = this.detectStyle(theme.colors, theme.background);
    insights.push({
      type: 'style',
      category: 'liked_style',
      content: { 
        style, 
        colors: theme.colors,
        comment: comment || null 
      },
      confidence: 0.9,
      source: 'positive_feedback',
    });

    // Analyze complexity
    const complexity = this.analyzeComplexity(theme);
    insights.push({
      type: 'complexity',
      category: 'liked_complexity',
      content: { complexity },
      confidence: 0.7,
      source: 'positive_feedback',
    });

    // Extract specific elements if mentioned in comment
    if (comment) {
      const mentionedElements = this.extractMentionedElements(comment);
      if (mentionedElements.length > 0) {
        insights.push({
          type: 'preference',
          category: 'liked_elements',
          content: { elements: mentionedElements },
          confidence: 0.8,
          source: 'positive_feedback_comment',
        });
      }
    }

    return insights;
  }

  private async analyzeNegativeFeedback(theme: any, comment?: string): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = [];

    // Extract what was disliked
    const style = this.detectStyle(theme.colors, theme.background);
    insights.push({
      type: 'style',
      category: 'disliked_style',
      content: { 
        style, 
        colors: theme.colors,
        comment: comment || null 
      },
      confidence: 0.7,
      source: 'negative_feedback',
    });

    // Analyze complexity
    const complexity = this.analyzeComplexity(theme);
    insights.push({
      type: 'complexity',
      category: 'disliked_complexity',
      content: { complexity },
      confidence: 0.6,
      source: 'negative_feedback',
    });

    // Extract specific issues from comment
    if (comment) {
      const issues = this.extractIssues(comment);
      if (issues.length > 0) {
        insights.push({
          type: 'preference',
          category: 'disliked_elements',
          content: { issues },
          confidence: 0.8,
          source: 'negative_feedback_comment',
        });
      }
    }

    return insights;
  }

  // ============================================================
  // PATTERN DETECTION
  // ============================================================

  async detectPatterns(userId: string): Promise<LearningInsight[]> {
    const insights: LearningInsight[] = [];

    // Get user's generation history
    const { data: generations } = await this.supabase
      .from('world_themes')
      .select('name, prompt, colors, background, created_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!generations || generations.length < 3) return insights;

    // Detect recurring styles
    const styles = generations.map(g => this.detectStyle(g.colors, g.background));
    const styleCounts = this.countOccurrences(styles);
    const dominantStyle = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0];

    if (dominantStyle && dominantStyle[1] >= 3) {
      insights.push({
        type: 'pattern',
        category: 'recurring_style',
        content: { 
          style: dominantStyle[0], 
          frequency: dominantStyle[1],
          total_generations: generations.length 
        },
        confidence: dominantStyle[1] / generations.length,
        source: 'pattern_detection',
      });
    }

    // Detect recurring themes
    const themes = generations.map(g => this.detectThemeCategory(g.prompt, g.name));
    const themeCounts = this.countOccurrences(themes);
    const dominantTheme = Object.entries(themeCounts).sort((a, b) => b[1] - a[1])[0];

    if (dominantTheme && dominantTheme[1] >= 3) {
      insights.push({
        type: 'pattern',
        category: 'recurring_theme',
        content: { 
          theme: dominantTheme[0], 
          frequency: dominantTheme[1],
          total_generations: generations.length 
        },
        confidence: dominantTheme[1] / generations.length,
        source: 'pattern_detection',
      });
    }

    // Detect color preferences
    const allColors = generations.flatMap(g => this.extractColorPalette(g.colors));
    const colorCounts = this.countOccurrences(allColors);
    const topColors = Object.entries(colorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color]) => color);

    if (topColors.length > 0) {
      insights.push({
        type: 'preference',
        category: 'favorite_colors',
        content: { colors: topColors },
        confidence: 0.7,
        source: 'pattern_detection',
      });
    }

    return insights;
  }

  // ============================================================
  // HELPER METHODS
  // ============================================================

  private async storeInsight(userId: string, insight: LearningInsight): Promise<void> {
    await this.supabase.from('ai_memory').insert({
      user_id: userId,
      memory_type: 'private',
      category: insight.category,
      content: insight.content,
      confidence_score: insight.confidence,
      usage_count: 0,
      meta {
        type: insight.type,
        source: insight.source,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private detectStyle(colors: any, background: any): string {
    const primary = colors?.primary || '#000000';
    
    if (primary.includes('ff') || primary.includes('FF')) return 'vibrant';
    if (primary.includes('00') && primary.length === 7) return 'dark';
    if (background?.type === 'svg') return 'geometric';
    if (background?.type === 'gradient') return 'gradient';
    
    return 'neutral';
  }

  private extractColorPalette(theme: any): string[] {
    if (!theme) return [];
    
    return [
      theme.primary,
      theme.secondary,
      theme.accent,
      theme.background,
    ].filter(Boolean);
  }

  private detectMood(colors: string[]): string {
    // Simple mood detection based on color brightness
    const avgBrightness = colors.reduce((sum, color) => {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return sum + (r + g + b) / 3;
    }, 0) / colors.length;

    if (avgBrightness > 200) return 'bright';
    if (avgBrightness > 100) return 'medium';
    return 'dark';
  }

  private analyzeComplexity(theme: any): string {
    const decorationsCount = theme.decorations?.length || 0;
    const animationsCount = Object.keys(theme.animations || {}).length;
    
    if (decorationsCount > 10 || animationsCount > 5) return 'high';
    if (decorationsCount > 5 || animationsCount > 2) return 'medium';
    return 'low';
  }

  private detectThemeCategory(prompt: string, name: string): string {
    const text = `${name} ${prompt}`.toLowerCase();
    
    if (text.includes('espacio') || text.includes('space') || text.includes('galaxia')) return 'space';
    if (text.includes('bosque') || text.includes('forest') || text.includes('naturaleza')) return 'nature';
    if (text.includes('castillo') || text.includes('castle') || text.includes('medieval')) return 'medieval';
    if (text.includes('cyber') || text.includes('futur') || text.includes('neon')) return 'cyberpunk';
    if (text.includes('oceano') || text.includes('mar') || text.includes('agua')) return 'ocean';
    
    return 'abstract';
  }

  private extractMentionedElements(comment: string): string[] {
    const elements: string[] = [];
    const lowerComment = comment.toLowerCase();
    
    const elementPatterns = [
      { pattern: /color/i, element: 'colors' },
      { pattern: /animaci[oó]n/i, element: 'animations' },
      { pattern: /decoraci[oó]n/i, element: 'decorations' },
      { pattern: /fondo/i, element: 'background' },
      { pattern: /diseño/i, element: 'design' },
      { pattern: /estilo/i, element: 'style' },
    ];

    for (const { pattern, element } of elementPatterns) {
      if (pattern.test(lowerComment)) {
        elements.push(element);
      }
    }

    return elements;
  }

  private extractIssues(comment: string): string[] {
    const issues: string[] = [];
    const lowerComment = comment.toLowerCase();
    
    const issuePatterns = [
      { pattern: /oscuro/i, issue: 'too_dark' },
      { pattern: /claro/i, issue: 'too_bright' },
      { pattern: /complejo/i, issue: 'too_complex' },
      { pattern: /simple/i, issue: 'too_simple' },
      { pattern: /aburrido/i, issue: 'boring' },
      { pattern: /recargado/i, issue: 'overwhelming' },
    ];

    for (const { pattern, issue } of issuePatterns) {
      if (pattern.test(lowerComment)) {
        issues.push(issue);
      }
    }

    return issues;
  }

  private countOccurrences<T>(arr: T[]): Record<string, number> {
    return arr.reduce((counts, item) => {
      const key = String(item);
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
  }
}
