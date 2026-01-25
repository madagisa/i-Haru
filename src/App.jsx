import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import TodayPage from './pages/TodayPage'
import SchedulePage from './pages/SchedulePage'
import PrepPage from './pages/PrepPage'
import HelpPage from './pages/HelpPage'
import SettingsPage from './pages/SettingsPage'
import JoinFamilyPage from './pages/JoinFamilyPage'

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner loading-spinner-lg"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Public Route - redirect to app if already logged in
function PublicRoute({ children }) {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner loading-spinner-lg"></div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/signup" element={
        <PublicRoute>
          <SignupPage />
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/join/:inviteCode" element={<JoinFamilyPage />} />
      <Route path="/join-family" element={<JoinFamilyPage />} />

      {/* Protected Routes with Layout */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<TodayPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="prep" element={<PrepPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="help" element={<HelpPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
