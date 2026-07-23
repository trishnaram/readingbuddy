import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useSettings } from './SettingsContext'
import { translateStrings } from '../lib/llm'

const TranslationContext = createContext({ t: (s) => s, language: 'English' })

const FLUSH_DELAY = 150

/**
 * Makes every page translatable. Components call `t('Some label')` while
 * rendering; the English text shows immediately and is swapped for the
 * translated version once it comes back from the LLM. Strings requested
 * during the same tick (i.e. everything on one page) are batched into a
 * single translation call and cached per language so re-visiting a page
 * or switching back to a language doesn't re-translate it.
 */
export function TranslationProvider({ children }) {
  const { settings } = useSettings()
  const language = settings?.language ?? 'English'

  const cacheRef = useRef({}) // { [language]: { [englishText]: translatedText } }
  const pendingRef = useRef(new Set())
  const inFlightRef = useRef(new Set())
  const timerRef = useRef(null)
  const [, bump] = useState(0)

  useEffect(() => {
    // Drop anything still queued for whatever language we just left.
    pendingRef.current = new Set()
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [language])

  const flush = useCallback(() => {
    timerRef.current = null
    const lang = language
    const words = Array.from(pendingRef.current).filter((w) => !inFlightRef.current.has(w))
    pendingRef.current = new Set()
    if (words.length === 0) return
    words.forEach((w) => inFlightRef.current.add(w))

    const map = Object.fromEntries(words.map((w) => [w, w]))
    translateStrings(map, lang)
      .then((result) => {
        cacheRef.current[lang] = cacheRef.current[lang] || {}
        for (const w of words) {
          const translated = result?.[w]
          if (typeof translated === 'string' && translated.trim()) {
            cacheRef.current[lang][w] = translated
          }
        }
      })
      .catch(() => {
        /* LLM helper not set up yet - keep showing English */
      })
      .finally(() => {
        words.forEach((w) => inFlightRef.current.delete(w))
        bump((n) => n + 1)
      })
  }, [language])

  const t = useCallback(
    (text) => {
      if (!text || typeof text !== 'string' || language === 'English') return text
      const cached = cacheRef.current[language]?.[text]
      if (cached) return cached
      if (!inFlightRef.current.has(text) && !pendingRef.current.has(text)) {
        pendingRef.current.add(text)
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(flush, FLUSH_DELAY)
      }
      return text
    },
    [language, flush]
  )

  return <TranslationContext.Provider value={{ t, language }}>{children}</TranslationContext.Provider>
}

/** `const t = useT()` then wrap any user-facing string: `t('Sign out')`. */
export const useT = () => useContext(TranslationContext).t
