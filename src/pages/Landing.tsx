import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Modal } from '../components/ui';

// ============================================================
// LANDING PAGE
// ============================================================

function FloatingNumbers() {
  const numbers = ['+', '×', '÷', '−', '=', 'π', '∑', '√', '%', '∞', 'x²', 'Δ'];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {numbers.map((n, i) => (
        <motion.span
          key={i}
          className="absolute text-rush-purple/20 font-bold select-none"
          style={{
            fontSize: `${Math.random() * 30 + 20}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.3, 0.1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        >
          {n}
        </motion.span>
      ))}
    </div>
  );
}

function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-rush-orange rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        />
      ))}
    </div>
  );
}

export default function Landing() {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-rush-dark overflow-hidden">
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 hero-gradient">
        <FloatingNumbers />
        <Particles />
        
        {/* Speed lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-rush-orange/30 to-transparent"
              style={{
                width: `${Math.random() * 200 + 100}px`,
                top: `${Math.random() * 100}%`,
                left: '-200px',
              }}
              animate={{ x: ['0vw', '120vw'] }}
              transition={{ duration: Math.random() * 2 + 1, repeat: Infinity, delay: Math.random() * 3 }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-4xl"
        >
          {/* Mascots */}
          <div className="flex justify-center gap-4 mb-6">
            <motion.span
              className="text-6xl md:text-7xl"
              animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🐹
            </motion.span>
            <motion.span
              className="text-5xl md:text-6xl"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            >
              🦙
            </motion.span>
          </div>

          {/* Title */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black mb-4">
            <span className="bg-gradient-to-r from-rush-orange via-rush-yellow to-rush-orange bg-clip-text text-transparent">
              MATH
            </span>
            <span className="text-white ml-3">RUSH</span>
          </h1>

          {/* Slogan */}
          <p className="text-xl md:text-2xl font-bold text-rush-purple-light mb-3">
            Aprende. Juega. Supera tus límites.
          </p>
          <p className="text-gray-400 text-base md:text-lg max-w-xl mx-auto mb-8">
            Convierte tus ejercicios de matemática en desafíos, carreras y batallas.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="primary" size="xl" className="w-full sm:w-auto animate-pulse-glow">
                ⚡ EMPEZAR GRATIS
              </Button>
            </Link>
            <Button variant="outline" size="xl" className="w-full sm:w-auto" onClick={() => setShowDemo(true)}>
              ▶ VER CÓMO FUNCIONA
            </Button>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-10">
            <div className="text-center">
              <p className="text-2xl font-black text-rush-orange">5</p>
              <p className="text-xs text-gray-400">Modos de juego</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-rush-purple">IA</p>
              <p className="text-xs text-gray-400">Cuy Sabio</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-rush-yellow">∞</p>
              <p className="text-xs text-gray-400">Desafíos</p>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-gray-500 text-2xl">↓</span>
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-3xl md:text-4xl font-display font-bold text-center mb-12"
          >
            ¿Cómo <span className="text-rush-orange">funciona</span>?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: '1', icon: '📸', title: 'ESCANEA', desc: 'Fotografía tu ejercicio' },
              { step: '2', icon: '🤖', title: 'CONVIERTE', desc: 'La IA lo transforma' },
              { step: '3', icon: '🎮', title: 'JUEGA', desc: 'Enfrenta desafíos' },
              { step: '4', icon: '🧠', title: 'APRENDE', desc: 'Entiende paso a paso' },
              { step: '5', icon: '📈', title: 'MEJORA', desc: 'Sube de nivel' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card-glass rounded-2xl p-5 text-center relative"
              >
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-rush-orange rounded-full flex items-center justify-center text-sm font-bold">
                  {item.step}
                </div>
                <span className="text-4xl mb-3 block">{item.icon}</span>
                <h3 className="font-bold text-rush-orange text-sm mb-1">{item.title}</h3>
                <p className="text-gray-400 text-xs">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GAME MODES */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-rush-card/30 to-transparent">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">
            Modos de <span className="text-rush-purple">Juego</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '⚡', name: 'Quick Rush', desc: '10 preguntas rápidas. Ideal para practicar.', color: 'from-rush-orange/20 to-rush-yellow/20' },
              { icon: '🔥', name: 'Time Attack', desc: 'Resuelve todas las que puedas contra el reloj.', color: 'from-red-500/20 to-rush-orange/20' },
              { icon: '💀', name: 'Boss Battle', desc: 'Enfrenta al jefe usando matemáticas.', color: 'from-rush-purple/20 to-rush-blue/20' },
              { icon: '♾️', name: 'Survival', desc: '5 vidas. ¿Cuánto puedes sobrevivir?', color: 'from-rush-green/20 to-rush-blue/20' },
              { icon: '⚔️', name: 'Duelo', desc: 'Compite contra otros jugadores en tiempo real.', color: 'from-rush-yellow/20 to-rush-green/20' },
              { icon: '📸', name: 'Escáner IA', desc: 'Escanea ejercicios y conviértelos en juegos.', color: 'from-rush-blue/20 to-rush-purple/20' },
            ].map((mode, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`card-glass rounded-2xl p-6 bg-gradient-to-br ${mode.color} hover:scale-105 transition-transform cursor-pointer`}
              >
                <span className="text-4xl mb-3 block">{mode.icon}</span>
                <h3 className="font-bold text-lg mb-1">{mode.name}</h3>
                <p className="text-gray-400 text-sm">{mode.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI SECTION */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
          >
            <span className="text-6xl mb-4 block">🐹</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Conoce al <span className="text-rush-orange">Cuy Sabio</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Tu asistente de IA que te explica paso a paso, te da pistas y te ayuda a entender, no solo a responder.
            </p>
            <div className="card-glass rounded-2xl p-6 max-w-md mx-auto text-left">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🐹</span>
                <div>
                  <p className="font-bold text-sm">Cuy Sabio</p>
                  <p className="text-xs text-gray-400">"No pasa nada. Vamos paso a paso."</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="bg-rush-orange/10 rounded-lg p-3 text-sm">💡 Dame una pista</div>
                <div className="bg-rush-purple/10 rounded-lg p-3 text-sm">📚 Explícame</div>
                <div className="bg-rush-blue/10 rounded-lg p-3 text-sm">🧠 Muéstrame el procedimiento</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PLANS */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-rush-card/30 to-transparent">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">
            Elige tu <span className="text-rush-yellow">Plan</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'FREE', price: 'S/ 0', features: ['Juegos básicos', '3 escaneos/día'], cta: 'Empezar' },
              { name: 'RUSH', price: 'S/ 4.90', features: ['Cuy Sabio IA', '10 escaneos/día', 'Skins Premium'], cta: 'Elegir Rush', popular: true },
              { name: 'LEGEND', price: 'S/ 9.90', features: ['Todo incluido', 'Modo Pre-U', 'Simulacros'], cta: 'Ser Leyenda' },
              { name: 'TEACHER', price: 'S/ 19.90', features: ['Dashboard docente', 'Clases', 'Reportes'], cta: 'Para Docentes' },
            ].map((plan, i) => (
              <div key={i} className={`card-glass rounded-2xl p-5 text-center ${plan.popular ? 'border-2 border-rush-orange shadow-lg shadow-rush-orange/20' : ''}`}>
                {plan.popular && <span className="text-xs bg-rush-orange text-white px-2 py-0.5 rounded-full font-bold">POPULAR</span>}
                <h3 className="font-display font-bold text-lg mt-2">{plan.name}</h3>
                <p className="text-2xl font-black my-3">{plan.price}<span className="text-sm text-gray-400">/mes</span></p>
                <ul className="text-sm text-gray-400 space-y-1 mb-4">
                  {plan.features.map((f, j) => <li key={j}>✓ {f}</li>)}
                </ul>
                <Link to="/register">
                  <Button variant={plan.popular ? 'primary' : 'outline'} size="sm" className="w-full">{plan.cta}</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEACHERS */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-3xl font-display font-bold mb-4">
              Área para <span className="text-rush-blue">Docentes</span>
            </h2>
            <p className="text-gray-400 mb-6">
              Crea clases, asigna actividades personalizadas y monitorea el progreso de tus estudiantes en tiempo real.
            </p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>✓ Crear clases con código de acceso</li>
              <li>✓ Asignar actividades por tema y dificultad</li>
              <li>✓ Dashboard con analíticas detalladas</li>
              <li>✓ Reportes de rendimiento por estudiante</li>
            </ul>
          </div>
          <div className="flex-1 card-glass rounded-2xl p-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-rush-blue/10 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-rush-blue">📊</p>
                <p className="text-xs text-gray-400 mt-1">Analíticas</p>
              </div>
              <div className="bg-rush-green/10 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-rush-green">📝</p>
                <p className="text-xs text-gray-400 mt-1">Actividades</p>
              </div>
              <div className="bg-rush-purple/10 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-rush-purple">👥</p>
                <p className="text-xs text-gray-400 mt-1">Clases</p>
              </div>
              <div className="bg-rush-orange/10 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-rush-orange">📈</p>
                <p className="text-xs text-gray-400 mt-1">Reportes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
          >
            <span className="text-6xl mb-4 block">⚡</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              ¿Listo para entrar al <span className="text-rush-orange">Rush</span>?
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Únete a miles de estudiantes que ya aprenden matemática jugando.
            </p>
            <Link to="/register">
              <Button variant="primary" size="xl" className="animate-pulse-glow">
                ⚡ COMENZAR AHORA
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-4 border-t border-rush-purple/20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐹</span>
            <span className="font-display font-bold text-rush-orange">Math Rush</span>
          </div>
          <p className="text-gray-500 text-sm">© 2024 Math Rush. Aprende. Juega. Supera tus límites.</p>
          <div className="flex gap-4">
            <Link to="/login" className="text-gray-400 hover:text-white text-sm">Iniciar sesión</Link>
            <Link to="/register" className="text-gray-400 hover:text-white text-sm">Registro</Link>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      <Modal isOpen={showDemo} onClose={() => setShowDemo(false)} title="Así funciona Math Rush">
        <div className="space-y-4">
          <div className="bg-rush-darker rounded-xl p-6 text-center">
            <div className="text-5xl mb-4">🎬</div>
            <h3 className="font-bold text-lg mb-2">Video Demostrativo</h3>
            <p className="text-sm text-gray-400 mb-4">
              El video demostrativo estará disponible próximamente.
            </p>
            <div className="bg-rush-card rounded-lg p-4 text-left">
              <p className="text-xs text-gray-500 mb-2">El video mostrará:</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>✓ Landing page y registro</li>
                <li>✓ Lobby y selección de modos</li>
                <li>✓ Escáner de ejercicios</li>
                <li>✓ Gameplay en acción</li>
                <li>✓ Cuy Sabio (IA)</li>
                <li>✓ Progreso y tienda</li>
                <li>✓ Laboratorio IA</li>
              </ul>
            </div>
            <p className="text-xs text-rush-orange mt-4">
              📹 Video pendiente: /assets/demo/math-rush-demo.mp4
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Link to="/register">
              <Button variant="primary" className="w-full">Probar Ahora</Button>
            </Link>
            <Button variant="outline" className="w-full" onClick={() => setShowDemo(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
