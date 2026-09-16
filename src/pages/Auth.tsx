import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card } from '../components/ui';

// ============================================================
// LOGIN PAGE
// ============================================================
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithEmail, signInWithGoogle, activateDeveloperMode } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signInWithEmail(email, password);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/app');
    }
  }

  async function handleGoogle() {
    const { error } = await signInWithGoogle();
    if (error) setError(error);
  }

  function handleDemo() {
    activateDeveloperMode();
    navigate('/app');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Math Symbols */}
        {['∑', 'π', '∫', '√', '∞', 'Δ', 'θ', 'λ'].map((symbol, i) => (
          <motion.div
            key={i}
            className="absolute text-rush-purple/10 font-bold select-none"
            style={{
              fontSize: `${Math.random() * 40 + 30}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.3, 0.1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            {symbol}
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md relative z-10"
      >
        {/* Logo Section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-block mb-4"
          >
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-rush-orange to-rush-yellow rounded-3xl flex items-center justify-center shadow-2xl shadow-rush-orange/50">
                <span className="text-6xl">🐹</span>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-2 border-2 border-rush-orange/30 rounded-3xl"
              />
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-display text-4xl font-black mb-2"
          >
            <span className="bg-gradient-to-r from-rush-orange via-rush-yellow to-rush-orange bg-clip-text text-transparent">
              MATH RUSH
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-300 text-lg font-medium"
          >
            Bienvenido al Rush
          </motion.p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-8 backdrop-blur-xl bg-rush-card/80 border-rush-purple/30 shadow-2xl">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-sm text-red-400 flex items-center gap-2"
              >
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-rush-darker/50 border-2 border-rush-purple/30 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-rush-orange focus:bg-rush-darker/70 transition-all"
                  placeholder="tu@correo.com"
                  required
                  aria-label="Correo electrónico"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-rush-darker/50 border-2 border-rush-purple/30 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-rush-orange focus:bg-rush-darker/70 transition-all"
                  placeholder="••••••••"
                  required
                  aria-label="Contraseña"
                />
              </div>
              
              <div className="flex justify-end">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-rush-purple hover:text-rush-orange transition-colors font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              
              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                className="w-full shadow-lg shadow-rush-orange/30" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      ⚡
                    </motion.span>
                    Entrando...
                  </span>
                ) : (
                  '⚡ INICIAR SESIÓN'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-rush-purple/30" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-rush-card/80 px-4 text-sm text-gray-400 font-medium">
                  O CONTINÚA CON
                </span>
              </div>
            </div>

            {/* Google Login */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold rounded-xl py-3.5 hover:bg-gray-50 transition-all shadow-lg"
              aria-label="Continuar con Google"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>CONTINUAR CON GOOGLE</span>
            </motion.button>

            {/* Register Link */}
            <p className="text-center text-sm text-gray-400 mt-7">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-rush-orange font-semibold hover:underline">
                Regístrate
              </Link>
            </p>
          </Card>
        </motion.div>

        {/* Demo Mode Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6"
        >
          <div className="bg-gradient-to-r from-rush-purple/20 to-rush-blue/20 border border-rush-purple/30 rounded-2xl p-5 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rush-purple to-rush-blue rounded-xl flex items-center justify-center">
                <span className="text-xl">🎮</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-sm">Modo Demostración</h3>
                <p className="text-xs text-gray-400">Prueba todas las funciones sin registro</p>
              </div>
            </div>
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleDemo}
            >
              🎮 ENTRAR A DEMO
            </Button>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Acceso completo con cuenta developer
            </p>
          </div>
        </motion.div>

        {/* OAuth Configuration Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-gray-600 mt-4"
        >
          💡 Google OAuth requiere configuración en Supabase Dashboard
        </motion.p>
      </motion.div>
    </div>
  );
}

// ============================================================
// REGISTER PAGE
// ============================================================
export function RegisterPage() {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUpWithEmail, signInWithGoogle, activateDeveloperMode } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
    setLoading(true);
    const { error } = await signUpWithEmail(email, password, nickname);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      navigate('/onboarding');
    }
  }

  async function handleGoogle() {
    const { error } = await signInWithGoogle();
    if (error) setError(error);
  }

  function handleDemo() {
    activateDeveloperMode();
    navigate('/app');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Math Symbols */}
        {['∑', 'π', '∫', '√', '∞', 'Δ', 'θ', 'λ'].map((symbol, i) => (
          <motion.div
            key={i}
            className="absolute text-rush-purple/10 font-bold select-none"
            style={{
              fontSize: `${Math.random() * 40 + 30}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.3, 0.1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            {symbol}
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md relative z-10"
      >
        {/* Logo Section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-block mb-4"
          >
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-rush-orange to-rush-yellow rounded-3xl flex items-center justify-center shadow-2xl shadow-rush-orange/50">
                <span className="text-6xl">🐹</span>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-2 border-2 border-rush-orange/30 rounded-3xl"
              />
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-display text-4xl font-black mb-2"
          >
            <span className="bg-gradient-to-r from-rush-orange via-rush-yellow to-rush-orange bg-clip-text text-transparent">
              MATH RUSH
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-300 text-lg font-medium"
          >
            Únete al Rush
          </motion.p>
        </div>

        {/* Register Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-8 backdrop-blur-xl bg-rush-card/80 border-rush-purple/30 shadow-2xl">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-sm text-red-400 flex items-center gap-2"
              >
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Nickname
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  className="w-full bg-rush-darker/50 border-2 border-rush-purple/30 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-rush-orange focus:bg-rush-darker/70 transition-all"
                  placeholder="Tu nombre de jugador"
                  required
                  aria-label="Nickname"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-rush-darker/50 border-2 border-rush-purple/30 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-rush-orange focus:bg-rush-darker/70 transition-all"
                  placeholder="tu@correo.com"
                  required
                  aria-label="Correo electrónico"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-rush-darker/50 border-2 border-rush-purple/30 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-rush-orange focus:bg-rush-darker/70 transition-all"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  aria-label="Contraseña"
                />
              </div>
              
              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                className="w-full shadow-lg shadow-rush-orange/30" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      ⚡
                    </motion.span>
                    Creando cuenta...
                  </span>
                ) : (
                  '⚡ CREAR CUENTA'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-rush-purple/30" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-rush-card/80 px-4 text-sm text-gray-400 font-medium">
                  O REGÍSTRATE CON
                </span>
              </div>
            </div>

            {/* Google Login */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold rounded-xl py-3.5 hover:bg-gray-50 transition-all shadow-lg"
              aria-label="Continuar con Google"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>CONTINUAR CON GOOGLE</span>
            </motion.button>

            {/* Login Link */}
            <p className="text-center text-sm text-gray-400 mt-7">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-rush-orange font-semibold hover:underline">
                Inicia sesión
              </Link>
            </p>
          </Card>
        </motion.div>

        {/* Demo Mode Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6"
        >
          <div className="bg-gradient-to-r from-rush-purple/20 to-rush-blue/20 border border-rush-purple/30 rounded-2xl p-5 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rush-purple to-rush-blue rounded-xl flex items-center justify-center">
                <span className="text-xl">🎮</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-sm">Modo Demostración</h3>
                <p className="text-xs text-gray-400">Prueba todas las funciones sin registro</p>
              </div>
            </div>
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleDemo}
            >
              🎮 ENTRAR A DEMO
            </Button>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Acceso completo con cuenta developer
            </p>
          </div>
        </motion.div>

        {/* OAuth Configuration Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-gray-600 mt-4"
        >
          💡 Google OAuth requiere configuración en Supabase Dashboard
        </motion.p>
      </motion.div>
    </div>
  );
}

// ============================================================
// FORGOT PASSWORD PAGE
// ============================================================
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      setError(error);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Math Symbols */}
        {['∑', 'π', '∫', '√', '∞', 'Δ', 'θ', 'λ'].map((symbol, i) => (
          <motion.div
            key={i}
            className="absolute text-rush-purple/10 font-bold select-none"
            style={{
              fontSize: `${Math.random() * 40 + 30}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.3, 0.1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            {symbol}
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md relative z-10"
      >
        {/* Logo Section */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-block mb-4"
          >
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-rush-orange to-rush-yellow rounded-3xl flex items-center justify-center shadow-2xl shadow-rush-orange/50">
                <span className="text-6xl">🔑</span>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-2 border-2 border-rush-orange/30 rounded-3xl"
              />
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-display text-3xl font-black mb-2"
          >
            <span className="bg-gradient-to-r from-rush-orange via-rush-yellow to-rush-orange bg-clip-text text-transparent">
              RECUPERAR CONTRASEÑA
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-300 text-base"
          >
            Te enviaremos un enlace para restablecer tu contraseña
          </motion.p>
        </div>

        {/* Forgot Password Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-8 backdrop-blur-xl bg-rush-card/80 border-rush-purple/30 shadow-2xl">
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-rush-green to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rush-green/50">
                  <span className="text-4xl">📧</span>
                </div>
                <h3 className="text-xl font-bold text-rush-green mb-2">¡Correo enviado!</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
                </p>
                <Link 
                  to="/login" 
                  className="inline-block bg-rush-orange hover:bg-rush-orange-dark text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-rush-orange/30"
                >
                  ← Volver al login
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400 flex items-center gap-2"
                  >
                    <span className="text-lg">⚠️</span>
                    <span>{error}</span>
                  </motion.div>
                )}
                
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-rush-darker/50 border-2 border-rush-purple/30 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-rush-orange focus:bg-rush-darker/70 transition-all"
                    placeholder="tu@correo.com"
                    required
                    aria-label="Correo electrónico"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="lg" 
                  className="w-full shadow-lg shadow-rush-orange/30" 
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        📧
                      </motion.span>
                      Enviando...
                    </span>
                  ) : (
                    '📧 ENVIAR ENLACE'
                  )}
                </Button>
                
                <Link 
                  to="/login" 
                  className="block text-center text-sm text-gray-400 hover:text-rush-orange transition-colors font-medium"
                >
                  ← Volver al login
                </Link>
              </form>
            )}
          </Card>
        </motion.div>

        {/* Info Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-xs text-gray-600 mt-6"
        >
          💡 Si no recibes el correo, revisa tu carpeta de spam
        </motion.p>
      </motion.div>
    </div>
  );
}
