// ============================================================
// Edge Function: Purchase Product
// ============================================================
// Handles product purchases with server-side validation
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { authenticateUser } from '../_shared/auth.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface PurchaseRequest {
  product_id: string;
  currency: 'coins' | 'gems' | 'tokens';
  idempotency_key: string;
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
    const body: PurchaseRequest = await req.json();
    const { product_id, currency, idempotency_key } = body;

    // 3. Validate input
    if (!product_id || !currency || !idempotency_key) {
      return new Response(
        JSON.stringify({ error: 'INVALID_REQUEST', message: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['coins', 'gems', 'tokens'].includes(currency)) {
      return new Response(
        JSON.stringify({ error: 'INVALID_CURRENCY', message: 'Invalid currency type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 5. Call purchase_product function
    const {  result, error } = await supabase.rpc('purchase_product', {
      user_uuid: user.userId,
      product_uuid: product_id,
      currency,
      idempotency_key,
    });

    if (error) {
      console.error('Purchase error:', error);
      
      // Handle specific errors
      if (error.message.includes('Duplicate purchase')) {
        return new Response(
          JSON.stringify({ error: 'DUPLICATE_PURCHASE', message: 'This purchase was already processed' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (error.message.includes('Insufficient balance')) {
        return new Response(
          JSON.stringify({ error: 'INSUFFICIENT_BALANCE', message: 'You do not have enough balance' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (error.message.includes('Product not found')) {
        return new Response(
          JSON.stringify({ error: 'PRODUCT_NOT_FOUND', message: 'Product not found or inactive' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'PURCHASE_FAILED', message: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Return success
    return new Response(
      JSON.stringify({
        success: true,
        ...result,
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
