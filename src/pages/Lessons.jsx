import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { lessonsForBand, LESSONS } from '../data/lessons'
import { bandByName, BANDS } from '../lib/lexile'
import Buddy from '../components/Buddy'

export default function Lessons() {
  const { user, profile } = useAuth()
  const [completed, setCompleted] = useState(new Set())
  const [showAll, setShowAll] = useState(false)

  const band = bandByName(profile?.band ?? 'Explorer')
  const myLessons = lessonsForBand(band.name)

  useEffect(() => {
    if (!user) return
    supabase
      .from('lesson_progress')
      .select('lesson_id')
      .eq('user_id', user.id)
      .then(({ data }) => setCompleted(new Set((data ?? []).map((r) => r.lesson_id))))
  }, [user])

  const doneInBand = myLessons.filter((l) => completed.has(l.id)).length

  const renderLesson = (lesson, locked = false) => (
    <Link
      key={lesson.id}
      to={locked ? '#' : `/lessons/${lesson.id}`}
      style={{ textDecoration: 'none', pointerEvents: locked ? 'none' : 'auto' }}
      aria-disabled={locked}
    >
      <div className={`card card-flat anim-wiggle ${completed.has(lesson.id) ? 'card-lime' : ''}`} style={{ opacity: locked ? 0.55 : 1, height: '100%' }}>
        <div className="row spread">
          <span style={{ fontSize: '2rem' }}>{lesson.emoji}</span>
          {completed.has(lesson.id) && <span className="chip chip-lime">✓ Done!</span>}
          {locked && <span className="chip">🔒 {lesson.band}</span>}
        </div>
        <h3 style={{ marginTop: 10 }}>{lesson.skill}</h3>
        <p className="muted" style={{ margin: 0 }}>{lesson.title}</p>
      </div>
    </Link>
  )

  return (
    <div className="page">
      <div className="row spread" style={{ marginBottom: 8 }}>
        <div>
          <h1>Your lessons {band.emoji}</h1>
          <p className="muted">
            You're in the <strong>{band.name}</strong> band — {band.blurb}
          </p>
        </div>
        <Buddy mood={doneInBand === myLessons.length && myLessons.length > 0 ? 'cheer' : 'happy'} size={100} float />
      </div>

      <div className="card card-sky card-flat" style={{ marginBottom: 24 }}>
        <div className="row spread">
          <strong style={{ fontFamily: 'var(--font-display)' }}>
            Band progress: {doneInBand} / {myLessons.length} lessons
          </strong>
          <div className="progress-track" style={{ flex: 1, maxWidth: 320 }}>
            <div className="progress-fill" style={{ width: `${(doneInBand / Math.max(1, myLessons.length)) * 100}%` }} />
          </div>
        </div>
        {doneInBand === myLessons.length && myLessons.length > 0 && (
          <p style={{ margin: '10px 0 0' }}>
            🎉 You finished every lesson in your band! Peek at the next band below, or keep sharpening your skills on the Reading page.
          </p>
        )}
      </div>

      <div className="grid grid-3">{myLessons.map((l) => renderLesson(l))}</div>

      <div style={{ marginTop: 32 }}>
        <button className="btn btn-sm" onClick={() => setShowAll((s) => !s)}>
          {showAll ? 'Hide other bands' : '👀 Peek at other bands'}
        </button>
        {showAll && (
          <div className="stack" style={{ marginTop: 16 }}>
            {BANDS.filter((b) => b.name !== band.name).map((b) => (
              <div key={b.name}>
                <h2>
                  {b.emoji} {b.name} band
                </h2>
                <div className="grid grid-3">
                  {LESSONS.filter((l) => l.band === b.name).map((l) => renderLesson(l, b.min > band.min))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
