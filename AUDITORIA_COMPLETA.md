# 🔍 AUDITORÍA COMPLETA - MATH RUSH

**Fecha:** 2024  
**Proyecto:** Math Rush  
**Objetivo:** Preparar implementación del "Diseñador de Mundo"

---

## 📊 1. ARQUITECTURA ACTUAL

### Stack Tecnológico
```
Frontend:
├── React 18.2.0
├── TypeScript 5.7.0
├── Vite 6.3.5
├── Tailwind CSS 4.1.7
├── Framer Motion 11.16.1
├── React Router DOM 6.8.0 (BrowserRouter)
└── Supabase JS 2.98.0

Backend (Preparado):
├── Supabase Auth
├── Supabase Database
├── Supabase Storage
└── Supabase Edge Functions
```

### Estructura de Directorios
```
math-rush/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── layout.tsx       # Sidebar, BottomNav, ProtectedRoute
│   │   └── ui.tsx           # Button, Card, Modal, Badge, etc.
│   ├── contexts/            # Contextos globales
│   │   ├── AuthContext.tsx  # Autenticación + developer mode
│   │   └── GameContext.tsx  # Motor de juego
│   ├── hooks/               # Hooks personalizados
│   │   ├── useAI.ts         # Hook de IA
│   │   └── useEntitlements.ts # Hook de permisos
│   ├── lib/                 # Utilidades
│   │   ├── assets.ts        # URLs de imágenes
│   │   ├── gameEngine.ts    # Lógica del juego + entitlements
│   │   ├── mockData.ts      # Datos mock
│   │   └── supabase.ts      # Cliente Supabase + tipos
│   ├── pages/               # Páginas (18 total)
│   │   ├── Landing.tsx
│   │   ├── Auth.tsx
│   │   ├── Lobby.tsx        # ← IMPORTANTE para Diseñador de Mundo
│   │   ├── AiLab.tsx        # ← Laboratorio IA actual
│   │   └── ... (15 más)
│   ├── services/            # Servicios
│   │   ├── ai/              # Sistema de IA
│   │   │   ├── AIService.ts
│   │   │   └── providers/
│   │   └── soundService.ts
│   ├── App.tsx              # Router principal
│   ├── main.tsx             # Entry point
│   └── index.css            # Estilos globales
├── supabase/
│   ├── schema.sql           # Estructura de BD
│   └── functions/           # Edge Functions (documentación)
└── public/                  # Assets públicos
```

---

## 🤖 2. ARCHIVOS RELACIONADOS CON IA

### Sistema de IA Actual
```
src/services/ai/
├── AIService.ts                    # Servicio principal
│   ├── PLAN_LIMITS                 # Límites por plan
│   ├── UsageTracker                # Tracking de uso
│   ├── generateImage()             # Generación de imágenes
│   ├── generateAudio()             # Generación de audio
│   └── generateMascot()            # Generación de mascotas
│
├── providers/
│   ├── types.ts                    # Interfaces
│   │   ├── ImageGenerationProvider
│   │   ├── AudioGenerationProvider
│   │   ├── MascotGenerationProvider
│   │   └── AIProviderError
│   │
│   ├── MockProvider.ts             # Provider mock (demo)
│   │   ├── MockImageProvider
│   │   ├── MockAudioProvider
│   │   └── MockMascotProvider
│   │
│   └── EdgeFunctionProvider.ts     # Provider para producción
│       ├── EdgeFunctionImageProvider
│       ├── EdgeFunctionAudioProvider
│       └── EdgeFunctionMascotProvider
│
└── index.ts                        # Exportaciones

src/hooks/
└── useAI.ts                        # Hook de React para IA
    ├── generateImage()
    ├── generateAudio()
    ├── generateMascot()
    ├── getUsage()
    └── getLimits()

src/pages/
└── AiLab.tsx                       # Laboratorio IA (UI)
    ├── Diseñador de Mundo          # ← Objetivo de mejora
    ├── Sintetizador de Audio
    └── Diseñador de Mascota
```

### Estado Actual del Laboratorio IA
- ✅ Máquina de estados completa (idle, generating, success, error, cancelled)
- ✅ Sistema de progreso animado
- ✅ Cancelación de generación
- ✅ Timeout de seguridad (30s)
- ✅ Manejo de errores
- ✅ Historial de generaciones
- ✅ Límites por plan
- ⚠️ Usa MockProvider (imágenes pre-generadas)
- ⚠️ No hay persistencia en BD
- ⚠️ No hay sistema de tokens

---

## 🗄️ 3. TABLAS SUPABASE EXISTENTES

### Tablas Principales
```sql
1. profiles                    # Usuarios y sus datos
   - id, email, nickname, role
   - level, xp, coins, gems, streak
   - grade, math_level, goal
   - onboarding_completed

2. plans                       # Planes de suscripción
   - id, name, price, currency
   - period, features (JSONB)

3. subscriptions               # Suscripciones activas
   - user_id, plan_id, status
   - provider, provider_subscription_id
   - current_period_start/end

4. payment_transactions        # Historial de pagos
   - user_id, provider, transaction_id
   - amount, currency, status, plan

5. game_sessions               # Partidas jugadas
   - user_id, game_mode, difficulty
   - score, xp_earned, coins_earned
   - questions (JSONB), combo, lives

6. questions                   # Banco de preguntas
   - text, options (JSONB)
   - correct_answer, explanation
   - topic, difficulty, time_limit

7. scans                       # Escaneos de ejercicios
   - user_id, file_url, file_type
   - status, extracted_text
   - detected_topic, generated_questions

8. achievements                # Logros disponibles
   - name, description, icon
   - condition, xp_reward, coins_reward

9. user_achievements           # Logros desbloqueados
   - user_id, achievement_id
   - unlocked_at

10. inventory                  # Items comprados
    - user_id, item_id
    - acquired_at

11. shop_items                 # Catálogo de tienda
    - name, description, icon
    - category, price_coins, price_gems
    - is_premium, rarity

12. teacher_classes            # Clases de profesores
    - teacher_id, name, code
    - grade, student_count

13. class_students             # Estudiantes en clases
    - class_id, student_id
    - joined_at

14. teacher_assignments        # Tareas asignadas
    - class_id, teacher_id
    - title, topic, difficulty
    - due_date, game_mode

15. ai_usage                   # Uso de IA (rate limiting)
    - user_id, type
    - created_at

16. game_stats                 # Estadísticas agregadas
    - user_id, date
    - games_played, total_score
    - total_xp, total_coins

17. missions                   # Misiones disponibles
    - name, description, type
    - target, xp_reward, coins_reward

18. user_missions              # Progreso de misiones
    - user_id, mission_id
    - progress, completed, date

19. notifications              # Notificaciones
    - user_id, title, message
    - type, read, created_at

20. generated_content          # Contenido generado por IA
    - user_id, type, prompt
    - result (JSONB), created_at

21. webhook_events             # Eventos de webhooks (idempotencia)
    - provider, event_id
    - event_type, payload (JSONB)
    - processed, created_at
```

### Tablas Faltantes para "Diseñador de Mundo"
```sql
❌ world_themes                 # Temas de mundo personalizados
❌ world_preferences            # Preferencias de usuario
❌ tokens                       # Sistema de tokens
❌ token_transactions           # Transacciones de tokens
❌ world_minigames              # Mini-juegos generados
❌ world_decorations            # Decoraciones de mundo
```

---

## ⚡ 4. EDGE FUNCTIONS EXISTENTES

### Estado Actual
```
supabase/functions/
└── README.md                   # Solo documentación

NO HAY EDGE FUNCTIONS IMPLEMENTADAS
```

### Edge Functions Necesarias
```sql
❌ generate-world-theme         # Generar tema de mundo
❌ generate-minigame            # Generar mini-juego
❌ apply-world-theme            # Aplicar tema al lobby
❌ get-user-worlds              # Obtener mundos del usuario
❌ expire-world-themes          # Expirar temas después de 3 días
❌ purchase-tokens              # Comprar tokens con gemas
❌ use-token-for-world          # Usar token para intento extra
```

---

## 💎 5. SISTEMA ACTUAL DE PLANES

### Planes Definidos
```typescript
// src/lib/gameEngine.ts - getUserEntitlements()

FREE:
├── canScan: true
├── scanLimit: 3
├── canUseAI: false
├── aiLimit: 0
├── canAccessLegend: false
├── canAccessTeacherTools: false
├── canRemoveAds: false
├── canUseAllSkins: false
├── canAccessPreU: false
├── canAccessSimulations: false
├── canAccessAdvancedStats: false
└── canAccessDuel: false

RUSH:
├── canScan: true
├── scanLimit: 10
├── canUseAI: true
├── aiLimit: 20
├── canRemoveAds: true
└── (resto igual que FREE)

LEGEND:
├── canScan: true
├── scanLimit: 999 (ilimitado)
├── canUseAI: true
├── aiLimit: 999 (ilimitado)
├── canAccessLegend: true
├── canRemoveAds: true
├── canUseAllSkins: true
├── canAccessPreU: true
├── canAccessSimulations: true
├── canAccessAdvancedStats: true
└── canAccessDuel: true

TEACHER:
├── canScan: true
├── scanLimit: 50
├── canUseAI: true
├── aiLimit: 50
├── canAccessTeacherTools: true
├── canRemoveAds: true
└── (resto como FREE)

DEVELOPER:
└── Todos los límites en 9999
```

### Límites de IA Actuales (src/services/ai/AIService.ts)
```typescript
FREE:
├── imagePerDay: 3
├── audioPerDay: 1
└── mascotPerDay: 2

RUSH:
├── imagePerDay: 20
├── audioPerDay: 10
└── mascotPerDay: 15

LEGEND:
├── imagePerDay: 50
├── audioPerDay: 30
└── mascotPerDay: 40

TEACHER:
├── imagePerDay: 100
├── audioPerDay: 50
└── mascotPerDay: 80
```

### Límites Requeridos para "Diseñador de Mundo"
```typescript
FREE:
├── worldAttempts: 2
└── renewal: monthly

RUSH:
├── worldAttempts: 5
└── renewal: weekly (while active)

LEGEND:
├── worldAttempts: 8
└── renewal: weekly (while active)

TEACHER:
├── worldAttempts: 15
└── renewal: weekly (while active)

TOKENS:
├── Other IAs: 1 token = 1 attempt
└── World Designer: 3 tokens = 1 attempt
```

---

## 🪙 6. SISTEMA ACTUAL DE MONEDAS/GEMAS/TOKENS

### Monedas (coins)
```typescript
// src/lib/supabase.ts - Profile interface
coins: number

// Ganancias:
- Partidas completadas
- Logros desbloqueados
- Misiones completadas
- Rachas diarias

// Gastos:
- Tienda (skins, mascotas, fondos, efectos)
```

### Gemas (gems)
```typescript
// src/lib/supabase.ts - Profile interface
gems: number

// Ganancias:
- Logros especiales
- Eventos especiales
- (Posiblemente compras reales)

// Gastos:
- Tienda premium
- (Futuro: tokens)
```

### Tokens
```typescript
❌ NO EXISTEN TODAVÍA

// Necesario crear:
- Tabla: tokens
- Tabla: token_transactions
- Lógica de conversión: gemas → tokens
- Lógica de uso: tokens → intentos extra
```

---

## 🔄 7. QUÉ SE PUEDE REUTILIZAR

### Del Sistema de IA Actual
```typescript
✅ AIService class               # Arquitectura de proveedores
✅ UsageTracker                   # Tracking de uso
✅ PLAN_LIMITS                    # Estructura de límites
✅ MockProvider                   # Para desarrollo
✅ EdgeFunctionProvider           # Para producción
✅ useAI hook                     # Hook de React
✅ GenerationState machine        # Máquina de estados
✅ simulateProgress()             # Animación de progreso
✅ Error handling                 # Manejo de errores
✅ Timeout system                 # Sistema de timeout
✅ Cancelation system             # Sistema de cancelación
```

### Del Laboratorio IA
```typescript
✅ UI de generación               # Interfaz de usuario
✅ Preview system                 # Sistema de preview
✅ History tracking               # Historial de generaciones
✅ Progress animation             # Animación de progreso
✅ Modal system                   # Modales
✅ Card components                # Componentes de tarjeta
```

### Del Sistema de Planes
```typescript
✅ getUserEntitlements()          # Función de permisos
✅ hasFeature()                   # Verificación de features
✅ AuthContext                    # Contexto de autenticación
✅ developerPlan state            # Estado de plan developer
✅ Plan switching                 # Cambio de planes
```

### De la Base de Datos
```typescript
✅ profiles table                 # Tabla de usuarios
✅ ai_usage table                 # Tabla de uso de IA
✅ generated_content table        # Tabla de contenido generado
✅ subscriptions table            # Tabla de suscripciones
✅ RLS policies                   # Políticas de seguridad
```

---

## ❌ 8. QUÉ FALTA

### Base de Datos
```sql
❌ Tabla: world_themes
   - id, user_id, name, theme_data (JSONB)
   - background, colors, decorations (JSONB)
   - minigames (JSONB), created_at, expires_at
   - is_active, is_default

❌ Tabla: world_preferences
   - user_id, current_theme_id
   - preferred_colors (JSONB)
   - preferred_styles (JSONB)
   - last_updated

❌ Tabla: tokens
   - user_id, balance
   - last_updated

❌ Tabla: token_transactions
   - id, user_id, type (purchase/use)
   - amount, reason, created_at
   - related_content_id

❌ Tabla: world_minigames
   - id, world_theme_id, topic
   - questions (JSONB), difficulty
   - created_at

❌ Función SQL: expire_world_themes()
   - Expirar temas después de 3 días
   - Restaurar tema default
```

### Edge Functions
```typescript
❌ generate-world-theme
   - Input: prompt, user preferences
   - Output: theme configuration (JSON)
   - Validar límites por plan
   - Guardar en world_themes

❌ apply-world-theme
   - Input: theme_id, user_id
   - Output: success
   - Actualizar world_preferences
   - Validar expiración

❌ get-user-worlds
   - Input: user_id
   - Output: list of worlds
   - Filtrar expirados

❌ purchase-tokens
   - Input: user_id, gems_amount
   - Output: tokens_purchased
   - Validar saldo de gemas
   - Actualizar tokens y gemas

❌ use-token-for-world
   - Input: user_id, world_theme_id
   - Output: success
   - Validar saldo de tokens
   - Costo: 3 tokens por intento
```

### Frontend
```typescript
❌ Hook: useWorldDesigner
   - generateWorld()
   - applyWorld()
   - getUserWorlds()
   - getWorldLimits()
   - purchaseTokens()
   - useToken()

❌ Componente: WorldDesigner
   - Formulario de personalización
   - Preview en tiempo real
   - Selector de colores
   - Selector de estilos
   - Selector de decoraciones
   - Generador de mini-juegos

❌ Componente: WorldPreview
   - Preview del lobby personalizado
   - Animaciones
   - Decoraciones
   - Mini-juegos disponibles

❌ Componente: TokenManager
   - Saldo de tokens
   - Comprar tokens con gemas
   - Usar tokens para intentos extra
   - Historial de transacciones

❌ Componente: WorldExpiration
   - Countdown de expiración
   - Botón para renovar
   - Opción para restaurar default

❌ Contexto: WorldContext
   - currentTheme state
   - userWorlds state
   - tokens state
   - applyTheme()
   - refreshWorlds()
```

### Integración con Lobby
```typescript
❌ Modificar Lobby.tsx
   - Leer world_preferences
   - Aplicar tema personalizado
   - Mostrar decoraciones
   - Mostrar mini-juegos
   - Countdown de expiración
   - Botón para abrir WorldDesigner

❌ Modificar AppLayout
   - Aplicar colores del tema
   - Aplicar animaciones del tema
   - Aplicar decoraciones
```

### Sistema de Tokens
```typescript
❌ Lógica de conversión
   - 1 token = 1 intento (otras IAs)
   - 3 tokens = 1 intento (Diseñador de Mundo)

❌ UI de tokens
   - Mostrar saldo en header
   - Botón para comprar tokens
   - Confirmación de compra
   - Historial de transacciones

❌ Validaciones
   - Saldo suficiente
   - Límites por plan
   - Expiración de tokens (opcional)
```

### Sistema de Expiración
```typescript
❌ Lógica de expiración
   - Temas expiran después de 3 días
   - Renovación automática si el plan está activo
   - Restaurar tema default al expirar

❌ Edge Function: expire-world-themes
   - Ejecutar cada hora (cron)
   - Marcar temas expirados
   - Restaurar preferencias default

❌ UI de expiración
   - Mostrar tiempo restante
   - Botón para renovar
   - Notificación antes de expirar
```

---

## ⚠️ 9. QUÉ PODRÍA ROMPERSE

### Router
```typescript
⚠️ BrowserRouter vs HashRouter
   - Actualmente usa BrowserRouter
   - GitHub Pages requiere HashRouter
   - NO CAMBIAR TODAVÍA (instrucción del usuario)
   - Pero tener en cuenta para deployment
```

### Sistema de Planes
```typescript
⚠️ getUserEntitlements()
   - Actualmente no incluye límites de "Diseñador de Mundo"
   - Necesita agregar:
     * worldDesignerAttempts
     * worldDesignerRenewal
   - Risk: Bajo (solo agregar campos)
```

### Sistema de IA
```typescript
⚠️ AIService
   - Actualmente tiene 3 proveedores (image, audio, mascot)
   - Necesita agregar: worldDesigner provider
   - Risk: Medio (nueva lógica de generación)

⚠️ UsageTracker
   - Actualmente trackea por día
   - Necesita soportar renovación semanal
   - Risk: Medio (cambiar lógica de reset)
```

### Base de Datos
```typescript
⚠️ Nuevas tablas
   - Necesita migraciones
   - Necesita RLS policies
   - Risk: Bajo (tablas nuevas, no modifica existentes)

⚠️ generated_content
   - Actualmente es genérica
   - Podría usarse para world_themes
   - Risk: Bajo (solo agregar tipo 'world')
```

### Lobby
```typescript
⚠️ Lobby.tsx
   - Actualmente tiene fondo estático
   - Necesita leer world_preferences
   - Necesita aplicar tema dinámicamente
   - Risk: Alto (cambia la UI principal)
   - Mitigación: Hacer cambios incrementales
```

### Performance
```typescript
⚠️ Carga de temas
   - Temas personalizados pueden ser pesados
   - Necesita lazy loading
   - Necesita caché
   - Risk: Medio (performance)
```

### Estado Global
```typescript
⚠️ AuthContext
   - Necesita agregar tokens al Profile
   - Necesita agregar world_preferences
   - Risk: Bajo (solo agregar campos)

⚠️ Nuevo WorldContext
   - Necesita crear contexto nuevo
   - Necesita integrar con AuthContext
   - Risk: Medio (nuevo contexto)
```

---

## 📋 10. PLAN DE IMPLEMENTACIÓN POR FASES

### FASE 1: Base de Datos (1-2 días)
```sql
1.1 Crear tabla: tokens
    - user_id (PK, FK)
    - balance (INTEGER)
    - last_updated (TIMESTAMPTZ)

1.2 Crear tabla: token_transactions
    - id (PK)
    - user_id (FK)
    - type (purchase/use)
    - amount (INTEGER)
    - reason (TEXT)
    - related_content_id (UUID, nullable)
    - created_at (TIMESTAMPTZ)

1.3 Crear tabla: world_themes
    - id (PK)
    - user_id (FK)
    - name (TEXT)
    - theme_data (JSONB)
    - background (JSONB)
    - colors (JSONB)
    - decorations (JSONB)
    - minigames (JSONB)
    - created_at (TIMESTAMPTZ)
    - expires_at (TIMESTAMPTZ)
    - is_active (BOOLEAN)
    - is_default (BOOLEAN)

1.4 Crear tabla: world_preferences
    - user_id (PK, FK)
    - current_theme_id (FK, nullable)
    - preferred_colors (JSONB)
    - preferred_styles (JSONB)
    - last_updated (TIMESTAMPTZ)

1.5 Crear tabla: world_minigames
    - id (PK)
    - world_theme_id (FK)
    - topic (TEXT)
    - questions (JSONB)
    - difficulty (TEXT)
    - created_at (TIMESTAMPTZ)

1.6 Agregar RLS policies
    - Users can view/update own tokens
    - Users can view own transactions
    - Users can view/create own worlds
    - Users can view/update own preferences

1.7 Crear función: expire_world_themes()
    - Marcar temas expirados
    - Restaurar tema default

1.8 Crear índices
    - idx_world_themes_user
    - idx_world_themes_expires
    - idx_token_transactions_user
```

### FASE 2: Edge Functions (2-3 días)
```typescript
2.1 Edge Function: generate-world-theme
    - Validar autenticación
    - Validar límites por plan
    - Llamar proveedor de IA
    - Guardar en world_themes
    - Retornar theme_id

2.2 Edge Function: apply-world-theme
    - Validar autenticación
    - Validar que el tema existe
    - Validar que no está expirado
    - Actualizar world_preferences
    - Retornar success

2.3 Edge Function: get-user-worlds
    - Validar autenticación
    - Consultar world_themes
    - Filtrar expirados
    - Retornar lista

2.4 Edge Function: purchase-tokens
    - Validar autenticación
    - Validar saldo de gemas
    - Calcular tokens a comprar
    - Actualizar tokens y gemas
    - Registrar transacción
    - Retornar tokens_purchased

2.5 Edge Function: use-token-for-world
    - Validar autenticación
    - Validar saldo de tokens
    - Validar que es para Diseñador de Mundo
    - Costo: 3 tokens
    - Actualizar tokens
    - Registrar transacción
    - Retornar success

2.6 Edge Function: expire-world-themes (cron)
    - Ejecutar cada hora
    - Buscar temas expirados
    - Marcar como inactivos
    - Restaurar preferencias default
```

### FASE 3: Frontend - Sistema de Tokens (1-2 días)
```typescript
3.1 Actualizar Profile interface
    - Agregar: tokens: number

3.2 Actualizar AuthContext
    - Cargar tokens desde BD
    - Agregar: purchaseTokens()
    - Agregar: useToken()

3.3 Crear hook: useTokens
    - getBalance()
    - purchaseTokens(gemsAmount)
    - useToken(reason, contentId)
    - getTransactionHistory()

3.4 Crear componente: TokenManager
    - Mostrar saldo
    - Botón para comprar
    - Modal de confirmación
    - Historial de transacciones

3.5 Integrar TokenManager en header
    - Mostrar saldo de tokens
    - Botón para abrir TokenManager
```

### FASE 4: Frontend - Diseñador de Mundo (3-4 días)
```typescript
4.1 Crear hook: useWorldDesigner
    - generateWorld(prompt, options)
    - applyWorld(themeId)
    - getUserWorlds()
    - getWorldLimits()
    - getCurrentTheme()
    - restoreDefault()

4.2 Crear componente: WorldDesigner
    - Formulario de personalización
    - Input de prompt
    - Presets de estilos
    - Selector de colores
    - Selector de decoraciones
    - Preview en tiempo real
    - Botón de generar
    - Mostrar límites y usos

4.3 Crear componente: WorldPreview
    - Preview del lobby personalizado
    - Animaciones del tema
    - Decoraciones
    - Mini-juegos disponibles
    - Countdown de expiración

4.4 Crear componente: WorldExpiration
    - Mostrar tiempo restante
    - Botón para renovar
    - Opción para restaurar default
    - Notificación antes de expirar

4.5 Crear componente: WorldHistory
    - Lista de mundos creados
    - Preview de cada mundo
    - Botón para aplicar
    - Botón para eliminar
    - Mostrar expiración

4.6 Integrar en AiLab.tsx
    - Reemplazar Diseñador de Mundo actual
    - Agregar nueva UI
    - Conectar con hooks
```

### FASE 5: Integración con Lobby (2-3 días)
```typescript
5.1 Crear contexto: WorldContext
    - currentTheme state
    - userWorlds state
    - applyTheme()
    - refreshWorlds()
    - restoreDefault()

5.2 Modificar Lobby.tsx
    - Leer world_preferences
    - Aplicar fondo personalizado
    - Aplicar colores del tema
    - Mostrar decoraciones
    - Mostrar mini-juegos
    - Agregar botón para abrir WorldDesigner
    - Mostrar countdown de expiración

5.3 Modificar AppLayout
    - Leer currentTheme
    - Aplicar colores globales
    - Aplicar animaciones
    - Aplicar decoraciones

5.4 Crear componente: LobbyCustomization
    - Botón para personalizar
    - Preview rápido
    - Acceso rápido a WorldDesigner
```

### FASE 6: Sistema de Expiración (1 día)
```typescript
6.1 Implementar countdown en UI
    - Mostrar tiempo restante
    - Actualizar cada minuto
    - Notificación cuando quede 1 día

6.2 Implementar renovación automática
    - Verificar estado de suscripción
    - Renovar si el plan está activo
    - Notificar al usuario

6.3 Implementar restauración de default
    - Al expirar, restaurar tema default
    - Notificar al usuario
    - Ofrecer opción de renovar
```

### FASE 7: Testing y QA (2 días)
```typescript
7.1 Testing de límites por plan
    - FREE: 2 intentos, renovación mensual
    - RUSH: 5 intentos, renovación semanal
    - LEGEND: 8 intentos, renovación semanal
    - TEACHER: 15 intentos, renovación semanal

7.2 Testing de tokens
    - Compra de tokens con gemas
    - Uso de tokens para intentos extra
    - 3 tokens = 1 intento (Diseñador de Mundo)
    - 1 token = 1 intento (otras IAs)

7.3 Testing de expiración
    - Temas expiran después de 3 días
    - Renovación automática
    - Restauración de default

7.4 Testing de personalización
    - Cambiar fondo
    - Cambiar colores
    - Cambiar decoraciones
    - Crear mini-juegos

7.5 Testing de persistencia
    - Preferencias se guardan
    - Temas se guardan
    - Tokens se guardan
    - Historial se guarda

7.6 Testing de performance
    - Carga de temas
    - Aplicación de temas
    - Animaciones
    - Decoraciones
```

### FASE 8: Documentación (1 día)
```typescript
8.1 Documentar API de Edge Functions
    - Endpoints
    - Parámetros
    - Respuestas
    - Errores

8.2 Documentar sistema de tokens
    - Cómo comprar
    - Cómo usar
    - Conversiones
    - Límites

8.3 Documentar Diseñador de Mundo
    - Cómo usar
    - Límites por plan
    - Expiración
    - Renovación

8.4 Actualizar README.md
    - Nueva funcionalidad
    - Cómo usar
    - Límites
    - Precios (tokens)
```

---

## 📊 RESUMEN EJECUTIVO

### Estado Actual
```
✅ Arquitectura sólida
✅ Sistema de IA funcional
✅ Sistema de planes funcional
✅ Sistema de monedas/gemas funcional
✅ Laboratorio IA funcional
✅ Base de datos bien estructurada
✅ Edge Functions preparadas (documentación)
⚠️ No hay sistema de tokens
⚠️ No hay personalización de lobby
⚠️ No hay expiración de temas
⚠️ No hay mini-juegos generados
```

### Lo que se necesita para "Diseñador de Mundo"
```
❌ 6 tablas nuevas en Supabase
❌ 6 Edge Functions nuevas
❌ 1 hook nuevo (useWorldDesigner)
❌ 1 contexto nuevo (WorldContext)
❌ 5 componentes nuevos
❌ Modificaciones a Lobby.tsx
❌ Modificaciones a AppLayout
❌ Modificaciones a AuthContext
❌ Modificaciones a getUserEntitlements()
```

### Tiempo Estimado
```
Fase 1: Base de Datos          - 1-2 días
Fase 2: Edge Functions         - 2-3 días
Fase 3: Sistema de Tokens      - 1-2 días
Fase 4: Diseñador de Mundo     - 3-4 días
Fase 5: Integración con Lobby  - 2-3 días
Fase 6: Sistema de Expiración  - 1 día
Fase 7: Testing y QA           - 2 días
Fase 8: Documentación          - 1 día

TOTAL: 13-18 días
```

### Riesgos
```
🟢 Bajo: Base de datos, tokens, documentación
🟡 Medio: Edge Functions, sistema de IA, expiración
🔴 Alto: Integración con Lobby (cambia UI principal)
```

### Recomendaciones
```
1. Implementar por fases, no todo de una vez
2. Hacer backup antes de modificar Lobby.tsx
3. Testing exhaustivo en cada fase
4. Documentar cada cambio
5. No modificar el router todavía
6. No cambiar a HashRouter todavía
7. Mantener compatibilidad con modo demo
```

---

## ✅ CONCLUSIÓN

El proyecto Math Rush tiene una arquitectura sólida y bien estructurada. El sistema de IA actual proporciona una base excelente para implementar el "Diseñador de Mundo". Sin embargo, se necesitan:

1. **6 tablas nuevas** en Supabase
2. **6 Edge Functions** nuevas
3. **Sistema de tokens** completo
4. **Componentes frontend** nuevos
5. **Integración con Lobby** (cambio crítico)

El proyecto está listo para comenzar la implementación, pero se recomienda hacerlo por fases para minimizar riesgos y facilitar testing.

**No se ha modificado ningún archivo durante esta auditoría.**

---

**Fecha de Auditoría:** 2024  
**Auditor:** Claude  
**Estado:** ✅ Completo  
**Próximo Paso:** Implementación Fase 1 (Base de Datos)
