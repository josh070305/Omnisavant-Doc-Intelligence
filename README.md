# Omnisavant Doc Intelligence

Omnisavant Doc Intelligence is a static React + TypeScript + Tailwind CSS app that runs a four-stage AI document processing pipeline entirely in the browser. It calls the Claude API directly with `fetch`, so there is no backend, server, or database.

Live Demo: https://intern-a6r2n2kzz-josh070305s-projects.vercel.app

## Features

- **Extract**: Convert pasted document text into structured JSON containing title, summary, key concepts, entities, and document structure.
- **Crawl**: Build an interactive concept graph from extracted concepts and relationships.
- **Agent**: Execute a ReAct-style reasoning loop over extracted content, displaying each reasoning step over time.
- **Query**: Provide a chat interface that answers questions using only grounded document content.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create a local environment file:

```bash
cp .env.example .env
```

3. Add your Claude API key to `.env`:

```env
VITE_ANTHROPIC_KEY=your-key-here
```

4. Run the app:

```bash
npm run dev
```

5. Build for production:

```bash
npm run build
```

## Environment Variables

- `VITE_ANTHROPIC_KEY`: Your Claude API key for the Anthropic API.

> Keep `.env` local and do not commit it. `.env` is included in `.gitignore`, so only `.env.example` should be tracked.

## Deployment

Deploy this project as a Vite app on Vercel:

- Add `VITE_ANTHROPIC_KEY` under **Settings → Environment Variables**
- The included `vercel.json` rewrites all routes to `/`, making the SPA deploy-ready

## Why This Pipeline

The pipeline is designed to make document AI predictable and inspectable:

- Extraction normalizes raw text into stable structured fields
- Crawling shows concept relationships visually
- The agent stage exposes reasoning steps instead of hiding them
- The query stage stays grounded in extracted document content

## Project Structure

- `src/` — React app source
- `src/components/` — stage components
- `README.md` — project documentation
- `.env.example` — sample environment variables
- `vite.config.ts` — Vite configuration
- `tailwind.config.js` — Tailwind setup
- `vercel.json` — SPA routing for Vercel

## Notes

- This app is intentionally frontend-only
- No sensitive keys should be pushed to the repo
- Use `.env.example` as the template for local setup