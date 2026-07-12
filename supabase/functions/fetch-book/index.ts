// Proxies Project Gutenberg text downloads (gutenberg.org blocks browser CORS)
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { url } = await req.json()
    if (!url || !/^https?:\/\/([a-z0-9-]+\.)*gutenberg\.org\//i.test(url)) {
      return new Response(JSON.stringify({ error: 'Only gutenberg.org URLs allowed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const resp = await fetch(url)
    if (!resp.ok) throw new Error(`Upstream ${resp.status}`)
    const text = await resp.text()
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