/**
 * ReadingBuddy groups lexile ranges into four kid-friendly bands.
 * The diagnostic estimates a number; everything else keys off the band.
 */

export const BANDS = [
  { name: 'Sprout',   emoji: '🌱', min: 0,    max: 500,  color: 'var(--lime)',  blurb: 'Just starting to grow!' },
  { name: 'Explorer', emoji: '🧭', min: 500,  max: 800,  color: 'var(--sky)',   blurb: 'Discovering new worlds.' },
  { name: 'Voyager',  emoji: '🚀', min: 800,  max: 1000, color: 'var(--coral)', blurb: 'Traveling far through stories.' },
  { name: 'Champion', emoji: '🏆', min: 1000, max: 1400, color: 'var(--sun)',   blurb: 'A true reading champion.' },
]

export function bandForLexile(lexile) {
  return BANDS.find((b) => lexile >= b.min && lexile < b.max) ?? BANDS[BANDS.length - 1]
}

export function bandByName(name) {
  return BANDS.find((b) => b.name === name) ?? BANDS[1]
}

/* ---------- readability estimation (for picking passages) ---------- */

function countSyllables(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (!w) return 0
  if (w.length <= 3) return 1
  const stripped = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '')
  const groups = stripped.match(/[aeiouy]{1,2}/g)
  return Math.max(1, groups ? groups.length : 1)
}

/** Flesch-Kincaid grade level for a chunk of text. */
export function fkGrade(text) {
  const sentences = Math.max(1, (text.match(/[.!?]+/g) || []).length)
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length < 20) return 8
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0)
  return 0.39 * (words.length / sentences) + 11.8 * (syllables / words.length) - 15.59
}

/** Very rough FK grade -> lexile mapping, good enough for passage filtering. */
export function gradeToLexile(grade) {
  const table = [
    [1, 250], [2, 450], [3, 600], [4, 700], [5, 800],
    [6, 900], [7, 970], [8, 1030], [9, 1080], [10, 1120],
    [11, 1160], [12, 1200],
  ]
  if (grade <= 1) return 200
  for (const [g, lex] of table) {
    if (grade <= g) return lex
  }
  return 1250
}

export function estimateLexile(text) {
  return gradeToLexile(fkGrade(text))
}

/** Does this passage fit the band (with a friendly margin)? */
export function passageFitsBand(text, band, margin = 150) {
  const lex = estimateLexile(text)
  return lex >= band.min - margin && lex <= band.max + margin
}
