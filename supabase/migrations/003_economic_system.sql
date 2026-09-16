-- ============================================================
-- MIGRACIÓN: Sistema Económico Completo
-- ============================================================
-- Fecha: 2024
-- Descripción: Sistema de tres monedas (coins, gems, tokens) con ledger
-- ============================================================

-- ============================================================
-- 1. TABLA: tokens
-- ============================================================
-- Tercera moneda para IA
CREATE TABLE IF NOT EXISTS tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. TABLA: currency_transactions (LEDGER UNIVERSAL)
-- ============================================================
-- Ledger para las tres monedas: coins, gems, tokens
CREATE TABLE IF NOT EXISTS currency_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Tipo de moneda
  currency_type TEXT NOT NULL CHECK (currency_type IN ('coins', 'gems', 'tokens')),
  
  -- Tipo de transacción
  transaction_type TEXT NOT NULL CHECK (transaction_type IN (
    'earn_game',        -- Ganado jugando
    'earn_achievement', -- Ganado por logro
    'earn_streak',      -- Ganado por racha
    'earn_bonus',       -- Bonus promocional
    'earn_purchase',    -- Comprado con dinero real
    'spend_shop',       -- Gastado en tienda
    'spend_ia',         -- Gastado en IA
    'spend_conversion', -- Convertido a otra moneda
    'admin_adjust',     -- Ajuste manual por admin
    'refund',           -- Reembolso
    'initial_grant'     -- Otorgado al registrarse
  )),
  
  -- Cantidad (positivo para entrada, negativo para salida)
  amount INTEGER NOT NULL CHECK (amount != 0),
  
  -- Balance después de la transacción (para auditoría)
  balance_after INTEGER NOT NULL,
  
  -- Motivo/descripción
  reason TEXT NOT NULL,
  
  -- ID del contenido relacionado (si aplica)
  related_content_id UUID,
  related_content_type TEXT CHECK (related_content_type IN (
    'shop_item', 'world_theme', 'minigame', 'ai_generation', 'achievement', NULL
  )),
  
  -- Metadata adicional
  metadata JSONB DEFAULT '{}',
  
  -- ID de idempotencia para prevenir doble consumo
  idempotency_key TEXT UNIQUE,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. TABLA: shop_products
-- ============================================================
-- Productos configurables de la tienda
CREATE TABLE IF NOT EXISTS shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información básica
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('skin', 'pet', 'background', 'effect', 'currency')),
  
  -- Precios en las tres monedas
  price_coins INTEGER NOT NULL DEFAULT 0,
  price_gems INTEGER NOT NULL DEFAULT 0,
  price_tokens INTEGER NOT NULL DEFAULT 0,
  
  -- Contenido del producto
  content JSONB NOT NULL DEFAULT '{}',
  
  -- Estado
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. TABLA: user_purchases
-- ============================================================
-- Historial de compras del usuario
CREATE TABLE IF NOT EXISTS user_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES shop_products(id) ON DELETE CASCADE NOT NULL,
  
  -- Moneda usada para la compra
  currency_type TEXT NOT NULL CHECK (currency_type IN ('coins', 'gems', 'tokens')),
  amount_paid INTEGER NOT NULL,
  
  -- Timestamp
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- ID de idempotencia
  idempotency_key TEXT UNIQUE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- ============================================================
-- ÍNDICES
-- ============================================================

-- Tokens
CREATE INDEX IF NOT EXISTS idx_tokens_user ON tokens(user_id);

-- Currency transactions
CREATE INDEX IF NOT EXISTS idx_currency_transactions_user ON currency_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_currency_transactions_type ON currency_transactions(currency_type);
CREATE INDEX IF NOT EXISTS idx_currency_transactions_created ON currency_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_currency_transactions_idempotency ON currency_transactions(idempotency_key);

-- Shop products
CREATE INDEX IF NOT EXISTS idx_shop_products_category ON shop_products(category);
CREATE INDEX IF NOT EXISTS idx_shop_products_active ON shop_products(is_active);

-- User purchases
CREATE INDEX IF NOT EXISTS idx_user_purchases_user ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_product ON user_purchases(product_id);
CREATE INDEX IF NOT EXISTS idx_user_purchases_idempotency ON user_purchases(idempotency_key);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE currency_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

-- Tokens: usuarios ven sus propios tokens
CREATE POLICY "Users can view own tokens"
  ON tokens FOR SELECT
  USING (auth.uid() = user_id);

-- Currency transactions: usuarios ven sus propias transacciones
CREATE POLICY "Users can view own transactions"
  ON currency_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Shop products: todos pueden ver productos activos
CREATE POLICY "Anyone can view active products"
  ON shop_products FOR SELECT
  USING (is_active = true);

-- User purchases: usuarios ven sus propias compras
CREATE POLICY "Users can view own purchases"
  ON user_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- FUNCIONES AUXILIARES
-- ============================================================

-- Función para obtener balance de una moneda específica
CREATE OR REPLACE FUNCTION get_currency_balance(
  user_uuid UUID,
  currency TEXT
)
RETURNS INTEGER AS $$
DECLARE
  balance_val INTEGER;
BEGIN
  IF currency = 'coins' THEN
    SELECT coins INTO balance_val FROM profiles WHERE id = user_uuid;
  ELSIF currency = 'gems' THEN
    SELECT gems INTO balance_val FROM profiles WHERE id = user_uuid;
  ELSIF currency = 'tokens' THEN
    SELECT balance INTO balance_val FROM tokens WHERE user_id = user_uuid;
    IF balance_val IS NULL THEN
      balance_val := 0;
    END IF;
  ELSE
    RAISE EXCEPTION 'Invalid currency type';
  END IF;
  
  RETURN balance_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para agregar moneda (con ledger)
CREATE OR REPLACE FUNCTION add_currency(
  user_uuid UUID,
  currency TEXT,
  amount INTEGER,
  transaction_type TEXT,
  reason TEXT,
  idempotency_key TEXT DEFAULT NULL,
  related_content_id UUID DEFAULT NULL,
  related_content_type TEXT DEFAULT NULL,
  metadata JSONB DEFAULT '{}'
)
RETURNS INTEGER AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- Verificar idempotencia
  IF idempotency_key IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM currency_transactions 
      WHERE idempotency_key = idempotency_key
    ) THEN
      RAISE EXCEPTION 'Duplicate transaction detected';
    END IF;
  END IF;
  
  -- Validar cantidad
  IF amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  -- Obtener balance actual y actualizar
  IF currency = 'coins' THEN
    UPDATE profiles 
    SET coins = coins + amount, updated_at = now()
    WHERE id = user_uuid
    RETURNING coins INTO new_balance;
    
    current_balance := new_balance - amount;
    
  ELSIF currency = 'gems' THEN
    UPDATE profiles 
    SET gems = gems + amount, updated_at = now()
    WHERE id = user_uuid
    RETURNING gems INTO new_balance;
    
    current_balance := new_balance - amount;
    
  ELSIF currency = 'tokens' THEN
    -- Crear registro de tokens si no existe
    INSERT INTO tokens (user_id, balance)
    VALUES (user_uuid, 0)
    ON CONFLICT (user_id) DO NOTHING;
    
    UPDATE tokens 
    SET balance = balance + amount, last_updated = now()
    WHERE user_id = user_uuid
    RETURNING balance INTO new_balance;
    
    current_balance := new_balance - amount;
    
  ELSE
    RAISE EXCEPTION 'Invalid currency type';
  END IF;
  
  -- Registrar en ledger
  INSERT INTO currency_transactions (
    user_id,
    currency_type,
    transaction_type,
    amount,
    balance_after,
    reason,
    related_content_id,
    related_content_type,
    metadata,
    idempotency_key
  ) VALUES (
    user_uuid,
    currency,
    transaction_type,
    amount,
    new_balance,
    reason,
    related_content_id,
    related_content_type,
    metadata,
    idempotency_key
  );
  
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para gastar moneda (con ledger)
CREATE OR REPLACE FUNCTION spend_currency(
  user_uuid UUID,
  currency TEXT,
  amount INTEGER,
  transaction_type TEXT,
  reason TEXT,
  idempotency_key TEXT DEFAULT NULL,
  related_content_id UUID DEFAULT NULL,
  related_content_type TEXT DEFAULT NULL,
  metadata JSONB DEFAULT '{}'
)
RETURNS INTEGER AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- Verificar idempotencia
  IF idempotency_key IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM currency_transactions 
      WHERE idempotency_key = idempotency_key
    ) THEN
      RAISE EXCEPTION 'Duplicate transaction detected';
    END IF;
  END IF;
  
  -- Validar cantidad
  IF amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  -- Obtener balance actual
  current_balance := get_currency_balance(user_uuid, currency);
  
  -- Verificar saldo suficiente
  IF current_balance < amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Actualizar balance
  IF currency = 'coins' THEN
    UPDATE profiles 
    SET coins = coins - amount, updated_at = now()
    WHERE id = user_uuid
    RETURNING coins INTO new_balance;
    
  ELSIF currency = 'gems' THEN
    UPDATE profiles 
    SET gems = gems - amount, updated_at = now()
    WHERE id = user_uuid
    RETURNING gems INTO new_balance;
    
  ELSIF currency = 'tokens' THEN
    UPDATE tokens 
    SET balance = balance - amount, last_updated = now()
    WHERE user_id = user_uuid
    RETURNING balance INTO new_balance;
    
  ELSE
    RAISE EXCEPTION 'Invalid currency type';
  END IF;
  
  -- Registrar en ledger
  INSERT INTO currency_transactions (
    user_id,
    currency_type,
    transaction_type,
    amount,
    balance_after,
    reason,
    related_content_id,
    related_content_type,
    metadata,
    idempotency_key
  ) VALUES (
    user_uuid,
    currency,
    transaction_type,
    -amount, -- Negativo para gasto
    new_balance,
    reason,
    related_content_id,
    related_content_type,
    metadata,
    idempotency_key
  );
  
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para comprar producto
CREATE OR REPLACE FUNCTION purchase_product(
  user_uuid UUID,
  product_uuid UUID,
  currency TEXT,
  idempotency_key TEXT
)
RETURNS JSONB AS $$
DECLARE
  product_record RECORD;
  price INTEGER;
  new_balance INTEGER;
  purchase_id UUID;
BEGIN
  -- Verificar idempotencia
  IF EXISTS (
    SELECT 1 FROM user_purchases 
    WHERE idempotency_key = idempotency_key
  ) THEN
    RAISE EXCEPTION 'Duplicate purchase detected';
  END IF;
  
  -- Obtener producto
  SELECT * INTO product_record
  FROM shop_products
  WHERE id = product_uuid AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product not found or inactive';
  END IF;
  
  -- Determinar precio según moneda
  IF currency = 'coins' THEN
    price := product_record.price_coins;
  ELSIF currency = 'gems' THEN
    price := product_record.price_gems;
  ELSIF currency = 'tokens' THEN
    price := product_record.price_tokens;
  ELSE
    RAISE EXCEPTION 'Invalid currency type';
  END IF;
  
  IF price <= 0 THEN
    RAISE EXCEPTION 'Product is free or invalid price';
  END IF;
  
  -- Gastar moneda
  new_balance := spend_currency(
    user_uuid,
    currency,
    price,
    'spend_shop',
    'Compra de producto: ' || product_record.name,
    idempotency_key,
    product_uuid,
    'shop_item',
    jsonb_build_object('product_name', product_record.name)
  );
  
  -- Registrar compra
  INSERT INTO user_purchases (
    user_id,
    product_id,
    currency_type,
    amount_paid,
    idempotency_key,
    metadata
  ) VALUES (
    user_uuid,
    product_uuid,
    currency,
    price,
    idempotency_key,
    jsonb_build_object('product_name', product_record.name)
  ) RETURNING id INTO purchase_id;
  
  -- Agregar al inventario si es item
  IF product_record.category IN ('skin', 'pet', 'background', 'effect') THEN
    INSERT INTO inventory (user_id, item_id)
    VALUES (user_uuid, product_uuid::TEXT)
    ON CONFLICT (user_id, item_id) DO NOTHING;
  END IF;
  
  RETURN jsonb_build_object(
    'success', true,
    'purchase_id', purchase_id,
    'new_balance', new_balance,
    'product', jsonb_build_object(
      'id', product_record.id,
      'name', product_record.name,
      'category', product_record.category
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- DATOS INICIALES
-- ============================================================

-- Insertar productos de ejemplo
INSERT INTO shop_products (name, description, category, price_coins, price_gems, price_tokens, content) VALUES
-- Skins
('Cuy Gamer', 'Skin gamer con lentes y audífonos', 'skin', 500, 0, 0, '{"icon": "🐹", "image_url": "..."}'),
('Cuy Dorado', 'Skin dorada legendaria', 'skin', 2000, 50, 0, '{"icon": "🐹", "image_url": "..."}'),
('Cuy Cyberpunk', 'Skin futurista con neón', 'skin', 1500, 30, 0, '{"icon": "🐹", "image_url": "..."}'),
('Cuy Samurai', 'Skin samurái épica', 'skin', 1800, 40, 0, '{"icon": "🐹", "image_url": "..."}'),

-- Mascotas
('Llama Blanca', 'Mascota compañera', 'pet', 800, 0, 0, '{"icon": "🦙", "image_url": "..."}'),
('Cuy Matemático', 'Compañero de estudio', 'pet', 650, 0, 0, '{"icon": "🐹", "image_url": "..."}'),

-- Fondos
('Fondo Espacial', 'Galaxias y planetas matemáticos', 'background', 600, 0, 0, '{"icon": "🌌", "image_url": "..."}'),
('Fondo Neón', 'Estilo cyberpunk con ecuaciones', 'background', 700, 15, 0, '{"icon": "💜", "image_url": "..."}'),
('Fondo Matemático', 'Formas geométricas y ecuaciones', 'background', 550, 0, 0, '{"icon": "📐", "image_url": "..."}'),
('Fondo Naturaleza', 'Bosque educativo', 'background', 500, 0, 0, '{"icon": "🌿", "image_url": "..."}'),
('Fondo Cyberpunk', 'Ciudad futurista', 'background', 750, 20, 0, '{"icon": "🏙️", "image_url": "..."}'),

-- Efectos
('Efecto Rayo', 'Relámpago eléctrico', 'effect', 400, 0, 0, '{"icon": "⚡", "image_url": "..."}'),
('Efecto Partículas', 'Sparkles mágicos', 'effect', 450, 0, 0, '{"icon": "✨", "image_url": "..."}'),
('Efecto Confeti', 'Celebración colorida', 'effect', 500, 0, 0, '{"icon": "🎉", "image_url": "..."}'),
('Explosión Matemática', 'Números y ecuaciones explotando', 'effect', 900, 20, 0, '{"icon": "💥", "image_url": "..."}'),

-- Paquetes de monedas (para compras futuras con dinero real)
('Pack 1000 Monedas', '1000 monedas Rush', 'currency', 0, 0, 0, '{"coins": 1000}'),
('Pack 5000 Monedas', '5000 monedas Rush', 'currency', 0, 0, 0, '{"coins": 5000}'),
('Pack 100 Gemas', '100 gemas premium', 'currency', 0, 0, 0, '{"gems": 100}'),
('Pack 500 Gemas', '500 gemas premium', 'currency', 0, 0, 0, '{"gems": 500}'),
('Pack 50 Tokens', '50 tokens para IA', 'currency', 0, 0, 0, '{"tokens": 50}'),
('Pack 200 Tokens', '200 tokens para IA', 'currency', 0, 0, 0, '{"tokens": 200}');

-- ============================================================
-- COMENTARIOS
-- ============================================================

COMMENT ON TABLE tokens IS 'Balance de tokens del usuario para intentos extra de IA';
COMMENT ON TABLE currency_transactions IS 'Ledger universal para las tres monedas (coins, gems, tokens)';
COMMENT ON TABLE shop_products IS 'Productos configurables de la tienda';
COMMENT ON TABLE user_purchases IS 'Historial de compras del usuario';

COMMENT ON COLUMN currency_transactions.currency_type IS 'Tipo de moneda: coins, gems, tokens';
COMMENT ON COLUMN currency_transactions.transaction_type IS 'Tipo de transacción: earn_*, spend_*, admin_adjust, refund, initial_grant';
COMMENT ON COLUMN currency_transactions.amount IS 'Cantidad (positivo para entrada, negativo para salida)';
COMMENT ON COLUMN currency_transactions.balance_after IS 'Balance después de la transacción para auditoría';
COMMENT ON COLUMN currency_transactions.idempotency_key IS 'Clave única para prevenir doble consumo';

-- ============================================================
-- FIN DE MIGRACIÓN
-- ============================================================
