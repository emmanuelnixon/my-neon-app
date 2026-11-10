# MakerPath

AI-powered co-pilot that turns any idea into a buildable plan. Includes: plan generator, step tracker, AI mentor chat, 3D sketchpad (Three.js via CDN), sample gallery, reference videos, Education Corner with quizzes, mentors directory, mock sign-in and progress dashboard.

Everything is mocked. You don't need an API key. Progress, chat, and session are stored in your browser (localStorage).

## Run locally
1. Install Node.js 20+ from https://nodejs.org (choose "LTS").
2. Open a terminal in this folder and run `npm install`.
3. Run `npm run dev`, then open http://localhost:3000.

## Deploy free (Vercel)
1. Push this folder to a GitHub repository.
2. Go to https://vercel.com, sign in with GitHub, and click **Add New → Project**.
3. Pick the repo and click **Deploy**. You don't need to set any environment variables for the demo.

## Structure
- `src/app/api/plan` – mock plan generator (6 rich plans + a generic fallback for any idea)
- `src/app/api/chat` – mock mentor that matches keywords to canned answers
- `src/components/App.tsx` – SPA with React Router (HashRouter): Build, Gallery, 3D, Learn, Mentors, Progress, Sign in
- `src/components/Visualizer.tsx` – Three.js sketchpad with OrbitControls and cleanup on unmount
- `src/components/store.tsx` – React context + localStorage persistence
- `src/lib/data.ts` – plans, lessons, referees, videos

## Online AI (optional)
Set `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`, default gpt-4o-mini) to generate detailed guides for any idea and get live mentor answers. Without it, the 17 verified built-in guides and the offline mentor are used.

## v2 ideas
1. **Real plan generation** with the OpenAI or Anthropic API, using JSON-schema structured output and the same `Plan` type.
2. **Real mentor chat** with an LLM, passing the current plan as context and streaming the replies.
3. **Sketchfab API**: search and import reference 3D models into the sketchpad. Also add GLTF export.
4. **YouTube Data API v3**: fetch the best-matching videos for each step.
5. **Real auth and cloud sync** with Auth.js or Supabase plus Postgres, so progress follows users across devices and they can share plans.
