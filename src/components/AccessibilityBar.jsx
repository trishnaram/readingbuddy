import { useSettings } from '../context/SettingsContext'

const LANGUAGES = ['English', 'Spanish', 'French', 'Mandarin Chinese', 'Hindi', 'Arabic', 'Portuguese', 'Korean', 'Kannada']

/**
 * Sits under the nav. Text size affects all reader text app-wide.
 * The language picker sets the translation target used on the Reading page.
 */
export default function AccessibilityBar() {
  const { settings, update } = useSettings()

  return (
    <div className="a11y-bar" role="toolbar" aria-label="Reading accessibility tools">
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>🛠️ Reading tools:</span>

      <div className="row" style={{ gap: 4 }}>
        <button
          className="btn btn-sm"
          aria-label="Make text smaller"
          onClick={() => update({ textScale: Math.max(0.85, +(settings.textScale - 0.15).toFixed(2)) })}
        >
          A−
        </button>
        <button
          className="btn btn-sm"
          aria-label="Make text bigger"
          onClick={() => update({ textScale: Math.min(1.6, +(settings.textScale + 0.15).toFixed(2)) })}
        >
          A+
        </button>
      </div>

      <label htmlFor="lang" style={{ margin: 0, fontSize: '0.9rem' }}>
        🌍 Translate to:
      </label>
      <select
        id="lang"
        className="input"
        style={{ width: 'auto', padding: '4px 10px', fontSize: '0.9rem' }}
        value={settings.language}
        onChange={(e) => update({ language: e.target.value })}
      >
        {LANGUAGES.map((l) => (
          <option key={l}>{l}</option>
        ))}
      </select>
      <span className="muted" style={{ fontSize: '0.8rem' }}>
        (read-aloud 🔊 buttons appear next to any passage)
      </span>
    </div>
  )
}
