// ============================================================
// Validation Helpers for Edge Functions
// ============================================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
  data?: any;
}

export function validatePrompt(prompt: string): ValidationResult {
  if (!prompt || typeof prompt !== 'string') {
    return { valid: false, error: 'Prompt is required' };
  }

  if (prompt.length < 10) {
    return { valid: false, error: 'Prompt must be at least 10 characters' };
  }

  if (prompt.length > 2000) {
    return { valid: false, error: 'Prompt must be less than 2000 characters' };
  }

  // Basic sanitization - remove potentially dangerous patterns
  const sanitized = prompt
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');

  return { valid: true, data: sanitized };
}

export function validateThemeResponse(response: any): ValidationResult {
  if (!response || typeof response !== 'object') {
    return { valid: false, error: 'Invalid response format' };
  }

  // Required fields
  const requiredFields = ['name', 'theme', 'background'];
  for (const field of requiredFields) {
    if (!(field in response)) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  // Validate theme structure
  if (typeof response.theme !== 'object') {
    return { valid: false, error: 'Theme must be an object' };
  }

  const themeFields = ['primary', 'secondary', 'accent', 'text'];
  for (const field of themeFields) {
    if (!(field in response.theme) || typeof response.theme[field] !== 'string') {
      return { valid: false, error: `Theme must have ${field} as string` };
    }

    // Basic color validation (hex or rgb)
    const color = response.theme[field];
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(color) && !/^rgb\(/.test(color)) {
      return { valid: false, error: `Invalid color format for ${field}` };
    }
  }

  // Validate background structure
  if (typeof response.background !== 'object') {
    return { valid: false, error: 'Background must be an object' };
  }

  if (!['type', 'value'].every((field) => field in response.background)) {
    return { valid: false, error: 'Background must have type and value' };
  }

  if (!['svg', 'gradient', 'pattern'].includes(response.background.type)) {
    return { valid: false, error: 'Background type must be svg, gradient, or pattern' };
  }

  // Validate decorations if present
  if (response.decorations && !Array.isArray(response.decorations)) {
    return { valid: false, error: 'Decorations must be an array' };
  }

  // Validate animations if present
  if (response.animations && typeof response.animations !== 'object') {
    return { valid: false, error: 'Animations must be an object' };
  }

  // Validate layout if present
  if (response.layout && typeof response.layout !== 'object') {
    return { valid: false, error: 'Layout must be an object' };
  }

  return { valid: true, data: response };
}

export function validateMinigameResponse(response: any): ValidationResult {
  if (!response || typeof response !== 'object') {
    return { valid: false, error: 'Invalid minigame response format' };
  }

  const requiredFields = ['type', 'theme', 'difficulty', 'content'];
  for (const field of requiredFields) {
    if (!(field in response)) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  if (!['quiz', 'puzzle', 'challenge'].includes(response.type)) {
    return { valid: false, error: 'Minigame type must be quiz, puzzle, or challenge' };
  }

  if (!['principiante', 'basico', 'intermedio', 'avanzado'].includes(response.difficulty)) {
    return { valid: false, error: 'Invalid difficulty level' };
  }

  if (typeof response.content !== 'object') {
    return { valid: false, error: 'Minigame content must be an object' };
  }

  return { valid: true, data: response };
}

export function checkRateLimit(
  userId: string,
  action: string,
  maxRequests: number,
  windowMs: number
): boolean {
  // This is a basic in-memory rate limit
  // In production, use Redis or similar
  const key = `${userId}:${action}`;
  const now = Date.now();
  
  // TODO: Implement proper rate limiting with Redis
  // For now, always allow (Edge Functions are stateless)
  return true;
}
