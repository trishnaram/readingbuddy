import { useEffect, useState } from 'react'

const COLORS = ['#70d6ff', '#ff70a6', '#ff9770', '#ffd670', '#e9ff70']

/** Celebration burst - renders ~40 falling pieces then cleans itself up. */
export default function Confetti({ trigger }) {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    if (!trigger) return
    const batch = Array.from({ length: 40 }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      color: COLORS[i % COLORS.length],
      round: Math.random() > 0.5,
    }))
    setPieces(batch)
    const t = setTimeout(() => setPieces([]), 3600)
    return () => clearTimeout(t)
  }, [trigger])

  return (
    <>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}vw`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            borderRadius: p.round ? '50%' : '3px',
          }}
        />
      ))}
    </>
  )
}
