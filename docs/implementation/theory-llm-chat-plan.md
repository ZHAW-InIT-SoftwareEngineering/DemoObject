# Theory Page LLM Chat Plan

## Purpose

This document describes the planned implementation for adding an LLM-backed chat
entry point to the theory pages.

It is a design note. It describes what to implement next. It is not a claim that
the chat feature already exists in code.

## Summary

Add a floating circular chat button to all theory pages through the shared
`/theory` layout. Clicking the button opens a small chat dialog where users can
send messages to the self-hosted LLM.

The frontend should call the DemoObject backend, not the hosted LLM directly.
The DemoObject backend should proxy requests to:

```text
https://llm-backend.cloudlab.zhaw.ch/chat
```

The hosted LLM request body is:

```json
{
  "user_message": "What is the capital of France?"
}
```

The hosted LLM response body is expected to be:

```json
{
  "llm_answer": "Paris"
}
```

## Backend Changes

Add a DemoObject backend chat proxy endpoint:

- Add zod DTOs for the frontend-facing request and response:
  - request: `{ userMessage: string }`
  - response: `{ llmAnswer: string }`
- Add `POST /chat` in the Express backend.
- Server-side, call `POST https://llm-backend.cloudlab.zhaw.ch/chat` with
  `{ user_message: userMessage }`.
- Map successful hosted responses from `{ llm_answer }` to `{ llmAnswer }`.
- Return `400` for invalid or empty input.
- Return `502` with a stable error response if the hosted LLM returns a non-OK
  status, non-JSON body, or malformed JSON.
- Register the route in OpenAPI.
- Mount the route in `backend/src/app.ts`.

The proxy is intentionally preferred over a direct browser call because the
hosted endpoint did not expose CORS headers during planning, and a probed
`POST /chat` returned `500 Internal Server Error`.

## Frontend Changes

Add a typed manual chat service:

- Call `POST /api/chat`, following the app's existing `/api` base-path behavior.
- Send `{ userMessage }`.
- Read `{ llmAnswer }`.
- Use `AbortController` so closing or unmounting the dialog does not leave stale
  state updates.
- Keep OpenAPI client regeneration optional for this first implementation.

Add a shared theory chat UI:

- Add a `TheoryChatWidget` component under the theory component area.
- Render it from `frontend/src/routes/theory/route.tsx` alongside `<Outlet />`,
  only after the active-session guard passes.
- Use a fixed circular icon button near the bottom-right of the viewport.
- Use a lucide chat icon, such as `MessageCircleQuestionMark`.
- Provide an accessible label for the trigger.
- Open a dialog containing:
  - scrollable message history
  - textarea input
  - send button
  - loading state
  - retry-friendly error message
- Keep message history in component memory.
- Preserve message history while navigating between theory pages, as long as the
  shared theory layout remains mounted.
- Reset message history on full page reload.

## Test Plan

Backend verification:

- Run `npm run build` in `backend`.
- Verify invalid request bodies return `400`.
- Verify hosted LLM failure paths return `502` without crashing.
- If the hosted LLM endpoint is healthy, verify `POST /chat` returns
  `{ llmAnswer: string }`.

Frontend verification:

- Run `npm run build` in `frontend`.
- Manually check `/theory/dsl` and `/theory/shortestPath`.
- Confirm the circular chat button is visible on both pages.
- Confirm the button does not overlap important content on mobile or desktop.
- Confirm the dialog opens and closes.
- Confirm empty messages cannot be submitted.
- Confirm loading and error states render clearly.
- Confirm successful LLM answers appear in order.

## Assumptions

- Chat is available on the existing theory pages only:
  - `/theory/dsl`
  - `/theory/shortestPath`
- Chat is not available on maze, editor, animation, display, or impressum pages.
- No persisted chat history is required.
- No streaming is required.
- The UI waits for the single `llm_answer` response.
- The backend proxy should centralize hosted LLM failure handling.
