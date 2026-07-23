import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SettingsProvider } from './context/SettingsContext'
import { TranslationProvider } from './context/TranslationContext'
import ProtectedRoute from './components/ProtectedRoute'
import NavBar from './components/NavBar'
import AccessibilityBar from './components/AccessibilityBar'
import Login from './pages/Login'
import Diagnostic from './pages/Diagnostic'
import Lessons from './pages/Lessons'
import LessonDetail from './pages/LessonDetail'
import Reading from './pages/Reading'
import Dashboard from './pages/Dashboard'

function Shell({ children }) {
  return (
    <>
      <NavBar />
      <AccessibilityBar />
      {children}
    </>
  )
}

function Home() {
  const { session, profile, loading } = useAuth()
  if (loading) return null
  if (!session) return <Navigate to="/login" replace />
  if (profile && !profile.diagnostic_done) return <Navigate to="/diagnostic" replace />
  return <Navigate to="/lessons" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <TranslationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />

              <Route
                path="/diagnostic"
                element={
                  <ProtectedRoute allowWithoutDiagnostic>
                    <Diagnostic />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lessons"
                element={
                  <ProtectedRoute>
                    <Shell><Lessons /></Shell>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lessons/:lessonId"
                element={
                  <ProtectedRoute>
                    <Shell><LessonDetail /></Shell>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reading"
                element={
                  <ProtectedRoute>
                    <Shell><Reading /></Shell>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Shell><Dashboard /></Shell>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TranslationProvider>
      </SettingsProvider>
    </AuthProvider>
  )
}
