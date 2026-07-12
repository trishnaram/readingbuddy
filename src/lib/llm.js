import { supabase } from './supabase'

/**
 * All LLM traffic goes through the Supabase Edge Function `llm`
 * (see supabase/functions/llm/index.ts) so the API key never ships
 * to the browser. Every helper below degrades gracefully: if the
 * function isn't deployed yet, the app still works using built-in
 * static content.
 */

async function callLLM(prompt, { json = false, maxTokens = 1200 } = {}) {
  const { data, error } = await supabase.functions.invoke('llm', {
    body: { prompt, json, max_tokens: maxTokens },
  })
  if (error) throw new Error(error.message || 'LLM call failed')
  return data?.text ?? ''
}

function extractJSON(text) {
  // tolerate ```json fences or stray prose around the object
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
  if (!match) throw new Error('No JSON found in LLM response')
  return JSON.parse(match[0])
}

/** Generate comprehension questions about a passage. */
export async function generateQuestions(passage, level, count = 4) {
  const prompt = `You are a reading teacher. Write ${count} multiple-choice reading comprehension questions about the passage below for a student at the "${level}" reading level. Mix question types: main idea, vocabulary in context, inference, and detail.

Respond with ONLY a JSON array, no other text, in this exact shape:
[{"question":"...","options":["A","B","C","D"],"answerIndex":0,"skill":"main idea"}]

Passage:
"""${passage.slice(0, 4000)}"""`
  const text = await callLLM(prompt, { json: true })
  const parsed = extractJSON(text)
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Bad question format')
  return parsed
}

/** Score the diagnostic and map to a level band. */
export async function analyzeDiagnostic(answersSummary) {
  const prompt = `A student took a reading diagnostic. Here is their performance summary:
${answersSummary}

Based on this, respond with ONLY JSON in this shape (lexile is a number, band is one of "Sprout", "Explorer", "Voyager", "Champion"):
{"lexile": 650, "band": "Explorer", "encouragement": "one short friendly sentence for a child"}`
  const text = await callLLM(prompt, { json: true, maxTokens: 300 })
  return extractJSON(text)
}

/** Translate a passage. */
export async function translateText(passage, language) {
  const prompt = `Translate the following text into ${language}. Respond with ONLY the translation, nothing else.

"""${passage.slice(0, 4000)}"""`
  return callLLM(prompt, { maxTokens: 2000 })
}

/** Pull a lesson example from the student's current reading text. */
export async function lessonExampleFromText(passage, skillName, level) {
  const prompt = `You are a friendly reading teacher for a student at the "${level}" level. Using ONLY the passage below, write a short worked example (3-5 sentences, warm and simple) that teaches the skill "${skillName}" using a specific moment from the passage. Quote at most one short phrase from it.

Passage:
"""${passage.slice(0, 3000)}"""`
  return callLLM(prompt, { maxTokens: 400 })
}

/** Quick availability check so the UI can show fallback notices. */
export async function llmAvailable() {
  try {
    const text = await callLLM('Reply with the single word: ok', { maxTokens: 5 })
    return /ok/i.test(text)
  } catch {
    return false
  }
}
