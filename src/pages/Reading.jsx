import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { supabase } from '../lib/supabase'
import { searchBooks, fetchPassages } from '../lib/gutenberg'
import { translatePage } from '../lib/llm'
import { bandByName } from '../lib/lexile'
import { speak, stop } from '../lib/tts'
import Buddy from '../components/Buddy'

// English defaults for every translatable label on the open-book view.
// Sent to the LLM alongside the passage so the whole page (not just the
// text) switches language together. The Lessons page/feature is separate
// and is never touched by this.
const UI_STRINGS = {
  backToLibrary: '← Back to library',
  pick: 'pick',
  part: 'Part',
  of: 'of',
  readAloud: '🔊 Read aloud',
  stop: '⏹ Stop',
  translate: '🌍 Translate',
  previous: '← Previous',
  next: 'Next →',
  by: 'by',
}

/**
 * Pulls public-domain books (Project Gutenberg via Gutendex) matched to
 * the student's band, slices them into right-sized passages, and offers
 * read-aloud + translation. The current passage is stashed in
 * sessionStorage so lessons can teach from it.
 */
export default function Reading() {
  const { user, profile } = useAuth()
  const { settings } = useSettings()
  const band = bandByName(profile?.band ?? 'Explorer')

  const [books, setBooks] = useState([])
  const [query, setQuery] = useState('')
  const [loadingBooks, setLoadingBooks] = useState(true)
  const [error, setError] = useState('')

  const [book, setBook] = useState(null)
  const [passages, setPassages] = useState([])
  const [pageIdx, setPageIdx] = useState(0)
  const [loadingText, setLoadingText] = useState(false)

  const [translation, setTranslation] = useState('')
  const [translating, setTranslating] = useState(false)
  const [ui, setUi] = useState(UI_STRINGS)

  const loadBooks = async (q = '') => {
    setLoadingBooks(true)
    setError('')
    try {
      const results = await searchBooks(band, q)
      setBooks(results.filter((b) => b.textUrl))
    } catch (e) {
      setError('Could not load the library right now. Check your internet and try again!')
    } finally {
      setLoadingBooks(false)
    }
  }

  useEffect(() => {
    loadBooks()
    return () => stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [band.name])

  const openBook = async (b) => {
    setBook(b)
    setLoadingText(true)
    setPassages([])
    setPageIdx(0)
    setTranslation('')
    setUi(UI_STRINGS)
    stop()
    try {
      const chunks = await fetchPassages(b, band)
      setPassages(chunks)
      sessionStorage.setItem('rb-current-passage', chunks[0])
      await supabase.from('reading_log').insert({
        user_id: user.id,
        gutenberg_id: b.id,
        title: b.title,
        author: b.author,
      })
    } catch (e) {
      setError(`Hmm, "${b.title}" wouldn't open. Try another book!`)
      setBook(null)
    } finally {
      setLoadingText(false)
    }
  }

  const changePage = (dir) => {
    stop()
    setTranslation('')
    setUi(UI_STRINGS)
    setPageIdx((i) => {
      const next = Math.min(Math.max(0, i + dir), passages.length - 1)
      sessionStorage.setItem('rb-current-passage', passages[next])
      return next
    })
  }

  const translate = async () => {
    if (settings.language === 'English') {
      setTranslation('Pick a language in the Reading tools bar above first! 🌍')
      return
    }
    setTranslating(true)
    try {
      const result = await translatePage(passages[pageIdx], UI_STRINGS, settings.language)
      setTranslation(result.passage)
      setUi({ ...UI_STRINGS, ...result.ui })
    } catch {
      setTranslation('Translation needs the LLM helper to be set up — ask a grown-up to deploy the Edge Function!')
    } finally {
      setTranslating(false)
    }
  }

  /* ---------- book open view ---------- */
  if (book && passages.length > 0) {
    return (
      <div className={`page ${translation ? '' : 'page-narrow'}`}>
        <button className="btn btn-sm" onClick={() => { setBook(null); stop() }}>{ui.backToLibrary}</button>

        <div className="row spread" style={{ marginTop: 12 }}>
          <div>
            <h1 style={{ marginBottom: 2 }}>{book.title}</h1>
            <p className="muted" style={{ margin: 0 }}>{ui.by} {book.author}</p>
          </div>
          <span className="chip">{band.emoji} {band.name} {ui.pick}</span>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <div className="row spread" style={{ marginBottom: 10 }}>
            <span className="chip chip-sky">{ui.part} {pageIdx + 1} {ui.of} {passages.length}</span>
            <div className="row">
              <button className="btn btn-sm btn-sky" onClick={() => speak(passages[pageIdx])}>{ui.readAloud}</button>
              <button className="btn btn-sm" onClick={stop}>{ui.stop}</button>
              <button className="btn btn-sm btn-pink" onClick={translate} disabled={translating}>
                {translating ? 'Translating…' : `${ui.translate}${settings.language === 'English' ? '' : `: ${settings.language}`}`}
              </button>
            </div>
          </div>

          <div className={translation ? 'translate-grid' : undefined}>
            <p className="reader-text" style={{ margin: 0 }}>{passages[pageIdx]}</p>

            {translation && (
              <div className="card card-pink card-flat" style={{ margin: 0 }}>
                <h3>🌍 {settings.language}</h3>
                <p className="reader-text">{translation}</p>
              </div>
            )}
          </div>
        </div>

        <div className="row spread" style={{ marginTop: 16 }}>
          <button className="btn" onClick={() => changePage(-1)} disabled={pageIdx === 0}>{ui.previous}</button>
          <Buddy mood="happy" size={64} />
          <button className="btn btn-coral" onClick={() => changePage(1)} disabled={pageIdx === passages.length - 1}>{ui.next}</button>
        </div>

        <div className="card card-lime card-flat center" style={{ marginTop: 20 }}>
          <p style={{ margin: 0 }}>
            💡 Head to <strong>Lessons</strong> while this book is open — Buddy will teach using <em>this very story</em>!
          </p>
        </div>
      </div>
    )
  }

  /* ---------- library view ---------- */
  return (
    <div className="page">
      <div className="row spread">
        <div>
          <h1>The Library 📚</h1>
          <p className="muted">
            Books picked for the <strong>{band.name}</strong> band {band.emoji} — all free, from Project Gutenberg.
          </p>
        </div>
        <Buddy mood="happy" size={96} float />
      </div>

      <form
        className="row"
        onSubmit={(e) => { e.preventDefault(); loadBooks(query) }}
        style={{ margin: '10px 0 22px' }}
      >
        <input
          className="input"
          style={{ maxWidth: 360 }}
          placeholder="Search for animals, adventure, space…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search the library"
        />
        <button className="btn btn-sun">🔍 Search</button>
      </form>

      {error && <div className="card card-pink card-flat" role="alert">{error}</div>}

      {loadingBooks ? (
        <div className="center" style={{ paddingTop: 40 }}>
          <Buddy mood="thinking" size={110} float />
          <h3>Buddy is browsing the shelves…</h3>
        </div>
      ) : (
        <div className="grid grid-3">
          {books.map((b, i) => (
            <button
              key={b.id}
              className="card card-flat anim-wiggle"
              style={{ textAlign: 'left', animationDelay: `${i * 0.03}s`, font: 'inherit' }}
              onClick={() => openBook(b)}
            >
              {b.cover && (
                <img
                  src={b.cover}
                  alt=""
                  style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 12, border: '2.5px solid var(--ink)' }}
                />
              )}
              <h3 style={{ marginTop: 10 }}>{b.title.length > 60 ? b.title.slice(0, 57) + '…' : b.title}</h3>
              <p className="muted" style={{ margin: 0 }}>{b.author}</p>
            </button>
          ))}
        </div>
      )}

      {loadingText && (
        <div className="center" style={{ paddingTop: 30 }}>
          <Buddy mood="thinking" size={100} float />
          <h3>Opening your book…</h3>
        </div>
      )}
    </div>
  )
}
