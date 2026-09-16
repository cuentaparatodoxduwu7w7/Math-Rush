// ============================================================
// Edge Function: Get Currency Balances
// ============================================================
// Returns balances for all three currencies: coins, gems, tokens
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { authenticateUser } from '../_shared/auth.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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

    // 2. Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 3. Get all balances
    const {  profile } = await supabase
      .from('profiles')
      .select('coins, gems')
      .eq('id', user.userId)
      .single();

    const {  tokenRecord } = await supabase
      .from('tokens')
      .select('balance')
      .eq('user_id', user.userId)
      .single();

    // 4. Return balances
    return new Response(
      JSON.stringify({
        success: true,
        balances: {
          coins: profile?.coins || 0,
          gems: profile?.gems || 0,
          tokens: tokenRecord?.balance || 0,
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
