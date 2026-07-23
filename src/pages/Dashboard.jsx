import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { bandByName, BANDS } from '../lib/lexile'
import { LESSONS } from '../data/lessons'
import { useT } from '../context/TranslationContext'
import Buddy from '../components/Buddy'

const SHELF_COLORS = ['var(--sky)', 'var(--pink)', 'var(--coral)', 'var(--sun)', 'var(--lime)']

export default function Dashboard() {
  const t = useT()
  const { user, profile } = useAuth()
  const [results, setResults] = useState([])
  const [progress, setProgress] = useState([])
  const [log, setLog] = useState([])

  const band = bandByName(profile?.band ?? 'Explorer')

  useEffect(() => {
    if (!user) return
    supabase.from('quiz_results').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30)
      .then(({ data }) => setResults(data ?? []))
    supabase.from('lesson_progress').select('*').eq('user_id', user.id)
      .then(({ data }) => setProgress(data ?? []))
    supabase.from('reading_log').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(12)
      .then(({ data }) => setLog(data ?? []))
  }, [user])

  const lessonResults = results.filter((r) => r.kind === 'lesson')
  const avgScore = lessonResults.length
    ? Math.round((lessonResults.reduce((s, r) => s + r.score / r.total, 0) / lessonResults.length) * 100)
    : null

  const bandLessons = LESSONS.filter((l) => l.band === band.name)
  const doneInBand = bandLessons.filter((l) => progress.some((p) => p.lesson_id === l.id)).length
  const bandIdx = BANDS.findIndex((b) => b.name === band.name)

  // unique books opened -> bookshelf
  const uniqueBooks = [...new Map(log.map((r) => [r.gutenberg_id, r])).values()]

  return (
    <div className="page">
      <div className="row spread">
        <div>
          <h1>{t('Hi')} {profile?.username ?? t('reader')}! ⭐</h1>
          <p className="muted">{t("Here's how your reading adventure is going.")}</p>
        </div>
        <Buddy mood={avgScore >= 80 ? 'cheer' : 'happy'} size={100} float />
      </div>

      {/* stat cards */}
      <div className="grid grid-3" style={{ marginTop: 10 }}>
        <div className="card card-sky center">
          <div style={{ fontSize: '2.4rem' }}>{band.emoji}</div>
          <h3>{t(band.name)} {t('band')}</h3>
          <p className="muted" style={{ margin: 0 }}>~{profile?.lexile ?? '—'}L {t('reading level')}</p>
        </div>
        <div className="card card-lime center">
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 800 }}>
            {progress.length}
          </div>
          <h3>{t('Lessons completed')}</h3>
          <p className="muted" style={{ margin: 0 }}>{doneInBand}/{bandLessons.length} {t('in your band')}</p>
        </div>
        <div className="card card-pink center">
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 800 }}>
            {avgScore !== null ? `${avgScore}%` : '—'}
          </div>
          <h3>{t('Average quiz score')}</h3>
          <p className="muted" style={{ margin: 0 }}>{lessonResults.length} {t('quizzes taken')}</p>
        </div>
      </div>

      {/* journey through the bands */}
      <div className="card" style={{ marginTop: 20 }}>
        <h2>{t('Your reading journey 🗺️')}</h2>
        <div className="row" style={{ gap: 8 }}>
          {BANDS.map((b, i) => (
            <div key={b.name} className="row" style={{ gap: 8 }}>
              <span
                className="chip"
                style={{
                  background: i <= bandIdx ? b.color : '#fff',
                  opacity: i <= bandIdx ? 1 : 0.5,
                }}
              >
                {b.emoji} {t(b.name)}
              </span>
              {i < BANDS.length - 1 && <span aria-hidden>→</span>}
            </div>
          ))}
        </div>
        <div className="progress-track" style={{ marginTop: 14 }}>
          <div
            className="progress-fill"
            style={{ width: `${((bandIdx + doneInBand / Math.max(1, bandLessons.length)) / BANDS.length) * 100}%` }}
          />
        </div>
        <p className="muted" style={{ marginBottom: 0 }}>
          {t("Finish your band's lessons with strong quiz scores to grow toward the next band!")}
        </p>
      </div>

      {/* bookshelf */}
      <div className="card" style={{ marginTop: 20 }}>
        <h2>{t('Your bookshelf 📚')}</h2>
        {uniqueBooks.length === 0 ? (
          <p className="muted">
            {t('No books yet —')} <Link to="/reading">{t('open your first one')}</Link> {t("and it'll appear here!")}
          </p>
        ) : (
          <>
            <div className="shelf">
              {uniqueBooks.map((b, i) => (
                <div
                  key={b.id}
                  className="shelf-book"
                  title={t(b.title)}
                  style={{
                    height: 55 + ((i * 17) % 30),
                    background: SHELF_COLORS[i % SHELF_COLORS.length],
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              ))}
            </div>
            <p className="muted" style={{ marginBottom: 0 }}>
              {uniqueBooks.length} {uniqueBooks.length === 1 ? t('book') : t('books')} {t('explored. Latest:')} <em>{t(uniqueBooks[0].title)}</em>
            </p>
          </>
        )}
      </div>

      {/* recent quizzes */}
      <div className="card" style={{ marginTop: 20 }}>
        <h2>{t('Recent quizzes ✏️')}</h2>
        {results.length === 0 ? (
          <p className="muted">
            {t('Take your first')} <Link to="/lessons">{t('lesson quiz')}</Link> {t('to see your scores here.')}
          </p>
        ) : (
          <div className="stack">
            {results.slice(0, 8).map((r) => {
              const pct = Math.round((r.score / r.total) * 100)
              const lesson = LESSONS.find((l) => l.id === r.lesson_id)
              return (
                <div key={r.id} className="row spread" style={{ borderBottom: '2px dashed rgba(37,49,88,0.15)', paddingBottom: 8 }}>
                  <span>
                    {r.kind === 'diagnostic' ? t('🧭 Placement adventure') : `${lesson?.emoji ?? '✏️'} ${t(lesson?.skill ?? r.lesson_id)}`}
                  </span>
                  <span className="row" style={{ gap: 10 }}>
                    <span className="muted" style={{ fontSize: '0.85rem' }}>
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                    <span className={`chip ${pct >= 80 ? 'chip-lime' : pct >= 60 ? '' : 'chip-pink'}`}>
                      {r.score}/{r.total}
                    </span>
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
