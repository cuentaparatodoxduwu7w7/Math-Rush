// ============================================================
// Edge Function: Submit Feedback
// ============================================================
// Handles user feedback on generated world themes
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { authenticateUser } from '../_shared/auth.ts';
import { MemoryService } from '../_shared/memory-service.ts';
import { MemoryProtectionService } from '../_shared/memory-protection.ts';
import { MemoryLearningService } from '../_shared/memory-learning.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface FeedbackRequest {
  world_theme_id: string;
  rating: number; // 1-5
  comment?: string;
  accepted?: boolean; // Whether user accepted/applied the theme
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

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
    const body: FeedbackRequest = await req.json();
    const { world_theme_id, rating, comment, accepted = true } = body;

    // 3. Validate input
    if (!world_theme_id) {
      return new Response(
        JSON.stringify({ error: 'INVALID_REQUEST', message: 'world_theme_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return new Response(
        JSON.stringify({ error: 'INVALID_RATING', message: 'Rating must be between 1 and 5' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Validate comment for security
    const protectionService = new MemoryProtectionService();
    if (comment) {
      const commentCheck = protectionService.detectPromptInjection(comment);
      if (!commentCheck.isSafe) {
        return new Response(
          JSON.stringify({ 
            error: 'SECURITY_CHECK_FAILED', 
            message: 'Comment contains potentially harmful content' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 5. Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 6. Verify world theme exists and belongs to user
    const { data: worldTheme, error: themeError } = await supabase
      .from('world_themes')
      .select('id, user_id, name, prompt, colors, background')
      .eq('id', world_theme_id)
      .single();

    if (themeError || !worldTheme) {
      return new Response(
        JSON.stringify({ error: 'NOT_FOUND', message: 'World theme not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (worldTheme.user_id !== user.userId) {
      return new Response(
        JSON.stringify({ error: 'FORBIDDEN', message: 'You can only provide feedback on your own themes' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Store feedback
    const memoryService = new MemoryService(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    await memoryService.storeFeedback(
      user.userId,
      world_theme_id,
      rating,
      comment,
      { accepted }
    );

    // 8. Learn from feedback
    const learningService = new MemoryLearningService(supabase);
    const insights = await learningService.learnFromFeedback(
      user.userId,
      world_theme_id,
      rating,
      comment
    );

    // 9. If highly rated and accepted, consider for global knowledge
    if (rating >= 4 && accepted) {
      // Check if this theme should be considered for global knowledge
      // This is done automatically in storeFeedback -> considerForGlobalKnowledge
    }

    // 10. Return success
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Feedback recorded successfully',
        insights_generated: insights.length,
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
