/**
 * Buddy — the ReadingBuddy mascot. An animated open book with a face.
 * Moods: happy | cheer | thinking | sleepy
 */
export default function Buddy({ mood = 'happy', size = 120, float = false }) {
  const mouth = {
    happy:    <path d="M52 66 Q60 74 68 66" stroke="#253158" strokeWidth="3.5" fill="none" strokeLinecap="round" />,
    cheer:    <path d="M50 64 Q60 78 70 64 Z" fill="#253158" />,
    thinking: <circle cx="60" cy="68" r="3.5" fill="#253158" />,
    sleepy:   <path d="M54 68 Q60 71 66 68" stroke="#253158" strokeWidth="3.5" fill="none" strokeLinecap="round" />,
  }[mood]

  const eyes =
    mood === 'sleepy' ? (
      <>
        <path d="M42 52 Q47 56 52 52" stroke="#253158" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <path d="M68 52 Q73 56 78 52" stroke="#253158" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </>
    ) : (
      <>
        <circle className="buddy-eye" cx="47" cy="52" r="5" fill="#253158" />
        <circle className="buddy-eye" cx="73" cy="52" r="5" fill="#253158" />
        <circle cx="49" cy="50" r="1.6" fill="#fff" />
        <circle cx="75" cy="50" r="1.6" fill="#fff" />
      </>
    )

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label={`Buddy the book, feeling ${mood}`}
      className={float ? 'anim-float' : undefined}
    >
      {/* cheering arms */}
      {mood === 'cheer' && (
        <>
          <path d="M18 60 Q6 44 16 34" stroke="#253158" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M102 60 Q114 44 104 34" stroke="#253158" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      )}
      {/* book pages */}
      <path
        d="M20 30 Q40 20 60 30 Q80 20 100 30 L100 88 Q80 78 60 88 Q40 78 20 88 Z"
        fill="#fff"
        stroke="#253158"
        strokeWidth="4"
      />
      {/* spine */}
      <line x1="60" y1="30" x2="60" y2="88" stroke="#253158" strokeWidth="3" strokeDasharray="4 5" opacity="0.35" />
      {/* cover peeking below */}
      <path
        d="M20 88 Q40 78 60 88 Q80 78 100 88 L100 96 Q80 86 60 96 Q40 86 20 96 Z"
        fill="#70d6ff"
        stroke="#253158"
        strokeWidth="4"
      />
      {/* rosy cheeks */}
      <circle cx="38" cy="60" r="4.5" fill="#ff70a6" opacity="0.55" />
      <circle cx="82" cy="60" r="4.5" fill="#ff70a6" opacity="0.55" />
      {eyes}
      {mouth}
      {/* thinking bubble */}
      {mood === 'thinking' && (
        <>
          <circle cx="96" cy="26" r="4" fill="#fff" stroke="#253158" strokeWidth="2.5" />
          <circle cx="106" cy="14" r="6.5" fill="#fff" stroke="#253158" strokeWidth="2.5" />
        </>
      )}
    </svg>
  )
}
