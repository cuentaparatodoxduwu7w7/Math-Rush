// ============================================================
// AI Provider for World Designer
// ============================================================

export interface AIProviderConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
}

export interface WorldDesignRequest {
  prompt: string;
  userPreferences?: {
    preferredColors?: string[];
    preferredStyles?: string[];
    preferredAnimations?: string[];
    preferredThemes?: string[];
  };
  memory?: Array<{
    category: string;
    content: any;
  }>;
  feedbackPatterns?: {
    likedStyles?: string[];
    dislikedStyles?: string[];
    preferredComplexity?: string;
  };
  includeMinigame?: boolean;
  difficulty?: string;
}

export interface WorldDesignResponse {
  name: string;
  theme: {
    background: string;
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    panel?: string;
    border?: string;
    glow?: string;
  };
  background: {
    type: 'svg' | 'gradient' | 'pattern';
    value: string;
  };
  decorations?: Array<{
    type: string;
    position: { x: number; y: number };
    size?: { width: number; height: number };
    svg?: string;
    animation?: string;
  }>;
  animations?: {
    [key: string]: any;
  };
  layout?: {
    [key: string]: any;
  };
  minigame?: {
    type: string;
    theme: string;
    difficulty: string;
    rules?: any;
    content: any;
  };
}

function getProviderConfig(): AIProviderConfig | null {
  const apiKey = Deno.env.get('AI_PROVIDER_KEY');
  const baseUrl = Deno.env.get('AI_PROVIDER_URL');
  const model = Deno.env.get('AI_MODEL') || 'gpt-4o-mini';

  if (!apiKey || !baseUrl) {
    return null;
  }

  return {
    apiKey,
    baseUrl,
    model,
    maxTokens: 4000,
  };
}

function buildSystemPrompt(): string {
  return `You are the "World Designer" AI for Math Rush, an educational math game.

Your task is to create visually stunning, cohesive world themes based on user prompts.

CRITICAL RULES:
1. You MUST respond with valid JSON only
2. You MUST follow the exact structure specified
3. Colors MUST be valid hex codes (e.g., #FF5733)
4. Background type MUST be one of: "svg", "gradient", "pattern"
5. All text content should be in Spanish
6. Design should be appropriate for an educational game
7. Never include executable code, only configuration
8. Keep SVG simple and optimized
9. Ensure color contrast is accessible
10. Design should feel cohesive and professional

RESPONSE STRUCTURE:
{
  "name": "string - Creative name for the world",
  "theme": {
    "background": "string - Main background color (hex)",
    "primary": "string - Primary color (hex)",
    "secondary": "string - Secondary color (hex)",
    "accent": "string - Accent color (hex)",
    "text": "string - Text color (hex)",
    "panel": "string - Panel/card color (hex, optional)",
    "border": "string - Border color (hex, optional)",
    "glow": "string - Glow effect color (hex, optional)"
  },
  "background": {
    "type": "svg|gradient|pattern",
    "value": "string - SVG markup, gradient CSS, or pattern description"
  },
  "decorations": [
    {
      "type": "string - Type of decoration",
      "position": { "x": number, "y": number },
      "size": { "width": number, "height": number },
      "svg": "string - Simple SVG markup",
      "animation": "string - Animation description"
    }
  ],
  "animations": {
    "key": "animation configuration object"
  },
  "layout": {
    "key": "layout configuration object"
  }
}

DESIGN PRINCIPLES:
- Use mathematical symbols and shapes as decorative elements
- Ensure readability and accessibility
- Create a sense of depth and immersion
- Use animations sparingly but effectively
- Keep SVG simple (max 500 characters per decoration)
- Ensure color harmony and contrast`;
}

function buildUserPrompt(request: WorldDesignRequest): string {
  let prompt = `Create a world theme based on this description: "${request.prompt}"`;

  if (request.userPreferences) {
    prompt += '\n\nUser preferences (learned from previous interactions):';
    if (request.userPreferences.preferredColors?.length) {
      prompt += `\n- Preferred colors: ${request.userPreferences.preferredColors.join(', ')}`;
    }
    if (request.userPreferences.preferredStyles?.length) {
      prompt += `\n- Preferred styles: ${request.userPreferences.preferredStyles.join(', ')}`;
    }
    if (request.userPreferences.preferredAnimations?.length) {
      prompt += `\n- Preferred animations: ${request.userPreferences.preferredAnimations.join(', ')}`;
    }
    if (request.userPreferences.preferredThemes?.length) {
      prompt += `\n- Preferred themes: ${request.userPreferences.preferredThemes.join(', ')}`;
    }
  }

  // Add feedback patterns
  if (request.feedbackPatterns) {
    prompt += '\n\nFeedback patterns (what user likes/dislikes):';
    if (request.feedbackPatterns.likedStyles?.length) {
      prompt += `\n- Liked styles: ${request.feedbackPatterns.likedStyles.join(', ')}`;
    }
    if (request.feedbackPatterns.dislikedStyles?.length) {
      prompt += `\n- Disliked styles: ${request.feedbackPatterns.dislikedStyles.join(', ')} (AVOID THESE)`;
    }
    if (request.feedbackPatterns.preferredComplexity) {
      prompt += `\n- Preferred complexity: ${request.feedbackPatterns.preferredComplexity}`;
    }
  }

  // Add relevant memory
  if (request.memory && request.memory.length > 0) {
    prompt += '\n\nRelevant context from previous generations:';
    
    // Group memory by category for better organization
    const groupedMemory: Record<string, any[]> = {};
    request.memory.forEach((mem) => {
      if (!groupedMemory[mem.category]) {
        groupedMemory[mem.category] = [];
      }
      groupedMemory[mem.category].push(mem.content);
    });

    // Add each category
    Object.entries(groupedMemory).forEach(([category, items]) => {
      prompt += `\n\n${category.replace(/_/g, ' ').toUpperCase()}:`;
      items.slice(0, 3).forEach((item) => {
        // Format based on category
        if (category === 'recent_generation') {
          prompt += `\n- Previous generation: "${item.prompt_snippet || item.prompt}" → ${item.theme_name} (${item.style || 'unknown style'})`;
        } else if (category === 'liked_pattern' || category === 'disliked_pattern') {
          prompt += `\n- ${category === 'liked_pattern' ? 'Liked' : 'Disliked'}: ${item.style || 'unknown'} style`;
        } else if (category === 'recurring_style' || category === 'recurring_theme') {
          prompt += `\n- Recurring ${category.includes('style') ? 'style' : 'theme'}: ${item.style || item.theme} (used ${item.frequency} times)`;
        } else {
          prompt += `\n- ${JSON.stringify(item).substring(0, 150)}`;
        }
      });
    });
  }

  if (request.includeMinigame) {
    prompt += `\n\nAlso create a mini-game with difficulty "${request.difficulty || 'basico'}" that fits this world theme.`;
    prompt += `\n\nCRITICAL: The mini-game must follow this EXACT JSON schema. NO executable code allowed - only configuration data.

MINIGAME SCHEMA:
{
  "minigame": {
    "gameType": "quiz" | "runner" | "puzzle" | "memory" | "boss" | "challenge",
    "name": "string - Creative name for the mini-game",
    "description": "string - Brief description",
    "theme": {
      "background": "#hex - Background color",
      "primary": "#hex - Primary color",
      "secondary": "#hex - Secondary color",
      "accent": "#hex - Accent color",
      "decorations": ["string - decoration names"]
    },
    "difficulty": "easy" | "medium" | "hard" | "expert",
    "duration": number (10-300 seconds),
    "operations": ["addition" | "subtraction" | "multiplication" | "division" | "mixed"],
    "questions": number (5-20),
    "numberRange": {
      "min": number (1-1000),
      "max": number (1-10000)
    },
    "rules": {
      "type": "quiz",
      "timePerQuestion": number (5-30),
      "showTimer": boolean,
      "allowRetry": boolean,
      "feedbackType": "immediate" | "end"
    },
    "rewards": {
      "xp": number (10-500),
      "coins": number (5-100),
      "gems": number (0-10)
    },
    "visual": {
      "character": "string - character name",
      "effects": ["string - effect names"],
      "animations": ["string - animation names"]
    }
  }
}

RULES FOR MINIGAME GENERATION:
1. NO JavaScript, NO HTML, NO executable code - ONLY configuration data
2. All colors must be valid hex codes (#RRGGBB)
3. All numbers must be within specified ranges
4. gameType must be one of: quiz, runner, puzzle, memory, boss, challenge
5. difficulty must be one of: easy, medium, hard, expert
6. operations must be from: addition, subtraction, multiplication, division, mixed
7. duration must be between 10 and 300 seconds
8. questions must be between 5 and 20
9. numberRange.min must be >= 1 and < numberRange.max
10. numberRange.max must be <= 10000
11. rewards.xp must be between 10 and 500
12. rewards.coins must be between 5 and 100
13. rewards.gems must be between 0 and 10
14. For quiz type: timePerQuestion must be 5-30, showTimer and allowRetry must be boolean, feedbackType must be "immediate" or "end"
15. All string values must be in Spanish
16. Theme colors should match the world theme colors
17. Visual elements should reference existing Math-Rush assets only

EXAMPLE FOR QUIZ TYPE:
{
  "gameType": "quiz",
  "name": "Piratas Espaciales",
  "description": "Resuelve operaciones matemáticas para derrotar piratas espaciales",
  "theme": {
    "background": "#0a0a2e",
    "primary": "#ff6b35",
    "secondary": "#f7931e",
    "accent": "#ffd700",
    "decorations": ["stars", "planets"]
  },
  "difficulty": "medium",
  "duration": 60,
  "operations": ["addition", "multiplication"],
  "questions": 10,
  "numberRange": { "min": 1, "max": 100 },
  "rules": {
    "type": "quiz",
    "timePerQuestion": 15,
    "showTimer": true,
    "allowRetry": false,
    "feedbackType": "immediate"
  },
  "rewards": { "xp": 100, "coins": 50, "gems": 2 },
  "visual": {
    "character": "cuy-pirate",
    "effects": ["sparkle", "explosion"],
    "animations": ["bounce", "fade"]
  }
}`;
  }

  prompt += '\n\nRespond with valid JSON only. No markdown, no code blocks, just the JSON object.';

  return prompt;
}

async function callAIProvider(
  config: AIProviderConfig,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const response = await fetch(config.baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: config.maxTokens,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI provider error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // Handle different provider response formats
  if (data.choices && data.choices[0]?.message?.content) {
    return data.choices[0].message.content;
  }

  if (data.content) {
    return data.content;
  }

  throw new Error('Unexpected AI provider response format');
}

function parseAIResponse(responseText: string): any {
  // Remove markdown code blocks if present
  let cleaned = responseText.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/```\s*$/i, '');

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error('Failed to parse AI response as JSON');
  }
}

export async function generateWorldDesign(
  request: WorldDesignRequest
): Promise<WorldDesignResponse> {
  const config = getProviderConfig();

  if (!config) {
    throw new Error('AI_PROVIDER_NOT_CONFIGURED');
  }

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(request);

  const startTime = Date.now();
  const responseText = await callAIProvider(config, systemPrompt, userPrompt);
  const duration = Date.now() - startTime;

  const parsed = parseAIResponse(responseText);

  return {
    ...parsed,
    _metadata: {
      model: config.model,
      duration,
      promptTokens: userPrompt.length,
      completionTokens: responseText.length,
    },
  };
}

export function isProviderConfigured(): boolean {
  return getProviderConfig() !== null;
}
