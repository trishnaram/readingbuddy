import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Buddy from '../components/Buddy'

export default function Login() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: username || email.split('@')[0] } },
        })
        if (error) throw error
        alert(`Almost there! 📬 We sent a confirmation link to ${email}. Click it, then sign in!`)
        setMode('signin')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/lessons')
      }
    } catch (err) {
      setError(err.message ?? 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="page page-narrow" style={{ paddingTop: 48 }}>
      <div className="center" style={{ marginBottom: 24 }}>
        <Buddy mood="happy" size={150} float />
        <h1 className="anim-bounce-in">
          Reading<span style={{ color: 'var(--pink)' }}>Buddy</span>
        </h1>
        <p className="muted" style={{ fontSize: '1.1rem' }}>
          Grow your reading superpowers, one story at a time. 🚀
        </p>
      </div>

      <div className="card anim-bounce-in" style={{ animationDelay: '0.1s' }}>
        <div className="row" style={{ marginBottom: 18 }}>
          <button
            className={`btn ${mode === 'signin' ? 'btn-sun' : 'btn-ghost'}`}
            onClick={() => setMode('signin')}
          >
            Sign in
          </button>
          <button
            className={`btn ${mode === 'signup' ? 'btn-sun' : 'btn-ghost'}`}
            onClick={() => setMode('signup')}
          >
            New reader? Join!
          </button>
        </div>

        <form onSubmit={submit} className="stack">
          {mode === 'signup' && (
            <div>
              <label htmlFor="username">What should Buddy call you?</label>
              <input
                id="username"
                className="input"
                placeholder="e.g. StarReader7"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p role="alert" style={{ background: 'var(--pink-pale)', border: '2.5px solid var(--pink)', borderRadius: 12, padding: '10px 14px' }}>
              {error}
            </p>
          )}
          {notice && (
            <p style={{ background: 'var(--lime-pale)', border: '2.5px solid var(--ink)', borderRadius: 12, padding: '10px 14px' }}>
              {notice}
            </p>
          )}

          <button className="btn btn-coral btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
            {busy ? 'One moment…' : mode === 'signup' ? 'Start my adventure! 🎒' : 'Back to reading! 📖'}
          </button>
        </form>
      </div>

      <p className="center muted" style={{ marginTop: 20, fontSize: '0.9rem' }}>
        New readers take a short placement adventure so lessons fit just right.
      </p>
    </div>
  )
}
