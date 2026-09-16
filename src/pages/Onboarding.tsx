import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui';
import { Difficulty } from '../lib/supabase';

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState('');
  const [grade, setGrade] = useState('');
  const [mathLevel, setMathLevel] = useState<Difficulty | ''>('');
  const [goal, setGoal] = useState('');
  const { updateProfile, user } = useAuth();
  const navigate = useNavigate();

  const steps = [
    { title: '¡Bienvenido a Math Rush!', subtitle: 'Prepararemos tu experiencia de juego.' },
    { title: '¿Cómo te llamas?', subtitle: 'Elige tu nickname de jugador.' },
    { title: '¿En qué grado estás?', subtitle: 'Para adaptar los desafíos a tu nivel.' },
    { title: '¿Cuál es tu nivel?', subtitle: 'No te preocupes, puedes mejorar.' },
    { title: '¿Cuál es tu objetivo?', subtitle: 'Para personalizar tu experiencia.' },
  ];

  async function handleFinish() {
    await updateProfile({
      nickname: nickname || user?.nickname || 'Jugador',
      grade,
      math_level: mathLevel as Difficulty,
      goal,
      onboarding_completed: true,
    });
    navigate('/app');
  }

  function nextStep() {
    if (step < steps.length - 1) setStep(step + 1);
    else handleFinish();
  }

  function prevStep() {
    if (step > 0) setStep(step - 1);
  }

  const grades = ['1.º secundaria', '2.º secundaria', '3.º secundaria', '4.º secundaria', '5.º secundaria', 'Otro'];
  const levels: { value: Difficulty; label: string; emoji: string }[] = [
    { value: 'principiante', label: 'Principiante', emoji: '🌱' },
    { value: 'basico', label: 'Básico', emoji: '📗' },
    { value: 'intermedio', label: 'Intermedio', emoji: '📘' },
    { value: 'avanzado', label: 'Avanzado', emoji: '🔥' },
  ];
  const goals = ['Mejorar notas', 'Practicar', 'Aprender desde cero', 'Prepararme para examen', 'Prepararme para universidad'];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 hero-gradient">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? 'bg-rush-orange' : 'bg-rush-purple/20'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center"
          >
            {/* Step 0: Welcome */}
            {step === 0 && (
              <div>
                <motion.span
                  className="text-7xl mb-6 block"
                  animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🐹
                </motion.span>
                <h1 className="font-display text-3xl font-bold mb-2">{steps[0].title}</h1>
                <p className="text-gray-400">{steps[0].subtitle}</p>
                <div className="flex justify-center gap-3 mt-6">
                  <span className="text-3xl animate-float" style={{ animationDelay: '0s' }}>🦙</span>
                  <span className="text-3xl animate-float" style={{ animationDelay: '0.5s' }}>⚡</span>
                  <span className="text-3xl animate-float" style={{ animationDelay: '1s' }}>🎮</span>
                </div>
              </div>
            )}

            {/* Step 1: Nickname */}
            {step === 1 && (
              <div>
                <span className="text-5xl mb-4 block">🎮</span>
                <h2 className="font-display text-2xl font-bold mb-2">{steps[1].title}</h2>
                <p className="text-gray-400 text-sm mb-6">{steps[1].subtitle}</p>
                <input
                  type="text"
                  value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  className="w-full bg-rush-darker border border-rush-purple/30 rounded-xl px-4 py-4 text-white text-center text-xl placeholder-gray-500 focus:outline-none focus:border-rush-orange transition-colors"
                  placeholder="Tu nickname"
                  maxLength={20}
                  aria-label="Nickname"
                />
              </div>
            )}

            {/* Step 2: Grade */}
            {step === 2 && (
              <div>
                <span className="text-5xl mb-4 block">📚</span>
                <h2 className="font-display text-2xl font-bold mb-2">{steps[2].title}</h2>
                <p className="text-gray-400 text-sm mb-6">{steps[2].subtitle}</p>
                <div className="grid grid-cols-2 gap-3">
                  {grades.map(g => (
                    <button
                      key={g}
                      onClick={() => setGrade(g)}
                      className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${grade === g ? 'border-rush-orange bg-rush-orange/10 text-rush-orange' : 'border-rush-purple/20 text-gray-400 hover:border-rush-purple/50'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Math Level */}
            {step === 3 && (
              <div>
                <span className="text-5xl mb-4 block">📊</span>
                <h2 className="font-display text-2xl font-bold mb-2">{steps[3].title}</h2>
                <p className="text-gray-400 text-sm mb-6">{steps[3].subtitle}</p>
                <div className="space-y-3">
                  {levels.map(l => (
                    <button
                      key={l.value}
                      onClick={() => setMathLevel(l.value)}
                      className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${mathLevel === l.value ? 'border-rush-orange bg-rush-orange/10' : 'border-rush-purple/20 hover:border-rush-purple/50'}`}
                    >
                      <span className="text-2xl">{l.emoji}</span>
                      <span className={`font-medium ${mathLevel === l.value ? 'text-rush-orange' : 'text-gray-300'}`}>{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Goal */}
            {step === 4 && (
              <div>
                <span className="text-5xl mb-4 block">🎯</span>
                <h2 className="font-display text-2xl font-bold mb-2">{steps[4].title}</h2>
                <p className="text-gray-400 text-sm mb-6">{steps[4].subtitle}</p>
                <div className="space-y-3">
                  {goals.map(g => (
                    <button
                      key={g}
                      onClick={() => setGoal(g)}
                      className={`w-full p-4 rounded-xl border-2 text-left text-sm font-medium transition-all ${goal === g ? 'border-rush-orange bg-rush-orange/10 text-rush-orange' : 'border-rush-purple/20 text-gray-400 hover:border-rush-purple/50'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {step > 0 ? (
            <Button variant="ghost" onClick={prevStep}>← Atrás</Button>
          ) : <div />}
          <Button
            variant="primary"
            size="lg"
            onClick={nextStep}
            disabled={step === 1 && !nickname}
          >
            {step === steps.length - 1 ? '⚡ EMPEZAR' : 'Siguiente →'}
          </Button>
        </div>
      </div>
    </div>
  );
}
