/**
 * Text-to-speech via the browser's built-in Web Speech API.
 * Free, offline-capable, no key needed.
 */

let currentUtterance = null

export function speak(text, { rate = 0.95, onEnd } = {}) {
  stop()
  if (!('speechSynthesis' in window)) {
    alert('Sorry, your browser does not support read-aloud.')
    return
  }
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = rate
  utterance.pitch = 1.05
  // prefer a friendly English voice if available
  const voices = window.speechSynthesis.getVoices()
  const nice = voices.find((v) => /en[-_]/i.test(v.lang) && /female|natural|samantha|zira/i.test(v.name))
  if (nice) utterance.voice = nice
  if (onEnd) utterance.onend = onEnd
  currentUtterance = utterance
  window.speechSynthesis.speak(utterance)
}

export function stop() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
  currentUtterance = null
}

export function isSpeaking() {
  return 'speechSynthesis' in window && window.speechSynthesis.speaking
}
