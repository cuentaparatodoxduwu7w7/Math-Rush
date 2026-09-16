-- ============================================================
-- MIGRACIÓN: Diseñador de Mundo - IA
-- ============================================================
-- Fecha: 2024
-- Descripción: Sistema completo para personalización de lobby con IA
-- ============================================================

-- ============================================================
-- 1. TABLA: tokens
-- ============================================================
-- Saldo de tokens del usuario para intentos extra de IA
CREATE TABLE IF NOT EXISTS tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. TABLA: token_transactions
-- ============================================================
-- Ledger completo de movimientos de tokens para auditoría
CREATE TABLE IF NOT EXISTS token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'purchase',      -- Compra con gemas
    'use',           -- Uso para intento extra
    'bonus',         -- Bonus (promoción, logro, etc.)
    'refund',        -- Reembolso
    'admin_adjust',  -- Ajuste manual por admin
    'initial_grant'  -- Tokens iniciales al registrarse
  )),
  amount INTEGER NOT NULL CHECK (amount != 0),
  balance_after INTEGER NOT NULL,
  reason TEXT NOT NULL,
  related_content_id UUID, -- ID del tema/contenido relacionado
  related_content_type TEXT CHECK (related_content_type IN ('world_theme', 'minigame', 'ai_generation', NULL)),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. TABLA: world_themes
-- ============================================================
-- Temas personalizados generados por IA
CREATE TABLE IF NOT EXISTS world_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  
  -- Configuración visual
  background JSONB NOT NULL DEFAULT '{}', -- { url, type, color }
  colors JSONB NOT NULL DEFAULT '{}', -- { primary, secondary, accent, text }
  decorations JSONB DEFAULT '[]', -- Array de decoraciones SVG/imagen
  animations JSONB DEFAULT '{}', -- Configuración de animaciones
  
  -- UI y metadata
  ui_config JSONB DEFAULT '{}', -- Configuración de UI personalizada
  metadata JSONB DEFAULT '{}', -- Metadata adicional
  
  -- SVG personalizado si existe
  svg_content TEXT,
  
  -- Control de tiempo
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  
  -- Intentos usados
  attempts_used INTEGER NOT NULL DEFAULT 1,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. TABLA: world_preferences
-- ============================================================
-- Preferencias actuales del usuario
CREATE TABLE IF NOT EXISTS world_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_theme_id UUID REFERENCES world_themes(id) ON DELETE SET NULL,
  
  -- Preferencias guardadas
  preferred_colors JSONB DEFAULT '{}',
  preferred_styles JSONB DEFAULT '{}',
  preferred_animations JSONB DEFAULT '{}',
  
  -- Intentos y renovación
  attempts_used_this_period INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '1 month'),
  renewal_type TEXT NOT NULL DEFAULT 'monthly' CHECK (renewal_type IN ('monthly', 'weekly')),
  
  -- Timestamps
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. TABLA: world_minigames
-- ============================================================
-- Mini-juegos generados dentro de los temas
CREATE TABLE IF NOT EXISTS world_minigames (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_theme_id UUID REFERENCES world_themes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Configuración del mini-juego
  name TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('principiante', 'basico', 'intermedio', 'avanzado')),
  
  -- Preguntas generadas
  questions JSONB NOT NULL DEFAULT '[]',
  
  -- Configuración visual
  visual_config JSONB DEFAULT '{}',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Estado
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. TABLA: ai_memory
-- ============================================================
-- Memoria de la IA (privada del usuario y global aprobada)
CREATE TABLE IF NOT EXISTS ai_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Tipo de memoria
  memory_type TEXT NOT NULL CHECK (memory_type IN ('private', 'global')),
  is_approved BOOLEAN NOT NULL DEFAULT false, -- Solo para memoria global
  
  -- Contenido
  category TEXT NOT NULL, -- 'preference', 'style', 'feedback', 'pattern', etc.
  content JSONB NOT NULL,
  
  -- Metadata
  confidence_score DECIMAL(3,2) DEFAULT 1.00 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  usage_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ
);

-- ============================================================
-- 7. TABLA: ai_feedback
-- ============================================================
-- Feedback del usuario sobre generaciones de IA
CREATE TABLE IF NOT EXISTS ai_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Contenido relacionado
  content_type TEXT NOT NULL CHECK (content_type IN ('world_theme', 'minigame', 'ai_generation')),
  content_id UUID NOT NULL,
  
  -- Feedback
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 8. TABLA: world_attempts
-- ============================================================
-- Registro de intentos de generación
CREATE TABLE IF NOT EXISTS world_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Intento
  attempt_number INTEGER NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  -- Resultado
  world_theme_id UUID REFERENCES world_themes(id) ON DELETE SET NULL,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================

-- Tokens
CREATE INDEX IF NOT EXISTS idx_tokens_user ON tokens(user_id);

-- Token transactions
CREATE INDEX IF NOT EXISTS idx_token_transactions_user ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created ON token_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_transactions_type ON token_transactions(type);

-- World themes
CREATE INDEX IF NOT EXISTS idx_world_themes_user ON world_themes(user_id);
CREATE INDEX IF NOT EXISTS idx_world_themes_expires ON world_themes(expires_at);
CREATE INDEX IF NOT EXISTS idx_world_themes_active ON world_themes(is_active);
CREATE INDEX IF NOT EXISTS idx_world_themes_user_active ON world_themes(user_id, is_active);

-- World preferences
CREATE INDEX IF NOT EXISTS idx_world_preferences_user ON world_preferences(user_id);

-- World minigames
CREATE INDEX IF NOT EXISTS idx_world_minigames_theme ON world_minigames(world_theme_id);
CREATE INDEX IF NOT EXISTS idx_world_minigames_user ON world_minigames(user_id);

-- AI memory
CREATE INDEX IF NOT EXISTS idx_ai_memory_user ON ai_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_memory_type ON ai_memory(memory_type);
CREATE INDEX IF NOT EXISTS idx_ai_memory_approved ON ai_memory(is_approved) WHERE memory_type = 'global';
CREATE INDEX IF NOT EXISTS idx_ai_memory_category ON ai_memory(category);

-- AI feedback
CREATE INDEX IF NOT EXISTS idx_ai_feedback_user ON ai_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_content ON ai_feedback(content_type, content_id);

-- World attempts
CREATE INDEX IF NOT EXISTS idx_world_attempts_user ON world_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_world_attempts_period ON world_attempts(period_start, period_end);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilitar RLS en todas las tablas nuevas
ALTER TABLE tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_minigames ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_attempts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLÍTICAS RLS: tokens
-- ============================================================

-- Usuarios pueden ver sus propios tokens
CREATE POLICY "Users can view own tokens"
  ON tokens FOR SELECT
  USING (auth.uid() = user_id);

-- Usuarios pueden actualizar sus propios tokens (solo via funciones)
CREATE POLICY "Users can update own tokens"
  ON tokens FOR UPDATE
  USING (auth.uid() = user_id);

-- Solo el sistema puede insertar tokens (via Edge Functions)
CREATE POLICY "System can insert tokens"
  ON tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- POLÍTICAS RLS: token_transactions
-- ============================================================

-- Usuarios pueden ver sus propias transacciones
CREATE POLICY "Users can view own token transactions"
  ON token_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Solo el sistema puede insertar transacciones (via Edge Functions)
CREATE POLICY "System can insert token transactions"
  ON token_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- POLÍTICAS RLS: world_themes
-- ============================================================

-- Usuarios pueden ver sus propios temas
CREATE POLICY "Users can view own world themes"
  ON world_themes FOR SELECT
  USING (auth.uid() = user_id);

-- Usuarios pueden crear sus propios temas
CREATE POLICY "Users can create own world themes"
  ON world_themes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuarios pueden actualizar sus propios temas
CREATE POLICY "Users can update own world themes"
  ON world_themes FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuarios pueden eliminar sus propios temas
CREATE POLICY "Users can delete own world themes"
  ON world_themes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- POLÍTICAS RLS: world_preferences
-- ============================================================

-- Usuarios pueden ver sus propias preferencias
CREATE POLICY "Users can view own world preferences"
  ON world_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Usuarios pueden crear sus propias preferencias
CREATE POLICY "Users can create own world preferences"
  ON world_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuarios pueden actualizar sus propias preferencias
CREATE POLICY "Users can update own world preferences"
  ON world_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- POLÍTICAS RLS: world_minigames
-- ============================================================

-- Usuarios pueden ver sus propios mini-juegos
CREATE POLICY "Users can view own world minigames"
  ON world_minigames FOR SELECT
  USING (auth.uid() = user_id);

-- Usuarios pueden crear sus propios mini-juegos
CREATE POLICY "Users can create own world minigames"
  ON world_minigames FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuarios pueden actualizar sus propios mini-juegos
CREATE POLICY "Users can update own world minigames"
  ON world_minigames FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuarios pueden eliminar sus propios mini-juegos
CREATE POLICY "Users can delete own world minigames"
  ON world_minigames FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- POLÍTICAS RLS: ai_memory
-- ============================================================

-- Usuarios pueden ver su propia memoria privada
CREATE POLICY "Users can view own private memory"
  ON ai_memory FOR SELECT
  USING (auth.uid() = user_id AND memory_type = 'private');

-- Usuarios pueden ver memoria global aprobada
CREATE POLICY "Users can view approved global memory"
  ON ai_memory FOR SELECT
  USING (memory_type = 'global' AND is_approved = true);

-- Usuarios pueden crear su propia memoria privada
CREATE POLICY "Users can create own private memory"
  ON ai_memory FOR INSERT
  WITH CHECK (auth.uid() = user_id AND memory_type = 'private');

-- Usuarios pueden actualizar su propia memoria privada
CREATE POLICY "Users can update own private memory"
  ON ai_memory FOR UPDATE
  USING (auth.uid() = user_id AND memory_type = 'private');

-- Usuarios pueden eliminar su propia memoria privada
CREATE POLICY "Users can delete own private memory"
  ON ai_memory FOR DELETE
  USING (auth.uid() = user_id AND memory_type = 'private');

-- Solo admins pueden aprobar memoria global
CREATE POLICY "Admins can manage global memory"
  ON ai_memory FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'developer')
    )
  );

-- ============================================================
-- POLÍTICAS RLS: ai_feedback
-- ============================================================

-- Usuarios pueden ver su propio feedback
CREATE POLICY "Users can view own feedback"
  ON ai_feedback FOR SELECT
  USING (auth.uid() = user_id);

-- Usuarios pueden crear feedback
CREATE POLICY "Users can create feedback"
  ON ai_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuarios pueden actualizar su propio feedback
CREATE POLICY "Users can update own feedback"
  ON ai_feedback FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================
-- POLÍTICAS RLS: world_attempts
-- ============================================================

-- Usuarios pueden ver sus propios intentos
CREATE POLICY "Users can view own world attempts"
  ON world_attempts FOR SELECT
  USING (auth.uid() = user_id);

-- Solo el sistema puede insertar intentos (via Edge Functions)
CREATE POLICY "System can insert world attempts"
  ON world_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- FUNCIONES AUXILIARES
-- ============================================================

-- Función para expirar temas automáticamente
CREATE OR REPLACE FUNCTION expire_world_themes()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  -- Desactivar temas expirados
  UPDATE world_themes
  SET is_active = false,
      updated_at = now()
  WHERE expires_at < now()
    AND is_active = true;
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  
  -- Restaurar preferencias default para usuarios con tema expirado
  UPDATE world_preferences wp
  SET current_theme_id = NULL,
      last_updated = now()
  FROM world_themes wt
  WHERE wp.current_theme_id = wt.id
    AND wt.expires_at < now()
    AND wt.is_active = false;
  
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar y renovar período de intentos
CREATE OR REPLACE FUNCTION check_and_renew_attempts(user_uuid UUID)
RETURNS TABLE (
  can_generate BOOLEAN,
  attempts_remaining INTEGER,
  period_end TIMESTAMPTZ
) AS $$
DECLARE
  user_plan TEXT;
  max_attempts INTEGER;
  current_attempts INTEGER;
  current_period_end TIMESTAMPTZ;
  renewal_type TEXT;
BEGIN
  -- Obtener plan del usuario
  SELECT p.plan_id, s.current_period_end
  INTO user_plan, current_period_end
  FROM subscriptions s
  JOIN profiles p ON p.id = s.user_id
  WHERE s.user_id = user_uuid
    AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  -- Si no tiene suscripción activa, usar FREE
  IF user_plan IS NULL THEN
    user_plan := 'free';
    current_period_end := now() + INTERVAL '1 month';
  END IF;
  
  -- Obtener preferencias del usuario
  SELECT attempts_used_this_period, period_end, renewal_type
  INTO current_attempts, current_period_end, renewal_type
  FROM world_preferences
  WHERE user_id = user_uuid;
  
  -- Si no existe, crear registro inicial
  IF NOT FOUND THEN
    INSERT INTO world_preferences (user_id, renewal_type, period_end)
    VALUES (user_uuid, 'monthly', now() + INTERVAL '1 month')
    RETURNING attempts_used_this_period, period_end, renewal_type
    INTO current_attempts, current_period_end, renewal_type;
  END IF;
  
  -- Verificar si el período ha expirado y renovar
  IF current_period_end < now() THEN
    UPDATE world_preferences
    SET attempts_used_this_period = 0,
        period_start = now(),
        period_end = CASE 
          WHEN renewal_type = 'weekly' THEN now() + INTERVAL '1 week'
          ELSE now() + INTERVAL '1 month'
        END,
        last_updated = now()
    WHERE user_id = user_uuid
    RETURNING period_end INTO current_period_end;
    
    current_attempts := 0;
  END IF;
  
  -- Determinar límite de intentos según plan
  max_attempts := CASE user_plan
    WHEN 'free' THEN 2
    WHEN 'rush' THEN 5
    WHEN 'legend' THEN 8
    WHEN 'teacher' THEN 15
    ELSE 2
  END;
  
  -- Developer tiene intentos ilimitados
  IF EXISTS (SELECT 1 FROM profiles WHERE id = user_uuid AND role = 'developer') THEN
    max_attempts := 9999;
  END IF;
  
  -- Retornar resultado
  RETURN QUERY SELECT
    (current_attempts < max_attempts),
    (max_attempts - current_attempts),
    current_period_end;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para usar tokens
CREATE OR REPLACE FUNCTION use_tokens(
  user_uuid UUID,
  amount INTEGER,
  reason TEXT,
  content_id UUID DEFAULT NULL,
  content_type TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance INTEGER;
  new_balance INTEGER;
BEGIN
  -- Obtener saldo actual
  SELECT balance INTO current_balance
  FROM tokens
  WHERE user_id = user_uuid;
  
  -- Si no existe, crear con saldo 0
  IF NOT FOUND THEN
    INSERT INTO tokens (user_id, balance)
    VALUES (user_uuid, 0)
    RETURNING balance INTO current_balance;
  END IF;
  
  -- Verificar si hay suficientes tokens
  IF current_balance < amount THEN
    RETURN FALSE;
  END IF;
  
  -- Actualizar saldo
  new_balance := current_balance - amount;
  
  UPDATE tokens
  SET balance = new_balance,
      last_updated = now()
  WHERE user_id = user_uuid;
  
  -- Registrar transacción
  INSERT INTO token_transactions (
    user_id,
    type,
    amount,
    balance_after,
    reason,
    related_content_id,
    related_content_type
  ) VALUES (
    user_uuid,
    'use',
    -amount,
    new_balance,
    reason,
    content_id,
    content_type
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para comprar tokens con gemas
CREATE OR REPLACE FUNCTION purchase_tokens_with_gems(
  user_uuid UUID,
  gems_amount INTEGER
)
RETURNS TABLE (
  success BOOLEAN,
  tokens_purchased INTEGER,
  new_token_balance INTEGER,
  new_gem_balance INTEGER
) AS $$
DECLARE
  current_gems INTEGER;
  current_tokens INTEGER;
  tokens_to_add INTEGER;
  new_gems INTEGER;
  new_tokens INTEGER;
  exchange_rate INTEGER := 10; -- 10 gemas = 1 token (ajustable)
BEGIN
  -- Obtener saldos actuales
  SELECT gems INTO current_gems FROM profiles WHERE id = user_uuid;
  SELECT balance INTO current_tokens FROM tokens WHERE user_id = user_uuid;
  
  -- Si no existe tokens, crear
  IF NOT FOUND THEN
    INSERT INTO tokens (user_id, balance) VALUES (user_uuid, 0);
    current_tokens := 0;
  END IF;
  
  -- Verificar si hay suficientes gemas
  IF current_gems < gems_amount THEN
    RETURN QUERY SELECT FALSE, 0, current_tokens, current_gems;
    RETURN;
  END IF;
  
  -- Calcular tokens a comprar
  tokens_to_add := gems_amount / exchange_rate;
  
  IF tokens_to_add = 0 THEN
    RETURN QUERY SELECT FALSE, 0, current_tokens, current_gems;
    RETURN;
  END IF;
  
  -- Actualizar gemas
  new_gems := current_gems - gems_amount;
  UPDATE profiles SET gems = new_gems, updated_at = now() WHERE id = user_uuid;
  
  -- Actualizar tokens
  new_tokens := current_tokens + tokens_to_add;
  UPDATE tokens SET balance = new_tokens, last_updated = now() WHERE user_id = user_uuid;
  
  -- Registrar transacción
  INSERT INTO token_transactions (
    user_id,
    type,
    amount,
    balance_after,
    reason,
    metadata
  ) VALUES (
    user_uuid,
    'purchase',
    tokens_to_add,
    new_tokens,
    'Compra con gemas',
    jsonb_build_object('gems_spent', gems_amount, 'exchange_rate', exchange_rate)
  );
  
  RETURN QUERY SELECT TRUE, tokens_to_add, new_tokens, new_gems;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para registrar intento de generación
CREATE OR REPLACE FUNCTION register_world_attempt(
  user_uuid UUID,
  world_theme_uuid UUID DEFAULT NULL,
  tokens_used_amount INTEGER DEFAULT 0
)
RETURNS INTEGER AS $$
DECLARE
  attempt_num INTEGER;
  period_start_val TIMESTAMPTZ;
  period_end_val TIMESTAMPTZ;
BEGIN
  -- Obtener período actual
  SELECT period_start, period_end
  INTO period_start_val, period_end_val
  FROM world_preferences
  WHERE user_id = user_uuid;
  
  -- Si no existe, crear
  IF NOT FOUND THEN
    INSERT INTO world_preferences (user_id)
    VALUES (user_uuid)
    RETURNING period_start, period_end
    INTO period_start_val, period_end_val;
  END IF;
  
  -- Contar intentos en el período actual
  SELECT COUNT(*) + 1
  INTO attempt_num
  FROM world_attempts
  WHERE user_id = user_uuid
    AND created_at >= period_start_val
    AND created_at < period_end_val;
  
  -- Registrar intento
  INSERT INTO world_attempts (
    user_id,
    attempt_number,
    period_start,
    period_end,
    world_theme_id,
    tokens_used
  ) VALUES (
    user_uuid,
    attempt_num,
    period_start_val,
    period_end_val,
    world_theme_uuid,
    tokens_used_amount
  );
  
  -- Actualizar contador en preferencias
  UPDATE world_preferences
  SET attempts_used_this_period = attempt_num,
      last_updated = now()
  WHERE user_id = user_uuid;
  
  RETURN attempt_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tokens_updated_at
  BEFORE UPDATE ON tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_world_themes_updated_at
  BEFORE UPDATE ON world_themes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_world_preferences_updated_at
  BEFORE UPDATE ON world_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_world_minigames_updated_at
  BEFORE UPDATE ON world_minigames
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_memory_updated_at
  BEFORE UPDATE ON ai_memory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================================

COMMENT ON TABLE tokens IS 'Saldo de tokens del usuario para intentos extra de IA';
COMMENT ON TABLE token_transactions IS 'Ledger completo de movimientos de tokens para auditoría';
COMMENT ON TABLE world_themes IS 'Temas personalizados generados por IA para el lobby';
COMMENT ON TABLE world_preferences IS 'Preferencias actuales del usuario y control de intentos';
COMMENT ON TABLE world_minigames IS 'Mini-juegos generados dentro de los temas personalizados';
COMMENT ON TABLE ai_memory IS 'Memoria de la IA (privada del usuario y global aprobada)';
COMMENT ON TABLE ai_feedback IS 'Feedback del usuario sobre generaciones de IA';
COMMENT ON TABLE world_attempts IS 'Registro de intentos de generación por período';

COMMENT ON COLUMN tokens.balance IS 'Saldo actual de tokens (no negativo)';
COMMENT ON COLUMN token_transactions.type IS 'Tipo de transacción: purchase, use, bonus, refund, admin_adjust, initial_grant';
COMMENT ON COLUMN token_transactions.amount IS 'Cantidad de tokens (positivo para entrada, negativo para salida)';
COMMENT ON COLUMN token_transactions.balance_after IS 'Saldo después de la transacción para auditoría';
COMMENT ON COLUMN world_themes.expires_at IS 'Fecha de expiración del tema (3 días por defecto)';
COMMENT ON COLUMN world_themes.is_active IS 'Si el tema está activo y no ha expirado';
COMMENT ON COLUMN world_preferences.renewal_type IS 'Tipo de renovación: monthly (FREE) o weekly (RUSH/LEGEND/TEACHER)';
COMMENT ON COLUMN ai_memory.memory_type IS 'Tipo de memoria: private (solo usuario) o global (aprobada por admin)';
COMMENT ON COLUMN ai_memory.is_approved IS 'Solo aplica para memoria global, indica si fue aprobada por admin';

-- ============================================================
-- FIN DE MIGRACIÓN
-- ============================================================
