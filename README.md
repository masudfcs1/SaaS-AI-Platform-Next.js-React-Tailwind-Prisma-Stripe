

This project uses Next.js 16.3.6 and React 19.3.0. Use Node.js 24 LTS
(`.nvmrc` pins 24.21.0); Node.js 22.13 or newer in the 22.x line is also supported.
The landing page, dashboard, and AI tools are public; no authentication service is required.

Install dependencies with `npm ci`, configure the environment using `.env.example`,
then run the development server:

```bash
npm run dev

```

Use `npm run build` and `npm start` for production. Run `npm run lint`,
`npm run typecheck`, and `npm test` to validate changes.

## Reusable Gemini utility

Conversation and code generation share the server-only utility in `lib/gemini.ts`.
Configure credentials in your ignored `.env` or `.env.local` file:

```dotenv
GEMINI_API_KEY=your_key
# Or configure multiple keys (blank entries and duplicates are removed):
GEMINI_API_KEYS=your_first_key,your_second_key
# Optional model priority override:
GEMINI_MODELS=gemini-3.6-flash,gemini-3.5-flash,gemini-3.5-flash-lite,gemini-flash-latest
```

Use the helpers from API routes, server actions, or server components:

```ts
import { generateGeminiText, generateGeminiResponse } from "@/lib/gemini";

const text = await generateGeminiText("Explain closures in JavaScript.");

const message = await generateGeminiResponse({
  messages: [{ role: "user", content: "Write a React toggle button." }],
  systemInstruction: "Answer with code and code comments only.",
  maxOutputTokens: 2048,
});
// message: { role: "assistant", content: string }
```

The utility exports `GEMINI_API_KEYS`, `GEMINI_MODELS`, `GeminiMessage`,
`GeminiOptions`, and `GeminiError`. Keys rotate between requests. Each model/key
pair is attempted at most once for credential, quota, or availability failures;
invalid keys are skipped for the rest of the request. Retries share a 45-second
budget (`timeoutMs` overrides it), with at most 15 seconds per attempt. Pass an
`AbortSignal` as `signal` to cancel a request. Prompt rejections are not retried.

Keep these imports on the server. Client components should call `/api/conversation`
or `/api/code`; do not store API credentials in `NEXT_PUBLIC_` variables. See
[Google's Gemini API reference](https://ai.google.dev/api/generate-content) for the
underlying request format. Run `npm test` for the utility and route regression tests.

![12](https://github.com/masudfcs1/SaaS-AI-Platform-Next.js-React-Tailwind-Prisma-Stripe/assets/57311382/7b244702-7ad7-4d6f-abc5-1cf61ce02a25)
![21](https://github.com/masudfcs1/SaaS-AI-Platform-Next.js-React-Tailwind-Prisma-Stripe/assets/57311382/e3868567-0d8d-40e1-9f8c-fbc976f68666)
![112](https://github.com/masudfcs1/SaaS-AI-Platform-Next.js-React-Tailwind-Prisma-Stripe/assets/57311382/9666a084-cb02-4b3d-82b5-9cb81ad73b5b)

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can edit the landing page in `app/(landing)/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources

- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutoria

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js...

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details

# SaaS-AI-Platform-Next.js-React-Tailwind-Prisma-Strip.
