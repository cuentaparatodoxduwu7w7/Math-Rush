// ============================================================
// Edge Function: Manage Global Memory
// ============================================================
// Admin function to approve/reject global memory contributions
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { authenticateUser } from '../_shared/auth.ts';
import { MemoryProtectionService } from '../_shared/memory-protection.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface ManageMemoryRequest {
  action: 'approve' | 'reject' | 'delete';
  memory_id: string;
  reason?: string;
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

    // 2. Check if user is admin or developer
    if (user.role !== 'admin' && user.role !== 'developer') {
      return new Response(
        JSON.stringify({ error: 'FORBIDDEN', message: 'Only admins can manage global memory' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Parse request body
    const body: ManageMemoryRequest = await req.json();
    const { action, memory_id, reason } = body;

    // 4. Validate input
    if (!action || !memory_id) {
      return new Response(
        JSON.stringify({ error: 'INVALID_REQUEST', message: 'action and memory_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['approve', 'reject', 'delete'].includes(action)) {
      return new Response(
        JSON.stringify({ error: 'INVALID_ACTION', message: 'Action must be approve, reject, or delete' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 6. Get memory entry
    const { data: memory, error: memoryError } = await supabase
      .from('ai_memory')
      .select('*')
      .eq('id', memory_id)
      .eq('memory_type', 'global')
      .single();

    if (memoryError || !memory) {
      return new Response(
        JSON.stringify({ error: 'NOT_FOUND', message: 'Memory entry not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7. Validate content before approving
    const protectionService = new MemoryProtectionService();
    
    if (action === 'approve') {
      const validation = protectionService.validateMemoryContent(memory.content, 'global');
      if (!validation.isSafe) {
        return new Response(
          JSON.stringify({ 
            error: 'CONTENT_NOT_SAFE', 
            message: `Content failed safety check: ${validation.reason}` 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 8. Perform action
    switch (action) {
      case 'approve':
        const { error: approveError } = await supabase
          .from('ai_memory')
          .update({
            is_approved: true,
            updated_at: new Date().toISOString(),
            meta {
              ...memory.metadata,
              approved_by: user.userId,
              approved_at: new Date().toISOString(),
              approval_reason: reason || 'Approved by admin',
            },
          })
          .eq('id', memory_id);

        if (approveError) {
          throw approveError;
        }
        break;

      case 'reject':
        const { error: rejectError } = await supabase
          .from('ai_memory')
          .update({
            is_approved: false,
            updated_at: new Date().toISOString(),
            meta {
              ...memory.metadata,
              rejected_by: user.userId,
              rejected_at: new Date().toISOString(),
              rejection_reason: reason || 'Rejected by admin',
            },
          })
          .eq('id', memory_id);

        if (rejectError) {
          throw rejectError;
        }
        break;

      case 'delete':
        const { error: deleteError } = await supabase
          .from('ai_memory')
          .delete()
          .eq('id', memory_id);

        if (deleteError) {
          throw deleteError;
        }
        break;
    }

    // 9. Return success
    return new Response(
      JSON.stringify({
        success: true,
        message: `Memory ${action}d successfully`,
        memory_id,
        action,
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
