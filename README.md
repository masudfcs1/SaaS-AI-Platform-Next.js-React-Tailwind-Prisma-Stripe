# Dune AI

A public AI workspace for conversations, code, images, and spoken audio. Built with Next.js, React, TypeScript, and shadcn/ui, with a consistent light and dark experience from the landing page to every studio.

Open the workspace and start creating without signing in. Gemini powers chat and code; OpenAI powers image generation and speech.

## Features

| Workspace | Route | What you can do |
| --- | --- | --- |
| Dashboard | `/dashboard` | Start a conversation and explore the tools. |
| Conversation | `/conversation` | Ask questions, write, brainstorm, and continue with follow-up messages. |
| Code assistant | `/code` | Generate and explain code with Markdown formatting and copyable code blocks. |
| Image studio | `/image` | Generate PNG images with size and quality controls, previews, and downloads. |
| Audio studio | `/audio` | Create spoken audio with voice, speed, format, and delivery controls. |
| Video studio | `/video` | View the service availability notice; generation is disabled. |
| Settings | `/settings` | Choose the appearance and review available tools. |

The landing page is at `/`. The legacy `/music` route redirects to `/audio`.

- **Chat-style layout:** scrollable output above a bottom composer, starter prompts, loading states, and clear errors.
- **Conversation controls:** Stop, Retry, Regenerate, New chat, and copy actions for responses and code.
- **Media controls:** preview or play generated files, download them, retry the original request, or start a new session.
- **Appearance:** Light, Dark, and System modes, with the selected preference saved in the browser.
- **Responsive UI:** shadcn/ui controls, mobile navigation, accessible labels, and keyboard interaction.

Video generation is disabled because OpenAI announced the Sora API shutdown for **September 24, 2026**. See the [official deprecation notice](https://developers.openai.com/api/docs/deprecations).

## Stack

| Area | Technology |
| --- | --- |
| Application | Next.js 16.3.6 App Router, React 19.3.0, TypeScript |
| Interface | Tailwind CSS 3, shadcn/ui, Radix UI, Lucide icons |
| Themes | `next-themes` with shared CSS variables |
| Text generation | Google Gemini through a reusable server-only utility |
| Images and speech | OpenAI Node SDK through Next.js API routes |
| Validation | Zod |
| Tests | Node.js test runner, React, and jsdom |

## Quick start

### 1. Install dependencies

Use **Node.js 24.21.0**, as pinned in [.nvmrc](.nvmrc), and npm. The package also supports Node.js 22.13 or newer in the 22.x line. Check your active runtime with `node --version`.

From the project directory:

```bash
npm ci
```

### 2. Configure your API keys

Create `.env.local` from [.env.example](.env.example) if it does not already exist.

**PowerShell:**

```powershell
if (!(Test-Path .env.local)) { Copy-Item .env.example .env.local }
```

**macOS / Linux:**

```bash
test -f .env.local || cp .env.example .env.local
```

Edit `.env.local` and replace the placeholders:

```dotenv
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
```

Configure the provider for the tools you want to use. The UI and production build work without keys; generation requires valid credentials and model access. API usage is billed by the providers.

Keep credentials in the ignored `.env.local` file or your hosting environment. These keys are server-only and must not use a `NEXT_PUBLIC_` prefix.

### 3. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Restart the development server after changing environment variables.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | Enables image and speech generation. |
| `OPENAI_IMAGE_MODEL` | Optional image model override. Default: `gpt-image-2.5-flare`. |
| `OPENAI_AUDIO_MODEL` | Optional speech model override. Default: `gpt-4o-mini-tts`. |
| `GEMINI_API_KEY` | A single Gemini key for chat and code. |
| `GEMINI_API_KEYS` | Optional comma-separated Gemini key pool. Merged with `GEMINI_API_KEY`; blanks and duplicates are removed. |
| `GEMINI_MODELS` | Optional comma-separated model list, attempted in the supplied order. |

The repository's default Gemini model order is:

```dotenv
GEMINI_MODELS=gemini-3.6-flash,gemini-3.5-flash,gemini-3.5-flash-lite,gemini-flash-latest
```

For multiple Gemini keys:

```dotenv
GEMINI_API_KEYS=your_first_key,your_second_key
```

Model overrides must support the corresponding API and its request options. Availability depends on the provider and your project.

## Using the studios

### Chat and code

Enter a prompt or choose a starter suggestion. Press **Enter** to send and **Shift + Enter** for a new line. Replies appear in reading order, with Markdown, tables, and copyable code blocks.

Follow-up requests include the conversation history. Retry resends a failed request; Regenerate replaces the last answer; New chat clears the conversation.

### Images

Describe the subject, style, composition, and lighting, then choose:

- **Size:** square `1024 × 1024`, landscape `1536 × 1024`, or portrait `1024 × 1536`.
- **Quality:** low, medium, or high.

Each request produces one PNG. The defaults are square and medium quality, with a maximum prompt length of 4,000 characters.

### Spoken audio

Paste the exact words to be read aloud, then choose:

- **Voice:** Marin, Cedar, Alloy, Ash, Coral, or Nova.
- **Format:** MP3 or WAV.
- **Speed:** 0.75×, 1×, or 1.25×.
- **Voice direction:** optional delivery instructions, such as a warm tone or gentle pacing.

The defaults are Marin, MP3, and 1× speed. Speech text supports up to 4,096 characters; delivery instructions support up to 500. Outputs include an audio player, transcript, download action, and an AI-generated voice label.

### Temporary results

Chat history and generated media are held in the current page's memory. Leaving or refreshing the page, or choosing New chat / New session, clears the associated results. Download files you want to keep.

Stop waiting aborts the application's request and ignores late results. It cannot guarantee that provider-side generation or billing has stopped.

## Development commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Create the production build. |
| `npm start` | Serve the production build. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Generate Next.js route types and run TypeScript checks. |
| `npm test` | Run the Gemini, chat, theme, media API, and media UI test suites. |

Automated tests use mocked provider requests and do not consume API credits. They cover validation, failover, error handling, cancellation, binary responses, previews, downloads, keyboard controls, theme persistence, and hydration.

## Project structure

```text
app/
  (landing)/                 Landing page and layout
  (dashboard)/
    (routes)/                Chat, code, media, settings, and redirect pages
    layout.tsx               Shared workspace shell
  api/
    conversation/            Gemini conversation endpoint
    code/                    Gemini code endpoint
    image/                   OpenAI PNG generation endpoint
    audio/                   OpenAI speech generation endpoint
  globals.css                Shared light and dark theme tokens
components/
  chat/                      Conversation UI, Markdown, and copy controls
  media/                     Image/audio composers and output previews
  ui/                        shadcn/ui components
lib/
  chat-tools.ts              Tool metadata, navigation, and starter prompts
  gemini.ts                  Reusable Gemini generation utility
  openai.ts                  Lazy server-only OpenAI client
  openai-media.ts            Media validation, generation, and error handling
  media-options.ts           Shared image and audio options
tests/                       API and component regression tests
```

Customize tool labels and starter prompts in [lib/chat-tools.ts](lib/chat-tools.ts), shared colors in [app/globals.css](app/globals.css), and UI primitives in [components/ui](components/ui).

## Server APIs

All endpoints accept `POST` requests. Send JSON with `Content-Type: application/json`.

| Endpoint | Request | Successful response |
| --- | --- | --- |
| `/api/conversation` | `{ messages: [{ role, content }] }` | `{ role: "assistant", content }` |
| `/api/code` | `{ messages: [{ role, content }] }` | `{ role: "assistant", content }` |
| `/api/image` | `{ prompt, size?, quality? }` | Binary `image/png` |
| `/api/audio` | `{ input, voice?, format?, speed?, instructions? }` | Binary `audio/mpeg` or `audio/wav` |

Conversation history uses `user` and `assistant` roles and must end with a non-empty user message. Media errors return JSON with `error` and `code`; chat and code errors return a text message with the corresponding HTTP status.

### Reuse Gemini in server code

```ts
import { generateGeminiText, generateGeminiResponse } from "@/lib/gemini";

const text = await generateGeminiText("Explain closures in JavaScript.");

const response = await generateGeminiResponse({
  messages: [{ role: "user", content: "Write a React toggle component." }],
  systemInstruction: "Use TypeScript and include brief comments.",
  maxOutputTokens: 2048,
});
// response: { role: "assistant", content: string }
```

The utility exports `GeminiMessage`, `GeminiOptions`, and `GeminiError`, plus the configured key and model lists. It rotates the starting key, preserves model priority, and retries eligible credential, quota, network, and availability failures. Each generation request has a default 45-second budget shared across its attempts, with a maximum of 15 seconds per attempt. Use `timeoutMs` to adjust the budget and `signal` to pass an `AbortSignal`.

Import provider utilities only from server code. Client components call the application's API routes.

## Production

Run the app as a Next.js application with a Node.js server:

```bash
npm run build
npm start
```

Configure provider credentials in the deployment environment. The image and audio routes declare maximum durations of 130 and 70 seconds respectively; choose hosting that accommodates those durations.

Media routes validate input and origins when provided, limit JSON request bodies to 32 KiB, verify generated file formats, and return downloads with `Cache-Control: no-store`. OpenAI media requests are not automatically retried.

| Media tool | Generation deadline | Concurrent requests per process | Starts per minute per process |
| --- | --- | --- | --- |
| Images | 120 seconds | 2 | 8 |
| Audio | 60 seconds | 4 | 20 |

These guards reset when the process restarts and apply separately to each running instance. They are not per-user quotas or billing caps. The app is public; configure provider spending limits and use a shared rate limiter when deploying across multiple instances.

## Troubleshooting

| Problem | Check |
| --- | --- |
| Runtime or installation error | Select the Node version in `.nvmrc`, then run `npm ci`. |
| Provider is not configured | Add the corresponding server key and restart the app. |
| Model access error | Check project permissions, model availability, and any required organization verification. |
| Quota or billing error | Check the provider project's credits and spending limits. |
| Generation is busy or rate-limited | Wait before retrying; the media API may include a `Retry-After` header. |
| Image generation times out | Try lower quality and confirm the deployment supports the route duration. |
| A result disappears | Results are temporary; download media before leaving, refreshing, or clearing the page. |

## Provider documentation

- [Gemini API reference](https://ai.google.dev/api/generate-content)
- [OpenAI image generation](https://developers.openai.com/api/docs/guides/image-generation)
- [OpenAI text to speech](https://developers.openai.com/api/docs/guides/text-to-speech)
- [shadcn/ui dark mode](https://ui.shadcn.com/docs/dark-mode/next)
