import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const SettingsContext = createContext(null)

const DEFAULTS = {
  textScale: 1,        // 0.85 - 1.6
  language: 'English', // translation target
}

export function SettingsProvider({ children }) {
  const { user, profile } = useAuth()
  const [settings, setSettings] = useState(DEFAULTS)

  // hydrate from profile when it loads
  useEffect(() => {
    if (profile?.settings && Object.keys(profile.settings).length) {
      setSettings({ ...DEFAULTS, ...profile.settings })
    }
  }, [profile])

  // apply text scale to the reader CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--reader-size', `${1.15 * settings.textScale}rem`)
  }, [settings.textScale])

  const update = async (patch) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    if (user) {
      await supabase.from('profiles').update({ settings: next }).eq('id', user.id)
    }
  }

  return (
    <SettingsContext.Provider value={{ settings, update }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)
