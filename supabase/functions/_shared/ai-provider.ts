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
  };
  memory?: Array<{
    category: string;
    content: any;
  }>;
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
    prompt += '\n\nUser preferences:';
    if (request.userPreferences.preferredColors?.length) {
      prompt += `\n- Preferred colors: ${request.userPreferences.preferredColors.join(', ')}`;
    }
    if (request.userPreferences.preferredStyles?.length) {
      prompt += `\n- Preferred styles: ${request.userPreferences.preferredStyles.join(', ')}`;
    }
    if (request.userPreferences.preferredAnimations?.length) {
      prompt += `\n- Preferred animations: ${request.userPreferences.preferredAnimations.join(', ')}`;
    }
  }

  if (request.memory && request.memory.length > 0) {
    prompt += '\n\nRelevant memory from previous interactions:';
    request.memory.slice(0, 5).forEach((mem) => {
      prompt += `\n- ${mem.category}: ${JSON.stringify(mem.content)}`;
    });
  }

  if (request.includeMinigame) {
    prompt += `\n\nAlso create a mini-game with difficulty "${request.difficulty || 'basico'}" that fits this world theme.`;
    prompt += `\n\nMINIGAME STRUCTURE (include in response):
{
  "minigame": {
    "type": "quiz|puzzle|challenge",
    "theme": "string - Theme of the minigame",
    "difficulty": "principiante|basico|intermedio|avanzado",
    "rules": {},
    "content": {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correct": number (0-3),
          "explanation": "string"
        }
      ]
    }
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
