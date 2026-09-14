# 🐹 MATH RUSH

**Aprende. Juega. Supera tus límites.**

Plataforma educativa gamificada que convierte el aprendizaje de matemática en una experiencia de videojuego.

---

## 🎯 Estado Actual (v1.1.0 - Post Auditoría)

### ✅ COMPLETAMENTE FUNCIONAL
- Landing page con animaciones y modal de demostración
- Sistema de autenticación (mock/demo cuando no hay Supabase)
- Motor de juego con 4 modos funcionales
- **Tienda con imágenes reales** (no solo emojis)
- **Laboratorio IA con contenido visual** (mundos y mascotas generados)
- Sistema de progresión (XP, niveles, monedas, logros)
- **Modo developer con acceso total**
- **Checkout funcional con estados**
- **Modo de pruebas para developer**
- Responsive design (mobile-first)

### ⚠️ REQUIERE CONFIGURACIÓN EXTERNA
- Supabase (para datos reales)
- Google OAuth (para login con Google)
- Culqi (para pagos reales)
- IA Provider (para generación de audio)

---

## 🚀 Stack

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Supabase (Auth, Database, Storage, Edge Functions)
- **Pagos:** Culqi (preparado para integración)
- **IA:** Arquitectura preparada para provider externo

---

## 🏃 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir en navegador
# http://localhost:5173
```

**Modo Demo Automático:** La aplicación funciona sin configuración. Usa usuario demo automáticamente.

**Usuario Developer:** `cuentaparatodoxduwu7w7@gmail.com` (tiene acceso completo)

---

## 📋 Configuración (Opcional)

### 1. Variables de Entorno

Crear archivo `.env` en la raíz:

```env
# Supabase (OBLIGATORIO para producción)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key

# NO colocar en frontend:
# SUPABASE_SERVICE_ROLE_KEY (solo en Edge Functions)
```

### 2. Google OAuth

Configurar en Supabase Dashboard:
1. Ir a Authentication → Providers → Google
2. Obtener Client ID y Client Secret de Google Cloud Console
3. Agregar Client ID y Client Secret en Supabase
4. En Google Cloud Console, agregar la URL de redirect:
   `https://tu-proyecto.supabase.co/auth/v1/callback`
5. Agregar tu dominio en "Authorized JavaScript origins"

**⚠️ El Client Secret NUNCA va en el frontend.**

### 3. Base de Datos

Ejecutar `supabase/schema.sql` en Supabase SQL Editor.

### 4. Pagos (Culqi)

Configurar en backend (Edge Functions):
```env
CULQI_PUBLIC_KEY=pk_...  (solo frontend para Culqi.js)
CULQI_SECRET_KEY=sk_...  (SOLO backend)
CULQI_WEBHOOK_SECRET=... (SOLO backend)
```

Medios de pago disponibles según configuración del comercio:
- Yape, Plin, Visa, Mastercard, American Express, Diners, PagoEfectivo, Banca Móvil

---

## 🏗️ Arquitectura

### Rutas

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/` | Landing Page | Público |
| `/login` | Iniciar sesión | Público |
| `/register` | Registro | Público |
| `/forgot-password` | Recuperar contraseña | Público |
| `/onboarding` | Configuración inicial | Autenticado |
| `/app` | Lobby | Autenticado |
| `/app/scan` | Escáner | Autenticado |
| `/app/games` | Modos de juego | Autenticado |
| `/app/game/:id` | Gameplay | Autenticado |
| `/app/library` | Biblioteca | Autenticado |
| `/app/progress` | Progreso | Autenticado |
| `/app/shop` | Tienda | Autenticado |
| `/app/ai-lab` | Laboratorio IA | Autenticado |
| `/app/profile` | Perfil | Autenticado |
| `/app/settings` | Configuración | Autenticado |
| `/app/plans` | Planes | Autenticado |
| `/teacher` | Dashboard docente | Teacher/Admin/Dev |
| `/admin` | Panel admin | Admin/Dev |
| `/admin/developer` | Panel developer | Developer |

### Roles

- **student:** Acceso básico al juego
- **teacher:** + Dashboard docente
- **admin:** + Panel administrativo
- **developer:** Acceso total (validado por backend/RLS)

### Seguridad

- RLS en todas las tablas
- Roles validados en backend
- Developer: `cuentaparatodoxduwu7w7@gmail.com` (verificado por backend)
- Entitlements calculados en backend
- Webhooks idempotentes
- No se almacenan datos de tarjeta
- No se exponen secrets en frontend

---

## 🎮 Modos de Juego

1. **⚡ Quick Rush** — 10 preguntas rápidas
2. **🔥 Time Attack** — Contra el reloj (60s)
3. **💀 Boss Battle** — Derrota al jefe matemático
4. **♾️ Survival** — 5 vidas, dificultad creciente
5. **⚔️ Duelo** — VS otro jugador (próximamente)

---

## 💰 Planes

| Plan | Precio | Beneficios |
|------|--------|------------|
| FREE | S/ 0 | Juegos básicos, 3 escaneos/día |
| RUSH | S/ 4.90/mes | Cuy Sabio IA, 10 escaneos, skins premium |
| LEGEND | S/ 9.90/mes | Todo incluido, modo Pre-U, simulacros |
| TEACHER | S/ 19.90/mes | Clases, actividades, dashboard |

---

## 📝 Estado Actual (MVP)

### ✅ Implementado
- Landing page completa
- Autenticación (email + Google preparado)
- Onboarding
- Lobby con UI de videojuego
- Motor de juego (5 modos)
- Sistema de XP y niveles
- Monedas y gemas
- Tienda con inventario
- Escáner (UI + flujo)
- Cuy Sabio (mock)
- Laboratorio IA (mock)
- Biblioteca
- Progreso con gráficos
- Planes y checkout (UI)
- Panel docente
- Panel admin
- Panel developer
- Diseño responsive (mobile-first)
- Sistema de logros
- Rutas protegidas por rol

### ⏳ Pendiente (requiere configuración externa)
- Conexión real a Supabase (requiere credenciales)
- Google OAuth funcional (requiere config en Supabase + Google Cloud)
- Escáner con IA real (requiere provider de IA)
- Pagos con Culqi (requiere cuenta de comercio)
- Webhook de pagos (Edge Function)
- Generación de preguntas por IA
- Modo Duelo en tiempo real
- Notificaciones push

---

## 🔒 Seguridad - Reglas

1. **NUNCA** colocar service_role_key en frontend
2. **NUNCA** almacenar datos completos de tarjeta
3. **NUNCA** confiar en valores del frontend para permisos
4. **NUNCA** permitir que un usuario modifique su propio rol
5. Los entitlements se calculan en backend
6. Los pagos se validan con webhooks idempotentes
7. Developer access se valida por claims/RLS, no solo por email

---

## 🐹 Mascotas

- **Cuy Matemático** 🐹 — Mascota principal
- **Llama Blanca** 🦙 — Mascota secundaria

---

*Hecho con ❤️ para estudiantes peruanos*
