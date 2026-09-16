// ============================================================
// Edge Function: Generate World Theme
// ============================================================
// Main function for the World Designer AI
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { authenticateUser } from '../_shared/auth.ts';
import { validatePrompt, validateThemeResponse, validateMinigameResponse } from '../_shared/validation.ts';
import { generateWorldDesign, isProviderConfigured } from '../_shared/ai-provider.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface GenerateWorldRequest {
  prompt: string;
  useToken?: boolean;
  includeMinigame?: boolean;
  difficulty?: string;
}

interface PlanLimits {
  free: number;
  rush: number;
  legend: number;
  teacher: number;
  developer: number;
}

const PLAN_LIMITS: PlanLimits = {
  free: 2,
  rush: 5,
  legend: 8,
  teacher: 15,
  developer: 9999,
};

const TOKEN_COST = 3; // 3 tokens = 1 attempt

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const startTime = Date.now();

  try {
    // 1. Authenticate user
    const authHeader = req.headers.get('Authorization');
    const user = await authenticateUser(authHeader, SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED', message: 'Invalid or missing authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parse request body
    const body: GenerateWorldRequest = await req.json();
    const { prompt, useToken = false, includeMinigame = false, difficulty = 'basico' } = body;

    // 3. Validate prompt
    const promptValidation = validatePrompt(prompt);
    if (!promptValidation.valid) {
      return new Response(
        JSON.stringify({ error: 'INVALID_PROMPT', message: promptValidation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Check if AI provider is configured
    if (!isProviderConfigured()) {
      return new Response(
        JSON.stringify({ 
          error: 'AI_PROVIDER_NOT_CONFIGURED', 
          message: 'The AI provider is not configured. Please contact support.' 
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 6. Check plan and attempts
    const { data: attemptsCheck, error: attemptsError } = await supabase
      .rpc('check_and_renew_attempts', { user_uuid: user.userId });

    if (attemptsError) {
      console.error('Error checking attempts:', attemptsError);
      return new Response(
        JSON.stringify({ error: 'DATABASE_ERROR', message: 'Failed to check attempts' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { can_generate, attempts_remaining, period_end } = attemptsCheck[0];

    // 7. Check if user can generate (either with attempts or tokens)
    if (!can_generate && !useToken) {
      return new Response(
        JSON.stringify({ 
          error: 'LIMIT_EXCEEDED', 
          message: 'You have used all your attempts for this period',
          attempts_remaining: 0,
          period_end,
          can_use_tokens: true
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 8. If using token, validate and deduct
    if (useToken || !can_generate) {
      const { data: tokenBalance } = await supabase
        .from('tokens')
        .select('balance')
        .eq('user_id', user.userId)
        .single();

      const currentBalance = tokenBalance?.balance || 0;

      if (currentBalance < TOKEN_COST) {
        return new Response(
          JSON.stringify({ 
            error: 'INSUFFICIENT_TOKENS', 
            message: `You need ${TOKEN_COST} tokens for this attempt`,
            current_balance: currentBalance,
            required: TOKEN_COST
          }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Deduct tokens
      const useTokenResult = await supabase.rpc('use_tokens', {
        user_uuid: user.userId,
        amount: TOKEN_COST,
        reason: 'World Designer AI generation',
      });

      if (!useTokenResult) {
        return new Response(
          JSON.stringify({ error: 'TOKEN_ERROR', message: 'Failed to use tokens' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 9. Get user preferences
    const { data: preferences } = await supabase
      .from('world_preferences')
      .select('*')
      .eq('user_id', user.userId)
      .single();

    // 10. Get relevant memory (private + approved global)
    const { data: memory } = await supabase
      .from('ai_memory')
      .select('category, content')
      .or(`and(user_id.eq.${user.userId},memory_type.eq.private),and(memory_type.eq.global,is_approved.eq.true)`)
      .order('usage_count', { ascending: false })
      .limit(10);

    // 11. Call AI provider
    let aiResponse;
    try {
      aiResponse = await generateWorldDesign({
        prompt: promptValidation.data,
        userPreferences: preferences ? {
          preferredColors: preferences.preferred_colors,
          preferredStyles: preferences.preferred_styles,
          preferredAnimations: preferences.preferred_animations,
        } : undefined,
        memory: memory || [],
        includeMinigame,
        difficulty,
      });
    } catch (error) {
      console.error('AI generation error:', error);
      
      // Log the error
      await supabase.from('ai_usage').insert({
        user_id: user.userId,
        type: 'world_theme',
        provider: 'world_designer',
        prompt: promptValidation.data,
        error: error.message,
        duration_ms: Date.now() - startTime,
        success: false,
      });

      return new Response(
        JSON.stringify({ 
          error: 'AI_GENERATION_FAILED', 
          message: 'Failed to generate world theme. Please try again.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 12. Validate AI response
    const themeValidation = validateThemeResponse(aiResponse);
    if (!themeValidation.valid) {
      return new Response(
        JSON.stringify({ 
          error: 'INVALID_AI_RESPONSE', 
          message: 'The AI generated an invalid response. Please try again.' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (includeMinigame && aiResponse.minigame) {
      const minigameValidation = validateMinigameResponse(aiResponse.minigame);
      if (!minigameValidation.valid) {
        return new Response(
          JSON.stringify({ 
            error: 'INVALID_MINIGAME_RESPONSE', 
            message: 'The AI generated an invalid minigame. Please try again.' 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 13. Save world theme to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3); // 3 days expiration

    const { data: worldTheme, error: insertError } = await supabase
      .from('world_themes')
      .insert({
        user_id: user.userId,
        name: aiResponse.name,
        prompt: promptValidation.data,
        background: aiResponse.background,
        colors: aiResponse.theme,
        decorations: aiResponse.decorations || [],
        animations: aiResponse.animations || {},
        ui_config: aiResponse.layout || {},
        metadata: aiResponse._metadata || {},
        expires_at: expiresAt.toISOString(),
        is_active: true,
        attempts_used: useToken || !can_generate ? 0 : 1,
        tokens_used: useToken || !can_generate ? TOKEN_COST : 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving world theme:', insertError);
      return new Response(
        JSON.stringify({ error: 'DATABASE_ERROR', message: 'Failed to save world theme' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 14. Save minigame if included
    if (includeMinigame && aiResponse.minigame) {
      const { error: minigameError } = await supabase
        .from('world_minigames')
        .insert({
          world_theme_id: worldTheme.id,
          user_id: user.userId,
          name: aiResponse.minigame.theme,
          topic: aiResponse.minigame.type,
          difficulty: aiResponse.minigame.difficulty,
          questions: aiResponse.minigame.content.questions || [],
          visual_config: aiResponse.minigame.rules || {},
          is_active: true,
        });

      if (minigameError) {
        console.error('Error saving minigame:', minigameError);
        // Don't fail the whole request, just log the error
      }
    }

    // 15. Register attempt
    await supabase.rpc('register_world_attempt', {
      user_uuid: user.userId,
      world_theme_uuid: worldTheme.id,
      tokens_used_amount: useToken || !can_generate ? TOKEN_COST : 0,
    });

    // 16. Log usage
    await supabase.from('ai_usage').insert({
      user_id: user.userId,
      type: 'world_theme',
      provider: 'world_designer',
      prompt: promptValidation.data,
      duration_ms: Date.now() - startTime,
      success: true,
    });

    // 17. Update memory with this generation
    await supabase.from('ai_memory').insert({
      user_id: user.userId,
      memory_type: 'private',
      category: 'generation',
      content: {
        prompt: promptValidation.data,
        theme_name: aiResponse.name,
        colors: aiResponse.theme,
        timestamp: new Date().toISOString(),
      },
      confidence_score: 1.0,
    });

    // 18. Return success response
    const duration = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        success: true,
        world_theme: {
          id: worldTheme.id,
          name: aiResponse.name,
          theme: aiResponse.theme,
          background: aiResponse.background,
          decorations: aiResponse.decorations,
          animations: aiResponse.animations,
          layout: aiResponse.layout,
          minigame: aiResponse.minigame,
          expires_at: expiresAt.toISOString(),
        },
        metadata: {
          duration,
          attempts_remaining: useToken || !can_generate ? attempts_remaining : attempts_remaining - 1,
          tokens_used: useToken || !can_generate ? TOKEN_COST : 0,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'INTERNAL_ERROR', 
        message: 'An unexpected error occurred. Please try again.' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
