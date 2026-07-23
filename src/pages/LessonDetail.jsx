import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { lessonById } from '../data/lessons'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { generateQuestions, lessonExampleFromText } from '../lib/llm'
import { bandByName } from '../lib/lexile'
import { useT } from '../context/TranslationContext'
import QuizCard from '../components/QuizCard'
import Buddy from '../components/Buddy'
import { speak } from '../lib/tts'

/**
 * Shows the lesson, then a mastery quiz. If the student has a current
 * reading passage saved (from the Reading page) AND the LLM function is
 * live, both the worked example and the quiz are generated fresh from
 * that passage; otherwise the built-in versions are used.
 */
export default function LessonDetail() {
  const { lessonId } = useParams()
  const { user, profile } = useAuth()
  const t = useT()
  const lesson = lessonById(lessonId)
  const band = bandByName(profile?.band ?? 'Explorer')

  const [stage, setStage] = useState('learn') // learn | quiz
  const [example, setExample] = useState(lesson?.example ?? '')
  const [personalized, setPersonalized] = useState(false)
  const [questions, setQuestions] = useState(lesson?.quiz ?? [])
  const [loadingQuiz, setLoadingQuiz] = useState(false)

  // try to personalize the example from the student's current passage
  useEffect(() => {
    if (!lesson) return
    const passage = sessionStorage.getItem('rb-current-passage')
    if (!passage) return
    lessonExampleFromText(passage, lesson.skill, band.name)
      .then((text) => {
        if (text?.trim()) {
          setExample(text.trim())
          setPersonalized(true)
        }
      })
      .catch(() => {})
  }, [lesson, band.name])

  const startQuiz = async () => {
    setLoadingQuiz(true)
    const passage = sessionStorage.getItem('rb-current-passage')
    if (passage) {
      try {
        const generated = await generateQuestions(passage, band.name, 4)
        setQuestions(generated)
      } catch {
        /* keep the built-in quiz */
      }
    }
    setLoadingQuiz(false)
    setStage('quiz')
  }

  const handleFinish = async (score, total) => {
    if (!user) return
    await supabase.from('quiz_results').insert({
      user_id: user.id,
      lesson_id: lesson.id,
      kind: 'lesson',
      score,
      total,
    })
    if (score / total >= 0.6) {
      await supabase
        .from('lesson_progress')
        .upsert({ user_id: user.id, lesson_id: lesson.id }, { onConflict: 'user_id,lesson_id' })
    }
  }

  if (!lesson) {
    return (
      <div className="page center">
        <Buddy mood="thinking" size={120} />
        <h2>{t("Hmm, that lesson doesn't exist.")}</h2>
        <Link to="/lessons" className="btn">{t('← Back to lessons')}</Link>
      </div>
    )
  }

  return (
    <div className="page page-narrow">
      <Link to="/lessons" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{t('← All lessons')}</Link>

      <div className="row" style={{ marginTop: 10 }}>
        <span style={{ fontSize: '2.6rem' }}>{lesson.emoji}</span>
        <div>
          <h1 style={{ marginBottom: 4 }}>{t(lesson.skill)}</h1>
          <span className="chip chip-sky">{t(lesson.band)} {t('band')}</span>
        </div>
      </div>

      {stage === 'learn' && (
        <>
          <div className="card" style={{ marginTop: 18 }}>
            <div className="row spread">
              <h2 style={{ margin: 0 }}>{t(lesson.title)}</h2>
              <button className="btn btn-sm btn-sky" onClick={() => speak(lesson.body)}>{t('🔊 Read to me')}</button>
            </div>
            <p className="reader-text" style={{ marginTop: 14 }}>{t(lesson.body)}</p>
          </div>

          <div className="card card-pink" style={{ marginTop: 18 }}>
            <div className="row spread">
              <h3 style={{ margin: 0 }}>
                {personalized ? t('✨ Example from YOUR book!') : t('✏️ Worked example')}
              </h3>
              <button className="btn btn-sm btn-sky" onClick={() => speak(example)}>🔊</button>
            </div>
            <p className="reader-text" style={{ marginTop: 12 }}>{t(example)}</p>
            {!personalized && (
              <p className="muted" style={{ fontSize: '0.85rem' }}>
                {t('Tip: open a book on the Reading page first, and this example will use YOUR story instead!')}
              </p>
            )}
          </div>

          <div className="center" style={{ marginTop: 26 }}>
            <button className="btn btn-coral btn-lg" onClick={startQuiz} disabled={loadingQuiz}>
              {loadingQuiz ? t('Buddy is writing your quiz…') : t("I'm ready for the quiz! ✏️")}
            </button>
          </div>
        </>
      )}

      {stage === 'quiz' && (
        <div style={{ marginTop: 18 }}>
          <QuizCard questions={questions} onFinish={handleFinish} title={`${t(lesson.skill)} — ${t('Quick Quiz')}`} />
          <div className="center" style={{ marginTop: 18 }}>
            <Link to="/lessons" className="btn">{t('← Back to lessons')}</Link>
          </div>
        </div>
      )}
    </div>
  )
}
