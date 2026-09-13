import { Question, GameSession, GameMode, Difficulty, GameStatus } from './supabase';
import { MOCK_QUESTIONS } from './mockData';

// ============================================================
// GAME ENGINE
// ============================================================

export interface GameState {
  session: GameSession;
  timeRemaining: number;
  isAnswering: boolean;
  lastAnswerCorrect: boolean | null;
  showExplanation: boolean;
}

export function createGameSession(
  userId: string,
  mode: GameMode,
  difficulty: Difficulty,
  questionCount: number = 10
): GameSession {
  const questions = selectQuestions(difficulty, questionCount);
  
  return {
    id: crypto.randomUUID(),
    user_id: userId,
    game_mode: mode,
    difficulty,
    questions,
    current_question: 0,
    score: 0,
    xp_earned: 0,
    coins_earned: 0,
    timer: mode === 'time_attack' ? 60 : mode === 'survival' ? 0 : 15,
    lives: mode === 'survival' ? 5 : mode === 'boss_battle' ? 3 : 0,
    combo: 0,
    max_combo: 0,
    start_time: new Date().toISOString(),
    end_time: null,
    status: 'playing',
  };
}

function selectQuestions(difficulty: Difficulty, count: number): Question[] {
  const filtered = MOCK_QUESTIONS.filter(q => {
    if (difficulty === 'principiante') return q.difficulty === 'basico' || q.difficulty === 'principiante';
    if (difficulty === 'basico') return q.difficulty === 'basico';
    if (difficulty === 'intermedio') return q.difficulty === 'basico' || q.difficulty === 'intermedio';
    return true;
  });
  
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function calculateScore(
  isCorrect: boolean,
  combo: number,
  timeRemaining: number,
  difficulty: Difficulty
): { score: number; xp: number; coins: number; newCombo: number } {
  if (!isCorrect) {
    return { score: 0, xp: 0, coins: 0, newCombo: 0 };
  }

  const difficultyMultiplier = { principiante: 1, basico: 1.5, intermedio: 2, avanzado: 3 }[difficulty];
  const comboMultiplier = 1 + (combo * 0.1);
  const timeBonus = Math.max(1, timeRemaining / 10);

  const score = Math.round(100 * difficultyMultiplier * comboMultiplier * timeBonus);
  const xp = Math.round(10 * difficultyMultiplier * comboMultiplier);
  const coins = Math.round(5 * difficultyMultiplier * (1 + combo * 0.05));
  const newCombo = combo + 1;

  return { score, xp, coins, newCombo };
}

export function getBossForDifficulty(difficulty: Difficulty): { name: string; emoji: string; hp: number } {
  const bosses = {
    principiante: { name: 'Duende Numérico', emoji: '👺', hp: 50 },
    basico: { name: 'Espectro Algebraico', emoji: '👻', hp: 80 },
    intermedio: { name: 'Monstruo del Álgebra', emoji: '👹', hp: 120 },
    avanzado: { name: 'Dragón del Cálculo', emoji: '🐉', hp: 200 },
  };
  return bosses[difficulty];
}

export function calculateBossDamage(isCorrect: boolean, combo: number): { bossDamage: number; playerDamage: number } {
  if (isCorrect) {
    return { bossDamage: 10 + combo * 2, playerDamage: 0 };
  }
  return { bossDamage: 0, playerDamage: 15 };
}

// ============================================================
// XP SYSTEM
// ============================================================

export function calculateXPReward(
  gameMode: GameMode,
  score: number,
  correctAnswers: number,
  totalQuestions: number,
  combo: number
): number {
  const baseXP = correctAnswers * 10;
  const modeBonus = { quick_rush: 1, time_attack: 1.2, survival: 1.5, boss_battle: 2, duel: 1.8 }[gameMode];
  const accuracyBonus = (correctAnswers / totalQuestions) * 50;
  const comboBonus = combo * 5;
  
  return Math.round((baseXP + accuracyBonus + comboBonus) * modeBonus);
}

export function calculateCoinsReward(score: number, combo: number): number {
  return Math.round(score / 50 + combo * 2);
}

// ============================================================
// SERVICES (MOCK ONLY)
// ============================================================

export function getUserEntitlements(role: string, plan: string) {
  const entitlements = {
    canScan: true,
    scanLimit: 3,
    canUseAI: false,
    aiLimit: 0,
    canAccessLegend: false,
    canAccessTeacherTools: false,
    canRemoveAds: false,
    canUseAllSkins: false,
    canAccessAdmin: false,
    canAccessDeveloper: false,
  };

  if (role === 'developer') {
    return { ...entitlements, scanLimit: 999, canUseAI: true, aiLimit: 999, canAccessLegend: true, canAccessTeacherTools: true, canRemoveAds: true, canUseAllSkins: true, canAccessAdmin: true, canAccessDeveloper: true };
  }
  if (role === 'admin') {
    return { ...entitlements, canAccessAdmin: true, canUseAllSkins: true };
  }
  if (role === 'teacher') {
    return { ...entitlements, canAccessTeacherTools: true, scanLimit: 50, canUseAI: true, aiLimit: 50 };
  }
  if (plan === 'legend') {
    return { ...entitlements, scanLimit: 999, canUseAI: true, aiLimit: 999, canAccessLegend: true, canRemoveAds: true, canUseAllSkins: true };
  }
  if (plan === 'rush') {
    return { ...entitlements, scanLimit: 10, canUseAI: true, aiLimit: 20, canRemoveAds: true };
  }
  
  return entitlements;
}

// Analytics tracking (MOCK ONLY - would send to backend in production)
export function trackEvent(eventName: string, properties: Record<string, unknown> = {}) {
  if (import.meta.env.DEV) {
    console.log('[Analytics]', eventName, properties);
  }
  // In production, this would send to an analytics service via Edge Function
  // Events: signup, login, google_login, game_started, game_finished,
  // scan_created, scan_completed, ai_request, achievement_unlocked,
  // plan_viewed, checkout_started, payment_success, subscription_created, etc.
}

// AI Service (MOCK ONLY)
export async function mockAIRequest(type: 'hint' | 'explanation' | 'step_by_step', question: Question): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const responses = {
    hint: `💡 Pista: Piensa en las propiedades básicas. ${question.explanation.split('.')[0]}.`,
    explanation: `📚 ${question.explanation}`,
    step_by_step: `🧠 Paso a paso:\n1. Lee la pregunta con calma.\n2. Identifica qué nos piden.\n3. ${question.explanation}`,
  };
  
  return responses[type];
}
