import { createClient } from '@supabase/supabase-js';

// ============================================================
// CONFIGURACIÓN DE SUPABASE
// ============================================================
// Para conectar con Supabase real, configurar estas variables:
// - VITE_SUPABASE_URL: URL del proyecto Supabase
// - VITE_SUPABASE_ANON_KEY: Clave pública (anon key)
//
// Google OAuth requiere:
// - Configurar Google Cloud OAuth en Supabase Dashboard
// - Agregar URL del sitio en "Redirect URLs" de Supabase Auth
// - NO colocar GOOGLE_CLIENT_SECRET en el frontend
//
// Variables de entorno necesarias (backend/Edge Functions):
// - SUPABASE_SERVICE_ROLE_KEY (NUNCA en frontend)
// - GOOGLE_CLIENT_ID (solo si se procesa en backend)
// - GOOGLE_CLIENT_SECRET (SOLO en backend)
// - AI_PROVIDER_KEY (SOLO en backend)
// - PAYMENT_PROVIDER_KEY (SOLO en backend)
// - PAYMENT_WEBHOOK_SECRET (SOLO en backend)
// ============================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// ============================================================
// TIPOS DE DATOS
// ============================================================

export type UserRole = 'student' | 'teacher' | 'admin' | 'developer';

export type GameMode = 'quick_rush' | 'time_attack' | 'survival' | 'boss_battle' | 'duel';

export type Difficulty = 'principiante' | 'basico' | 'intermedio' | 'avanzado';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'completed' | 'failed';

export type ScanStatus = 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';

export type SubscriptionStatus = 'pending' | 'active' | 'trial' | 'past_due' | 'cancelled' | 'expired' | 'failed';

export type PlanId = 'free' | 'rush' | 'legend' | 'teacher' | 'developer';

export interface Profile {
  id: string;
  email: string;
  nickname: string;
  avatar_url: string | null;
  role: UserRole;
  grade: string | null;
  math_level: Difficulty | null;
  goal: string | null;
  level: number;
  xp: number;
  coins: number;
  gems: number;
  streak: number;
  last_active: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface GameSession {
  id: string;
  user_id: string;
  game_mode: GameMode;
  difficulty: Difficulty;
  questions: Question[];
  current_question: number;
  score: number;
  xp_earned: number;
  coins_earned: number;
  timer: number;
  lives: number;
  combo: number;
  max_combo: number;
  start_time: string;
  end_time: string | null;
  status: GameStatus;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  topic: string;
  difficulty: Difficulty;
  time_limit: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  xp_reward: number;
  coins_reward: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: PlanId;
  provider: string;
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  provider: string;
  transaction_id: string;
  amount: number;
  currency: string;
  status: string;
  plan: PlanId;
  created_at: string;
}

export interface Scan {
  id: string;
  user_id: string;
  file_url: string;
  file_type: string;
  status: ScanStatus;
  extracted_text: string | null;
  detected_topic: string | null;
  generated_questions: Question[] | null;
  created_at: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'skin' | 'pet' | 'background' | 'effect';
  price_coins: number;
  price_gems: number | null;
  is_premium: boolean;
}

export interface UserEntitlements {
  canScan: boolean;
  scanLimit: number;
  canUseAI: boolean;
  aiLimit: number;
  canAccessLegend: boolean;
  canAccessTeacherTools: boolean;
  canRemoveAds: boolean;
  canUseAllSkins: boolean;
  canAccessAdmin: boolean;
  canAccessDeveloper: boolean;
}

export interface TeacherClass {
  id: string;
  teacher_id: string;
  name: string;
  code: string;
  grade: string;
  student_count: number;
  created_at: string;
}

export interface TeacherAssignment {
  id: string;
  class_id: string;
  teacher_id: string;
  title: string;
  topic: string;
  difficulty: Difficulty;
  time_limit: number;
  question_count: number;
  due_date: string;
  game_mode: GameMode;
  created_at: string;
}

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  currency: string;
  period: string;
  features: string[];
  highlighted: boolean;
}
