# Streaming Chat Debug: Local vs Production

## Problem
When running the collaboration-app locally with `npm run dev`, the chat window only showed the first word from the streaming response of the llm-service. However, when deployed to Kubernetes (or run locally in production mode), the UI correctly displayed the full stream of words.

## Investigation
- The llm-service streaming endpoint was verified to send correct SSE (Server-Sent Events) data.
- Debug logs were added to the frontend to inspect all received stream lines.
- Testing showed that:
  - Locally (dev mode): Only the first word appeared, stream closed early.
  - Locally (production mode) and in Kubernetes: Full streaming worked as expected.
- Both local and pod collaboration-app pointed to the same llm-service pod, ruling out backend issues.

## Root Cause
- The Next.js development server (`npm run dev`) buffers or mishandles streaming responses, breaking SSE streaming.
- The production server (`npm run start`) handles streaming correctly.

## Solution
- Use `npm run build` and `npm run start` to run the app locally in production mode for streaming features.
- Avoid relying on `npm run dev` for testing streaming chat functionality.

## Summary
If you experience issues with streaming responses in local development, always test in production mode. Dev servers may not support streaming correctly.

---

**Keywords:** Next.js, streaming, SSE, dev server, production, chat, debugging, frontend, llm-service
