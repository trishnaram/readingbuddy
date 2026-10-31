// Supabase Edge Function: proxies LLM requests so the API key stays secret.
// Deploy:  supabase functions deploy llm
// Secret:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// Swap providers by editing the fetch below - the frontend only ever
// sends { prompt, json, max_tokens } and reads back { text }.
//
// Only signed-in users can call this (the public anon key alone is rejected),
// and every call is logged to public.llm_usage for rate limiting. Limits can
// be tuned with secrets: LLM_LIMIT_PER_HOUR, LLM_LIMIT_PER_DAY, LLM_GLOBAL_LIMIT_PER_DAY.

import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const LIMIT_PER_HOUR = Number(Deno.env.get('LLM_LIMIT_PER_HOUR') ?? 150)
const LIMIT_PER_DAY = Number(Deno.env.get('LLM_LIMIT_PER_DAY') ?? 600)
const GLOBAL_LIMIT_PER_DAY = Number(Deno.env.get('LLM_GLOBAL_LIMIT_PER_DAY') ?? 5000)
const MAX_PROMPT_CHARS = 20000
const MAX_OUTPUT_TOKENS = 4000

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function countSince(ms: number, userId?: string) {
  let q = admin
    .from('llm_usage')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', new Date(Date.now() - ms).toISOString())
  if (userId) q = q.eq('user_id', userId)
  const { count, error } = await q
  if (error) throw error
  return count ?? 0
}

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // The anon key is a valid JWT too, so check for an actual signed-in user.
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
    const { data: userData } = await admin.auth.getUser(token)
    const user = userData?.user
    if (!user) return json({ error: 'Sign in required' }, 401)

    const { prompt, max_tokens = 1200 } = await req.json()
    if (typeof prompt !== 'string' || !prompt.trim()) {
      return json({ error: 'Missing prompt' }, 400)
    }
    if (prompt.length > MAX_PROMPT_CHARS) {
      return json({ error: 'Prompt too long' }, 413)
    }

    const [hourCount, dayCount, globalCount] = await Promise.all([
      countSince(HOUR, user.id),
      countSince(DAY, user.id),
      countSince(DAY),
    ])
    if (hourCount >= LIMIT_PER_HOUR || dayCount >= LIMIT_PER_DAY || globalCount >= GLOBAL_LIMIT_PER_DAY) {
      return json({ error: 'Rate limit reached, try again later' }, 429)
    }
    const { error: logError } = await admin.from('llm_usage').insert({ user_id: user.id })
    if (logError) throw logError

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: Math.min(Math.max(1, Number(max_tokens) || 1200), MAX_OUTPUT_TOKENS),
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await resp.json()
    const text = data?.content?.map((b: { text?: string }) => b.text ?? '').join('') ?? ''

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
