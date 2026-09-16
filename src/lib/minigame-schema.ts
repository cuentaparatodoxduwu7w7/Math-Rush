// ============================================================
// Mini-Game Schema Types
// ============================================================
// Safe JSON schema for AI-generated mini-games
// NO executable code allowed - only configuration
// ============================================================

export type GameType = 'quiz' | 'runner' | 'puzzle' | 'memory' | 'boss' | 'challenge';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type MathOperation = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed';

export type RewardType = 'xp' | 'coins' | 'gems' | 'achievement';

// ============================================================
// GAME SCHEMA
// ============================================================

export interface MiniGameSchema {
  // Basic info
  gameType: GameType;
  name: string;
  description: string;
  
  // Theme (visual configuration only)
  theme: {
    background: string; // Color hex or gradient
    primary: string;
    secondary: string;
    accent: string;
    decorations?: string[]; // Simple decoration names
  };
  
  // Difficulty and timing
  difficulty: Difficulty;
  duration: number; // seconds (10-300)
  
  // Math configuration
  operations: MathOperation[];
  questions: number; // 5-20
  numberRange: {
    min: number; // 1-1000
    max: number; // 1-10000
  };
  
  // Game-specific rules
  rules: GameRules;
  
  // Rewards
  rewards: {
    xp: number; // 10-500
    coins: number; // 5-100
    gems?: number; // 0-10
    achievement?: string; // Achievement ID
  };
  
  // Visual configuration (no code)
  visual: {
    character?: string; // Character name from existing assets
    effects?: string[]; // Effect names from existing assets
    animations?: string[]; // Animation names
  };
}

// ============================================================
// GAME RULES BY TYPE
// ============================================================

export interface QuizRules {
  type: 'quiz';
  timePerQuestion: number; // 5-30 seconds
  showTimer: boolean;
  allowRetry: boolean;
  feedbackType: 'immediate' | 'end';
}

export interface RunnerRules {
  type: 'runner';
  speed: 'slow' | 'normal' | 'fast';
  obstacles: number; // 5-20
  powerUps: boolean;
  checkpointInterval: number; // seconds
}

export interface PuzzleRules {
  type: 'puzzle';
  puzzleType: 'match' | 'sequence' | 'pattern';
  pieces: number; // 4-16
  hintSystem: boolean;
  maxHints: number; // 1-5
}

export interface MemoryRules {
  type: 'memory';
  pairs: number; // 4-12
  showTime: number; // seconds to show cards (2-10)
  flipTime: number; // seconds to view card (1-5)
  comboBonus: boolean;
}

export interface BossRules {
  type: 'boss';
  bossHealth: number; // 50-500
  playerHealth: number; // 30-100
  damagePerCorrect: number; // 5-20
  damagePerWrong: number; // 5-15
  bossAttacks: number; // 3-10
}

export interface ChallengeRules {
  type: 'challenge';
  challengeType: 'speed' | 'accuracy' | 'streak';
  targetScore: number;
  timeBonus: boolean;
  comboMultiplier: number; // 1.0-3.0
}

export type GameRules = 
  | QuizRules 
  | RunnerRules 
  | PuzzleRules 
  | MemoryRules 
  | BossRules 
  | ChallengeRules;

// ============================================================
// VALIDATION LIMITS
// ============================================================

export const VALIDATION_LIMITS = {
  gameTypes: ['quiz', 'runner', 'puzzle', 'memory', 'boss', 'challenge'] as const,
  difficulties: ['easy', 'medium', 'hard', 'expert'] as const,
  operations: ['addition', 'subtraction', 'multiplication', 'division', 'mixed'] as const,
  
  duration: { min: 10, max: 300 },
  questions: { min: 5, max: 20 },
  numberRange: { min: 1, max: 10000 },
  
  rewards: {
    xp: { min: 10, max: 500 },
    coins: { min: 5, max: 100 },
    gems: { min: 0, max: 10 },
  },
  
  quiz: {
    timePerQuestion: { min: 5, max: 30 },
  },
  
  runner: {
    obstacles: { min: 5, max: 20 },
    checkpointInterval: { min: 10, max: 60 },
  },
  
  puzzle: {
    pieces: { min: 4, max: 16 },
    maxHints: { min: 1, max: 5 },
  },
  
  memory: {
    pairs: { min: 4, max: 12 },
    showTime: { min: 2, max: 10 },
    flipTime: { min: 1, max: 5 },
  },
  
  boss: {
    bossHealth: { min: 50, max: 500 },
    playerHealth: { min: 30, max: 100 },
    damagePerCorrect: { min: 5, max: 20 },
    damagePerWrong: { min: 5, max: 15 },
    bossAttacks: { min: 3, max: 10 },
  },
  
  challenge: {
    comboMultiplier: { min: 1.0, max: 3.0 },
  },
} as const;

// ============================================================
// FORBIDDEN PATTERNS
// ============================================================

export const FORBIDDEN_PATTERNS = [
  /<script/i,
  /<iframe/i,
  /javascript:/i,
  /eval\s*\(/i,
  /function\s*\(/i,
  /document\./i,
  /window\./i,
  /alert\s*\(/i,
  /console\./i,
  /fetch\s*\(/i,
  /XMLHttpRequest/i,
  /import\s+/i,
  /require\s*\(/i,
  /process\./i,
  /__proto__/i,
  /constructor\s*\[/i,
];
