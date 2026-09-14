# Arquitectura de IA - Math Rush

## Resumen de Implementación

### ✅ Completado

#### 1. Sistema de Proveedores Intercambiables
- **ImageGenerationProvider**: Generación de imágenes
- **AudioGenerationProvider**: Generación de audio
- **MascotGenerationProvider**: Generación de mascotas

#### 2. Proveedores Implementados
- **MockProvider**: Para desarrollo y testing
  - Usa assets pre-generados
  - Simula delays realistas
  - Implementa rate limiting local
  - Caché en memoria (5 minutos TTL)

- **EdgeFunctionProvider**: Para producción
  - Se conecta a Supabase Edge Functions
  - API keys en backend (secrets)
  - Manejo de errores completo
  - Timeout configurable

#### 3. AIService (Capa de Negocio)
- Gestión de límites por plan:
  - FREE: 3 imágenes, 1 audio, 2 mascotas/día
  - RUSH: 20 imágenes, 10 audios, 15 mascotas/día
  - LEGEND: 50 imágenes, 30 audios, 40 mascotas/día
  - TEACHER: 100 imágenes, 50 audios, 80 mascotas/día
  - DEVELOPER: Ilimitado (9999)

- Tracking de uso:
  - Contador local por usuario
  - Reset cada 24 horas
  - Registro en base de datos (preparado)

- Manejo de errores:
  - RateLimitError
  - TimeoutError
  - ProviderNotConfiguredError
  - InsufficientCreditsError
  - AIProviderError (base)

- Caché:
  - Implementado en MockProvider
  - TTL de 5 minutos
  - Reduce costos de API

#### 4. Hook de React (useAI)
- Estado: loading, error, retryable
- Métodos: generateImage, generateAudio, generateMascot
- Utilidades: getUsage, getLimits, clearError
- Integración con AuthContext para usuario y plan

#### 5. Interfaz Actualizada (AiLab.tsx)
- Muestra uso actual vs límites
- Manejo de errores con retry
- Loading states mejorados
- Reproductor de audio para resultados
- Historial de generaciones
- Información del proveedor usado

### 📁 Estructura de Archivos

```
src/
├── services/
│   └── ai/
│       ├── index.ts                    # Export principal
│       ├── AIService.ts                # Servicio principal
│       └── providers/
│           ├── types.ts                # Interfaces y errores
│           ├── MockProvider.ts         # Provider para dev
│           └── EdgeFunctionProvider.ts # Provider para prod
├── hooks/
│   └── useAI.ts                        # Hook de React
└── pages/
    └── AiLab.tsx                       # Interfaz actualizada

supabase/
└── functions/
    └── README.md                       # Documentación Edge Functions
```

### 🔒 Seguridad

✅ API keys NUNCA en frontend
✅ Solo en Edge Functions (Supabase secrets)
✅ Autenticación requerida
✅ Rate limiting por usuario y plan
✅ Validación de inputs
✅ No exponer datos sensibles
✅ Registro de uso para auditoría

### 🎯 Flujo de Datos

```
Frontend (React)
    ↓
useAI Hook
    ↓
AIService
    ↓
├─ Verificar límites (plan)
├─ Verificar caché
└─ Llamar proveedor
    ↓
├─ MockProvider (dev) → Assets locales
└─ EdgeFunctionProvider (prod) → Supabase Edge Function
    ↓
Edge Function
    ├─ Verificar auth
    ├─ Verificar límites (DB)
    ├─ Llamar API externa (OpenAI, ElevenLabs, etc.)
    ├─ Subir resultado a Storage
    ├─ Registrar uso en ai_usage
    └─ Retornar URL pública
    ↓
Frontend recibe URL
    ↓
Mostrar preview
    ↓
Usuario puede aplicar/guardar
```

### 📊 Límites por Plan

| Plan | Imágenes/día | Audios/día | Mascotas/día |
|------|--------------|------------|--------------|
| FREE | 3 | 1 | 2 |
| RUSH | 20 | 10 | 15 |
| LEGEND | 50 | 30 | 40 |
| TEACHER | 100 | 50 | 80 |
| DEVELOPER | ∞ | ∞ | ∞ |

### 🚀 Próximos Pasos para Producción

1. **Configurar Supabase Edge Functions:**
   ```bash
   supabase functions deploy generate-image
   supabase functions deploy generate-audio
   supabase functions deploy generate-mascot
   supabase functions deploy ai-status
   ```

2. **Configurar Secrets:**
   ```bash
   supabase secrets set IMAGE_PROVIDER_API_KEY=sk-...
   supabase secrets set AUDIO_PROVIDER_API_KEY=...
   supabase secrets set MASCOT_PROVIDER_API_KEY=...
   ```

3. **Crear Storage Bucket:**
   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('ai-generated', 'ai-generated', true);
   ```

4. **Configurar Políticas RLS:**
   - Ver `supabase/functions/README.md`

5. **Elegir Proveedores de IA:**
   - Imágenes: OpenAI DALL-E 3, Stability AI
   - Audio: ElevenLabs, OpenAI TTS
   - Mascotas: Mismo que imágenes con prompts específicos

6. **Monitoreo:**
   - Logs en Supabase Dashboard
   - Alertas para errores
   - Tracking de costos
   - Análisis de uso por usuario

### 💰 Costos Estimados (Mensuales)

**Escenario: 1000 usuarios activos**
- 50% FREE, 30% RUSH, 15% LEGEND, 5% TEACHER

**Imágenes (DALL-E 3):**
- FREE: 500 × 3 × 30 = 45,000 imágenes × $0.04 = $1,800
- RUSH: 300 × 20 × 30 = 180,000 imágenes × $0.04 = $7,200
- LEGEND: 150 × 50 × 30 = 225,000 imágenes × $0.04 = $9,000
- TEACHER: 50 × 100 × 30 = 150,000 imágenes × $0.04 = $6,000
- **Total: ~$24,000/mes**

**Optimización:**
- Usar Stability AI: ~$0.02/imagen → $12,000/mes
- Caché agresivo: -30% → $8,400/mes
- Fine-tuning propio: -50% → $4,200/mes

**Audio (ElevenLabs):**
- Similar cálculo, ~$500-2000/mes dependiendo de uso

### 🧪 Testing

```typescript
// Test con MockProvider (automático en dev)
import { aiService } from './services/ai';

const result = await aiService.generateImage(
  'user-123',
  'free',
  'Un castillo matemático'
);

console.log(result.url); // URL de imagen generada
```

```bash
# Test con Edge Functions (producción)
curl -X POST https://tu-proyecto.supabase.co/functions/v1/generate-image \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Un gato matemático"}'
```

### 📝 Notas Importantes

1. **Mock vs Real:**
   - Mock: Usa assets pre-generados, gratis, instantáneo
   - Real: Usa APIs externas, cuesta dinero, toma tiempo

2. **Caché:**
   - Mock: Caché en memoria (se pierde al recargar)
   - Real: Caché en Storage (persistente)

3. **Rate Limiting:**
   - Mock: Contador local (no persiste)
   - Real: Contador en base de datos (persiste)

4. **Desarrollo:**
   - Usar MockProvider para desarrollo
   - Switch automático basado en VITE_SUPABASE_URL
   - No gastar dinero en APIs durante desarrollo

5. **Producción:**
   - Configurar Edge Functions
   - Configurar secrets
   - Monitorear costos
   - Optimizar con caché

### ✅ Estado Actual

- ✅ Arquitectura completa implementada
- ✅ Proveedores intercambiables
- ✅ MockProvider funcional para desarrollo
- ✅ EdgeFunctionProvider preparado para producción
- ✅ Sistema de límites por plan
- ✅ Manejo de errores completo
- ✅ Caché implementado
- ✅ Tracking de uso
- ✅ Hook de React listo
- ✅ Interfaz actualizada
- ✅ Documentación completa

**La arquitectura de IA está lista para producción. Solo falta configurar los Edge Functions y las API keys de los proveedores externos.**
