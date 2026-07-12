# 📖 ReadingBuddy

A playful reading-comprehension platform for kids: placement diagnostic, leveled lessons, a free public-domain library, mastery quizzes, a progress dashboard, and built-in accessibility tools (text sizing, read-aloud, translation).

Built with **React + Vite + Supabase**, styled with the candy palette `70D6FF / FF70A6 / FF9770 / FFD670 / E9FF70`.

---

## Setup (about 15 minutes)

### 1. Install and run the frontend

```bash
npm install
cp .env.example .env    # then fill it in (step 2)
npm run dev
```

### 2. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → New project (free tier is fine).
2. **Settings → API**: copy the **Project URL** and **anon public key** into your `.env`:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
3. **SQL Editor → New query**: paste the entire contents of `supabase/schema.sql` and click **Run**. This creates all tables, row-level security policies, and the trigger that auto-creates a profile on signup.
4. (Recommended for testing) **Authentication → Providers → Email**: turn OFF "Confirm email" so signups work instantly while you develop.

### 3. Deploy the LLM Edge Function (powers smart quizzes, diagnostic analysis, personalized examples, and translation)

```bash
npm install -g supabase          # Supabase CLI, once
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set ANTHROPIC_API_KEY=sk-ant-your-key-here
supabase functions deploy llm
```

Get an API key at [console.anthropic.com](https://console.anthropic.com). The function uses Claude Haiku (cheap + fast); swap the model or provider by editing `supabase/functions/llm/index.ts` — the frontend never needs to change.

**No key yet? The app still fully works.** Every LLM feature has a built-in fallback: static diagnostic scoring, built-in lesson quizzes and examples. Translation is the only feature that requires the function.

### 4. That's it

Open the dev server URL, create an account, and you'll be routed straight into the placement adventure.

---

## What's where

| Path | What it does |
|---|---|
| `src/pages/Login.jsx` | Sign in / sign up |
| `src/pages/Diagnostic.jsx` | Placement quiz → lexile estimate → saved to profile |
| `src/pages/Lessons.jsx` + `LessonDetail.jsx` | Band-filtered lessons + post-lesson mastery quiz |
| `src/pages/Reading.jsx` | Project Gutenberg library (via Gutendex), leveled passages, read-aloud, translation |
| `src/pages/Dashboard.jsx` | Stats, band journey, bookshelf, quiz history |
| `src/data/lessons.js` | The 12-lesson curriculum + diagnostic bank — **edit this to add lessons** |
| `src/lib/lexile.js` | Band definitions + readability estimation |
| `src/lib/llm.js` | All LLM calls (through the Edge Function) |
| `supabase/schema.sql` | Database schema + RLS |
| `supabase/functions/llm/index.ts` | Server-side LLM proxy (keeps your key secret) |

## Things you must fill in

1. `.env` → your Supabase URL + anon key (step 2)
2. `supabase/schema.sql` → run once in the SQL editor (step 2)
3. `ANTHROPIC_API_KEY` secret + `supabase functions deploy llm` (step 3)

## Nice-to-know

- **Text-to-speech** uses the browser's built-in Web Speech API — free, no key, works offline.
- **Books** come from [Gutendex](https://gutendex.com) (free Project Gutenberg API, no key).
- Lesson quizzes and worked examples are **generated from the book the student currently has open** when the LLM function is live; otherwise the built-in versions are used.
- A student "passes" a lesson at ≥60% quiz score; that marks it complete on the dashboard.
- Accessibility: adjustable text size (persisted to their profile), read-aloud on every passage, translation into 8 languages, keyboard-visible focus states, `prefers-reduced-motion` respected, Atkinson Hyperlegible body font (designed for low-vision readers).
