# 🚀 Edge Functions - Diseñador de Mundo

## 📁 Estructura

```
supabase/functions/
├── _shared/
│   ├── cors.ts              # Configuración CORS
│   ├── auth.ts              # Helper de autenticación
│   ├── validation.ts        # Validaciones
│   └── ai-provider.ts       # Provider de IA
├── generate-world-theme/
│   └── index.ts             # Edge Function principal
└── README.md                # Este archivo
```

---

## 🔧 Configuración Requerida

### 1. Secrets de Supabase

Configura estos secrets en Supabase Dashboard → Edge Functions → Secrets:

```bash
# AI Provider (OpenAI, Anthropic, etc.)
AI_PROVIDER_KEY=sk-...              # API key del proveedor
AI_PROVIDER_URL=https://...         # URL del endpoint
AI_MODEL=gpt-4o-mini                # Modelo a usar (opcional, default: gpt-4o-mini)

# Supabase (automático en Edge Functions)
# SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY ya están disponibles
```

### 2. Configurar via Supabase CLI

```bash
# Login a Supabase
supabase login

# Vincular proyecto
supabase link --project-ref tu-project-ref

# Configurar secrets
supabase secrets set AI_PROVIDER_KEY=sk-...
supabase secrets set AI_PROVIDER_URL=https://api.openai.com/v1/chat/completions
supabase secrets set AI_MODEL=gpt-4o-mini
```

---

## 🚀 Despliegue

### Desplegar Edge Function

```bash
# Desplegar la función
supabase functions deploy generate-world-theme

# Verificar despliegue
supabase functions list
```

### Desplegar con flags específicos

```bash
# Desplegar sin verificación de tipos (no recomendado)
supabase functions deploy generate-world-theme --no-verify

# Desplegar con región específica
supabase functions deploy generate-world-theme --region us-east-1
```

---

## 📡 Endpoint

**URL**: `https://tu-project-ref.supabase.co/functions/v1/generate-world-theme`

**Método**: `POST`

**Headers**:
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

---

## 📥 Payload Esperado

### Request Básico

```json
{
  "prompt": "Un mundo espacial con planetas matemáticos y estrellas brillantes"
}
```

### Request con Mini-juego

```json
{
  "prompt": "Un castillo medieval con torres de geometría",
  "includeMinigame": true,
  "difficulty": "intermedio"
}
```

### Request usando Token

```json
{
  "prompt": "Un océano de fracciones con olas de números",
  "useToken": true
}
```

### Request Completo

```json
{
  "prompt": "Un bosque mágico con árboles de fractales y flores geométricas",
  "useToken": false,
  "includeMinigame": true,
  "difficulty": "basico"
}
```

### Parámetros

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `prompt` | string | ✅ | Descripción del mundo (10-2000 caracteres) |
| `useToken` | boolean | ❌ | Usar tokens en lugar de intentos (default: false) |
| `includeMinigame` | boolean | ❌ | Incluir mini-juego (default: false) |
| `difficulty` | string | ❌ | Dificultad del mini-juego (default: "basico") |

**Valores de difficulty**: `principiante`, `basico`, `intermedio`, `avanzado`

---

## 📤 Respuesta Esperada

### Respuesta Exitosa (200)

```json
{
  "success": true,
  "world_theme": {
    "id": "uuid-del-tema",
    "name": "Bosque Mágico de Fractales",
    "theme": {
      "background": "#0a1929",
      "primary": "#4caf50",
      "secondary": "#81c784",
      "accent": "#ffeb3b",
      "text": "#ffffff",
      "panel": "#1a2942",
      "border": "#2d4a6f",
      "glow": "#4caf50"
    },
    "background": {
      "type": "svg",
      "value": "<svg>...</svg>"
    },
    "decorations": [
      {
        "type": "tree",
        "position": { "x": 10, "y": 20 },
        "size": { "width": 100, "height": 150 },
        "svg": "<svg>...</svg>",
        "animation": "sway"
      }
    ],
    "animations": {
      "sway": {
        "type": "rotate",
        "duration": "3s",
        "easing": "ease-in-out"
      }
    },
    "layout": {
      "header": { "position": "top", "height": "60px" },
      "sidebar": { "position": "left", "width": "250px" }
    },
    "minigame": {
      "type": "quiz",
      "theme": "Fractales del Bosque",
      "difficulty": "basico",
      "rules": {
        "timeLimit": 30,
        "questionsCount": 5
      },
      "content": {
        "questions": [
          {
            "question": "¿Cuál es el siguiente número en la secuencia fractal?",
            "options": ["2", "4", "8", "16"],
            "correct": 2,
            "explanation": "Cada número se multiplica por 2"
          }
        ]
      }
    },
    "expires_at": "2024-12-20T10:00:00Z"
  },
  "metadata": {
    "duration": 3500,
    "attempts_remaining": 1,
    "tokens_used": 0
  }
}
```

### Respuestas de Error

#### 401 - Unauthorized

```json
{
  "error": "UNAUTHORIZED",
  "message": "Invalid or missing authentication"
}
```

#### 400 - Invalid Prompt

```json
{
  "error": "INVALID_PROMPT",
  "message": "Prompt must be at least 10 characters"
}
```

#### 429 - Limit Exceeded

```json
{
  "error": "LIMIT_EXCEEDED",
  "message": "You have used all your attempts for this period",
  "attempts_remaining": 0,
  "period_end": "2024-12-20T10:00:00Z",
  "can_use_tokens": true
}
```

#### 402 - Insufficient Tokens

```json
{
  "error": "INSUFFICIENT_TOKENS",
  "message": "You need 3 tokens for this attempt",
  "current_balance": 2,
  "required": 3
}
```

#### 503 - AI Provider Not Configured

```json
{
  "error": "AI_PROVIDER_NOT_CONFIGURED",
  "message": "The AI provider is not configured. Please contact support."
}
```

#### 500 - AI Generation Failed

```json
{
  "error": "AI_GENERATION_FAILED",
  "message": "Failed to generate world theme. Please try again."
}
```

#### 500 - Invalid AI Response

```json
{
  "error": "INVALID_AI_RESPONSE",
  "message": "The AI generated an invalid response. Please try again."
}
```

---

## 🧪 Testing

### Testing con cURL

```bash
# Request básico
curl -X POST https://tu-project-ref.supabase.co/functions/v1/generate-world-theme \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Un mundo espacial con planetas matemáticos"
  }'

# Request con mini-juego
curl -X POST https://tu-project-ref.supabase.co/functions/v1/generate-world-theme \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Un castillo medieval con torres de geometría",
    "includeMinigame": true,
    "difficulty": "intermedio"
  }'

# Request usando token
curl -X POST https://tu-project-ref.supabase.co/functions/v1/generate-world-theme \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Un océano de fracciones",
    "useToken": true
  }'
```

### Testing con JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function generateWorldTheme(prompt: string, options?: {
  useToken?: boolean;
  includeMinigame?: boolean;
  difficulty?: string;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/generate-world-theme`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        ...options,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}

// Uso
try {
  const result = await generateWorldTheme('Un mundo espacial', {
    includeMinigame: true,
    difficulty: 'basico',
  });
  
  console.log('World theme:', result.world_theme);
  console.log('Metadata:', result.metadata);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## 🔒 Seguridad

### Autenticación
- ✅ JWT token requerido en header `Authorization`
- ✅ Usuario validado server-side
- ✅ Plan y límites verificados en backend

### Validaciones
- ✅ Prompt validado (10-2000 caracteres)
- ✅ Sanitización básica de input
- ✅ Respuesta de IA validada estructuralmente
- ✅ Colores validados (hex o rgb)
- ✅ Tipos de background validados

### Rate Limiting
- ✅ Límites por plan (FREE: 2, RUSH: 5, LEGEND: 8, TEACHER: 15)
- ✅ Renovación automática de períodos
- ✅ Sistema de tokens para intentos extra
- ✅ Registro de todos los intentos

### Datos Sensibles
- ✅ API keys solo en secrets de Supabase
- ✅ Nunca expuestas al frontend
- ✅ Service role key solo en backend
- ✅ JWT tokens con expiración

---

## 📊 Logging y Monitoreo

### Logs en Supabase

Todos los intentos se registran en la tabla `ai_usage`:

```sql
SELECT * FROM ai_usage 
WHERE type = 'world_theme' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Métricas Registradas

- `user_id` - Usuario que generó
- `type` - Tipo de generación (world_theme)
- `provider` - Provider usado (world_designer)
- `prompt` - Prompt original
- `duration_ms` - Duración en milisegundos
- `success` - Si fue exitoso
- `error` - Mensaje de error si falló

### Monitoreo de Errores

```sql
-- Errores en las últimas 24 horas
SELECT error, COUNT(*) as count
FROM ai_usage
WHERE type = 'world_theme'
  AND success = false
  AND created_at > now() - interval '24 hours'
GROUP BY error
ORDER BY count DESC;
```

---

## 🔄 Flujo Completo

```
1. Frontend envía request con JWT
   ↓
2. Edge Function valida CORS
   ↓
3. Autentica usuario (JWT → Supabase Auth)
   ↓
4. Valida prompt (longitud, sanitización)
   ↓
5. Verifica si AI provider está configurado
   ↓
6. Verifica plan y límites (check_and_renew_attempts)
   ↓
7. Si no hay intentos, verifica tokens
   ↓
8. Si usa tokens, valida y deduce (use_tokens)
   ↓
9. Recupera preferencias del usuario
   ↓
10. Recupera memoria relevante (privada + global aprobada)
    ↓
11. Llama al AI provider con prompt estructurado
    ↓
12. Valida respuesta de IA (estructura JSON, colores, tipos)
    ↓
13. Guarda world_theme en base de datos
    ↓
14. Si incluye minigame, guarda en world_minigames
    ↓
15. Registra intento (register_world_attempt)
    ↓
16. Log usage en ai_usage
    ↓
17. Actualiza memoria con esta generación
    ↓
18. Retorna resultado estructurado
```

---

## 🎯 Estructura de Respuesta de IA

La IA debe retornar JSON con esta estructura:

```json
{
  "name": "string - Nombre creativo del mundo",
  "theme": {
    "background": "#hex - Color de fondo principal",
    "primary": "#hex - Color primario",
    "secondary": "#hex - Color secundario",
    "accent": "#hex - Color de acento",
    "text": "#hex - Color de texto",
    "panel": "#hex - Color de paneles (opcional)",
    "border": "#hex - Color de bordes (opcional)",
    "glow": "#hex - Color de glow (opcional)"
  },
  "background": {
    "type": "svg|gradient|pattern",
    "value": "string - SVG markup, gradient CSS, o pattern"
  },
  "decorations": [
    {
      "type": "string - Tipo de decoración",
      "position": { "x": number, "y": number },
      "size": { "width": number, "height": number },
      "svg": "string - SVG simple (max 500 chars)",
      "animation": "string - Descripción de animación"
    }
  ],
  "animations": {
    "key": "animation config object"
  },
  "layout": {
    "key": "layout config object"
  },
  "minigame": {
    "type": "quiz|puzzle|challenge",
    "theme": "string - Tema del mini-juego",
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
}
```

---

## 🐛 Troubleshooting

### Error: AI_PROVIDER_NOT_CONFIGURED

**Causa**: Secrets no configurados

**Solución**:
```bash
supabase secrets set AI_PROVIDER_KEY=sk-...
supabase secrets set AI_PROVIDER_URL=https://api.openai.com/v1/chat/completions
```

### Error: UNAUTHORIZED

**Causa**: JWT token inválido o expirado

**Solución**: Renovar sesión del usuario
```typescript
const { data } = await supabase.auth.refreshSession();
```

### Error: LIMIT_EXCEEDED

**Causa**: Usuario alcanzó límite de intentos

**Solución**: 
- Esperar renovación del período
- Usar tokens: `"useToken": true`
- Mejorar plan del usuario

### Error: INSUFFICIENT_TOKENS

**Causa**: Usuario no tiene suficientes tokens

**Solución**: Comprar más tokens con gemas
```typescript
const result = await supabase.rpc('purchase_tokens_with_gems', {
  user_uuid: userId,
  gems_amount: 100, // 100 gemas = 10 tokens
});
```

### Error: AI_GENERATION_FAILED

**Causa**: Provider de IA falló o retornó error

**Solución**: 
- Verificar logs en Supabase Dashboard
- Verificar que API key es válida
- Verificar que el endpoint es correcto
- Reintentar

---

## 📝 Notas Importantes

1. **No ejecutar código generado**: La IA solo genera configuración JSON, nunca código ejecutable
2. **Validación estricta**: Todas las respuestas de IA se validan antes de guardar
3. **Timeout**: La función tiene timeout de 60 segundos (configurable)
4. **Costo**: Cada llamada al provider de IA tiene un costo (monitorear usage)
5. **Rate limiting**: Implementar rate limiting adicional si es necesario
6. **Caché**: Considerar caché para prompts similares (futuro)

---

## 🚀 Próximos Pasos

1. ✅ Edge Function creada
2. ✅ Validaciones implementadas
3. ✅ Provider de IA integrado
4. ⏭️ Desplegar en Supabase
5. ⏭️ Configurar secrets
6. ⏭️ Probar con datos reales
7. ⏭️ Monitorear usage y errores
8. ⏭️ Implementar frontend para consumir

---

**Fecha**: 2024  
**Versión**: 1.0  
**Estado**: ✅ Listo para desplegar
