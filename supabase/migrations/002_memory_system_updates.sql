-- ============================================================
-- MIGRACIÓN: Actualización para Sistema de Memoria
-- ============================================================
-- Fecha: 2024
-- Descripción: Agregar columnas necesarias para el sistema de memoria avanzado
-- ============================================================

-- ============================================================
-- 1. ACTUALIZAR TABLA: ai_memory
-- ============================================================

-- Agregar columna para metadata mejorada
ALTER TABLE ai_memory 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Agregar índice para búsqueda por categoría y usuario
CREATE INDEX IF NOT EXISTS idx_ai_memory_user_category 
ON ai_memory(user_id, category);

-- Agregar índice para memoria global aprobada
CREATE INDEX IF NOT EXISTS idx_ai_memory_global_approved 
ON ai_memory(memory_type, is_approved) 
WHERE memory_type = 'global' AND is_approved = true;

-- ============================================================
-- 2. ACTUALIZAR TABLA: world_preferences
-- ============================================================

-- Agregar columna para temas preferidos
ALTER TABLE world_preferences 
ADD COLUMN IF NOT EXISTS preferred_themes JSONB DEFAULT '[]';

-- ============================================================
-- 3. ACTUALIZAR TABLA: world_themes
-- ============================================================

-- Agregar columna para tracking de aceptación
ALTER TABLE world_themes 
ADD COLUMN IF NOT EXISTS was_accepted BOOLEAN DEFAULT NULL;

-- Agregar columna para feedback recibido
ALTER TABLE world_themes 
ADD COLUMN IF NOT EXISTS has_feedback BOOLEAN DEFAULT false;

-- Agregar columna para rating promedio
ALTER TABLE world_themes 
ADD COLUMN IF NOT EXISTS avg_rating DECIMAL(2,1) DEFAULT NULL;

-- ============================================================
-- 4. FUNCIÓN: Obtener memoria relevante para un prompt
-- ============================================================

CREATE OR REPLACE FUNCTION get_relevant_memory(
  user_uuid UUID,
  search_prompt TEXT,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  memory_type TEXT,
  category TEXT,
  content JSONB,
  confidence_score DECIMAL,
  relevance_score DECIMAL
) AS $$
BEGIN
  -- This is a simplified version - in production, use pgvector for semantic search
  -- For now, we'll use keyword matching
  
  RETURN QUERY
  SELECT 
    m.id,
    m.memory_type,
    m.category,
    m.content,
    m.confidence_score,
    -- Simple relevance scoring based on keyword matching
    CASE 
      WHEN m.content::text ILIKE '%' || search_prompt || '%' THEN 1.0
      WHEN m.category ILIKE '%' || search_prompt || '%' THEN 0.8
      ELSE 0.5
    END as relevance_score
  FROM ai_memory m
  WHERE 
    (m.user_id = user_uuid AND m.memory_type = 'private')
    OR 
    (m.memory_type = 'global' AND m.is_approved = true)
  ORDER BY 
    relevance_score DESC,
    m.confidence_score DESC,
    m.usage_count DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 5. FUNCIÓN: Actualizar uso de memoria
-- ============================================================

CREATE OR REPLACE FUNCTION increment_memory_usage(memory_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE ai_memory
  SET 
    usage_count = usage_count + 1,
    last_used_at = now(),
    updated_at = now()
  WHERE id = memory_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 6. FUNCIÓN: Obtener patrones de usuario
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_patterns(user_uuid UUID)
RETURNS TABLE (
  pattern_type TEXT,
  pattern_data JSONB,
  frequency INTEGER,
  confidence DECIMAL
) AS $$
BEGIN
  -- Get most common styles
  RETURN QUERY
  SELECT 
    'style' as pattern_type,
    jsonb_build_object('style', content->>'style') as pattern_data,
    COUNT(*)::INTEGER as frequency,
    AVG(confidence_score) as confidence
  FROM ai_memory
  WHERE user_id = user_uuid
    AND category IN ('preferred_style', 'liked_style')
  GROUP BY content->>'style'
  HAVING COUNT(*) >= 2
  
  UNION ALL
  
  -- Get most common themes
  SELECT 
    'theme' as pattern_type,
    jsonb_build_object('theme', content->>'theme') as pattern_data,
    COUNT(*)::INTEGER as frequency,
    AVG(confidence_score) as confidence
  FROM ai_memory
  WHERE user_id = user_uuid
    AND category IN ('theme_category', 'recurring_theme')
  GROUP BY content->>'theme'
  HAVING COUNT(*) >= 2
  
  ORDER BY frequency DESC, confidence DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 7. FUNCIÓN: Limpiar memoria antigua
-- ============================================================

CREATE OR REPLACE FUNCTION cleanup_old_memory(
  user_uuid UUID,
  days_to_keep INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete old private memory entries (keep recent ones)
  WITH deleted AS (
    DELETE FROM ai_memory
    WHERE user_id = user_uuid
      AND memory_type = 'private'
      AND created_at < now() - (days_to_keep || ' days')::INTERVAL
      AND usage_count < 3  -- Don't delete frequently used memories
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 8. VISTA: Resumen de memoria del usuario
-- ============================================================

CREATE OR REPLACE VIEW user_memory_summary AS
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE memory_type = 'private') as private_memories,
  COUNT(*) FILTER (WHERE memory_type = 'global' AND is_approved) as approved_global_memories,
  COUNT(*) FILTER (WHERE category = 'generation') as generation_count,
  COUNT(*) FILTER (WHERE category LIKE '%pattern%') as pattern_count,
  COUNT(*) FILTER (WHERE category LIKE '%preference%') as preference_count,
  AVG(confidence_score) as avg_confidence,
  MAX(created_at) as last_memory_date
FROM ai_memory
GROUP BY user_id;

-- ============================================================
-- 9. COMENTARIOS
-- ============================================================

COMMENT ON COLUMN ai_memory.metadata IS 'Additional metadata about the memory entry';
COMMENT ON COLUMN world_preferences.preferred_themes IS 'Array of preferred theme categories';
COMMENT ON COLUMN world_themes.was_accepted IS 'Whether the user accepted/applied this theme';
COMMENT ON COLUMN world_themes.has_feedback IS 'Whether this theme has received feedback';
COMMENT ON COLUMN world_themes.avg_rating IS 'Average rating from feedback (1-5)';

COMMENT ON FUNCTION get_relevant_memory IS 'Retrieve memory entries relevant to a search prompt';
COMMENT ON FUNCTION increment_memory_usage IS 'Increment usage counter for a memory entry';
COMMENT ON FUNCTION get_user_patterns IS 'Get detected patterns from user memory';
COMMENT ON FUNCTION cleanup_old_memory IS 'Clean up old, unused memory entries';
COMMENT ON VIEW user_memory_summary IS 'Summary of memory statistics per user';

-- ============================================================
-- FIN DE MIGRACIÓN
-- ============================================================
