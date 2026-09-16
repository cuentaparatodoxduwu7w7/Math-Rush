// ============================================================
// Edge Function: Get Transaction History
// ============================================================
// Returns transaction history for all currencies
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { authenticateUser } from '../_shared/auth.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface GetHistoryRequest {
  currency_type?: 'coins' | 'gems' | 'tokens';
  limit?: number;
  offset?: number;
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

    // 2. Parse query parameters
    const url = new URL(req.url);
    const currencyType = url.searchParams.get('currency_type') as 'coins' | 'gems' | 'tokens' | null;
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // 3. Validate parameters
    if (currencyType && !['coins', 'gems', 'tokens'].includes(currencyType)) {
      return new Response(
        JSON.stringify({ error: 'INVALID_CURRENCY', message: 'Invalid currency type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (limit > 100) {
      return new Response(
        JSON.stringify({ error: 'INVALID_LIMIT', message: 'Limit cannot exceed 100' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 5. Build query
    let query = supabase
      .from('currency_transactions')
      .select('*')
      .eq('user_id', user.userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (currencyType) {
      query = query.eq('currency_type', currencyType);
    }

    // 6. Execute query
    const {  transactions, error } = await query;

    if (error) {
      console.error('Query error:', error);
      return new Response(
        JSON.stringify({ error: 'QUERY_FAILED', message: 'Failed to fetch transactions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Get total count
    let countQuery = supabase
      .from('currency_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.userId);

    if (currencyType) {
      countQuery = countQuery.eq('currency_type', currencyType);
    }

    const { count } = await countQuery;

    // 8. Return transactions
    return new Response(
      JSON.stringify({
        success: true,
        transactions: transactions || [],
        pagination: {
          total: count || 0,
          limit,
          offset,
          has_more: (offset + limit) < (count || 0),
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
