import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import { ProtectedRoute } from './components/layout';

// Lazy load pages for performance
const Landing = lazy(() => import('./pages/Landing'));
const OnboardingPage = lazy(() => import('./pages/Onboarding'));
const LobbyPage = lazy(() => import('./pages/Lobby'));
const GamesPage = lazy(() => import('./pages/Games'));
const GamePlayPage = lazy(() => import('./pages/GamePlay'));
const ScanPage = lazy(() => import('./pages/Scan'));
const LibraryPage = lazy(() => import('./pages/Library'));
const ProgressPage = lazy(() => import('./pages/Progress'));
const ShopPage = lazy(() => import('./pages/Shop'));
const AiLabPage = lazy(() => import('./pages/AiLab'));
const ProfilePage = lazy(() => import('./pages/Profile'));
const PlansPage = lazy(() => import('./pages/Plans'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const TeacherPage = lazy(() => import('./pages/Teacher'));
const AdminPage = lazy(() => import('./pages/Admin'));

// Auth pages (not lazy loaded for fast initial access)
import { LoginPage, RegisterPage, ForgotPasswordPage } from './pages/Auth';
import { PaymentSuccessPage, PaymentCancelledPage, AuthCallbackPage } from './pages/Payment';

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-rush-dark">
      <div className="text-center">
        <div className="animate-bounce text-5xl mb-4">🐹</div>
        <p className="text-gray-400 text-sm animate-pulse">Cargando Math Rush...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GameProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />

              {/* Payment Routes */}
              <Route path="/app/payment/success" element={
                <ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>
              } />
              <Route path="/app/payment/cancelled" element={
                <ProtectedRoute><PaymentCancelledPage /></ProtectedRoute>
              } />

              {/* Onboarding (protected) */}
              <Route path="/onboarding" element={
                <ProtectedRoute><OnboardingPage /></ProtectedRoute>
              } />

              {/* App Routes (protected) */}
              <Route path="/app" element={
                <ProtectedRoute><LobbyPage /></ProtectedRoute>
              } />
              <Route path="/app/scan" element={
                <ProtectedRoute><ScanPage /></ProtectedRoute>
              } />
              <Route path="/app/games" element={
                <ProtectedRoute><GamesPage /></ProtectedRoute>
              } />
              <Route path="/app/game/:id" element={
                <ProtectedRoute><GamePlayPage /></ProtectedRoute>
              } />
              <Route path="/app/library" element={
                <ProtectedRoute><LibraryPage /></ProtectedRoute>
              } />
              <Route path="/app/progress" element={
                <ProtectedRoute><ProgressPage /></ProtectedRoute>
              } />
              <Route path="/app/shop" element={
                <ProtectedRoute><ShopPage /></ProtectedRoute>
              } />
              <Route path="/app/ai-lab" element={
                <ProtectedRoute><AiLabPage /></ProtectedRoute>
              } />
              <Route path="/app/profile" element={
                <ProtectedRoute><ProfilePage /></ProtectedRoute>
              } />
              <Route path="/app/settings" element={
                <ProtectedRoute><SettingsPage /></ProtectedRoute>
              } />
              <Route path="/app/plans" element={
                <ProtectedRoute><PlansPage /></ProtectedRoute>
              } />
              <Route path="/app/payment" element={
                <ProtectedRoute><PlansPage /></ProtectedRoute>
              } />

              {/* Teacher Routes (protected, teacher role) */}
              <Route path="/teacher" element={
                <ProtectedRoute requireRole={['teacher', 'admin', 'developer']}><TeacherPage /></ProtectedRoute>
              } />
              <Route path="/teacher/classes" element={
                <ProtectedRoute requireRole={['teacher', 'admin', 'developer']}><TeacherPage /></ProtectedRoute>
              } />
              <Route path="/teacher/assignments" element={
                <ProtectedRoute requireRole={['teacher', 'admin', 'developer']}><TeacherPage /></ProtectedRoute>
              } />
              <Route path="/teacher/analytics" element={
                <ProtectedRoute requireRole={['teacher', 'admin', 'developer']}><TeacherPage /></ProtectedRoute>
              } />

              {/* Admin Routes (protected, admin/developer role) */}
              <Route path="/admin" element={
                <ProtectedRoute requireRole={['admin', 'developer']}><AdminPage /></ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute requireRole={['admin', 'developer']}><AdminPage /></ProtectedRoute>
              } />
              <Route path="/admin/content" element={
                <ProtectedRoute requireRole={['admin', 'developer']}><AdminPage /></ProtectedRoute>
              } />
              <Route path="/admin/analytics" element={
                <ProtectedRoute requireRole={['admin', 'developer']}><AdminPage /></ProtectedRoute>
              } />
              <Route path="/admin/developer" element={
                <ProtectedRoute requireRole={['developer']}><AdminPage /></ProtectedRoute>
              } />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </GameProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
