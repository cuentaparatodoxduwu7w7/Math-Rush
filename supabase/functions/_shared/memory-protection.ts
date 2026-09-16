// ============================================================
// Memory Protection Service
// ============================================================
// Protects against prompt injection, malicious instructions,
// and memory contamination
// ============================================================

export interface ProtectionResult {
  isSafe: boolean;
  reason?: string;
  sanitizedContent?: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export class MemoryProtectionService {
  // ============================================================
  // PROMPT INJECTION DETECTION
  // ============================================================

  detectPromptInjection(prompt: string): ProtectionResult {
    const lowerPrompt = prompt.toLowerCase();
    
    // Check for common injection patterns
    const injectionPatterns = [
      // Direct instruction overrides
      /ignore (previous|all|above) instructions/i,
      /forget (everything|all|previous)/i,
      /you are now/i,
      /act as (if|a)/i,
      /pretend (you are|to be)/i,
      /new (role|instruction|task)/i,
      
      // System prompt extraction
      /show me your (instructions|prompt|system)/i,
      /what (are|were) your (instructions|rules)/i,
      /repeat your (instructions|prompt)/i,
      
      // Role manipulation
      /you (are|must|should|will) (now )?(be|act|pretend)/i,
      /from now on/i,
      /your new (role|task|job)/i,
      
      // Data extraction
      /tell me (about|your) (data|database|users)/i,
      /show (me|all) (data|records|users)/i,
      /export (data|database)/i,
      
      // Malicious content
      /execute (code|script|command)/i,
      /run (this|code|script)/i,
      /eval\(/i,
      /<script/i,
      /javascript:/i,
      
      // Memory manipulation
      /remember (this|that|to)/i,
      /store (this|that|in memory)/i,
      /save (this|to memory)/i,
      /add (this|to) (memory|knowledge)/i,
    ];

    for (const pattern of injectionPatterns) {
      if (pattern.test(lowerPrompt)) {
        return {
          isSafe: false,
          reason: `Potential prompt injection detected: ${pattern.source}`,
          riskLevel: 'high',
        };
      }
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /system:/i,
      /assistant:/i,
      /user:/i,
      /\[INST\]/i,
      /\[\/INST\]/i,
      /<\|.*?\|>/, // Special tokens
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(prompt)) {
        return {
          isSafe: false,
          reason: `Suspicious pattern detected: ${pattern.source}`,
          riskLevel: 'medium',
        };
      }
    }

    return {
      isSafe: true,
      sanitizedContent: prompt,
      riskLevel: 'low',
    };
  }

  // ============================================================
  // MEMORY CONTAMINATION PREVENTION
  // ============================================================

  validateMemoryContent(content: any, memoryType: 'private' | 'global'): ProtectionResult {
    // Check for malicious content
    const contentStr = JSON.stringify(content).toLowerCase();
    
    // Patterns that should never be in memory
    const forbiddenPatterns = [
      /password/i,
      /secret/i,
      /api[_-]?key/i,
      /token/i,
      /credit[_-]?card/i,
      /ssn/i,
      /social[_-]?security/i,
      /private[_-]?key/i,
      /admin/i,
      /root/i,
    ];

    for (const pattern of forbiddenPatterns) {
      if (pattern.test(contentStr)) {
        return {
          isSafe: false,
          reason: `Forbidden content detected: ${pattern.source}`,
          riskLevel: 'high',
        };
      }
    }

    // Additional checks for global memory
    if (memoryType === 'global') {
      // Global memory must be anonymized
      if (this.containsPersonalData(content)) {
        return {
          isSafe: false,
          reason: 'Global memory must not contain personal data',
          riskLevel: 'high',
        };
      }

      // Global memory must be useful and safe
      if (!this.isUsefulContent(content)) {
        return {
          isSafe: false,
          reason: 'Content is not useful for global knowledge',
          riskLevel: 'medium',
        };
      }
    }

    return {
      isSafe: true,
      sanitizedContent: content,
      riskLevel: 'low',
    };
  }

  private containsPersonalData(content: any): boolean {
    const contentStr = JSON.stringify(content).toLowerCase();
    
    const personalDataPatterns = [
      /email/i,
      /phone/i,
      /address/i,
      /name.*user/i,
      /user.*name/i,
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN pattern
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card pattern
    ];

    return personalDataPatterns.some(pattern => pattern.test(contentStr));
  }

  private isUsefulContent(content: any): boolean {
    // Check if content has useful structure
    if (!content || typeof content !== 'object') return false;
    
    // Must have some meaningful fields
    const usefulFields = ['style', 'colors', 'pattern', 'example', 'description'];
    const contentStr = JSON.stringify(content).toLowerCase();
    
    return usefulFields.some(field => contentStr.includes(field));
  }

  // ============================================================
  // CONTENT SANITIZATION
  // ============================================================

  sanitizePrompt(prompt: string): string {
    // Remove potential injection attempts
    let sanitized = prompt;
    
    // Remove system-like markers
    sanitized = sanitized.replace(/system:/gi, '');
    sanitized = sanitized.replace(/assistant:/gi, '');
    sanitized = sanitized.replace(/user:/gi, '');
    
    // Remove special tokens
    sanitized = sanitized.replace(/<\|.*?\|>/g, '');
    
    // Remove script tags
    sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
    
    // Remove javascript: URLs
    sanitized = sanitized.replace(/javascript:/gi, '');
    
    // Remove eval and similar
    sanitized = sanitized.replace(/eval\s*\(/gi, '');
    sanitized = sanitized.replace(/function\s*\(/gi, '');
    
    // Limit length
    if (sanitized.length > 2000) {
      sanitized = sanitized.substring(0, 2000);
    }
    
    return sanitized.trim();
  }

  sanitizeMemoryContent(content: any): any {
    // Deep sanitize content
    if (typeof content === 'string') {
      return this.sanitizeString(content);
    }
    
    if (Array.isArray(content)) {
      return content.map(item => this.sanitizeMemoryContent(item));
    }
    
    if (typeof content === 'object' && content !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(content)) {
        // Skip potentially dangerous keys
        if (this.isDangerousKey(key)) continue;
        
        sanitized[key] = this.sanitizeMemoryContent(value);
      }
      return sanitized;
    }
    
    return content;
  }

  private sanitizeString(str: string): string {
    // Remove dangerous patterns
    let sanitized = str;
    
    sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');
    sanitized = sanitized.replace(/eval\s*\(/gi, '');
    
    // Limit length
    if (sanitized.length > 1000) {
      sanitized = sanitized.substring(0, 1000);
    }
    
    return sanitized.trim();
  }

  private isDangerousKey(key: string): boolean {
    const dangerousKeys = [
      'password',
      'secret',
      'apikey',
      'api_key',
      'token',
      'private_key',
      'credit_card',
      'ssn',
    ];
    
    return dangerousKeys.some(dangerous => 
      key.toLowerCase().includes(dangerous)
    );
  }

  // ============================================================
  // RATE LIMITING
  // ============================================================

  checkRateLimit(userId: string, action: string, maxRequests: number, windowMs: number): boolean {
    // This is a basic check - in production, use Redis or similar
    // For now, always allow (Edge Functions are stateless)
    return true;
  }

  // ============================================================
  // COMPREHENSIVE VALIDATION
  // ============================================================

  async validateRequest(
    userId: string,
    prompt: string,
    memoryContent?: any
  ): Promise<{ isValid: boolean; error?: string; sanitizedPrompt?: string }> {
    // 1. Check for prompt injection
    const injectionCheck = this.detectPromptInjection(prompt);
    if (!injectionCheck.isSafe) {
      return {
        isValid: false,
        error: `Security check failed: ${injectionCheck.reason}`,
      };
    }

    // 2. Sanitize prompt
    const sanitizedPrompt = this.sanitizePrompt(prompt);

    // 3. Validate memory content if provided
    if (memoryContent) {
      const memoryCheck = this.validateMemoryContent(memoryContent, 'private');
      if (!memoryCheck.isSafe) {
        return {
          isValid: false,
          error: `Memory validation failed: ${memoryCheck.reason}`,
        };
      }
    }

    // 4. Check rate limit
    if (!this.checkRateLimit(userId, 'generate', 10, 60000)) {
      return {
        isValid: false,
        error: 'Rate limit exceeded. Please try again later.',
      };
    }

    return {
      isValid: true,
      sanitizedPrompt,
    };
  }
}
