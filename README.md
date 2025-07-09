This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Authentication Setup

Google sign-in is implemented with **Firebase Authentication**. Create a `.env.local` file based on `.env.example` and fill in your Firebase project configuration. Once the environment variables are set you can run the development server and test login via `/login`.

## Gemini Chat

Open the prompt box from the menu (or the invite button that appears after a few
seconds) and type your question. Requests are posted to `/api/gemini`. If
`GEMINI_API_KEY` is set the server handles the request locally using the
`@google/generative-ai` SDK. Without a key the message is forwarded to the
external service at
`https://gemini-api-565729687872.asia-northeast3.run.app/chat` (or the URL in
`NEXT_PUBLIC_GEMINI_API_URL`).
