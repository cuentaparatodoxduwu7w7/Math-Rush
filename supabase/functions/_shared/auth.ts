// ============================================================
// Authentication Helper for Edge Functions
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  plan: string;
}

export async function authenticateUser(
  authHeader: string | null,
  supabaseUrl: string,
  supabaseAnonKey: string
): Promise<AuthenticatedUser | null> {
  if (!authHeader) {
    return null;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Get user profile with plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Get active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return {
      userId: user.id,
      email: user.email || '',
      role: profile?.role || 'student',
      plan: subscription?.plan_id || 'free',
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}
