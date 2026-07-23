import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { DIAGNOSTIC } from '../data/lessons'
import { analyzeDiagnostic } from '../lib/llm'
import { bandForLexile } from '../lib/lexile'
import { useT } from '../context/TranslationContext'
import Buddy from '../components/Buddy'
import Confetti from '../components/Confetti'
import { speak, stop } from '../lib/tts'

/**
 * Placement flow: the student reads 4 passages of rising difficulty and
 * answers 2 questions each. Scoring maps to a lexile estimate locally;
 * if the LLM function is deployed it refines the estimate and writes a
 * personalized encouragement line.
 */
export default function Diagnostic() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const t = useT()

  const [stage, setStage] = useState('intro') // intro | quiz | saving | result
  const [passageIdx, setPassageIdx] = useState(0)
  const [questionIdx, setQuestionIdx] = useState(0)
  const [picked, setPicked] = useState(null)
  const [answers, setAnswers] = useState([]) // {level, correct}
  const [result, setResult] = useState(null)
  const [celebrate, setCelebrate] = useState(0)

  const current = DIAGNOSTIC[passageIdx]
  const question = current?.questions[questionIdx]

  const progress = useMemo(() => {
    const total = DIAGNOSTIC.reduce((n, p) => n + p.questions.length, 0)
    const done = answers.length
    return Math.round((done / total) * 100)
  }, [answers])

  const pick = (i) => {
    if (picked !== null) return
    setPicked(i)
    setAnswers((a) => [...a, { level: current.level, lexile: current.lexile, correct: i === question.answerIndex }])
  }

  const next = async () => {
    setPicked(null)
    if (questionIdx + 1 < current.questions.length) {
      setQuestionIdx((q) => q + 1)
      return
    }
    if (passageIdx + 1 < DIAGNOSTIC.length) {
      setPassageIdx((p) => p + 1)
      setQuestionIdx(0)
      return
    }
    await finish()
  }

  const finish = async () => {
    setStage('saving')
    stop()

    // local estimate: highest level where the student got both right,
    // nudged by partial credit above it
    let estimate = 350
    for (const p of DIAGNOSTIC) {
      const got = answers.filter((a) => a.level === p.level && a.correct).length
      const total = p.questions.length
      if (got === total) estimate = p.lexile
      else if (got > 0) estimate = Math.max(estimate, p.lexile - 100)
    }

    let final = { lexile: estimate, band: bandForLexile(estimate).name, encouragement: '' }

    // let the LLM refine if it's deployed
    try {
      const summary = DIAGNOSTIC.map((p) => {
        const got = answers.filter((a) => a.level === p.level && a.correct).length
        return `${p.level} passage (~${p.lexile}L): ${got}/${p.questions.length} correct`
      }).join('\n')
      const llm = await analyzeDiagnostic(summary)
      if (llm?.lexile) final = { ...llm }
    } catch {
      /* fallback to the local estimate - totally fine */
    }

    // persist
    const correctCount = answers.filter((a) => a.correct).length
    await supabase.from('quiz_results').insert({
      user_id: user.id,
      kind: 'diagnostic',
      score: correctCount,
      total: answers.length,
    })
    await supabase
      .from('profiles')
      .update({ lexile: final.lexile, band: final.band, diagnostic_done: true })
      .eq('id', user.id)
    await refreshProfile()

    setResult(final)
    setCelebrate((c) => c + 1)
    setStage('result')
  }

  /* ---------- render ---------- */

  if (stage === 'intro') {
    return (
      <div className="page page-narrow center" style={{ paddingTop: 48 }}>
        <Buddy mood="happy" size={150} float />
        <h1 className="anim-bounce-in">{t("Let's find your perfect books! 🔎")}</h1>
        <div className="card card-sky anim-bounce-in" style={{ textAlign: 'left', animationDelay: '0.1s' }}>
          <p>{t("Hi! I'm Buddy. Before we start, let's play a short reading game — 4 mini stories with 2 questions each.")}</p>
          <p>{t("Some will be easy, some might be tricky. That's on purpose! It helps me pick lessons and books that fit you just right.")}</p>
          <p className="muted">{t("There's no failing — every answer helps me learn about you. 💙")}</p>
        </div>
        <button className="btn btn-coral btn-lg anim-wiggle" style={{ marginTop: 20 }} onClick={() => setStage('quiz')}>
          {t("I'm ready! Let's go 🚀")}
        </button>
      </div>
    )
  }

  if (stage === 'saving') {
    return (
      <div className="page center" style={{ paddingTop: 120 }}>
        <Buddy mood="thinking" size={130} float />
        <h2>{t('Buddy is thinking about your answers…')}</h2>
      </div>
    )
  }

  if (stage === 'result' && result) {
    const band = bandForLexile(result.lexile)
    return (
      <div className="page page-narrow center" style={{ paddingTop: 48 }}>
        <Confetti trigger={celebrate} />
        <Buddy mood="cheer" size={150} />
        <h1 className="anim-bounce-in">{t("You're a")} {t(band.name)}! {band.emoji}</h1>
        <div className="card card-lime anim-bounce-in" style={{ animationDelay: '0.1s' }}>
          <p style={{ fontSize: '1.2rem' }}>
            {t('Your reading level:')} <strong>{t('about')} {result.lexile}L</strong>
          </p>
          <p>{t(result.encouragement || band.blurb)}</p>
          <p className="muted">{t('Your lessons and book picks are now tuned to your level. You can always grow to the next band!')}</p>
        </div>
        <button className="btn btn-coral btn-lg" style={{ marginTop: 20 }} onClick={() => navigate('/lessons')}>
          {t('Show me my lessons! 📚')}
        </button>
      </div>
    )
  }

  return (
    <div className="page page-narrow">
      <div className="row spread" style={{ marginBottom: 14 }}>
        <span className="chip">{t('Story')} {passageIdx + 1} {t('of')} {DIAGNOSTIC.length}</span>
        <div className="progress-track" style={{ flex: 1, maxWidth: 300 }}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="card card-sky">
        <div className="row spread">
          <h3 style={{ margin: 0 }}>{t('📖 Read this little story')}</h3>
          <button className="btn btn-sm btn-sky" onClick={() => speak(current.passage)}>
            {t('🔊 Read to me')}
          </button>
        </div>
        <p className="reader-text" style={{ marginTop: 12 }}>{t(current.passage)}</p>
      </div>

      <div className="card anim-bounce-in" style={{ marginTop: 18 }} key={`${passageIdx}-${questionIdx}`}>
        <p style={{ fontSize: '1.15rem', fontWeight: 700 }}>{t(question.question)}</p>
        <div className="stack">
          {question.options.map((opt, i) => {
            let cls = 'btn'
            if (picked !== null) {
              if (i === question.answerIndex) cls += ' answer-correct'
              else if (i === picked) cls += ' answer-wrong'
            }
            return (
              <button key={i} className={cls} style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => pick(i)}>
                <span className="chip" style={{ minWidth: 34, justifyContent: 'center' }}>{String.fromCharCode(65 + i)}</span>
                {t(opt)}
              </button>
            )
          })}
        </div>
        {picked !== null && (
          <div className="row" style={{ marginTop: 16, justifyContent: 'flex-end' }}>
            <button className="btn btn-coral" onClick={next}>{t('Keep going →')}</button>
          </div>
        )}
      </div>
    </div>
  )
}
