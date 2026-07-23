import { useState } from 'react'
import { useT } from '../context/TranslationContext'
import Buddy from './Buddy'
import Confetti from './Confetti'

/**
 * Runs a multiple-choice quiz one question at a time with instant
 * feedback animations. Calls onFinish(score, total) at the end.
 */
export default function QuizCard({ questions, onFinish, title = 'Quick Quiz' }) {
  const t = useT()
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState(null)   // option index the student chose
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [celebrate, setCelebrate] = useState(0)

  const q = questions[index]
  const isCorrect = picked !== null && picked === q?.answerIndex

  const pick = (i) => {
    if (picked !== null) return
    setPicked(i)
    if (i === q.answerIndex) setScore((s) => s + 1)
  }

  const next = () => {
    if (index + 1 >= questions.length) {
      const finalScore = score
      setDone(true)
      if (finalScore / questions.length >= 0.6) setCelebrate((c) => c + 1)
      onFinish?.(finalScore, questions.length)
    } else {
      setIndex((i) => i + 1)
      setPicked(null)
    }
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="card card-lime center anim-bounce-in">
        <Confetti trigger={celebrate} />
        <Buddy mood={pct >= 60 ? 'cheer' : 'happy'} size={110} />
        <h2>
          {pct >= 80 ? t('Amazing work! 🌟') : pct >= 60 ? t('Nice job! 🎉') : t('Good try! 💪')}
        </h2>
        <p style={{ fontSize: '1.2rem' }}>
          {t('You got')} <strong>{score}</strong> {t('out of')} <strong>{questions.length}</strong> ({pct}%)
        </p>
        {pct < 60 && <p className="muted">{t('Every champion reader practices. Review the lesson and try again!')}</p>}
      </div>
    )
  }

  return (
    <div className="card anim-bounce-in">
      <div className="row spread">
        <h3 style={{ margin: 0 }}>{t(title)}</h3>
        <span className="chip chip-sky">
          {index + 1} / {questions.length}
        </span>
      </div>

      <p style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: 16 }}>{t(q.question)}</p>

      <div className="stack">
        {q.options.map((opt, i) => {
          let cls = 'btn'
          if (picked !== null) {
            if (i === q.answerIndex) cls += ' answer-correct'
            else if (i === picked) cls += ' answer-wrong'
          }
          return (
            <button
              key={i}
              className={cls}
              style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left' }}
              onClick={() => pick(i)}
              disabled={picked !== null && i !== picked && i !== q.answerIndex}
            >
              <span className="chip" style={{ minWidth: 34, justifyContent: 'center' }}>
                {String.fromCharCode(65 + i)}
              </span>
              {t(opt)}
            </button>
          )
        })}
      </div>

      {picked !== null && (
        <div className="row spread" style={{ marginTop: 18 }}>
          <div className="row">
            <Buddy mood={isCorrect ? 'cheer' : 'thinking'} size={56} />
            <strong>{isCorrect ? t('You got it!') : `${t('Almost! The answer was')} ${String.fromCharCode(65 + q.answerIndex)}.`}</strong>
          </div>
          <button className="btn btn-coral" onClick={next}>
            {index + 1 >= questions.length ? t('See my score →') : t('Next question →')}
          </button>
        </div>
      )}
    </div>
  )
}
