# 📊 Migración: Diseñador de Mundo - Documentación

## 📁 Archivos Creados

### 1. Archivo de Migración
- **Ruta**: `supabase/migrations/001_world_designer.sql`
- **Propósito**: Crear todas las tablas, índices, RLS policies y funciones para el Diseñador de Mundo

---

## 🗄️ Tablas Nuevas Creadas (8 tablas)

### 1. `tokens`
**Propósito**: Saldo de tokens del usuario para intentos extra de IA

**Columnas principales**:
- `user_id` (UUID, único) - Referencia a profiles
- `balance` (INTEGER) - Saldo actual de tokens (≥ 0)
- `last_updated` (TIMESTAMPTZ) - Última actualización

**Características**:
- Un registro por usuario
- Balance no puede ser negativo
- Se actualiza automáticamente con triggers

---

### 2. `token_transactions`
**Propósito**: Ledger completo de movimientos de tokens para auditoría

**Columnas principales**:
- `user_id` (UUID) - Referencia a profiles
- `type` (TEXT) - Tipo: purchase, use, bonus, refund, admin_adjust, initial_grant
- `amount` (INTEGER) - Cantidad (positivo o negativo)
- `balance_after` (INTEGER) - Saldo después de la transacción
- `reason` (TEXT) - Motivo de la transacción
- `related_content_id` (UUID, nullable) - ID del contenido relacionado
- `related_content_type` (TEXT, nullable) - Tipo: world_theme, minigame, ai_generation
- `metadata` (JSONB) - Metadata adicional

**Características**:
- Ledger inmutable (solo INSERT)
- Permite auditoría completa
- Rastrea origen de cada token

---

### 3. `world_themes`
**Propósito**: Temas personalizados generados por IA

**Columnas principales**:
- `user_id` (UUID) - Referencia a profiles
- `name` (TEXT) - Nombre del tema
- `prompt` (TEXT) - Prompt original usado
- `background` (JSONB) - Configuración de fondo { url, type, color }
- `colors` (JSONB) - Paleta de colores { primary, secondary, accent, text }
- `decorations` (JSONB) - Array de decoraciones SVG/imagen
- `animations` (JSONB) - Configuración de animaciones
- `ui_config` (JSONB) - Configuración de UI personalizada
- `metadata` (JSONB) - Metadata adicional
- `svg_content` (TEXT) - SVG personalizado si existe
- `activated_at` (TIMESTAMPTZ) - Fecha de activación
- `expires_at` (TIMESTAMPTZ) - Fecha de expiración (3 días)
- `is_active` (BOOLEAN) - Si está activo
- `is_default` (BOOLEAN) - Si es el tema por defecto
- `attempts_used` (INTEGER) - Intentos usados para generar
- `tokens_used` (INTEGER) - Tokens usados para generar

**Características**:
- Almacena configuración visual completa
- Control de expiración (3 días)
- Soporta SVG personalizado
- Metadata flexible con JSONB

---

### 4. `world_preferences`
**Propósito**: Preferencias actuales del usuario y control de intentos

**Columnas principales**:
- `user_id` (UUID, único) - Referencia a profiles
- `current_theme_id` (UUID, nullable) - Tema actualmente activo
- `preferred_colors` (JSONB) - Colores preferidos
- `preferred_styles` (JSONB) - Estilos preferidos
- `preferred_animations` (JSONB) - Animaciones preferidas
- `attempts_used_this_period` (INTEGER) - Intentos usados en período actual
- `period_start` (TIMESTAMPTZ) - Inicio del período
- `period_end` (TIMESTAMPTZ) - Fin del período
- `renewal_type` (TEXT) - monthly o weekly

**Características**:
- Un registro por usuario
- Control de intentos por período
- Renovación automática (semanal/mensual)
- Almacena preferencias aprendidas

---

### 5. `world_minigames`
**Propósito**: Mini-juegos generados dentro de los temas

**Columnas principales**:
- `world_theme_id` (UUID) - Referencia a world_themes
- `user_id` (UUID) - Referencia a profiles
- `name` (TEXT) - Nombre del mini-juego
- `topic` (TEXT) - Tema matemático
- `difficulty` (TEXT) - principiante, basico, intermedio, avanzado
- `questions` (JSONB) - Preguntas generadas
- `visual_config` (JSONB) - Configuración visual
- `metadata` (JSONB) - Metadata adicional
- `is_active` (BOOLEAN) - Si está activo

**Características**:
- Relacionado con un tema específico
- Preguntas almacenadas en JSONB
- Configuración visual flexible
- Cascade delete con tema padre

---

### 6. `ai_memory`
**Propósito**: Memoria de la IA (privada y global)

**Columnas principales**:
- `user_id` (UUID) - Referencia a profiles
- `memory_type` (TEXT) - private o global
- `is_approved` (BOOLEAN) - Solo para memoria global
- `category` (TEXT) - preference, style, feedback, pattern, etc.
- `content` (JSONB) - Contenido de la memoria
- `confidence_score` (DECIMAL 3,2) - Score de confianza (0-1)
- `usage_count` (INTEGER) - Cuántas veces se ha usado
- `last_used_at` (TIMESTAMPTZ) - Última vez usada

**Características**:
- **Memoria privada**: Solo el usuario puede ver
- **Memoria global**: Requiere aprobación de admin
- No se comparte automáticamente información privada
- Score de confianza para priorizar
- Tracking de uso

---

### 7. `ai_feedback`
**Propósito**: Feedback del usuario sobre generaciones de IA

**Columnas principales**:
- `user_id` (UUID) - Referencia a profiles
- `content_type` (TEXT) - world_theme, minigame, ai_generation
- `content_id` (UUID) - ID del contenido
- `rating` (INTEGER) - Rating 1-5
- `comment` (TEXT, nullable) - Comentario opcional
- `metadata` (JSONB) - Metadata adicional

**Características**:
- Rating de 1 a 5 estrellas
- Comentario opcional
- Relacionado con cualquier tipo de contenido
- Útil para mejorar la IA

---

### 8. `world_attempts`
**Propósito**: Registro de intentos de generación

**Columnas principales**:
- `user_id` (UUID) - Referencia a profiles
- `attempt_number` (INTEGER) - Número de intento en el período
- `period_start` (TIMESTAMPTZ) - Inicio del período
- `period_end` (TIMESTAMPTZ) - Fin del período
- `world_theme_id` (UUID, nullable) - Tema generado (si existe)
- `tokens_used` (INTEGER) - Tokens usados
- `metadata` (JSONB) - Metadata adicional

**Características**:
- Registro histórico de intentos
- Control por período
- Rastrea tokens usados
- Relacionado con tema generado

---

## 🔒 Políticas RLS Creadas

### tokens
- ✅ Users can view own tokens
- ✅ Users can update own tokens
- ✅ System can insert tokens

### token_transactions
- ✅ Users can view own token transactions
- ✅ System can insert token transactions

### world_themes
- ✅ Users can view own world themes
- ✅ Users can create own world themes
- ✅ Users can update own world themes
- ✅ Users can delete own world themes

### world_preferences
- ✅ Users can view own world preferences
- ✅ Users can create own world preferences
- ✅ Users can update own world preferences

### world_minigames
- ✅ Users can view own world minigames
- ✅ Users can create own world minigames
- ✅ Users can update own world minigames
- ✅ Users can delete own world minigames

### ai_memory
- ✅ Users can view own private memory
- ✅ Users can view approved global memory
- ✅ Users can create own private memory
- ✅ Users can update own private memory
- ✅ Users can delete own private memory
- ✅ Admins can manage global memory

### ai_feedback
- ✅ Users can view own feedback
- ✅ Users can create feedback
- ✅ Users can update own feedback

### world_attempts
- ✅ Users can view own world attempts
- ✅ System can insert world attempts

---

## 🛠️ Funciones Auxiliares Creadas

### 1. `expire_world_themes()`
**Propósito**: Expirar temas automáticamente después de 3 días

**Retorna**: INTEGER (cantidad de temas expirados)

**Acciones**:
- Desactiva temas expirados
- Restaura preferencias default

**Uso**:
```sql
SELECT expire_world_themes();
```

**Ejecución**: Debe ejecutarse periódicamente (cron job cada hora)

---

### 2. `check_and_renew_attempts(user_uuid UUID)`
**Propósito**: Verificar y renovar período de intentos

**Retorna**: TABLE (can_generate BOOLEAN, attempts_remaining INTEGER, period_end TIMESTAMPTZ)

**Acciones**:
- Obtiene plan del usuario
- Verifica si el período ha expirado
- Renueva automáticamente si es necesario
- Calcula intentos restantes según plan

**Límites por plan**:
- FREE: 2 intentos/mes
- RUSH: 5 intentos/semana
- LEGEND: 8 intentos/semana
- TEACHER: 15 intentos/semana
- DEVELOPER: 9999 intentos (ilimitado)

**Uso**:
```sql
SELECT * FROM check_and_renew_attempts('user-uuid-here');
```

---

### 3. `use_tokens(user_uuid UUID, amount INTEGER, reason TEXT, content_id UUID, content_type TEXT)`
**Propósito**: Usar tokens para intento extra

**Retorna**: BOOLEAN (éxito o fracaso)

**Acciones**:
- Verifica saldo suficiente
- Deduce tokens
- Registra transacción en ledger

**Uso**:
```sql
SELECT use_tokens(
  'user-uuid-here',
  3,  -- 3 tokens para Diseñador de Mundo
  'Intento extra para generar tema',
  'theme-uuid-here',
  'world_theme'
);
```

**Costos**:
- Otras IAs: 1 token = 1 intento
- Diseñador de Mundo: 3 tokens = 1 intento

---

### 4. `purchase_tokens_with_gems(user_uuid UUID, gems_amount INTEGER)`
**Propósito**: Comprar tokens con gemas

**Retorna**: TABLE (success BOOLEAN, tokens_purchased INTEGER, new_token_balance INTEGER, new_gem_balance INTEGER)

**Acciones**:
- Verifica saldo de gemas
- Calcula tokens a comprar (10 gemas = 1 token)
- Deduce gemas
- Agrega tokens
- Registra transacción

**Uso**:
```sql
SELECT * FROM purchase_tokens_with_gems('user-uuid-here', 100);
-- Retorna: (TRUE, 10, 10, 0) - 10 tokens comprados con 100 gemas
```

**Tasa de cambio**: 10 gemas = 1 token (ajustable)

---

### 5. `register_world_attempt(user_uuid UUID, world_theme_uuid UUID, tokens_used_amount INTEGER)`
**Propósito**: Registrar intento de generación

**Retorna**: INTEGER (número de intento en el período)

**Acciones**:
- Cuenta intentos en período actual
- Registra intento
- Actualiza contador en preferencias

**Uso**:
```sql
SELECT register_world_attempt(
  'user-uuid-here',
  'theme-uuid-here',
  3  -- tokens usados
);
```

---

## 🔄 Triggers Creados

Todos los triggers actualizan automáticamente la columna `updated_at`:

1. `update_tokens_updated_at` - tokens
2. `update_world_themes_updated_at` - world_themes
3. `update_world_preferences_updated_at` - world_preferences
4. `update_world_minigames_updated_at` - world_minigames
5. `update_ai_memory_updated_at` - ai_memory

---

## 📊 Índices Creados

### tokens
- `idx_tokens_user` - user_id

### token_transactions
- `idx_token_transactions_user` - user_id
- `idx_token_transactions_created` - created_at DESC
- `idx_token_transactions_type` - type

### world_themes
- `idx_world_themes_user` - user_id
- `idx_world_themes_expires` - expires_at
- `idx_world_themes_active` - is_active
- `idx_world_themes_user_active` - (user_id, is_active)

### world_preferences
- `idx_world_preferences_user` - user_id

### world_minigames
- `idx_world_minigames_theme` - world_theme_id
- `idx_world_minigames_user` - user_id

### ai_memory
- `idx_ai_memory_user` - user_id
- `idx_ai_memory_type` - memory_type
- `idx_ai_memory_approved` - is_approved (WHERE memory_type = 'global')
- `idx_ai_memory_category` - category

### ai_feedback
- `idx_ai_feedback_user` - user_id
- `idx_ai_feedback_content` - (content_type, content_id)

### world_attempts
- `idx_world_attempts_user` - user_id
- `idx_world_attempts_period` - (period_start, period_end)

---

## 🧪 Cómo Probar las Migraciones

### 1. Ejecutar la Migración en Supabase

```bash
# Opción 1: Via Supabase Dashboard
# 1. Ir a SQL Editor en Supabase Dashboard
# 2. Copiar contenido de supabase/migrations/001_world_designer.sql
# 3. Ejecutar el SQL

# Opción 2: Via Supabase CLI (si está instalado)
supabase db push
```

### 2. Verificar que las Tablas se Crearon

```sql
-- Ver todas las tablas nuevas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'tokens',
    'token_transactions',
    'world_themes',
    'world_preferences',
    'world_minigames',
    'ai_memory',
    'ai_feedback',
    'world_attempts'
  );
```

### 3. Verificar que las Políticas RLS se Crearon

```sql
-- Ver políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN (
  'tokens',
  'token_transactions',
  'world_themes',
  'world_preferences',
  'world_minigames',
  'ai_memory',
  'ai_feedback',
  'world_attempts'
);
```

### 4. Verificar que las Funciones se Crearon

```sql
-- Ver funciones
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'expire_world_themes',
    'check_and_renew_attempts',
    'use_tokens',
    'purchase_tokens_with_gems',
    'register_world_attempt'
  );
```

### 5. Probar Funciones con Datos de Ejemplo

#### Crear usuario de prueba
```sql
-- Asumiendo que ya tienes un usuario en profiles
-- Si no, crear uno de prueba:
INSERT INTO profiles (id, email, nickname, role, gems)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test@example.com',
  'TestUser',
  'student',
  500  -- 500 gemas para probar
);
```

#### Probar compra de tokens
```sql
-- Comprar 10 tokens con 100 gemas
SELECT * FROM purchase_tokens_with_gems(
  '00000000-0000-0000-0000-000000000001',
  100
);

-- Verificar saldo
SELECT * FROM tokens WHERE user_id = '00000000-0000-0000-0000-000000000001';
SELECT gems FROM profiles WHERE id = '00000000-0000-0000-0000-000000000001';

-- Ver transacción
SELECT * FROM token_transactions 
WHERE user_id = '00000000-0000-0000-0000-000000000001'
ORDER BY created_at DESC;
```

#### Probar uso de tokens
```sql
-- Usar 3 tokens para un intento
SELECT use_tokens(
  '00000000-0000-0000-0000-000000000001',
  3,
  'Intento extra para generar tema',
  NULL,
  NULL
);

-- Verificar saldo actualizado
SELECT * FROM tokens WHERE user_id = '00000000-0000-0000-0000-000000000001';
```

#### Probar verificación de intentos
```sql
-- Verificar intentos disponibles
SELECT * FROM check_and_renew_attempts(
  '00000000-0000-0000-0000-000000000001'
);
```

#### Probar creación de tema
```sql
-- Crear un tema de ejemplo
INSERT INTO world_themes (
  user_id,
  name,
  prompt,
  background,
  colors,
  expires_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Espacio Matemático',
  'Un mundo espacial con planetas matemáticos',
  '{"url": "space-bg.jpg", "type": "image", "color": "#0f0a1e"}',
  '{"primary": "#f97316", "secondary": "#8b5cf6", "accent": "#fbbf24", "text": "#ffffff"}',
  now() + INTERVAL '3 days'
) RETURNING *;
```

#### Probar expiración de temas
```sql
-- Crear tema expirado
INSERT INTO world_themes (
  user_id,
  name,
  prompt,
  background,
  colors,
  expires_at,
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Tema Expirado',
  'Este tema ya expiró',
  '{}',
  '{}',
  now() - INTERVAL '1 day',  -- Expirado ayer
  true
);

-- Ejecutar función de expiración
SELECT expire_world_themes();

-- Verificar que se desactivó
SELECT id, name, is_active, expires_at 
FROM world_themes 
WHERE name = 'Tema Expirado';
```

#### Probar memoria
```sql
-- Crear memoria privada
INSERT INTO ai_memory (
  user_id,
  memory_type,
  category,
  content
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'private',
  'preference',
  '{"style": "cyberpunk", "colors": ["#f97316", "#8b5cf6"]}'
);

-- Crear memoria global (requiere aprobación)
INSERT INTO ai_memory (
  user_id,
  memory_type,
  is_approved,
  category,
  content
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'global',
  false,  -- Pendiente de aprobación
  'pattern',
  '{"pattern": "users_prefer_cyberpunk", "confidence": 0.85}'
);

-- Ver memoria privada
SELECT * FROM ai_memory 
WHERE user_id = '00000000-0000-0000-0000-000000000001' 
  AND memory_type = 'private';

-- Aprobar memoria global (como admin)
UPDATE ai_memory 
SET is_approved = true 
WHERE memory_type = 'global' 
  AND id = 'uuid-de-la-memoria-global';
```

#### Probar feedback
```sql
-- Crear feedback
INSERT INTO ai_feedback (
  user_id,
  content_type,
  content_id,
  rating,
  comment
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'world_theme',
  'uuid-del-tema',
  5,
  '¡Me encanta este tema!'
);

-- Ver feedback
SELECT * FROM ai_feedback 
WHERE user_id = '00000000-0000-0000-0000-000000000001';
```

### 6. Limpiar Datos de Prueba

```sql
-- Eliminar datos de prueba
DELETE FROM ai_feedback WHERE user_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM ai_memory WHERE user_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM world_attempts WHERE user_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM world_minigames WHERE user_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM world_themes WHERE user_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM world_preferences WHERE user_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM token_transactions WHERE user_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM tokens WHERE user_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM profiles WHERE id = '00000000-0000-0000-0000-000000000001';
```

---

## 📋 Checklist de Verificación

### ✅ Tablas Creadas
- [ ] tokens
- [ ] token_transactions
- [ ] world_themes
- [ ] world_preferences
- [ ] world_minigames
- [ ] ai_memory
- [ ] ai_feedback
- [ ] world_attempts

### ✅ RLS Habilitado
- [ ] tokens
- [ ] token_transactions
- [ ] world_themes
- [ ] world_preferences
- [ ] world_minigames
- [ ] ai_memory
- [ ] ai_feedback
- [ ] world_attempts

### ✅ Políticas RLS Creadas
- [ ] 3 políticas para tokens
- [ ] 2 políticas para token_transactions
- [ ] 4 políticas para world_themes
- [ ] 3 políticas para world_preferences
- [ ] 4 políticas para world_minigames
- [ ] 6 políticas para ai_memory
- [ ] 3 políticas para ai_feedback
- [ ] 2 políticas para world_attempts

### ✅ Funciones Creadas
- [ ] expire_world_themes()
- [ ] check_and_renew_attempts()
- [ ] use_tokens()
- [ ] purchase_tokens_with_gems()
- [ ] register_world_attempt()

### ✅ Triggers Creados
- [ ] update_tokens_updated_at
- [ ] update_world_themes_updated_at
- [ ] update_world_preferences_updated_at
- [ ] update_world_minigames_updated_at
- [ ] update_ai_memory_updated_at

### ✅ Índices Creados
- [ ] 1 índice para tokens
- [ ] 3 índices para token_transactions
- [ ] 4 índices para world_themes
- [ ] 1 índice para world_preferences
- [ ] 2 índices para world_minigames
- [ ] 4 índices para ai_memory
- [ ] 2 índices para ai_feedback
- [ ] 2 índices para world_attempts

---

## 🔐 Seguridad

### Aislamiento de Usuarios
- ✅ Todas las tablas tienen RLS habilitado
- ✅ Usuarios solo pueden ver sus propios datos
- ✅ Memoria privada no se comparte automáticamente
- ✅ Memoria global requiere aprobación de admin

### Validación en Backend
- ✅ No se confía en el frontend para:
  - Número de intentos
  - Saldo de tokens
  - Plan del usuario
  - Expiraciones
  - Compras

### Ledger Completo
- ✅ Todas las transacciones de tokens se registran
- ✅ Balance after se guarda para auditoría
- ✅ Metadata flexible para tracking adicional
- ✅ Solo INSERT, nunca UPDATE/DELETE en transacciones

---

## 📝 Notas Importantes

1. **No se modificaron tablas existentes**: Todas las tablas nuevas son independientes
2. **Reutiliza tablas existentes**: Usa `profiles` y `subscriptions` existentes
3. **RLS estricto**: Cada usuario solo ve sus propios datos
4. **Ledger inmutable**: Las transacciones de tokens solo se insertan, nunca se modifican
5. **Memoria separada**: Privada vs Global, sin compartir automáticamente
6. **Expiración automática**: Los temas expiran después de 3 días
7. **Renovación automática**: Los intentos se renuevan según el plan
8. **Funciones SECURITY DEFINER**: Las funciones críticas se ejecutan con privilegios elevados

---

## 🚀 Próximos Pasos

Después de ejecutar esta migración:

1. ✅ Verificar que todas las tablas se crearon correctamente
2. ✅ Verificar que las políticas RLS están activas
3. ✅ Probar las funciones con datos de ejemplo
4. ✅ Implementar Edge Functions para consumir estas tablas
5. ✅ Implementar frontend para interactuar con el sistema
6. ✅ Configurar cron job para `expire_world_themes()`

---

**Fecha de creación**: 2024  
**Versión**: 1.0  
**Estado**: ✅ Listo para ejecutar en Supabase
