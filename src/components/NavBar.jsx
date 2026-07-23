import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useT } from '../context/TranslationContext'
import Buddy from './Buddy'

export default function NavBar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const t = useT()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="nav">
      <div className="row" style={{ gap: 8 }}>
        <Buddy size={44} />
        <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
          Reading<span style={{ color: 'var(--pink)' }}>Buddy</span>
        </strong>
      </div>
      <div className="nav-links">
        <NavLink to="/lessons" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          📚 {t('Lessons')}
        </NavLink>
        <NavLink to="/reading" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          📖 {t('Reading')}
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          ⭐ {t('My Progress')}
        </NavLink>
        <button className="btn btn-sm btn-ghost" onClick={handleSignOut}>
          👋 {t('Sign out')}{profile?.username ? `, ${profile.username}` : ''}
        </button>
      </div>
    </nav>
  )
}
