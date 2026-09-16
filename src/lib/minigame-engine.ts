// ============================================================
// Mini-Game Engine
// ============================================================
// Interprets validated JSON schemas and creates playable games
// Uses existing Math-Rush components and systems
// ============================================================

import { MiniGameSchema, GameType } from './minigame-schema';
import { validateMiniGameSchema } from './minigame-validator';

export interface MiniGameState {
  schema: MiniGameSchema;
  currentQuestion: number;
  score: number;
  timeRemaining: number;
  combo: number;
  isPlaying: boolean;
  isCompleted: boolean;
  questions: GeneratedQuestion[];
}

export interface GeneratedQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  operation: string;
}

// ============================================================
// MAIN ENGINE CLASS
// ============================================================

export class MiniGameEngine {
  private schema: MiniGameSchema;
  private state: MiniGameState;

  constructor(schemaJson: any) {
    // Validate schema first
    const validation = validateMiniGameSchema(schemaJson);
    if (!validation.valid) {
      throw new Error(`Invalid mini-game schema: ${validation.errors.join(', ')}`);
    }

    this.schema = validation.sanitized!;
    this.state = this.initializeState();
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================

  private initializeState(): MiniGameState {
    return {
      schema: this.schema,
      currentQuestion: 0,
      score: 0,
      timeRemaining: this.schema.duration,
      combo: 0,
      isPlaying: false,
      isCompleted: false,
      questions: this.generateQuestions(),
    };
  }

  // ============================================================
  // QUESTION GENERATION
  // ============================================================

  private generateQuestions(): GeneratedQuestion[] {
    const questions: GeneratedQuestion[] = [];
    const { operations, questions: numQuestions, numberRange, difficulty } = this.schema;

    for (let i = 0; i < numQuestions; i++) {
      const operation = operations[Math.floor(Math.random() * operations.length)];
      const question = this.generateQuestion(operation, numberRange, difficulty, i);
      questions.push(question);
    }

    return questions;
  }

  private generateQuestion(
    operation: string,
    numberRange: { min: number; max: number },
    difficulty: string,
    index: number
  ): GeneratedQuestion {
    const { min, max } = numberRange;
    const diffMultiplier = this.getDifficultyMultiplier(difficulty);

    let num1: number, num2: number, answer: number, text: string;

    switch (operation) {
      case 'addition':
        num1 = this.randomNumber(min, max * diffMultiplier);
        num2 = this.randomNumber(min, max * diffMultiplier);
        answer = num1 + num2;
        text = `¿Cuánto es ${num1} + ${num2}?`;
        break;

      case 'subtraction':
        num1 = this.randomNumber(min, max * diffMultiplier);
        num2 = this.randomNumber(min, num1); // Ensure positive result
        answer = num1 - num2;
        text = `¿Cuánto es ${num1} - ${num2}?`;
        break;

      case 'multiplication':
        num1 = this.randomNumber(min, Math.min(max, 20) * diffMultiplier);
        num2 = this.randomNumber(min, Math.min(max, 20) * diffMultiplier);
        answer = num1 * num2;
        text = `¿Cuánto es ${num1} × ${num2}?`;
        break;

      case 'division':
        num2 = this.randomNumber(1, Math.min(max, 12) * diffMultiplier);
        answer = this.randomNumber(min, Math.min(max, 12) * diffMultiplier);
        num1 = num2 * answer; // Ensure clean division
        text = `¿Cuánto es ${num1} ÷ ${num2}?`;
        break;

      case 'mixed':
        const ops = ['addition', 'subtraction', 'multiplication', 'division'];
        return this.generateQuestion(
          ops[Math.floor(Math.random() * ops.length)],
          numberRange,
          difficulty,
          index
        );

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    // Generate wrong options
    const options = this.generateOptions(answer, operation);
    const correctIndex = options.indexOf(answer.toString());

    return {
      id: `q_${index}`,
      text,
      options,
      correctAnswer: correctIndex,
      explanation: `La respuesta es ${answer}. ${this.getExplanation(operation, num1, num2, answer)}`,
      operation,
    };
  }

  private generateOptions(correctAnswer: number, operation: string): string[] {
    const options: number[] = [correctAnswer];

    // Generate 3 wrong answers
    while (options.length < 4) {
      const variation = Math.floor(Math.random() * 10) - 5; // -5 to +5
      const wrongAnswer = correctAnswer + variation;
      
      if (wrongAnswer > 0 && !options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }
    }

    // Shuffle options
    return options
      .map(n => n.toString())
      .sort(() => Math.random() - 0.5);
  }

  private getDifficultyMultiplier(difficulty: string): number {
    switch (difficulty) {
      case 'easy': return 0.5;
      case 'medium': return 1.0;
      case 'hard': return 1.5;
      case 'expert': return 2.0;
      default: return 1.0;
    }
  }

  private getExplanation(operation: string, num1: number, num2: number, answer: number): string {
    switch (operation) {
      case 'addition':
        return `Sumamos ${num1} + ${num2} = ${answer}`;
      case 'subtraction':
        return `Restamos ${num1} - ${num2} = ${answer}`;
      case 'multiplication':
        return `Multiplicamos ${num1} × ${num2} = ${answer}`;
      case 'division':
        return `Dividimos ${num1} ÷ ${num2} = ${answer}`;
      default:
        return '';
    }
  }

  private randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // ============================================================
  // GAME LOGIC
  // ============================================================

  start(): void {
    this.state.isPlaying = true;
    this.state.timeRemaining = this.schema.duration;
  }

  submitAnswer(answerIndex: number): { correct: boolean; score: number; combo: number } {
    if (!this.state.isPlaying || this.state.isCompleted) {
      return { correct: false, score: 0, combo: 0 };
    }

    const question = this.state.questions[this.state.currentQuestion];
    const correct = answerIndex === question.correctAnswer;

    if (correct) {
      this.state.combo++;
      const baseScore = 10;
      const comboBonus = this.state.combo * 2;
      const timeBonus = Math.floor(this.state.timeRemaining / 10);
      const score = baseScore + comboBonus + timeBonus;
      
      this.state.score += score;

      return { correct: true, score, combo: this.state.combo };
    } else {
      this.state.combo = 0;
      return { correct: false, score: 0, combo: 0 };
    }
  }

  nextQuestion(): boolean {
    if (this.state.currentQuestion < this.state.questions.length - 1) {
      this.state.currentQuestion++;
      return true;
    }
    
    this.state.isCompleted = true;
    this.state.isPlaying = false;
    return false;
  }

  updateTime(delta: number): void {
    if (!this.state.isPlaying) return;

    this.state.timeRemaining -= delta;
    
    if (this.state.timeRemaining <= 0) {
      this.state.timeRemaining = 0;
      this.state.isCompleted = true;
      this.state.isPlaying = false;
    }
  }

  // ============================================================
  // GETTERS
  // ============================================================

  getState(): MiniGameState {
    return { ...this.state };
  }

  getCurrentQuestion(): GeneratedQuestion | null {
    return this.state.questions[this.state.currentQuestion] || null;
  }

  getSchema(): MiniGameSchema {
    return this.schema;
  }

  getProgress(): { current: number; total: number; percentage: number } {
    return {
      current: this.state.currentQuestion + 1,
      total: this.state.questions.length,
      percentage: ((this.state.currentQuestion + 1) / this.state.questions.length) * 100,
    };
  }

  getRewards(): { xp: number; coins: number; gems: number } {
    const completionBonus = this.state.isCompleted ? 1.0 : 0.5;
    const accuracyBonus = this.state.score / (this.state.questions.length * 20); // Max 20 points per question
    
    return {
      xp: Math.floor(this.schema.rewards.xp * completionBonus * (1 + accuracyBonus)),
      coins: Math.floor(this.schema.rewards.coins * completionBonus * (1 + accuracyBonus)),
      gems: this.schema.rewards.gems || 0,
    };
  }

  // ============================================================
  // GAME TYPE SPECIFIC LOGIC
  // ============================================================

  getGameTypeConfig(): any {
    const { rules } = this.schema;

    switch (this.schema.gameType) {
      case 'quiz':
        const quizRules = rules as any;
        return {
          type: 'quiz',
          timePerQuestion: quizRules.timePerQuestion,
          showTimer: quizRules.showTimer,
          allowRetry: quizRules.allowRetry,
          feedbackType: quizRules.feedbackType,
        };

      case 'runner':
        const runnerRules = rules as any;
        return {
          type: 'runner',
          speed: runnerRules.speed,
          obstacles: runnerRules.obstacles,
          powerUps: runnerRules.powerUps,
          checkpointInterval: runnerRules.checkpointInterval,
        };

      case 'puzzle':
        const puzzleRules = rules as any;
        return {
          type: 'puzzle',
          puzzleType: puzzleRules.puzzleType,
          pieces: puzzleRules.pieces,
          hintSystem: puzzleRules.hintSystem,
          maxHints: puzzleRules.maxHints,
        };

      case 'memory':
        const memoryRules = rules as any;
        return {
          type: 'memory',
          pairs: memoryRules.pairs,
          showTime: memoryRules.showTime,
          flipTime: memoryRules.flipTime,
          comboBonus: memoryRules.comboBonus,
        };

      case 'boss':
        const bossRules = rules as any;
        return {
          type: 'boss',
          bossHealth: bossRules.bossHealth,
          playerHealth: bossRules.playerHealth,
          damagePerCorrect: bossRules.damagePerCorrect,
          damagePerWrong: bossRules.damagePerWrong,
          bossAttacks: bossRules.bossAttacks,
        };

      case 'challenge':
        const challengeRules = rules as any;
        return {
          type: 'challenge',
          challengeType: challengeRules.challengeType,
          targetScore: challengeRules.targetScore,
          timeBonus: challengeRules.timeBonus,
          comboMultiplier: challengeRules.comboMultiplier,
        };

      default:
        return {};
    }
  }
}

// ============================================================
// FACTORY FUNCTION
// ============================================================

export function createMiniGame(schemaJson: any): MiniGameEngine {
  return new MiniGameEngine(schemaJson);
}
