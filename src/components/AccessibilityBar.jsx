import { useSettings } from '../context/SettingsContext'
import { useT } from '../context/TranslationContext'

const LANGUAGES = ['English', 'Spanish', 'French', 'Mandarin Chinese', 'Hindi', 'Arabic', 'Portuguese', 'Korean', 'Kannada']

/**
 * Sits under the nav. Text size affects all reader text app-wide.
 * The language picker sets the site-wide translation target: every page's
 * text switches to it (see TranslationContext), except the reading
 * passage body, which stays English with its translation shown alongside.
 * Language names in the <select> are left untranslated on purpose - they
 * double as the exact value sent to the translator.
 */
export default function AccessibilityBar() {
  const { settings, update } = useSettings()
  const t = useT()

  return (
    <div className="a11y-bar" role="toolbar" aria-label="Reading accessibility tools">
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>🛠️ {t('Reading tools:')}</span>

      <div className="row" style={{ gap: 4 }}>
        <button
          className="btn btn-sm"
          aria-label={t('Make text smaller')}
          onClick={() => update({ textScale: Math.max(0.85, +(settings.textScale - 0.15).toFixed(2)) })}
        >
          A−
        </button>
        <button
          className="btn btn-sm"
          aria-label={t('Make text bigger')}
          onClick={() => update({ textScale: Math.min(1.6, +(settings.textScale + 0.15).toFixed(2)) })}
        >
          A+
        </button>
      </div>

      <label htmlFor="lang" style={{ margin: 0, fontSize: '0.9rem' }}>
        🌍 {t('Translate to:')}
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
        {t('(read-aloud 🔊 buttons appear next to any passage)')}
      </span>
    </div>
  )
}
