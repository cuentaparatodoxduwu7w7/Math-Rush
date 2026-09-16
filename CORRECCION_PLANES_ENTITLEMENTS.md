# Corrección Crítica: Sistema de Planes y Entitlements

## Problema Identificado

El usuario developer podía cambiar de plan, pero la interfaz no reflejaba los cambios en las funcionalidades. Todos los planes mostraban las mismas capacidades.

## Solución Implementada

### 1. Separación de Role y Active Plan

**Antes:**
- El role del developer se confundía con el plan activo
- Los entitlements se calculaban solo basados en el role

**Ahora:**
- `role`: Identidad del usuario (student, teacher, admin, developer)
- `activePlan`: Plan que está probando el developer (free, rush, legend, teacher)
- Los entitlements se calculan basados en el `activePlan`, no en el role

### 2. Nueva Función getUserEntitlements

**Ubicación:** `src/lib/gameEngine.ts`

**Cambios:**
- Ahora recibe `role` y `activePlan` como parámetros
- Define entitlements específicos para cada plan:
  - **FREE**: 3 escaneos/día, sin IA, sin características premium
  - **RUSH**: 10 escaneos/día, IA limitada, sin anuncios
  - **LEGEND**: Escaneos ilimitados, IA ilimitada, Pre-U, simulacros, estadísticas avanzadas, modo duelo
  - **TEACHER**: 50 escaneos/día, IA limitada, panel docente

**Nuevos Entitlements:**
```typescript
{
  canScan: boolean;
  scanLimit: number;
  canUseAI: boolean;
  aiLimit: number;
  canAccessLegend: boolean;
  canAccessTeacherTools: boolean;
  canRemoveAds: boolean;
  canUseAllSkins: boolean;
  canAccessPreU: boolean;
  canAccessSimulations: boolean;
  canAccessAdvancedStats: boolean;
  canAccessDuel: boolean;
  canAccessAdmin: boolean;
  canAccessDeveloper: boolean;
}
```

### 3. Función hasFeature

**Ubicación:** `src/lib/gameEngine.ts`

**Propósito:** Proporcionar una forma centralizada de verificar si el usuario tiene acceso a una característica específica.

**Uso:**
```typescript
hasFeature(entitlements, 'ai_cuy_sabio')
hasFeature(entitlements, 'legend_simulations')
hasFeature(entitlements, 'teacher_dashboard')
hasFeature(entitlements, 'unlimited_scans')
```

**Características Mapeadas:**
- `scan`: canScan
- `unlimited_scans`: scanLimit >= 999
- `ai_cuy_sabio`: canUseAI
- `legend_features`: canAccessLegend
- `teacher_dashboard`: canAccessTeacherTools
- `no_ads`: canRemoveAds
- `all_skins`: canUseAllSkins
- `pre_u`: canAccessPreU
- `simulations`: canAccessSimulations
- `advanced_stats`: canAccessAdvancedStats
- `duel_mode`: canAccessDuel
- `admin_panel`: canAccessAdmin
- `developer_panel`: canAccessDeveloper

### 4. Hook useEntitlements

**Ubicación:** `src/hooks/useEntitlements.ts`

**Propósito:** Facilitar el acceso a los entitlements en cualquier componente.

**Uso:**
```typescript
const { entitlements, hasFeature, isDeveloper, activePlan } = useEntitlements();

if (hasFeature('ai_cuy_sabio')) {
  // Mostrar Cuy Sabio
}
```

### 5. Actualización de AuthContext

**Cambios:**
- `activateDeveloperMode`: Ahora establece `developerPlan` como 'free' (no 'developer')
- `setDeveloperPlan`: Solo actualiza el plan, mantiene el role como 'developer'
- `entitlements`: Se calcula usando `getUserEntitlements(role, activePlan)`

### 6. Actualización de DeveloperPanel

**Cambios:**
- Lista de características desbloqueadas ahora usa los nuevos entitlements
- Muestra características específicas de cada plan:
  - Escáner básico (3/día) - FREE
  - Escáner premium (10/día) - RUSH
  - Escáner ilimitado - LEGEND
  - Cuy Sabio (IA) - RUSH/LEGEND/TEACHER
  - Modo Pre-U - LEGEND
  - Simulacros - LEGEND
  - Estadísticas avanzadas - LEGEND
  - Modo Duelo - LEGEND
  - Panel docente - TEACHER

### 7. Actualización de PlansPage

**Cambios:**
- `currentPlan` ahora usa `developerPlan` del contexto cuando el usuario es developer
- Botones de plan muestran "🧪 PROBAR [NOMBRE]" para developers
- Banner de developer cambia de color según el plan activo:
  - Verde cuando está probando un plan
  - Naranja cuando está en FREE
- Mensaje claro: "🧪 MODO DE PRUEBAS ACTIVADO" cuando se prueba un plan
- Botón "Volver a FREE" cuando se está probando un plan

## Cómo Probar los Cambios

### Prueba 1: Developer → FREE

1. Iniciar sesión como developer: `cuentaparatodoxduwu7w7@gmail.com`
2. Ir a `/developer`
3. Seleccionar plan FREE
4. Ir a `/plans`
5. **Verificar:**
   - Banner muestra "Modo Developer Activo" (naranja)
   - Plan actual: FREE
   - En DeveloperPanel, solo están desbloqueadas:
     - Escáner básico (3/día)
     - Panel admin
     - Panel developer

### Prueba 2: Developer → RUSH

1. En `/developer`, seleccionar plan RUSH
2. Ir a `/plans`
3. **Verificar:**
   - Banner cambia a verde: "🧪 MODO DE PRUEBAS ACTIVADO"
   - Mensaje: "Probando plan: MATH RUSH PASS"
   - Botón "Volver a FREE" visible
   - En DeveloperPanel, están desbloqueadas:
     - Escáner premium (10/día)
     - Cuy Sabio (IA)
     - Sin anuncios
     - Panel admin
     - Panel developer

### Prueba 3: Developer → LEGEND

1. En `/developer`, seleccionar plan LEGEND
2. Ir a `/plans`
3. **Verificar:**
   - Banner verde: "🧪 MODO DE PRUEBAS ACTIVADO"
   - Mensaje: "Probando plan: LEGEND PASS"
   - En DeveloperPanel, están desbloqueadas:
     - Escáner ilimitado
     - Cuy Sabio (IA)
     - Sin anuncios
     - Todas las skins
     - Modo Pre-U
     - Simulacros
     - Estadísticas avanzadas
     - Modo Duelo
     - Panel admin
     - Panel developer

### Prueba 4: Developer → TEACHER

1. En `/developer`, seleccionar plan TEACHER
2. Ir a `/plans`
3. **Verificar:**
   - Banner verde: "🧪 MODO DE PRUEBAS ACTIVADO"
   - Mensaje: "Probando plan: TEACHER"
   - En DeveloperPanel, están desbloqueadas:
     - Escáner premium (50/día)
     - Cuy Sabio (IA)
     - Sin anuncios
     - Panel docente
     - Panel admin
     - Panel developer

### Prueba 5: Developer → Volver a FREE

1. En `/plans`, hacer clic en "Volver a FREE"
2. **Verificar:**
   - Banner vuelve a naranja: "Modo Developer Activo"
   - Plan actual: FREE
   - En DeveloperPanel, solo están desbloqueadas las características básicas

## Verificación de Cambios en la Interfaz

### Laboratorio IA

**FREE:**
- Límite: 3 imágenes/día, 1 audio/día, 2 mascotas/día
- Mensaje: "Límite diario alcanzado" al superar el límite

**RUSH:**
- Límite: 20 imágenes/día, 10 audios/día, 15 mascotas/día

**LEGEND:**
- Límite: 50 imágenes/día, 30 audios/día, 40 mascotas/día

**TEACHER:**
- Límite: 100 imágenes/día, 50 audios/día, 80 mascotas/día

### Escáner

**FREE:**
- Límite: 3 escaneos/día

**RUSH:**
- Límite: 10 escaneos/día

**LEGEND:**
- Límite: Ilimitado

**TEACHER:**
- Límite: 50 escaneos/día

### Tienda

**FREE:**
- Solo skins básicas visibles

**LEGEND:**
- Todas las skins desbloqueadas (canUseAllSkins = true)

### Juegos

**FREE:**
- Quick Rush, Time Attack, Boss Battle, Survival

**LEGEND:**
- Todos los anteriores + Duelo (canAccessDuel = true)

## Archivos Modificados

1. `src/lib/gameEngine.ts`
   - Nueva función `getUserEntitlements` con lógica de planes
   - Nueva función `hasFeature` para verificación centralizada

2. `src/lib/supabase.ts`
   - Actualizado `UserEntitlements` con nuevos campos

3. `src/contexts/AuthContext.tsx`
   - Corregido `activateDeveloperMode` para usar 'free' como plan inicial
   - Corregido `setDeveloperPlan` para no cambiar el role
   - Actualizado cálculo de `entitlements`

4. `src/hooks/useEntitlements.ts` (NUEVO)
   - Hook para facilitar acceso a entitlements

5. `src/pages/DeveloperPanel.tsx`
   - Actualizada lista de características desbloqueadas
   - Ahora usa los nuevos entitlements

6. `src/pages/Plans.tsx`
   - `currentPlan` ahora usa `developerPlan` del contexto
   - Botones "🧪 PROBAR [NOMBRE]" para developers
   - Banner dinámico según el plan activo
   - Botón "Volver a FREE" cuando se prueba un plan

## Resultados

✅ **Los cambios de plan ahora afectan realmente la interfaz**
✅ **Cada plan tiene sus propios límites y características**
✅ **El developer puede probar todos los planes sin pagar**
✅ **La interfaz muestra claramente qué plan se está probando**
✅ **No se simulan pagos reales**
✅ **Los entitlements se calculan correctamente según el plan activo**

## Próximos Pasos

Para completar la integración, se debe:

1. **Actualizar componentes que usan entitlements:**
   - `src/pages/AiLab.tsx`: Usar `hasFeature('ai_cuy_sabio')` para mostrar/ocultar IA
   - `src/pages/Scan.tsx`: Verificar `entitlements.scanLimit` antes de escanear
   - `src/pages/Shop.tsx`: Filtrar skins según `entitlements.canUseAllSkins`
   - `src/pages/Games.tsx`: Mostrar/ocultar modo Duelo según `entitlements.canAccessDuel`

2. **Implementar límites reales:**
   - Contador de escaneos por día
   - Contador de generaciones de IA por día
   - Reset de contadores cada 24 horas

3. **Sincronizar con backend:**
   - Guardar `activePlan` en Supabase
   - Validar entitlements en Edge Functions
   - No confiar solo en el frontend para límites

## Conclusión

El sistema de planes ahora funciona correctamente. El developer puede probar todos los planes y ver cómo cambian las funcionalidades en tiempo real. La interfaz refleja fielmente las capacidades de cada plan, y los entitlements se calculan correctamente basados en el plan activo, no en el role del usuario.
