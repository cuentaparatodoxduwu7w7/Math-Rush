# 🐹 Math Rush

**Aprende. Juega. Supera tus límites.**

Math Rush es una plataforma educativa gamificada que convierte el aprendizaje de matemáticas en una experiencia de videojuego. Escanea ejercicios, conviértelos en desafíos y compite contigo mismo.

![Math Rush](https://img.shields.io/badge/version-1.0.0-orange)
![React](https://img.shields.io/badge/React-18.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Características

### 🎮 Modos de Juego
- **⚡ Quick Rush**: 10 preguntas rápidas
- **🔥 Time Attack**: Resuelve contra el reloj
- **💀 Boss Battle**: Enfrenta al jefe matemático
- **♾️ Survival**: 5 vidas, dificultad creciente

### 📸 Escáner Inteligente
- Escanea ejercicios con tu cámara
- Convierte fotos en desafíos de juego
- Detección automática de tema y dificultad

### 🤖 Laboratorio IA
- **🎨 Diseñador de Mundo**: Crea mundos personalizados
- **🎵 Sintetizador de Audio**: Genera música y efectos
- **🐹 Diseñador de Mascota**: Personaliza tu compañero

### 🛒 Tienda
- Skins exclusivas (Cuy Gamer, Dorado, Cyberpunk, Samurai)
- Mascotas (Llama Blanca, Cuy Matemático)
- Fondos temáticos (Espacial, Neón, Matemático, Cyberpunk)
- Efectos visuales (Rayo, Partículas, Confeti)

### 📊 Progreso
- Sistema de XP y niveles
- Monedas y gemas
- Rachas diarias
- Logros desbloqueables
- Estadísticas detalladas

### 👨‍🏫 Panel Docente
- Crear clases con código de acceso
- Asignar actividades personalizadas
- Monitorear progreso de estudiantes
- Analíticas detalladas

---

## 🚀 Instalación

### Requisitos
- Node.js 18+ 
- npm o yarn

### Pasos

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/math-rush.git
cd math-rush

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## 🎯 Uso Rápido

### Modo Demo (sin configuración)

```bash
npm run dev
```

1. Abre `http://localhost:3000`
2. Haz clic en "🎮 ENTRAR A DEMO"
3. Explora todas las funcionalidades

### Modo Developer

Usuario developer: `cuentaparatodoxduwu7w7@gmail.com`

El developer puede:
- Probar todos los planes (FREE, RUSH, LEGEND, TEACHER)
- Acceder a todas las funciones
- Usar el panel de pruebas
- Recursos ilimitados

---

## 🏗️ Estructura del Proyecto

```
math-rush/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── layout.tsx       # Sidebar, BottomNav, ProtectedRoute
│   │   └── ui.tsx           # Button, Card, Modal, Badge, etc.
│   ├── contexts/            # Contextos de React
│   │   ├── AuthContext.tsx  # Autenticación y developer mode
│   │   └── GameContext.tsx  # Motor de juego
│   ├── hooks/               # Hooks personalizados
│   │   ├── useAI.ts         # Hook de IA
│   │   └── useEntitlements.ts # Hook de permisos
│   ├── lib/                 # Utilidades y configuración
│   │   ├── assets.ts        # URLs de imágenes
│   │   ├── gameEngine.ts    # Lógica del juego
│   │   ├── mockData.ts      # Datos mock
│   │   └── supabase.ts      # Cliente Supabase + tipos
│   ├── pages/               # Páginas de la aplicación
│   │   ├── Landing.tsx      # Landing page
│   │   ├── Auth.tsx         # Login, Register, ForgotPassword
│   │   ├── Lobby.tsx        # Menú principal
│   │   ├── Games.tsx        # Selector de modos
│   │   ├── GamePlay.tsx     # Gameplay
│   │   ├── Scan.tsx         # Escáner
│   │   ├── Shop.tsx         # Tienda
│   │   ├── AiLab.tsx        # Laboratorio IA
│   │   ├── Plans.tsx        # Planes
│   │   ├── DeveloperPanel.tsx # Panel developer
│   │   └── ...              # Otras páginas
│   ├── services/            # Servicios
│   │   ├── ai/              # Servicio de IA
│   │   │   ├── AIService.ts
│   │   │   └── providers/
│   │   └── soundService.ts  # Servicio de sonidos
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Entry point
│   └── index.css            # Estilos globales
├── supabase/
│   ├── schema.sql           # Estructura de base de datos
│   └── functions/           # Edge Functions
├── public/                  # Assets públicos
├── index.html               # HTML principal
├── package.json             # Dependencias
├── vite.config.js           # Configuración Vite
└── tsconfig.json            # Configuración TypeScript
```

---

## 🔧 Configuración para Producción

### Variables de Entorno

Crea un archivo `.env` en la raíz:

```env
# Supabase (requerido para producción)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### Configuraciones Adicionales

#### 1. Supabase
```bash
# Ejecutar schema.sql en Supabase SQL Editor
# Configurar Authentication
# Configurar Storage buckets
```

#### 2. Google OAuth
1. Ir a Supabase Dashboard → Authentication → Providers → Google
2. Configurar Client ID y Client Secret de Google Cloud
3. Agregar URL de redirect

#### 3. Pagos (Culqi)
```env
# Solo en backend (Edge Functions)
CULQI_PUBLIC_KEY=pk_...
CULQI_SECRET_KEY=sk_...
CULQI_WEBHOOK_SECRET=...
```

#### 4. APIs de IA
```env
# Solo en backend (Edge Functions)
AI_PROVIDER_KEY=...
AI_PROVIDER_URL=...
```

---

## 📦 Build para Producción

```bash
# Build
npm run build

# Preview del build
npm run preview
```

Los archivos optimizados se generarán en `dist/`

---

## 🎨 Tecnologías

- **Frontend**: React 18 + TypeScript
- **Estilos**: Tailwind CSS 4
- **Animaciones**: Framer Motion
- **Enrutamiento**: React Router v6
- **Estado**: Context API
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **Pagos**: Culqi (preparado)
- **Build**: Vite

---

## 📱 Responsive

La aplicación es completamente responsive:
- ✅ Mobile (< 768px)
- ✅ Tablet (768px - 1024px)
- ✅ Desktop (> 1024px)

---

## 🔒 Seguridad

- ✅ API keys solo en backend
- ✅ No se almacenan datos de tarjeta
- ✅ RLS en todas las tablas
- ✅ Validación en Edge Functions
- ✅ No se confía en el frontend para permisos

---

## 📊 Planes

| Plan | Precio | Características |
|------|--------|----------------|
| **FREE** | S/ 0.00 | Juegos básicos, 3 escaneos/día |
| **RUSH** ⭐ | S/ 4.90/mes | Cuy Sabio IA, 10 escaneos/día, skins premium |
| **LEGEND** | S/ 9.90/mes | Todo incluido, Pre-U, simulacros |
| **TEACHER** | S/ 19.90/mes | Clases, actividades, dashboard |

---

## 🐛 Modo Demo

La aplicación funciona completamente en modo demo sin necesidad de configuración externa:

- ✅ Todas las funcionalidades operativas
- ✅ Datos mock en memoria
- ✅ Usuario demo automático
- ✅ Modo developer para pruebas

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

## 👥 Autor

**Math Rush Team**

---

## 🙏 Agradecimientos

- React Team
- Supabase Team
- Tailwind CSS Team
- Framer Motion Team
- Todos los contribuidores

---

## 📞 Contacto

Para preguntas o soporte:
- Email: soporte@mathrush.com
- Twitter: @MathRushApp
- Discord: [Comunidad Math Rush](https://discord.gg/mathrush)

---

**¡Aprende. Juega. Supera tus límites!** 🐹⚡
