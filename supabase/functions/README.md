# Supabase Edge Functions para AI Lab

Este directorio contiene las funciones Edge de Supabase necesarias para la integración real de IA.

## Funciones Requeridas

### 1. `generate-image`
Genera imágenes usando un proveedor de IA (DALL-E, Stable Diffusion, etc.)

**Endpoint:** `POST /functions/v1/generate-image`

**Request:**
```json
{
  "prompt": "Un castillo matemático flotando en el espacio",
  "width": 1024,
  "height": 1024,
  "quality": "medium"
}
```

**Response:**
```json
{
  "id": "img_123",
  "url": "https://storage.supabase.co/...",
  "prompt": "...",
  "width": 1024,
  "height": 1024,
  "format": "png",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 2. `generate-audio`
Genera audio usando un proveedor de IA (ElevenLabs, OpenAI TTS, etc.)

**Endpoint:** `POST /functions/v1/generate-audio`

**Request:**
```json
{
  "prompt": "Música lo-fi futurista",
  "duration": 5,
  "format": "wav"
}
```

**Response:**
```json
{
  "id": "audio_123",
  "url": "https://storage.supabase.co/...",
  "prompt": "...",
  "duration": 5.2,
  "format": "wav",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 3. `generate-mascot`
Genera mascotas personalizadas.

**Endpoint:** `POST /functions/v1/generate-mascot`

**Request:**
```json
{
  "prompt": "Cuy gamer con audífonos",
  "style": "cartoon"
}
```

**Response:**
```json
{
  "id": "mascot_123",
  "imageUrl": "https://storage.supabase.co/...",
  "name": "Cuy Gamer",
  "prompt": "...",
  "style": "cartoon",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### 4. `ai-status`
Verifica el estado de los proveedores de IA.

**Endpoint:** `POST /functions/v1/ai-status`

**Request:**
```json
{
  "provider": "image" | "audio" | "mascot"
}
```

**Response:**
```json
{
  "available": true,
  "message": "Provider is active",
  "limits": {
    "requestsPerMinute": 10,
    "requestsPerDay": 100
  }
}
```

## Configuración

### Variables de Entorno (Supabase Secrets)

```bash
# Proveedor de imágenes (ejemplo: OpenAI DALL-E)
IMAGE_PROVIDER_API_KEY=sk-...
IMAGE_PROVIDER_URL=https://api.openai.com/v1/images/generations

# Proveedor de audio (ejemplo: ElevenLabs)
AUDIO_PROVIDER_API_KEY=...
AUDIO_PROVIDER_URL=https://api.elevenlabs.io/v1/text-to-speech

# Proveedor de mascotas (puede usar el mismo que imágenes)
MASCOT_PROVIDER_API_KEY=...
MASCOT_PROVIDER_URL=...

# Supabase Storage
STORAGE_BUCKET=ai-generated
```

### Configuración de Supabase

1. **Crear bucket de storage:**
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('ai-generated', 'ai-generated', true);
```

2. **Políticas RLS para storage:**
```sql
-- Usuarios pueden leer sus propias generaciones
CREATE POLICY "Users can view own AI generations"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'ai-generated' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Edge functions pueden escribir (usar service role)
-- No crear política pública de escritura
```

## Implementación de Edge Functions

### Ejemplo: `generate-image/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }

    // Parse request
    const { prompt, width = 1024, height = 1024, quality = 'medium' } = await req.json()

    if (!prompt) {
      throw new Error('Prompt is required')
    }

    // Check rate limits
    const { data: usage } = await supabase
      .from('ai_usage')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('type', 'image')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    const usageCount = usage?.length || 0
    const limits = await getUserLimits(supabase, user.id)

    if (usageCount >= limits.imagePerDay) {
      return new Response(
        JSON.stringify({ 
          error: { 
            code: 'RATE_LIMIT', 
            message: 'Daily limit reached',
            retryable: false 
          } 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call AI provider
    const apiKey = Deno.env.get('IMAGE_PROVIDER_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: { 
            code: 'NOT_CONFIGURED', 
            message: 'Image provider not configured',
            retryable: false 
          } 
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const response = await fetch(Deno.env.get('IMAGE_PROVIDER_URL')!, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        n: 1,
        size: `${width}x${height}`,
        quality,
      }),
    })

    if (!response.ok) {
      throw new Error(`Provider error: ${response.statusText}`)
    }

    const providerData = await response.json()
    const imageUrl = providerData.data[0].url

    // Download and upload to storage
    const imageResponse = await fetch(imageUrl)
    const imageBlob = await imageResponse.blob()

    const fileName = `${user.id}/${Date.now()}.png`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ai-generated')
      .upload(fileName, imageBlob, {
        contentType: 'image/png',
        upsert: false,
      })

    if (uploadError) {
      throw new Error(`Storage error: ${uploadError.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('ai-generated')
      .getPublicUrl(fileName)

    // Log usage
    await supabase.from('ai_usage').insert({
      user_id: user.id,
      type: 'image',
      provider: 'openai-dalle',
      prompt,
    })

    // Return result
    return new Response(
      JSON.stringify({
        id: `img_${Date.now()}`,
        url: publicUrl,
        prompt,
        width,
        height,
        format: 'png',
        createdAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: { 
          code: 'GENERATION_FAILED', 
          message: error.message,
          retryable: true 
        } 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function getUserLimits(supabase: any, userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  const role = profile?.role || 'student'

  if (role === 'developer') {
    return { imagePerDay: 9999, audioPerDay: 9999, mascotPerDay: 9999 }
  }

  // Check subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  const plan = subscription?.plan_id || 'free'

  const limits: Record<string, any> = {
    free: { imagePerDay: 3, audioPerDay: 1, mascotPerDay: 2 },
    rush: { imagePerDay: 20, audioPerDay: 10, mascotPerDay: 15 },
    legend: { imagePerDay: 50, audioPerDay: 30, mascotPerDay: 40 },
    teacher: { imagePerDay: 100, audioPerDay: 50, mascotPerDay: 80 },
  }

  return limits[plan] || limits.free
}
```

## Proveedores Recomendados

### Imágenes
- **OpenAI DALL-E 3**: Alta calidad, fácil integración
- **Stability AI**: Más económico, buena calidad
- **Midjourney**: Excelente calidad, pero API limitada

### Audio
- **ElevenLabs**: Voces realistas, música
- **OpenAI TTS**: Bueno para narración
- **Audiocraft (Meta)**: Open source, música

### Mascotas
- Usar el mismo proveedor de imágenes con prompts específicos
- Fine-tuning con dataset de mascotas

## Costos Estimados

### OpenAI DALL-E 3
- $0.040 por imagen (1024x1024, standard)
- $0.080 por imagen (1024x1024, HD)

### ElevenLabs
- $0.30 por 1,000 caracteres (starter)
- $0.14 por 1,000 caracteres (creator)

### Stability AI
- $0.002 por crédito (aproximadamente $0.02 por imagen)

## Despliegue

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Vincular proyecto
supabase link --project-ref tu-project-ref

# Desplegar función
supabase functions deploy generate-image

# Configurar secrets
supabase secrets set IMAGE_PROVIDER_API_KEY=sk-...

# Repetir para otras funciones
supabase functions deploy generate-audio
supabase functions deploy generate-mascot
supabase functions deploy ai-status
```

## Testing

```bash
# Test local
supabase functions serve

# Test con curl
curl -X POST http://localhost:54321/functions/v1/generate-image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Un gato matemático"}'
```

## Monitoreo

- Usar Supabase Dashboard para ver logs
- Configurar alertas para errores
- Monitorear costos de proveedores
- Trackear uso por usuario en `ai_usage`

## Seguridad

✅ API keys solo en Edge Functions (secrets)
✅ Autenticación requerida
✅ Rate limiting por usuario
✅ Validación de inputs
✅ No exponer datos sensibles al frontend
✅ Registro de uso para auditoría
