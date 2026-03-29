# Mihu Learning — Task Tracker

## Completed
- [x] Phase 0: Decompose 853-line monolith into 13 components + 6 library modules
- [x] Phase 1: Full design overhaul (white bg, Google blue palette, Inter font, Attie mascot, compact sticky bar)
- [x] Phase 2: Google Sign-In (5-email allowlist) + Drive appdata persistence + localStorage fallback
- [x] Phase 3: Gemini `gemini-3-flash-preview` grading via `/api/grade` API route + cache + fallback
- [x] Phase 4: Content extraction + expansion pipeline scripts (`npm run content`)
- [x] Phase 5: Design audit — fixed focus-visible, ARIA roles, CSS tokens, touch targets, inline styles, README

## Open Items
- [ ] Attie sound effects (need .wav files: happy yip, gentle whine, celebration bark)
- [ ] Run content pipeline to re-extract from PDFs and expand question bank
- [ ] Attie image edge cleanup (regenerate with solid white bg for cleaner cutout)
- [ ] Cross-device persistence end-to-end test (sign in on two devices)
- [ ] Lighthouse performance pass (target: >90 perf, >95 a11y)
- [ ] Delete `lib/mihika-data.ts` once content pipeline JSON is curated and committed
- [ ] Deploy to Vercel (add env vars to Vercel project settings, add production domain to OAuth origins)

## Working Notes
- Google Cloud project: "Mihu Learning" under ashish@econforeverybody.com
- OAuth consent screen: External, Testing mode, 5 test users
- Gemini model: `gemini-3-flash-preview` (confirmed 2026-03-29, DO NOT downgrade)
- Source PDFs are image-based scans; OCR folder has PNG screenshots
- The `NEXT_PRIVATE_WORKER_THREADS=false` Codex hack was removed from build script
