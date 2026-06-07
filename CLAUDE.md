# Conciply Growth OS

Standalone Next.js 14 App Router + TypeScript + Tailwind.
One OpenAI call per report → 16-section structured JSON growth playbook.
Stripe + HMAC license keys. localStorage workspace. No database.

## Run locally
1. npm install
2. cp .env.example .env.local — set OPENAI_API_KEY
3. npm run dev → http://localhost:3000

## Check before committing
npm run typecheck && npm run build

## Design rules
- Neon Dutch: near-black bg (#0A0A0B), neon cyan/magenta/lime, Archivo display, hard edges
- No new colors or fonts
- Stateless / no-login — no database unless asked

## Key files
- lib/types.ts — all TypeScript types
- lib/prompt.ts — AI system prompt + JSON parser
- app/api/analyze/route.ts — main AI endpoint
- components/HeroInput.tsx — landing input + loading + paywall
- components/ReportView.tsx — 16-section tab layout
