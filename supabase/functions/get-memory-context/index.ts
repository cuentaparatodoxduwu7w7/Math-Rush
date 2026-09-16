// ============================================================
// Edge Function: Get Memory Context
// ============================================================
// Returns the memory context for a user (for debugging/inspection)
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { authenticateUser } from '../_shared/auth.ts';
import { MemoryService } from '../_shared/memory-service.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface GetMemoryRequest {
  prompt?: string; // Optional: get memory relevant to a specific prompt
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

    // 2. Parse request body (optional)
    let prompt = '';
    if (req.method === 'POST') {
      const body: GetMemoryRequest = await req.json();
      prompt = body.prompt || '';
    }

    // 3. Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 4. Get memory context
    const memoryService = new MemoryService(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const memoryContext = await memoryService.getMemoryContext(user.userId, prompt);

    // 5. Get additional statistics
    const { count: totalGenerations } = await supabase
      .from('world_themes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.userId);

    const { count: totalFeedback } = await supabase
      .from('ai_feedback')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.userId);

    const { count: privateMemoryCount } = await supabase
      .from('ai_memory')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.userId)
      .eq('memory_type', 'private');

    const { count: globalMemoryCount } = await supabase
      .from('ai_memory')
      .select('*', { count: 'exact', head: true })
      .eq('memory_type', 'global')
      .eq('is_approved', true);

    // 6. Return comprehensive memory context
    return new Response(
      JSON.stringify({
        success: true,
        memory_context: memoryContext,
        statistics: {
          total_generations: totalGenerations || 0,
          total_feedback: totalFeedback || 0,
          private_memory_entries: privateMemoryCount || 0,
          global_memory_entries: globalMemoryCount || 0,
        },
        prompt_used: prompt || null,
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
