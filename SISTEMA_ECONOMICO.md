# 💰 Sistema Económico de Math-Rush

## 📊 Resumen Ejecutivo

**Fecha**: 2024  
**Implementación**: Sistema económico completo con tres monedas independientes  
**Estado**: ✅ Completado  
**Archivos creados**: 8

---

## 🎯 Objetivo

Implementar un sistema económico robusto con tres monedas separadas:
1. **Monedas (Coins)** - Moneda principal del juego
2. **Gemas (Gems)** - Moneda premium
3. **Tokens** - Moneda para IA

**REGLA CRÍTICA**: NO mezclar las monedas. Cada una tiene su propósito específico.

---

## 💱 Las Tres Monedas

### 1. Monedas (Coins) 🪙
**Propósito**: Moneda principal del juego
- Se ganan jugando, completando misiones y logros
- Se usan para comprar skins, mascotas, fondos y efectos
- Cantidad inicial: 0
- No tiene límite máximo

**Casos de uso**:
- Comprar items de la tienda (skins, mascotas, etc.)
- Recompensas de juegos
- Logros y misiones

### 2. Gemas (Gems) 💎
**Propósito**: Moneda premium
- Se obtienen mediante logros especiales o compras
- Se usan para items premium y características exclusivas
- Cantidad inicial: 0
- No tiene límite máximo

**Casos de uso**:
- Comprar items premium
- Desbloquear características especiales
- Conversiones futuras (si se implementan)

### 3. Tokens 🎟️
**Propósito**: Moneda exclusiva para IA
- Se usan para intentos extra de IA
- **Regla de conversión**:
  - Otras IAs: 1 token = 1 intento
  - IA Mundo (Diseñador de Mundo): 3 tokens = 1 intento
- Cantidad inicial: 0
- No tiene límite máximo

**Casos de uso**:
- Intentos extra para Diseñador de Mundo (3 tokens)
- Intentos extra para otras IAs (1 token)

---

## 🏗️ Arquitectura del Sistema

### Base de Datos

#### Tabla: `tokens`
```sql
CREATE TABLE tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  last_updated TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);
```

#### Tabla: `currency_transactions` (LEDGER)
```sql
CREATE TABLE currency_transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  currency_type TEXT CHECK (currency_type IN ('coins', 'gems', 'tokens')),
  transaction_type TEXT CHECK (transaction_type IN (...)),
  amount INTEGER NOT NULL CHECK (amount != 0),
  balance_after INTEGER NOT NULL,
  reason TEXT NOT NULL,
  related_content_id UUID,
  related_content_type TEXT,
  metadata JSONB,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ
);
```

#### Tabla: `shop_products`
```sql
CREATE TABLE shop_products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('skin', 'pet', 'background', 'effect', 'currency')),
  price_coins INTEGER NOT NULL DEFAULT 0,
  price_gems INTEGER NOT NULL DEFAULT 0,
  price_tokens INTEGER NOT NULL DEFAULT 0,
  content JSONB,
  is_active BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

#### Tabla: `user_purchases`
```sql
CREATE TABLE user_purchases (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  product_id UUID REFERENCES shop_products(id),
  currency_type TEXT CHECK (currency_type IN ('coins', 'gems', 'tokens')),
  amount_paid INTEGER NOT NULL,
  purchased_at TIMESTAMPTZ,
  idempotency_key TEXT UNIQUE,
  metadata JSONB
);
```

---

## 🔐 Seguridad y Validaciones

### 1. Prevención de Saldo Negativo
```sql
CHECK (balance >= 0)
```
- Todas las tablas de balance tienen CHECK constraint
- Función `spend_currency` verifica saldo antes de gastar
- Error si intenta gastar más de lo disponible

### 2. Prevención de Doble Consumo
```sql
idempotency_key TEXT UNIQUE
```
- Cada transacción tiene una clave de idempotencia única
- Si se intenta procesar la misma transacción dos veces, falla
- Generado por el frontend con UUID v4

### 3. Prevención de Doble Compra
```sql
-- En user_purchases
idempotency_key TEXT UNIQUE

-- En purchase_product function
IF EXISTS (SELECT 1 FROM user_purchases WHERE idempotency_key = idempotency_key) THEN
  RAISE EXCEPTION 'Duplicate purchase detected';
END IF;
```

### 4. Prevención de Replay Attacks
- Cada transacción tiene `idempotency_key` único
- Si se reenvía la misma request, se rechaza
- Clave generada por el frontend para cada intento de compra

### 5. Prevención de Manipulación del Frontend
- **TODAS las operaciones pasan por Edge Functions**
- Frontend NUNCA modifica balances directamente
- Edge Functions usan `SECURITY DEFINER` para ejecutar con privilegios
- Validaciones server-side en todas las operaciones

---

## 🔄 Tipos de Transacciones

### Entradas (amount positivo)
- `earn_game` - Ganado jugando
- `earn_achievement` - Ganado por logro
- `earn_streak` - Ganado por racha
- `earn_bonus` - Bonus promocional
- `earn_purchase` - Comprado con dinero real
- `initial_grant` - Otorgado al registrarse

### Salidas (amount negativo)
- `spend_shop` - Gastado en tienda
- `spend_ia` - Gastado en IA
- `spend_conversion` - Convertido a otra moneda

### Ajustes
- `admin_adjust` - Ajuste manual por admin
- `refund` - Reembolso

---

## 🛠️ Funciones Server-Side

### 1. `get_currency_balance(user_uuid, currency)`
**Propósito**: Obtener balance de una moneda específica
```sql
SELECT get_currency_balance('user-uuid', 'coins');
-- Retorna: 1500
```

### 2. `add_currency(user_uuid, currency, amount, transaction_type, reason, ...)`
**Propósito**: Agregar moneda con registro en ledger
```sql
SELECT add_currency(
  'user-uuid',
  'coins',
  100,
  'earn_game',
  'Recompensa por completar nivel',
  'idempotency-key-123',
  NULL,
  NULL,
  '{}'
);
-- Retorna: nuevo balance
```

### 3. `spend_currency(user_uuid, currency, amount, transaction_type, reason, ...)`
**Propósito**: Gastar moneda con validación de saldo
```sql
SELECT spend_currency(
  'user-uuid',
  'coins',
  50,
  'spend_shop',
  'Compra de skin Cuy Gamer',
  'idempotency-key-456',
  'product-uuid',
  'shop_item',
  '{}'
);
-- Retorna: nuevo balance o error si saldo insuficiente
```

### 4. `purchase_product(user_uuid, product_uuid, currency, idempotency_key)`
**Propósito**: Comprar producto de la tienda
```sql
SELECT purchase_product(
  'user-uuid',
  'product-uuid',
  'coins',
  'idempotency-key-789'
);
-- Retorna: {success: true, new_balance: 1450, product: {...}}
```

---

## 🚀 Edge Functions

### 1. `get-balances`
**Endpoint**: `GET /functions/v1/get-balances`  
**Propósito**: Obtener balances de las tres monedas

**Respuesta**:
```json
{
  "success": true,
  "balances": {
    "coins": 1500,
    "gems": 50,
    "tokens": 15
  }
}
```

### 2. `get-transaction-history`
**Endpoint**: `GET /functions/v1/get-transaction-history`  
**Propósito**: Obtener historial de transacciones

**Parámetros**:
- `currency_type` (opcional): 'coins' | 'gems' | 'tokens'
- `limit` (opcional): número de transacciones (default: 50, max: 100)
- `offset` (opcional): para paginación

**Respuesta**:
```json
{
  "success": true,
  "transactions": [
    {
      "id": "uuid",
      "currency_type": "coins",
      "transaction_type": "earn_game",
      "amount": 100,
      "balance_after": 1500,
      "reason": "Recompensa por completar nivel",
      "created_at": "2024-12-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}
```

### 3. `get-shop-products`
**Endpoint**: `GET /functions/v1/get-shop-products`  
**Propósito**: Obtener productos de la tienda

**Parámetros**:
- `category` (opcional): filtrar por categoría

**Respuesta**:
```json
{
  "success": true,
  "products": [
    {
      "id": "uuid",
      "name": "Cuy Gamer",
      "description": "Skin gamer con lentes y audífonos",
      "category": "skin",
      "price_coins": 500,
      "price_gems": 0,
      "price_tokens": 0,
      "content": {"icon": "🐹", "image_url": "..."},
      "is_premium": false
    }
  ]
}
```

### 4. `purchase-product`
**Endpoint**: `POST /functions/v1/purchase-product`  
**Propósito**: Comprar producto de la tienda

**Payload**:
```json
{
  "product_id": "uuid",
  "currency": "coins",
  "idempotency_key": "uuid-v4"
}
```

**Respuesta exitosa**:
```json
{
  "success": true,
  "new_balance": 1000,
  "product": {
    "id": "uuid",
    "name": "Cuy Gamer",
    "category": "skin"
  }
}
```

**Respuestas de error**:
- `DUPLICATE_PURCHASE` (409): Compra duplicada
- `INSUFFICIENT_BALANCE` (402): Saldo insuficiente
- `PRODUCT_NOT_FOUND` (404): Producto no encontrado
- `PURCHASE_FAILED` (500): Error en la compra

---

## 🎨 UI de la Tienda

### Componente: `CurrencyShop`
**Ruta**: `src/components/CurrencyShop.tsx`

**Características**:
- Tres pestañas: Monedas, Gemas, Tokens
- Muestra saldo actual de cada moneda
- Lista de productos disponibles
- Botón de compra con validación de saldo
- Mensaje de éxito después de comprar
- Manejo de errores
- Información sobre cada moneda

**Flujo de compra**:
1. Usuario selecciona pestaña (coins/gems/tokens)
2. Ve productos disponibles con precios en esa moneda
3. Click en "Comprar"
4. Frontend genera `idempotency_key` (UUID v4)
5. Envía request a Edge Function
6. Edge Function valida y procesa compra
7. Actualiza balance y registra en ledger
8. Frontend muestra mensaje de éxito
9. Actualiza saldo mostrado

---

## 📊 Integración con Sistema Existente

### Tienda de Items (existente)
- Sigue funcionando con monedas
- Ahora usa `purchase_product` en lugar de `updateProfile`
- Todas las compras se registran en ledger

### Diseñador de Mundo (existente)
- Usa tokens para intentos extra
- 3 tokens = 1 intento
- Valida saldo antes de generar
- Registra gasto en ledger

### Otras IAs (existente)
- Usan tokens para intentos extra
- 1 token = 1 intento
- Valida saldo antes de generar
- Registra gasto en ledger

---

## 🛡️ Protecciones Implementadas

### 1. CHECK Constraints
```sql
-- Previene saldo negativo
CHECK (balance >= 0)

-- Previene amount cero
CHECK (amount != 0)
```

### 2. UNIQUE Constraints
```sql
-- Previene doble compra
idempotency_key TEXT UNIQUE

-- Previene múltiples registros de tokens por usuario
user_id UUID UNIQUE
```

### 3. Row Level Security (RLS)
```sql
-- Usuarios solo ven sus propios balances
CREATE POLICY "Users can view own tokens"
  ON tokens FOR SELECT
  USING (auth.uid() = user_id);

-- Usuarios solo ven sus propias transacciones
CREATE POLICY "Users can view own transactions"
  ON currency_transactions FOR SELECT
  USING (auth.uid() = user_id);
```

### 4. SECURITY DEFINER Functions
```sql
-- Funciones se ejecutan con privilegios elevados
CREATE OR REPLACE FUNCTION spend_currency(...)
RETURNS INTEGER AS $$
...
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5. Validaciones Server-Side
```typescript
// En Edge Function
if (current_balance < amount) {
  return new Response(
    JSON.stringify({ error: 'INSUFFICIENT_BALANCE' }),
    { status: 402 }
  );
}
```

---

## 📝 Productos Iniciales

### Skins
- Cuy Gamer: 500 monedas
- Cuy Dorado: 2000 monedas / 50 gemas
- Cuy Cyberpunk: 1500 monedas / 30 gemas
- Cuy Samurai: 1800 monedas / 40 gemas

### Mascotas
- Llama Blanca: 800 monedas
- Cuy Matemático: 650 monedas

### Fondos
- Fondo Espacial: 600 monedas
- Fondo Neón: 700 monedas / 15 gemas
- Fondo Matemático: 550 monedas
- Fondo Naturaleza: 500 monedas
- Fondo Cyberpunk: 750 monedas / 20 gemas

### Efectos
- Efecto Rayo: 400 monedas
- Efecto Partículas: 450 monedas
- Efecto Confeti: 500 monedas
- Explosión Matemática: 900 monedas / 20 gemas

### Paquetes de Moneda (para compras futuras)
- Pack 1000 Monedas
- Pack 5000 Monedas
- Pack 100 Gemas
- Pack 500 Gemas
- Pack 50 Tokens
- Pack 200 Tokens

---

## 🔄 Flujo Completo de Compra

### Ejemplo: Comprar "Cuy Gamer" por 500 monedas

1. **Frontend**:
   - Usuario click en "Comprar"
   - Genera `idempotency_key = uuidv4()`
   - Envía POST a `/functions/v1/purchase-product`
   - Payload: `{product_id, currency: 'coins', idempotency_key}`

2. **Edge Function**:
   - Autentica usuario
   - Valida input
   - Llama a `purchase_product()` RPC

3. **Base de Datos**:
   - Verifica idempotency_key (previene doble compra)
   - Obtiene producto
   - Verifica saldo (500 monedas)
   - Llama a `spend_currency()`
   - Actualiza balance (1500 → 1000)
   - Registra transacción en ledger
   - Registra compra en user_purchases
   - Agrega item a inventory

4. **Respuesta**:
   - Retorna `{success: true, new_balance: 1000, product: {...}}`

5. **Frontend**:
   - Actualiza saldo local
   - Muestra mensaje de éxito
   - Agrega item al inventario

---

## 📊 Ledger y Auditoría

### Ejemplo de Transacciones

```sql
-- Compra de skin
INSERT INTO currency_transactions VALUES (
  'uuid-1',
  'user-uuid',
  'coins',
  'spend_shop',
  -500,  -- Negativo porque es gasto
  1000,  -- Balance después
  'Compra de skin Cuy Gamer',
  'product-uuid',
  'shop_item',
  '{"product_name": "Cuy Gamer"}',
  'idempotency-key-1',
  '2024-12-15T10:00:00Z'
);

-- Recompensa por juego
INSERT INTO currency_transactions VALUES (
  'uuid-2',
  'user-uuid',
  'coins',
  'earn_game',
  100,  -- Positivo porque es ganancia
  1100, -- Balance después
  'Recompensa por completar nivel',
  NULL,
  NULL,
  '{}',
  'idempotency-key-2',
  '2024-12-15T10:05:00Z'
);

-- Uso de token para IA
INSERT INTO currency_transactions VALUES (
  'uuid-3',
  'user-uuid',
  'tokens',
  'spend_ia',
  -3,   -- 3 tokens para Diseñador de Mundo
  12,   -- Balance después
  'Intento extra para Diseñador de Mundo',
  'world-theme-uuid',
  'world_theme',
  '{}',
  'idempotency-key-3',
  '2024-12-15T10:10:00Z'
);
```

### Consulta de Historial
```sql
-- Todas las transacciones de un usuario
SELECT * FROM currency_transactions
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;

-- Solo transacciones de tokens
SELECT * FROM currency_transactions
WHERE user_id = 'user-uuid'
  AND currency_type = 'tokens'
ORDER BY created_at DESC;

-- Total ganado vs gastado
SELECT 
  currency_type,
  SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_earned,
  SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_spent
FROM currency_transactions
WHERE user_id = 'user-uuid'
GROUP BY currency_type;
```

---

## 🎯 Reglas de Negocio

### Tokens para IA
```typescript
// Diseñador de Mundo
const TOKEN_COST_WORLD_DESIGNER = 3;

// Otras IAs (Sintetizador de Audio, Diseñador de Mascota)
const TOKEN_COST_OTHER_IA = 1;
```

### Conversión de Monedas (Futuro)
```typescript
// No implementado aún, pero preparado para:
// 100 monedas = 1 gema
// 10 gemas = 1 token
```

### Límites de Compra (Futuro)
```typescript
// No implementado aún, pero preparado para:
// Límite diario de compras
// Límite mensual de compras
// Verificación de edad para compras reales
```

---

## 📈 Métricas y Analytics

### Consultas Útiles

```sql
-- Productos más vendidos
SELECT 
  p.name,
  COUNT(*) as total_sales,
  SUM(up.amount_paid) as total_revenue
FROM user_purchases up
JOIN shop_products p ON p.id = up.product_id
GROUP BY p.id, p.name
ORDER BY total_sales DESC;

-- Usuarios con más transacciones
SELECT 
  u.nickname,
  COUNT(*) as total_transactions,
  SUM(ABS(ct.amount)) as total_volume
FROM currency_transactions ct
JOIN profiles u ON u.id = ct.user_id
GROUP BY ct.user_id, u.nickname
ORDER BY total_transactions DESC;

-- Ingresos por tipo de moneda
SELECT 
  currency_type,
  COUNT(*) as total_transactions,
  SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_earned,
  SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_spent
FROM currency_transactions
GROUP BY currency_type;
```

---

## ✅ Checklist de Implementación

### Base de Datos
- [x] Tabla `tokens` creada
- [x] Tabla `currency_transactions` creada
- [x] Tabla `shop_products` creada
- [x] Tabla `user_purchases` creada
- [x] Índices creados
- [x] RLS policies creadas
- [x] Funciones auxiliares creadas
- [x] Datos iniciales insertados

### Edge Functions
- [x] `get-balances` creada
- [x] `get-transaction-history` creada
- [x] `get-shop-products` creada
- [x] `purchase-product` creada

### Frontend
- [x] Hook `useEconomy` creado
- [x] Componente `CurrencyShop` creado
- [x] Integración con página de Shop
- [x] Manejo de errores
- [x] Validación de saldo
- [x] Generación de idempotency_key

### Seguridad
- [x] CHECK constraints para saldo negativo
- [x] UNIQUE constraints para idempotency
- [x] RLS policies para aislamiento
- [x] SECURITY DEFINER functions
- [x] Validaciones server-side
- [x] Frontend nunca modifica balances directamente

### Documentación
- [x] Este documento
- [x] Comentarios en código
- [x] Ejemplos de uso
- [x] Flujo completo documentado

---

## 🚀 Próximos Pasos

### Corto Plazo
1. ✅ Integrar con sistema de juegos existente
2. ✅ Agregar recompensas automáticas por juegos
3. ✅ Implementar historial de transacciones en UI
4. ✅ Agregar filtros y búsqueda en historial

### Mediano Plazo
5. ⏭️ Implementar compras con dinero real (Culqi)
6. ⏭️ Agregar sistema de descuentos y promociones
7. ⏭️ Implementar conversiones entre monedas
8. ⏭️ Agregar límites de compra por día/mes

### Largo Plazo
9. ⏭️ Sistema de suscripciones con monedas
10. ⏭️ Marketplace entre usuarios
11. ⏭️ Sistema de regalos
12. ⏭️ Analytics avanzados

---

## 📝 Notas Importantes

### Lo que NO se permite
❌ Frontend modificar balances directamente  
❌ Mezclar monedas (coins ≠ gems ≠ tokens)  
❌ Saldo negativo  
❌ Doble consumo sin idempotency  
❌ Manipulación de precios desde frontend  

### Lo que SÍ se permite
✅ Frontend mostrar balances  
✅ Frontend enviar requests de compra  
✅ Frontend generar idempotency_key  
✅ Edge Functions validar y procesar  
✅ Base de datos registrar todo en ledger  

---

## ✅ Conclusión

El sistema económico de Math-Rush está **completamente implementado** con:

✅ **Tres monedas independientes** (coins, gems, tokens)  
✅ **Ledger completo** para auditoría  
✅ **Edge Functions** para operaciones server-side  
✅ **UI de tienda** con tres secciones  
✅ **Protecciones** contra manipulación  
✅ **Idempotency** para prevenir doble consumo  
✅ **Validaciones** server-side estrictas  
✅ **Documentación** completa  

**El frontend nunca modifica balances directamente. Todas las operaciones pasan por Edge Functions con validaciones server-side.**

---

**Fecha**: 2024  
**Versión**: 1.0  
**Estado**: ✅ Completado y documentado
