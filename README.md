# Mihu Learning

Mihika's personal learning platform — exam prep that builds real understanding. Starts with French, architected for any subject.

## What it does

- **Practice Arena** — MCQ and text questions with Gemini-powered intelligent grading
- **Memory Garden** — spaced repetition flashcards (intervals: 0, 1, 3, 7, 14 days)
- **Writing Quest** — guided writing with scaffolded prompts (Ma sortie récente)
- **Listening Prep** — exam strategies for picture-based listening
- **Attie** — a cartoon golden retriever mascot who reacts to correct/wrong answers
- **Progress persistence** — Google Sign-In + Drive sync, localStorage offline fallback
- **Game mechanics** — health, lives, streak, XP, mastery % (learning-first, not point-farming)

## Setup

### Prerequisites

- Node.js 18+
- A Google Cloud project with OAuth 2.0 configured
- A Gemini API key

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env.local`

Copy `.env.example` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — from Google Cloud Console → APIs & Services → Credentials
- `GOOGLE_CLIENT_SECRET` — same location
- `GEMINI_API_KEY` — from [AI Studio](https://aistudio.google.com)

### 3. Google Cloud setup

1. Create a project at [console.cloud.google.com](https://console.cloud.google.com)
2. Enable the **Google Drive API**
3. Configure OAuth consent screen (External, add `drive.appdata` scope)
4. Add test users (emails that should be allowed to sign in)
5. Create a Web OAuth client with authorized origins: `http://localhost:3000`, `http://localhost:3848`

### 4. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000/french`

## Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run content` | Extract + expand questions from PDFs (requires `GEMINI_API_KEY`) |
| `npm run optimize-images` | Optimize Attie mascot images to WebP |

## Architecture

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- Subject-agnostic data model (`lib/types.ts`) — French is the first tenant
- Pure scoring engine (`lib/progress/engine.ts`) — no side effects
- Google Identity Services for auth (no SDK dependency)
- Google Drive `appdata` scope for hidden progress file
- Gemini `gemini-3-flash-preview` for answer grading via API route
- Zero production dependencies beyond Next.js/React

## Adding authorized users

Edit `lib/auth/allowlist.ts` — add their email to the array. If the app is still in Google's "Testing" mode, also add them as a test user in the Google Cloud console.
