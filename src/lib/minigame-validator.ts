// ============================================================
// Mini-Game Validator
// ============================================================
// Validates AI-generated mini-game JSON schemas
// Ensures safety and prevents code injection
// ============================================================

import { 
  MiniGameSchema, 
  GameType, 
  Difficulty, 
  MathOperation,
  GameRules,
  VALIDATION_LIMITS,
  FORBIDDEN_PATTERNS,
} from './minigame-schema';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitized?: MiniGameSchema;
}

// ============================================================
// MAIN VALIDATOR
// ============================================================

export function validateMiniGameSchema(data: any): ValidationResult {
  const errors: string[] = [];

  // Check if it's an object
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid data: must be an object'] };
  }

  // Check for forbidden patterns in all string fields
  const forbiddenErrors = checkForbiddenPatterns(data);
  if (forbiddenErrors.length > 0) {
    return { valid: false, errors: forbiddenErrors };
  }

  // Validate required fields
  validateRequiredFields(data, errors);
  
  // Validate game type
  validateGameType(data.gameType, errors);
  
  // Validate difficulty
  validateDifficulty(data.difficulty, errors);
  
  // Validate duration
  validateDuration(data.duration, errors);
  
  // Validate operations
  validateOperations(data.operations, errors);
  
  // Validate questions
  validateQuestions(data.questions, errors);
  
  // Validate number range
  validateNumberRange(data.numberRange, errors);
  
  // Validate rewards
  validateRewards(data.rewards, errors);
  
  // Validate rules based on game type
  validateRules(data.rules, data.gameType, errors);
  
  // Validate theme
  validateTheme(data.theme, errors);
  
  // Validate visual
  validateVisual(data.visual, errors);

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Sanitize and return
  const sanitized = sanitizeSchema(data);
  return { valid: true, errors: [], sanitized };
}

// ============================================================
// VALIDATION HELPERS
// ============================================================

function checkForbiddenPatterns(obj: any, path: string = ''): string[] {
  const errors: string[] = [];

  if (typeof obj === 'string') {
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(obj)) {
        errors.push(`Forbidden pattern detected${path ? ` at ${path}` : ''}: ${pattern.source}`);
      }
    }
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      errors.push(...checkForbiddenPatterns(value, currentPath));
    }
  }

  return errors;
}

function validateRequiredFields(data: any, errors: string[]): void {
  const required = [
    'gameType', 'name', 'description', 'theme', 'difficulty',
    'duration', 'operations', 'questions', 'numberRange',
    'rules', 'rewards', 'visual'
  ];

  for (const field of required) {
    if (!(field in data)) {
      errors.push(`Missing required field: ${field}`);
    }
  }
}

function validateGameType(gameType: any, errors: string[]): void {
  if (!VALIDATION_LIMITS.gameTypes.includes(gameType)) {
    errors.push(`Invalid gameType: ${gameType}. Must be one of: ${VALIDATION_LIMITS.gameTypes.join(', ')}`);
  }
}

function validateDifficulty(difficulty: any, errors: string[]): void {
  if (!VALIDATION_LIMITS.difficulties.includes(difficulty)) {
    errors.push(`Invalid difficulty: ${difficulty}. Must be one of: ${VALIDATION_LIMITS.difficulties.join(', ')}`);
  }
}

function validateDuration(duration: any, errors: string[]): void {
  if (typeof duration !== 'number') {
    errors.push('duration must be a number');
    return;
  }

  const { min, max } = VALIDATION_LIMITS.duration;
  if (duration < min || duration > max) {
    errors.push(`duration must be between ${min} and ${max} seconds`);
  }
}

function validateOperations(operations: any, errors: string[]): void {
  if (!Array.isArray(operations)) {
    errors.push('operations must be an array');
    return;
  }

  if (operations.length === 0) {
    errors.push('operations must contain at least one operation');
    return;
  }

  for (const op of operations) {
    if (!VALIDATION_LIMITS.operations.includes(op)) {
      errors.push(`Invalid operation: ${op}. Must be one of: ${VALIDATION_LIMITS.operations.join(', ')}`);
    }
  }
}

function validateQuestions(questions: any, errors: string[]): void {
  if (typeof questions !== 'number') {
    errors.push('questions must be a number');
    return;
  }

  const { min, max } = VALIDATION_LIMITS.questions;
  if (questions < min || questions > max) {
    errors.push(`questions must be between ${min} and ${max}`);
  }
}

function validateNumberRange(numberRange: any, errors: string[]): void {
  if (!numberRange || typeof numberRange !== 'object') {
    errors.push('numberRange must be an object');
    return;
  }

  const { min, max } = numberRange;

  if (typeof min !== 'number' || typeof max !== 'number') {
    errors.push('numberRange.min and numberRange.max must be numbers');
    return;
  }

  const limits = VALIDATION_LIMITS.numberRange;
  
  if (min < limits.min || min > limits.max) {
    errors.push(`numberRange.min must be between ${limits.min} and ${limits.max}`);
  }

  if (max < limits.min || max > limits.max) {
    errors.push(`numberRange.max must be between ${limits.min} and ${limits.max}`);
  }

  if (min >= max) {
    errors.push('numberRange.min must be less than numberRange.max');
  }
}

function validateRewards(rewards: any, errors: string[]): void {
  if (!rewards || typeof rewards !== 'object') {
    errors.push('rewards must be an object');
    return;
  }

  const { xp, coins, gems } = rewards;
  const limits = VALIDATION_LIMITS.rewards;

  // Validate XP
  if (typeof xp !== 'number' || xp < limits.xp.min || xp > limits.xp.max) {
    errors.push(`rewards.xp must be a number between ${limits.xp.min} and ${limits.xp.max}`);
  }

  // Validate coins
  if (typeof coins !== 'number' || coins < limits.coins.min || coins > limits.coins.max) {
    errors.push(`rewards.coins must be a number between ${limits.coins.min} and ${limits.coins.max}`);
  }

  // Validate gems (optional)
  if (gems !== undefined) {
    if (typeof gems !== 'number' || gems < limits.gems.min || gems > limits.gems.max) {
      errors.push(`rewards.gems must be a number between ${limits.gems.min} and ${limits.gems.max}`);
    }
  }

  // Validate achievement (optional, must be string)
  if (rewards.achievement !== undefined && typeof rewards.achievement !== 'string') {
    errors.push('rewards.achievement must be a string');
  }
}

function validateRules(rules: any, gameType: any, errors: string[]): void {
  if (!rules || typeof rules !== 'object') {
    errors.push('rules must be an object');
    return;
  }

  if (rules.type !== gameType) {
    errors.push(`rules.type must match gameType: ${gameType}`);
    return;
  }

  // Validate rules based on game type
  switch (gameType) {
    case 'quiz':
      validateQuizRules(rules, errors);
      break;
    case 'runner':
      validateRunnerRules(rules, errors);
      break;
    case 'puzzle':
      validatePuzzleRules(rules, errors);
      break;
    case 'memory':
      validateMemoryRules(rules, errors);
      break;
    case 'boss':
      validateBossRules(rules, errors);
      break;
    case 'challenge':
      validateChallengeRules(rules, errors);
      break;
  }
}

function validateQuizRules(rules: any, errors: string[]): void {
  const limits = VALIDATION_LIMITS.quiz;

  if (typeof rules.timePerQuestion !== 'number' || 
      rules.timePerQuestion < limits.timePerQuestion.min || 
      rules.timePerQuestion > limits.timePerQuestion.max) {
    errors.push(`rules.timePerQuestion must be between ${limits.timePerQuestion.min} and ${limits.timePerQuestion.max}`);
  }

  if (typeof rules.showTimer !== 'boolean') {
    errors.push('rules.showTimer must be a boolean');
  }

  if (typeof rules.allowRetry !== 'boolean') {
    errors.push('rules.allowRetry must be a boolean');
  }

  if (!['immediate', 'end'].includes(rules.feedbackType)) {
    errors.push('rules.feedbackType must be "immediate" or "end"');
  }
}

function validateRunnerRules(rules: any, errors: string[]): void {
  const limits = VALIDATION_LIMITS.runner;

  if (!['slow', 'normal', 'fast'].includes(rules.speed)) {
    errors.push('rules.speed must be "slow", "normal", or "fast"');
  }

  if (typeof rules.obstacles !== 'number' || 
      rules.obstacles < limits.obstacles.min || 
      rules.obstacles > limits.obstacles.max) {
    errors.push(`rules.obstacles must be between ${limits.obstacles.min} and ${limits.obstacles.max}`);
  }

  if (typeof rules.powerUps !== 'boolean') {
    errors.push('rules.powerUps must be a boolean');
  }

  if (typeof rules.checkpointInterval !== 'number' || 
      rules.checkpointInterval < limits.checkpointInterval.min || 
      rules.checkpointInterval > limits.checkpointInterval.max) {
    errors.push(`rules.checkpointInterval must be between ${limits.checkpointInterval.min} and ${limits.checkpointInterval.max}`);
  }
}

function validatePuzzleRules(rules: any, errors: string[]): void {
  const limits = VALIDATION_LIMITS.puzzle;

  if (!['match', 'sequence', 'pattern'].includes(rules.puzzleType)) {
    errors.push('rules.puzzleType must be "match", "sequence", or "pattern"');
  }

  if (typeof rules.pieces !== 'number' || 
      rules.pieces < limits.pieces.min || 
      rules.pieces > limits.pieces.max) {
    errors.push(`rules.pieces must be between ${limits.pieces.min} and ${limits.pieces.max}`);
  }

  if (typeof rules.hintSystem !== 'boolean') {
    errors.push('rules.hintSystem must be a boolean');
  }

  if (typeof rules.maxHints !== 'number' || 
      rules.maxHints < limits.maxHints.min || 
      rules.maxHints > limits.maxHints.max) {
    errors.push(`rules.maxHints must be between ${limits.maxHints.min} and ${limits.maxHints.max}`);
  }
}

function validateMemoryRules(rules: any, errors: string[]): void {
  const limits = VALIDATION_LIMITS.memory;

  if (typeof rules.pairs !== 'number' || 
      rules.pairs < limits.pairs.min || 
      rules.pairs > limits.pairs.max) {
    errors.push(`rules.pairs must be between ${limits.pairs.min} and ${limits.pairs.max}`);
  }

  if (typeof rules.showTime !== 'number' || 
      rules.showTime < limits.showTime.min || 
      rules.showTime > limits.showTime.max) {
    errors.push(`rules.showTime must be between ${limits.showTime.min} and ${limits.showTime.max}`);
  }

  if (typeof rules.flipTime !== 'number' || 
      rules.flipTime < limits.flipTime.min || 
      rules.flipTime > limits.flipTime.max) {
    errors.push(`rules.flipTime must be between ${limits.flipTime.min} and ${limits.flipTime.max}`);
  }

  if (typeof rules.comboBonus !== 'boolean') {
    errors.push('rules.comboBonus must be a boolean');
  }
}

function validateBossRules(rules: any, errors: string[]): void {
  const limits = VALIDATION_LIMITS.boss;

  if (typeof rules.bossHealth !== 'number' || 
      rules.bossHealth < limits.bossHealth.min || 
      rules.bossHealth > limits.bossHealth.max) {
    errors.push(`rules.bossHealth must be between ${limits.bossHealth.min} and ${limits.bossHealth.max}`);
  }

  if (typeof rules.playerHealth !== 'number' || 
      rules.playerHealth < limits.playerHealth.min || 
      rules.playerHealth > limits.playerHealth.max) {
    errors.push(`rules.playerHealth must be between ${limits.playerHealth.min} and ${limits.playerHealth.max}`);
  }

  if (typeof rules.damagePerCorrect !== 'number' || 
      rules.damagePerCorrect < limits.damagePerCorrect.min || 
      rules.damagePerCorrect > limits.damagePerCorrect.max) {
    errors.push(`rules.damagePerCorrect must be between ${limits.damagePerCorrect.min} and ${limits.damagePerCorrect.max}`);
  }

  if (typeof rules.damagePerWrong !== 'number' || 
      rules.damagePerWrong < limits.damagePerWrong.min || 
      rules.damagePerWrong > limits.damagePerWrong.max) {
    errors.push(`rules.damagePerWrong must be between ${limits.damagePerWrong.min} and ${limits.damagePerWrong.max}`);
  }

  if (typeof rules.bossAttacks !== 'number' || 
      rules.bossAttacks < limits.bossAttacks.min || 
      rules.bossAttacks > limits.bossAttacks.max) {
    errors.push(`rules.bossAttacks must be between ${limits.bossAttacks.min} and ${limits.bossAttacks.max}`);
  }
}

function validateChallengeRules(rules: any, errors: string[]): void {
  const limits = VALIDATION_LIMITS.challenge;

  if (!['speed', 'accuracy', 'streak'].includes(rules.challengeType)) {
    errors.push('rules.challengeType must be "speed", "accuracy", or "streak"');
  }

  if (typeof rules.targetScore !== 'number' || rules.targetScore < 0) {
    errors.push('rules.targetScore must be a positive number');
  }

  if (typeof rules.timeBonus !== 'boolean') {
    errors.push('rules.timeBonus must be a boolean');
  }

  if (typeof rules.comboMultiplier !== 'number' || 
      rules.comboMultiplier < limits.comboMultiplier.min || 
      rules.comboMultiplier > limits.comboMultiplier.max) {
    errors.push(`rules.comboMultiplier must be between ${limits.comboMultiplier.min} and ${limits.comboMultiplier.max}`);
  }
}

function validateTheme(theme: any, errors: string[]): void {
  if (!theme || typeof theme !== 'object') {
    errors.push('theme must be an object');
    return;
  }

  const required = ['background', 'primary', 'secondary', 'accent'];
  for (const field of required) {
    if (typeof theme[field] !== 'string') {
      errors.push(`theme.${field} must be a string`);
    }
  }

  if (theme.decorations !== undefined) {
    if (!Array.isArray(theme.decorations)) {
      errors.push('theme.decorations must be an array');
    } else {
      for (const dec of theme.decorations) {
        if (typeof dec !== 'string') {
          errors.push('theme.decorations must contain only strings');
          break;
        }
      }
    }
  }
}

function validateVisual(visual: any, errors: string[]): void {
  if (!visual || typeof visual !== 'object') {
    errors.push('visual must be an object');
    return;
  }

  if (visual.character !== undefined && typeof visual.character !== 'string') {
    errors.push('visual.character must be a string');
  }

  if (visual.effects !== undefined) {
    if (!Array.isArray(visual.effects)) {
      errors.push('visual.effects must be an array');
    } else {
      for (const effect of visual.effects) {
        if (typeof effect !== 'string') {
          errors.push('visual.effects must contain only strings');
          break;
        }
      }
    }
  }

  if (visual.animations !== undefined) {
    if (!Array.isArray(visual.animations)) {
      errors.push('visual.animations must be an array');
    } else {
      for (const anim of visual.animations) {
        if (typeof anim !== 'string') {
          errors.push('visual.animations must contain only strings');
          break;
        }
      }
    }
  }
}

// ============================================================
// SANITIZATION
// ============================================================

function sanitizeSchema(data: any): MiniGameSchema {
  // Deep clone and ensure all values are safe
  return JSON.parse(JSON.stringify(data));
}
