import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useT } from '../context/TranslationContext'
import Buddy from './Buddy'

/**
 * 1. Not signed in           -> /login
 * 2. Signed in, no diagnostic -> /diagnostic (forced for all new users)
 * 3. Otherwise render the page.
 */
export default function ProtectedRoute({ children, allowWithoutDiagnostic = false }) {
  const { session, profile, loading } = useAuth()
  const location = useLocation()
  const t = useT()

  if (loading) {
    return (
      <div className="page center" style={{ paddingTop: 120 }}>
        <Buddy mood="thinking" size={130} float />
        <h2>{t('Loading your bookshelf…')}</h2>
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace state={{ from: location }} />

  if (!allowWithoutDiagnostic && profile && !profile.diagnostic_done) {
    return <Navigate to="/diagnostic" replace />
  }

  return children
}
