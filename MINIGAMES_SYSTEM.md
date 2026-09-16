# 🎮 Sistema de Mini-Juegos Matemáticos

## 📊 Resumen Ejecutivo

**Fecha**: 2024  
**Implementación**: Sistema completo de mini-juegos matemáticos generados por IA  
**Estado**: ✅ Completado  
**Archivos creados**: 4

---

## 🎯 Objetivo

Permitir que la IA del Diseñador de Mundo genere mini-juegos matemáticos personalizados basados en prompts del usuario como:
- "Quiero un juego de matemáticas sobre piratas espaciales"
- "Quiero un mini-juego de multiplicaciones ambientado en una ciudad cyberpunk"
- "Quiero algo tipo carrera, con dificultad difícil y 60 segundos"

**RESTRICCIÓN CRÍTICA**: La IA NO devuelve JavaScript ejecutable, solo JSON de configuración validado.

---

## 📁 Archivos Creados

### 1. **`src/lib/minigame-schema.ts`** (~180 líneas)
Define el esquema JSON seguro para mini-juegos:
- Tipos de juego: quiz, runner, puzzle, memory, boss, challenge
- Dificultades: easy, medium, hard, expert
- Operaciones matemáticas: addition, subtraction, multiplication, division, mixed
- Límites de validación para todos los campos
- Patrones prohibidos (HTML, JavaScript, etc.)

### 2. **`src/lib/minigame-validator.ts`** (~400 líneas)
Validador estricto del esquema JSON:
- Verifica estructura completa
- Valida tipos de datos
- Verifica rangos numéricos
- Detecta patrones prohibidos
- Sanitiza datos
- Valida reglas específicas por tipo de juego

### 3. **`src/lib/minigame-engine.ts`** (~380 líneas)
Motor que interpreta el JSON y crea juegos jugables:
- Genera preguntas matemáticas dinámicamente
- Maneja estado del juego
- Calcula puntuación y combos
- Maneja temporizador
- Calcula recompensas
- Usa componentes existentes de Math-Rush

### 4. **`src/components/MiniGamePlayer.tsx`** (~280 líneas)
Componente React que renderiza el mini-juego:
- Usa componentes existentes (Card, Button, Badge, Timer, ComboCounter)
- Muestra preguntas generadas
- Maneja respuestas del usuario
- Muestra feedback inmediato
- Calcula y muestra recompensas
- Aplica tema visual del mundo

---

## 🔒 Esquema JSON Seguro

### Estructura Base

```json
{
  "gameType": "quiz",
  "name": "Piratas Espaciales",
  "description": "Resuelve operaciones matemáticas para derrotar piratas espaciales",
  "theme": {
    "background": "#0a0a2e",
    "primary": "#ff6b35",
    "secondary": "#f7931e",
    "accent": "#ffd700",
    "decorations": ["stars", "planets"]
  },
  "difficulty": "medium",
  "duration": 60,
  "operations": ["addition", "multiplication"],
  "questions": 10,
  "numberRange": {
    "min": 1,
    "max": 100
  },
  "rules": {
    "type": "quiz",
    "timePerQuestion": 15,
    "showTimer": true,
    "allowRetry": false,
    "feedbackType": "immediate"
  },
  "rewards": {
    "xp": 100,
    "coins": 50,
    "gems": 2
  },
  "visual": {
    "character": "cuy-pirate",
    "effects": ["sparkle", "explosion"],
    "animations": ["bounce", "fade"]
  }
}
```

---

## 🛡️ Validaciones de Seguridad

### 1. Patrones Prohibidos

El validador detecta y rechaza:
```javascript
// HTML/JavaScript
<script>, <iframe>, javascript:, eval(), function()

// Acceso a DOM/APIs
document.*, window.*, alert(), console.*, fetch(), XMLHttpRequest

// Módulos/Imports
import, require(), process.*

// Prototipos/Constructores
__proto__, constructor[*
```

### 2. Límites Numéricos

| Campo | Mínimo | Máximo |
|-------|--------|--------|
| duration | 10s | 300s |
| questions | 5 | 20 |
| numberRange.min | 1 | 1000 |
| numberRange.max | 1 | 10000 |
| rewards.xp | 10 | 500 |
| rewards.coins | 5 | 100 |
| rewards.gems | 0 | 10 |

### 3. Tipos Permitidos

**gameType**: quiz, runner, puzzle, memory, boss, challenge  
**difficulty**: easy, medium, hard, expert  
**operations**: addition, subtraction, multiplication, division, mixed  
**feedbackType**: immediate, end

### 4. Validación por Tipo de Juego

Cada tipo de juego tiene reglas específicas:

**Quiz**:
- timePerQuestion: 5-30 segundos
- showTimer: boolean
- allowRetry: boolean
- feedbackType: "immediate" | "end"

**Runner**:
- speed: "slow" | "normal" | "fast"
- obstacles: 5-20
- powerUps: boolean
- checkpointInterval: 10-60 segundos

**Puzzle**:
- puzzleType: "match" | "sequence" | "pattern"
- pieces: 4-16
- hintSystem: boolean
- maxHints: 1-5

**Memory**:
- pairs: 4-12
- showTime: 2-10 segundos
- flipTime: 1-5 segundos
- comboBonus: boolean

**Boss**:
- bossHealth: 50-500
- playerHealth: 30-100
- damagePerCorrect: 5-20
- damagePerWrong: 5-15
- bossAttacks: 3-10

**Challenge**:
- challengeType: "speed" | "accuracy" | "streak"
- targetScore: número positivo
- timeBonus: boolean
- comboMultiplier: 1.0-3.0

---

## 🎮 Tipos de Mini-Juegos

### 1. Quiz
- Preguntas de opción múltiple
- Temporizador por pregunta
- Feedback inmediato o al final
- Sistema de combos

### 2. Runner
- Juego de carrera
- Obstáculos matemáticos
- Power-ups
- Checkpoints

### 3. Puzzle
- Rompecabezas matemáticos
- Tipos: match, sequence, pattern
- Sistema de pistas
- Piezas configurables

### 4. Memory
- Juego de memoria con cartas
- Pares de operaciones/respuestas
- Tiempo de visualización configurable
- Bonus por combos

### 5. Boss
- Batalla contra jefe
- HP del jefe y jugador
- Daño por respuestas correctas/incorrectas
- Ataques del jefe

### 6. Challenge
- Desafíos de velocidad/precisión/racha
- Objetivo de puntuación
- Bonus de tiempo
- Multiplicador de combo

---

## 🔄 Flujo de Generación

### 1. Usuario solicita mini-juego
```
"Quiero un juego de piratas espaciales con multiplicaciones"
```

### 2. IA genera JSON de configuración
```json
{
  "gameType": "quiz",
  "name": "Piratas Espaciales",
  "operations": ["multiplication"],
  ...
}
```

### 3. Backend valida el JSON
- Verifica estructura
- Valida rangos
- Detecta patrones prohibidos
- Sanitiza datos

### 4. Frontend recibe JSON validado
- Almacena en base de datos
- Muestra opción de jugar

### 5. Usuario inicia mini-juego
- Motor interpreta JSON
- Genera preguntas dinámicamente
- Usa componentes existentes
- Aplica tema visual

### 6. Usuario juega
- Responde preguntas
- Gana puntos y combos
- Ve feedback inmediato
- Recibe recompensas

---

## 🎨 Integración con Componentes Existentes

El MiniGamePlayer usa componentes existentes de Math-Rush:

```typescript
import { Card, Button, Badge, Timer, ComboCounter, XPBar } from '../components/ui';
```

**Ventajas**:
- Consistencia visual
- Menos código duplicado
- Mantenimiento más fácil
- Experiencia de usuario coherente

---

## 📊 Ejemplos de Uso

### Ejemplo 1: Quiz Simple
**Prompt**: "Quiero un quiz de sumas fácil con 10 preguntas"

**JSON generado**:
```json
{
  "gameType": "quiz",
  "name": "Sumas Divertidas",
  "difficulty": "easy",
  "duration": 120,
  "operations": ["addition"],
  "questions": 10,
  "numberRange": { "min": 1, "max": 50 },
  "rules": {
    "type": "quiz",
    "timePerQuestion": 15,
    "showTimer": true,
    "allowRetry": false,
    "feedbackType": "immediate"
  },
  "rewards": { "xp": 50, "coins": 25 }
}
```

### Ejemplo 2: Boss Battle
**Prompt**: "Batalla contra un dragón con divisiones difíciles"

**JSON generado**:
```json
{
  "gameType": "boss",
  "name": "Dragón Matemático",
  "difficulty": "hard",
  "duration": 180,
  "operations": ["division"],
  "questions": 15,
  "numberRange": { "min": 10, "max": 500 },
  "rules": {
    "type": "boss",
    "bossHealth": 300,
    "playerHealth": 80,
    "damagePerCorrect": 15,
    "damagePerWrong": 10,
    "bossAttacks": 8
  },
  "rewards": { "xp": 300, "coins": 100, "gems": 5 }
}
```

### Ejemplo 3: Memory Game
**Prompt**: "Juego de memoria con multiplicaciones, 8 pares"

**JSON generado**:
```json
{
  "gameType": "memory",
  "name": "Memoria Matemática",
  "difficulty": "medium",
  "duration": 90,
  "operations": ["multiplication"],
  "questions": 8,
  "numberRange": { "min": 1, "max": 12 },
  "rules": {
    "type": "memory",
    "pairs": 8,
    "showTime": 5,
    "flipTime": 3,
    "comboBonus": true
  },
  "rewards": { "xp": 150, "coins": 75, "gems": 3 }
}
```

---

## 🎯 Características del Motor

### Generación Dinámica de Preguntas

El motor genera preguntas en tiempo real basadas en:
- Operaciones especificadas
- Rango de números
- Dificultad
- Número de preguntas

**Ejemplo**:
```typescript
// Para operation: "multiplication", range: {min: 1, max: 12}
// Genera: "¿Cuánto es 7 × 8?"
// Opciones: ["56", "54", "58", "52"]
// Respuesta correcta: 0 (56)
```

### Sistema de Puntuación

```typescript
baseScore = 10
comboBonus = combo * 2
timeBonus = timeRemaining / 10
totalScore = baseScore + comboBonus + timeBonus
```

### Cálculo de Recompensas

```typescript
completionBonus = isCompleted ? 1.0 : 0.5
accuracyBonus = score / (questions * 20)

xp = schema.rewards.xp * completionBonus * (1 + accuracyBonus)
coins = schema.rewards.coins * completionBonus * (1 + accuracyBonus)
gems = schema.rewards.gems || 0
```

---

## 🔐 Seguridad

### Lo que NO se permite:

❌ JavaScript ejecutable  
❌ HTML arbitrario  
❌ Scripts embebidos  
❌ Iframes  
❌ URLs arbitrarias  
❌ Acceso a APIs del navegador  
❌ Código generado por la IA  

### Lo que SÍ se permite:

✅ Configuración JSON pura  
✅ Colores hexadecimales  
✅ Números dentro de rangos  
✅ Strings descriptivos  
✅ Nombres de assets existentes  
✅ Configuración de reglas  

---

## 📝 Documentación del Prompt para IA

El prompt del sistema incluye instrucciones estrictas:

```
CRITICAL: The mini-game must follow this EXACT JSON schema. 
NO executable code allowed - only configuration data.

RULES FOR MINIGAME GENERATION:
1. NO JavaScript, NO HTML, NO executable code - ONLY configuration data
2. All colors must be valid hex codes (#RRGGBB)
3. All numbers must be within specified ranges
4. gameType must be one of: quiz, runner, puzzle, memory, boss, challenge
5. difficulty must be one of: easy, medium, hard, expert
6. operations must be from: addition, subtraction, multiplication, division, mixed
7. duration must be between 10 and 300 seconds
8. questions must be between 5 and 20
...
```

---

## 🚀 Integración con WorldDesigner

### Checkbox para incluir mini-juego
```typescript
<label>
  <input type="checkbox" checked={includeMinigame} />
  Incluir Mini-juego
</label>
```

### Presets de mini-juegos
```typescript
const minigamePresets = [
  { label: '🏴‍☠️ Piratas espaciales', value: '...' },
  { label: '🌃 Carrera cyberpunk', value: '...' },
  { label: '🧙‍♂️ Torneo de magos', value: '...' },
  ...
];
```

### Botón para jugar
```typescript
{currentTheme.minigame && (
  <Button onClick={() => setActiveMinigame(currentTheme.minigame)}>
    🎮 Jugar Mini-juego
  </Button>
)}
```

### Reproductor de mini-juego
```typescript
{activeMinigame && (
  <MiniGamePlayer
    schema={activeMinigame}
    onComplete={handleComplete}
    onExit={handleExit}
  />
)}
```

---

## 📊 Métricas

### Archivos creados: 4
- `minigame-schema.ts`: 180 líneas
- `minigame-validator.ts`: 400 líneas
- `minigame-engine.ts`: 380 líneas
- `MiniGamePlayer.tsx`: 280 líneas

**Total**: ~1,240 líneas de código

### Tipos de juego soportados: 6
- Quiz
- Runner
- Puzzle
- Memory
- Boss
- Challenge

### Operaciones matemáticas: 5
- Addition
- Subtraction
- Multiplication
- Division
- Mixed

---

## ✅ Checklist de Implementación

### Esquema JSON
- [x] Definición de tipos
- [x] Límites de validación
- [x] Patrones prohibidos
- [x] Reglas por tipo de juego

### Validador
- [x] Validación de estructura
- [x] Validación de tipos
- [x] Validación de rangos
- [x] Detección de patrones prohibidos
- [x] Sanitización de datos
- [x] Validación específica por tipo

### Motor
- [x] Generación de preguntas
- [x] Sistema de puntuación
- [x] Manejo de combos
- [x] Temporizador
- [x] Cálculo de recompensas
- [x] Configuración por tipo de juego

### Componente
- [x] Renderizado de preguntas
- [x] Manejo de respuestas
- [x] Feedback visual
- [x] Temporizador visual
- [x] Sistema de combos
- [x] Pantalla de resultados
- [x] Integración con componentes existentes

### Integración
- [x] Checkbox en WorldDesigner
- [x] Presets de mini-juegos
- [x] Botón para jugar
- [x] Reproductor de mini-juegos
- [x] Actualización de tipos

### Seguridad
- [x] No se ejecuta código arbitrario
- [x] Validación estricta de JSON
- [x] Detección de patrones prohibidos
- [x] Sanitización de datos
- [x] Límites numéricos estrictos

---

## 🎯 Conclusión

El sistema de mini-juegos matemáticos está **completamente implementado** con:

✅ Esquema JSON seguro y validado  
✅ Validador estricto con detección de patrones prohibidos  
✅ Motor que interpreta JSON y genera juegos jugables  
✅ Componente React que usa componentes existentes  
✅ 6 tipos de juegos diferentes  
✅ 5 operaciones matemáticas  
✅ Sistema de puntuación y combos  
✅ Cálculo de recompensas  
✅ Integración completa con WorldDesigner  
✅ Seguridad contra ejecución de código arbitrario  

**La IA genera solo configuración JSON, nunca código ejecutable. El motor de Math-Rush interpreta el JSON y crea el juego usando componentes existentes.**

---

**Fecha**: 2024  
**Versión**: 1.0  
**Estado**: ✅ Completado y documentado
