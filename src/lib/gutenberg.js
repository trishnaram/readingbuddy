import { passageFitsBand } from './lexile'
import { supabase } from './supabase'

/**
 * Public-domain texts via the free Gutendex API (no key required).
 * https://gutendex.com
 */

const SEARCH_TOPICS = {
  Sprout:   ['children', 'fairy tales', 'nursery'],
  Explorer: ['children', 'juvenile fiction', 'adventure'],
  Voyager:  ['adventure', 'short stories', 'fiction'],
  Champion: ['classic', 'literature', 'science fiction'],
}

/* ---------- content safety ---------- */

// Subjects, bookshelves or titles matching any of these mean the whole book is hidden.
const BLOCKED_BOOK_TERMS = [
  'erotic', 'sex', 'sexual', 'pornograph', 'obscen', 'prostitut', 'courtesan', 'brothel',
  'flagellation', 'sadism', 'masochism', 'fetish', 'venereal', 'contracepti',
  'birth control', 'marriage manual', 'kama sutra', 'kamasutra', 'fanny hill',
  'marquis de sade', 'libertine', 'decameron', 'heptameron', 'satyricon',
  'rape', 'incest', 'torture', 'cannibal',
]

// Younger bands only see books catalogued as children's literature.
const KID_TERMS = ['juvenile', 'children', 'fairy tales', 'nursery rhymes', 'picture books']
const KID_ONLY_BANDS = ['Sprout', 'Explorer']

// Passages containing any of these words are skipped.
const BLOCKED_PASSAGE_WORDS = [
  'fuck\\w*', 'shit\\w*', 'cunt\\w*', 'whore\\w*', 'slut\\w*', 'bastard\\w*', 'nigger\\w*',
  'dick', 'cock', 'pussy', 'penis\\w*', 'vagina\\w*', 'breasts?', 'nipples?', 'naked',
  'nude', 'sexual\\w*', 'sex', 'erotic\\w*', 'orgasm\\w*', 'rape[ds]?', 'raping',
  'bosom', 'lust\\w*', 'harlot\\w*', 'prostitut\\w*', 'seduc\\w*', 'mistress\\w*',
  'brothel\\w*', 'damn\\w*', 'goddam\\w*', 'hell', 'bloody',
]
const BLOCKED_PASSAGE_RE = new RegExp(`\\b(${BLOCKED_PASSAGE_WORDS.join('|')})\\b`, 'i')

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const BLOCKED_BOOK_RE = new RegExp(`\\b(${BLOCKED_BOOK_TERMS.map(escapeRe).join('|')})`, 'i')

export function isQueryAllowed(query) {
  return !BLOCKED_BOOK_RE.test(query) && !BLOCKED_PASSAGE_RE.test(query)
}

function isBookAllowed(book, band) {
  const tags = [...(book.subjects || []), ...(book.bookshelves || [])].join(' | ')
  if (BLOCKED_BOOK_RE.test(tags) || BLOCKED_BOOK_RE.test(book.title || '')) return false
  if (KID_ONLY_BANDS.includes(band.name)) {
    const lower = tags.toLowerCase()
    if (!KID_TERMS.some((t) => lower.includes(t))) return false
  }
  return true
}

export function isPassageAllowed(text) {
  return !BLOCKED_PASSAGE_RE.test(text)
}

export async function searchBooks(band, query = '') {
  if (query && !isQueryAllowed(query)) return []
  const topic = query || SEARCH_TOPICS[band.name][0]
  const url = `https://gutendex.com/books?search=${encodeURIComponent(topic)}&languages=en&mime_type=text%2Fplain`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Book search failed')
  const data = await res.json()
  return (data.results || []).filter((b) => isBookAllowed(b, band)).slice(0, 12).map((b) => ({
    id: b.id,
    title: b.title,
    author: b.authors?.[0]?.name ?? 'Unknown author',
    cover: b.formats['image/jpeg'] ?? null,
    textUrl:
      b.formats['text/plain; charset=us-ascii'] ||
      b.formats['text/plain; charset=utf-8'] ||
      b.formats['text/plain'] ||
      null,
  }))
}

/** Strip the Project Gutenberg license header/footer. */
function stripGutenberg(raw) {
  const start = raw.search(/\*\*\* ?START OF (THE|THIS) PROJECT GUTENBERG[^*]*\*\*\*/i)
  const end = raw.search(/\*\*\* ?END OF (THE|THIS) PROJECT GUTENBERG/i)
  let body = raw
  if (start !== -1) body = body.slice(body.indexOf('***', start + 3) + 3)
  if (end !== -1) body = body.slice(0, raw.search(/\*\*\* ?END OF/i))
  return body.trim()
}

/**
 * Fetch a book and slice it into readable passages (~200-300 words),
 * preferring ones whose estimated difficulty matches the student's band.
 */
export async function fetchPassages(book, band, maxPassages = 8) {
  if (!book.textUrl) throw new Error('No plain-text version available')
  const { data, error } = await supabase.functions.invoke('fetch-book', {
    body: { url: book.textUrl },
  })
  if (error || !data?.text) throw new Error('Could not download book text')
  const raw = data.text
  const body = stripGutenberg(raw)

  const paragraphs = body
    .split(/\r?\n\r?\n+/)
    .map((p) => p.replace(/\r?\n/g, ' ').trim())
    .filter((p) => p.length > 80 && !/^[A-Z\s.,'"-]{40,}$/.test(p)) // drop headings

  // group paragraphs into ~250-word passages
  const passages = []
  let current = []
  let words = 0
  for (const p of paragraphs) {
    if (!isPassageAllowed(p)) {
      // drop the whole in-progress passage so it doesn't read with a gap
      current = []
      words = 0
      continue
    }
    current.push(p)
    words += p.split(/\s+/).length
    if (words >= 220) {
      passages.push(current.join('\n\n'))
      current = []
      words = 0
    }
    if (passages.length >= 40) break
  }

  const fitting = passages.filter((p) => passageFitsBand(p, band))
  const chosen = (fitting.length >= 3 ? fitting : passages).slice(0, maxPassages)
  if (chosen.length === 0) throw new Error('No usable passages found')
  return chosen
}
