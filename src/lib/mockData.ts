import { Question, Achievement, ShopItem, Plan } from './supabase';

// ============================================================
// MOCK DATA — MOCK ONLY
// ============================================================
// Estos datos se utilizan cuando no hay conexión a Supabase.
// En producción, estos datos vendrán de la base de datos.

export const MOCK_QUESTIONS: Question[] = [
  { id: 'q1', text: '¿Cuánto es 15 × 8?', options: ['100', '120', '115', '130'], correct_answer: 1, explanation: '15 × 8 = 120. Puedes descomponer: 10×8 + 5×8 = 80 + 40 = 120', topic: 'Aritmética', difficulty: 'basico', time_limit: 15 },
  { id: 'q2', text: 'Resuelve: 3x + 7 = 22', options: ['x = 3', 'x = 5', 'x = 7', 'x = 4'], correct_answer: 1, explanation: '3x + 7 = 22 → 3x = 15 → x = 5', topic: 'Álgebra', difficulty: 'basico', time_limit: 20 },
  { id: 'q3', text: '¿Cuál es el área de un triángulo con base 10 y altura 6?', options: ['60', '30', '16', '36'], correct_answer: 1, explanation: 'Área = (base × altura) / 2 = (10 × 6) / 2 = 30', topic: 'Geometría', difficulty: 'basico', time_limit: 20 },
  { id: 'q4', text: 'Si sen(30°) = ?', options: ['1', '0.5', '0.866', '0'], correct_answer: 1, explanation: 'sen(30°) = 1/2 = 0.5', topic: 'Trigonometría', difficulty: 'intermedio', time_limit: 20 },
  { id: 'q5', text: '¿Cuál es la media de: 4, 8, 6, 10, 12?', options: ['8', '7', '9', '10'], correct_answer: 0, explanation: 'Media = (4+8+6+10+12)/5 = 40/5 = 8', topic: 'Estadística', difficulty: 'basico', time_limit: 20 },
  { id: 'q6', text: 'Resuelve: 2(x - 3)² = 32', options: ['x = 7 o x = -1', 'x = 5 o x = 1', 'x = 8 o x = -2', 'x = 4 o x = 0'], correct_answer: 0, explanation: '(x-3)² = 16 → x-3 = ±4 → x = 7 o x = -1', topic: 'Álgebra', difficulty: 'intermedio', time_limit: 30 },
  { id: 'q7', text: '¿Cuánto es √144?', options: ['11', '12', '13', '14'], correct_answer: 1, explanation: '√144 = 12, porque 12 × 12 = 144', topic: 'Aritmética', difficulty: 'basico', time_limit: 10 },
  { id: 'q8', text: 'Si P(A) = 0.3 y P(B) = 0.5, y son independientes, ¿P(A∩B)?', options: ['0.8', '0.15', '0.2', '0.35'], correct_answer: 1, explanation: 'P(A∩B) = P(A) × P(B) = 0.3 × 0.5 = 0.15', topic: 'Probabilidad', difficulty: 'intermedio', time_limit: 25 },
  { id: 'q9', text: '¿Cuál es el volumen de un cubo de arista 5?', options: ['25', '125', '150', '75'], correct_answer: 1, explanation: 'V = arista³ = 5³ = 125', topic: 'Geometría', difficulty: 'basico', time_limit: 15 },
  { id: 'q10', text: 'Resuelve: log₂(8) = ?', options: ['2', '3', '4', '8'], correct_answer: 1, explanation: 'log₂(8) = 3, porque 2³ = 8', topic: 'Álgebra', difficulty: 'intermedio', time_limit: 20 },
  { id: 'q11', text: '¿Cuánto es 25% de 360?', options: ['80', '90', '72', '85'], correct_answer: 1, explanation: '25% de 360 = 0.25 × 360 = 90', topic: 'Aritmética', difficulty: 'basico', time_limit: 15 },
  { id: 'q12', text: 'Factoriza: x² - 9', options: ['(x-3)²', '(x+3)(x-3)', '(x-9)(x+1)', '(x+9)(x-1)'], correct_answer: 1, explanation: 'x² - 9 es diferencia de cuadrados: (x+3)(x-3)', topic: 'Álgebra', difficulty: 'basico', time_limit: 20 },
  { id: 'q13', text: '¿Cuántos grados tiene un ángulo interior de un hexágono regular?', options: ['108°', '120°', '135°', '90°'], correct_answer: 1, explanation: 'Ángulo interior = (n-2)×180°/n = 4×180°/6 = 120°', topic: 'Geometría', difficulty: 'intermedio', time_limit: 25 },
  { id: 'q14', text: '¿Cuál es la derivada de f(x) = 3x² + 2x?', options: ['6x + 2', '3x + 2', '6x² + 2', 'x² + 2x'], correct_answer: 0, explanation: "f'(x) = 6x + 2 (regla de potencia)", topic: 'Cálculo', difficulty: 'avanzado', time_limit: 25 },
  { id: 'q15', text: 'Resuelve el sistema: x + y = 10, x - y = 4', options: ['x=7, y=3', 'x=6, y=4', 'x=8, y=2', 'x=5, y=5'], correct_answer: 0, explanation: 'Sumando: 2x = 14 → x = 7, y = 3', topic: 'Álgebra', difficulty: 'intermedio', time_limit: 25 },
];

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', name: 'Primera Racha', description: 'Responde 5 preguntas seguidas correctamente', icon: '🔥', condition: 'streak_5', xp_reward: 50, coins_reward: 25 },
  { id: 'a2', name: 'Velocista', description: 'Responde 10 preguntas en menos de 2 minutos', icon: '⚡', condition: 'speed_10', xp_reward: 100, coins_reward: 50 },
  { id: 'a3', name: 'Maestro del Álgebra', description: 'Resuelve 50 problemas de álgebra', icon: '👑', condition: 'algebra_50', xp_reward: 200, coins_reward: 100 },
  { id: 'a4', name: 'Destructor de Bosses', description: 'Derrota a 10 bosses', icon: '💀', condition: 'bosses_10', xp_reward: 300, coins_reward: 150 },
  { id: 'a5', name: 'Explorador', description: 'Completa partidas en todos los modos', icon: '🗺️', condition: 'all_modes', xp_reward: 150, coins_reward: 75 },
  { id: 'a6', name: 'Racha de Fuego', description: 'Mantén una racha de 7 días', icon: '🔥', condition: 'streak_7_days', xp_reward: 250, coins_reward: 125 },
];

export const MOCK_SHOP_ITEMS: ShopItem[] = [
  { id: 's1', name: 'Cuy Gamer', description: 'Skin gamer con lentes y audífonos', icon: '🐹', category: 'skin', price_coins: 500, price_gems: null, is_premium: false, image_url: 'https://image.qwenlm.ai/generated-images/88ab4c3a-01d1-41c4-b17e-2e84faabf6ed/_result.png' },
  { id: 's2', name: 'Cuy Dorado', description: 'Skin dorada legendaria', icon: '🐹', category: 'skin', price_coins: 2000, price_gems: 50, is_premium: true, image_url: 'https://image.qwenlm.ai/generated-images/a10a7b6c-a6e8-4a96-99a6-ed451da3f033/_result.png' },
  { id: 's3', name: 'Cuy Cyberpunk', description: 'Skin futurista con neón', icon: '🐹', category: 'skin', price_coins: 1500, price_gems: 30, is_premium: true, image_url: 'https://image.qwenlm.ai/generated-images/1a9a7a35-400d-4b78-a880-0247f3368945/_result.png' },
  { id: 's4', name: 'Llama Blanca', description: 'Mascota compañera', icon: '🦙', category: 'pet', price_coins: 800, price_gems: null, is_premium: false, image_url: 'https://image.qwenlm.ai/generated-images/4008da11-eb13-4253-b822-7c6ddae70000/_result.png' },
  { id: 's5', name: 'Fondo Espacial', description: 'Fondo con galaxias y planetas', icon: '🌌', category: 'background', price_coins: 600, price_gems: null, is_premium: false, image_url: 'https://image.qwenlm.ai/generated-images/3468e72c-4148-4f9a-8565-9bc4c720942d/_result.png' },
  { id: 's6', name: 'Efecto Relámpago', description: 'Efecto visual al acertar', icon: '⚡', category: 'effect', price_coins: 400, price_gems: null, is_premium: false, image_url: null },
  { id: 's7', name: 'Fondo Neón', description: 'Fondo estilo cyberpunk', icon: '💜', category: 'background', price_coins: 700, price_gems: 15, is_premium: true, image_url: 'https://image.qwenlm.ai/generated-images/2f848f42-dfbb-47e8-ae21-15fdae7d3843/_result.png' },
  { id: 's8', name: 'Cuy Samurai', description: 'Skin samurái épica', icon: '🐹', category: 'skin', price_coins: 1800, price_gems: 40, is_premium: true, image_url: 'https://image.qwenlm.ai/generated-images/e30ef96a-31cb-49e5-8ea7-1dccc0c93f14/_result.png' },
  { id: 's9', name: 'Fondo Matemático', description: 'Fondo con formas geométricas', icon: '📐', category: 'background', price_coins: 550, price_gems: null, is_premium: false, image_url: 'https://image.qwenlm.ai/generated-images/f9b90eb8-0f91-4f1a-9fe1-4c3525451032/_result.png' },
  { id: 's10', name: 'Fondo Naturaleza', description: 'Fondo de bosque educativo', icon: '🌿', category: 'background', price_coins: 500, price_gems: null, is_premium: false, image_url: 'https://image.qwenlm.ai/generated-images/52ebb24b-1a72-466e-a214-e74ee4affcdc/_result.png' },
];

export const MOCK_PLANS: Plan[] = [
  {
    id: 'free',
    name: 'FREE',
    price: 0,
    currency: 'S/',
    period: '',
    features: ['Juegos básicos', '3 escaneos/día', 'Funciones básicas', 'Quick Rush', 'Survival'],
    highlighted: false,
  },
  {
    id: 'rush',
    name: 'MATH RUSH PASS',
    price: 4.90,
    currency: 'S/',
    period: '/mes',
    features: ['10 escaneos/día', 'Funciones Premium', 'Cuy Sabio (IA)', 'Skins Premium', 'Time Attack', 'Boss Battle', 'Sin anuncios'],
    highlighted: true,
  },
  {
    id: 'legend',
    name: 'LEGEND PASS',
    price: 9.90,
    currency: 'S/',
    period: '/mes',
    features: ['Todo del Rush Pass', 'Escaneos ilimitados', 'Modo Pre-U', 'Simulacros', 'Estadísticas avanzadas', 'Duelo', 'Acceso anticipado'],
    highlighted: false,
  },
  {
    id: 'teacher',
    name: 'TEACHER',
    price: 19.90,
    currency: 'S/',
    period: '/mes',
    features: ['Crear clases', 'Asignar actividades', 'Dashboard completo', 'Reportes de estudiantes', 'Analíticas avanzadas', 'Soporte prioritario'],
    highlighted: false,
  },
];

export const LEVEL_THRESHOLDS: Record<number, { name: string; xpRequired: number }> = {
  1: { name: 'Novato', xpRequired: 0 },
  2: { name: 'Novato', xpRequired: 100 },
  3: { name: 'Novato', xpRequired: 250 },
  4: { name: 'Novato', xpRequired: 450 },
  5: { name: 'Aprendiz', xpRequired: 700 },
  6: { name: 'Aprendiz', xpRequired: 1000 },
  7: { name: 'Aprendiz', xpRequired: 1350 },
  8: { name: 'Aprendiz', xpRequired: 1750 },
  9: { name: 'Aprendiz', xpRequired: 2200 },
  10: { name: 'Calculador', xpRequired: 2700 },
  15: { name: 'Calculador', xpRequired: 5000 },
  20: { name: 'Estratega', xpRequired: 8000 },
  25: { name: 'Estratega', xpRequired: 12000 },
  30: { name: 'Maestro', xpRequired: 17000 },
  40: { name: 'Maestro', xpRequired: 30000 },
  50: { name: 'Leyenda Matemática', xpRequired: 50000 },
};

export function getLevelInfo(xp: number): { level: number; name: string; currentXp: number; nextLevelXp: number; progress: number } {
  let level = 1;
  let name = 'Novato';
  let currentThreshold = 0;
  let nextThreshold = 100;

  const sortedLevels = Object.entries(LEVEL_THRESHOLDS)
    .map(([lvl, data]) => ({ level: parseInt(lvl), ...data }))
    .sort((a, b) => a.level - b.level);

  for (let i = 0; i < sortedLevels.length; i++) {
    if (xp >= sortedLevels[i].xpRequired) {
      level = sortedLevels[i].level;
      name = sortedLevels[i].name;
      currentThreshold = sortedLevels[i].xpRequired;
      nextThreshold = i < sortedLevels.length - 1 ? sortedLevels[i + 1].xpRequired : sortedLevels[i].xpRequired + 5000;
    }
  }

  const progress = ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

  return { level, name, currentXp: xp, nextLevelXp: nextThreshold, progress: Math.min(progress, 100) };
}
