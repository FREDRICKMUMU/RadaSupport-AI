# RadaSupport-AI

An AI customer-support chatbot builder. Add your knowledge (websites, text, files), organise it into topic **sections**, tune the bot's look and tone, and embed it on any site with a single script tag. Visitors chat with an AI agent grounded in your content, and you read and reply to conversations from a dashboard inbox.

Built following the "OneMinute Support" tutorial, then extended with Gemini, a conversations inbox, team invites and a dashboard overview.

## Features

- **Knowledge base**: crawl a website (ZenRows), add Q&A / plain text, or upload files. Content is condensed by the LLM into a dense summary used as chatbot context.
- **Sections**: group knowledge sources by topic (e.g. Pricing, Projects) with a description for routing, a tone (Strict, Neutral, Friendly, Empathetic) and allowed / blocked topics.
- **Chatbot playground**: test the bot in the dashboard before publishing.
- **Appearance**: brand colour and welcome message.
- **Embeddable widget**: one `<script>` tag; chat runs in an iframe with a signed session token.
- **Conversations inbox**: see every visitor chat and reply as a human.
- **Escalation**: the bot offers to create a support ticket when it cannot answer.
- **Team**: invite teammates to your organisation (ScaleKit).
- **Dashboard overview**: setup progress, knowledge stats, recent chats and the install snippet.

## Tech stack

| Area | Tool |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React, TypeScript |
| Styling / UI | Tailwind CSS v4, shadcn/ui (Base UI) |
| Database | Neon Postgres + Drizzle ORM |
| Auth / orgs | ScaleKit |
| LLM | Google Gemini via its OpenAI-compatible endpoint (`openai` SDK) |
| Scraping | ZenRows |
| Session tokens | `jose` (HS256 JWT) |
| Hosting | Vercel |

## Getting started

### Prerequisites

- Node.js 20+
- A Neon database, a ScaleKit app, a ZenRows key and a Gemini API key

### Install

```bash
git clone https://github.com/FREDRICKMUMU/RadaSupport-AI.git
cd RadaSupport-AI
npm install
```

### Environment variables

Create a `.env` file in the project root (never commit it):

```dotenv
# Database
DATABASE_URL=

# Widget session tokens (use a long random string)
JWT_SECRET=

# LLM (Gemini)
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash

# Scraping
ZENROWS_API_KEY=

# ScaleKit (check the exact names your lib/scalekit.ts reads)
SCALEKIT_ENVIRONMENT_URL=
SCALEKIT_CLIENT_ID=
SCALEKIT_CLIENT_SECRET=
SCALEKIT_WEBHOOK_SECRET=
```

Values must have no quotes or trailing spaces, especially `GEMINI_MODEL` on Vercel.

### Database

```bash
npm run db:push
```

### Run

```bash
npm run dev
```

Open http://localhost:3000. Restart the dev server after any `.env` change.

## Embedding the widget

Add this to any site (use your deployed URL and your chatbot's widget ID from Dashboard → Chatbot):

```html
<script
  src="https://YOUR-APP-URL/widget.js"
  data-id="YOUR_WIDGET_ID"
  defer
></script>
```

In a Next.js site:

```tsx
import Script from "next/script";

<Script
  src="https://YOUR-APP-URL/widget.js"
  data-id="YOUR_WIDGET_ID"
  strategy="afterInteractive"
/>
```

How it works:

1. `widget.js` posts the `data-id` to `/api/widget/session` and receives a signed JWT.
2. It injects an iframe pointing at `/embed?token=...`.
3. The embed page loads its config from `/api/widget/config` and sends messages to `/api/chat/public` with the token.

`/api/widget/session` must send CORS headers so the script can call it from other origins.

## Project structure

```
app/
  api/
    auth/                  ScaleKit login + callback
    chat/test              Dashboard playground chat
    chat/public            Public widget chat (JWT-protected)
    chatbot/metadata/      Appearance (fetch / update)
    conversations/         Inbox list, [id]/messages, [id]/reply
    knowledge/             Store and fetch knowledge sources
    section/               Create / fetch / delete sections
    team/                  Invite and list team members
    overview               Dashboard statistics
    widget/                session + config for the embed
    webhook/scalekit       Membership webhook
  dashboard/               Overview, chatbot, knowledge, sections,
                           conversations, settings
  embed/                   Widget chat UI (runs inside the iframe)
  test/                    Local page for testing the widget
components/                Dashboard and UI components
db/                        Drizzle client and schema
lib/
  llm.ts                   Gemini client, model, system prompt, summariser
  openAI.ts                summarizeMarkdown (knowledge ingestion)
  isAuthorized.ts          Session check for dashboard routes
public/widget.js           The embeddable script
```

## Deployment (Vercel)

1. Import the repo and choose the production branch.
2. Add **all** environment variables above for **Production and Preview**.
3. Redeploy after changing variables (they only apply to new deployments).
4. Set the ScaleKit redirect URI and webhook URL to your production domain.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `400 unexpected model name format` | `GEMINI_MODEL` has quotes/spaces or a wrong value |
| `401` from the LLM | Wrong `GEMINI_API_KEY` or `.env` not reloaded |
| `429` from the LLM | Gemini free-tier rate limit |
| Empty or cut-off replies | `max_tokens` too low (Gemini uses tokens for thinking) |
| `Zero-length key is not supported` | `JWT_SECRET` is not set |
| Widget session returns 404 | Wrong `data-id` |
| No topic chips in the widget | No active sections created yet |
| `fetch failed` from Neon locally | Network/IPv6 issue; the dev script forces IPv4 first |
| Works locally, 500 in production | Missing environment variables on Vercel |

## Roadmap

- Live polling so visitors see human replies in the widget
- Delete workspace route
- Privacy policy and terms pages
- Self-hosted fonts

## Author

Fred Munyao, [GitHub](https://github.com/FREDRICKMUMU)
