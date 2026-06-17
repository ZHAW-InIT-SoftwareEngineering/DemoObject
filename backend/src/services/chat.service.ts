import { LLM_CHAT_ENDPOINT, LLM_CHAT_STREAM_ENDPOINT, LLM_CHAT_TIMEOUT_MS } from "../config/config";
import { HostedChatResponse } from "../api/chat/chat.dto";

type ChatServiceResult =
  | { status: "ok"; llmAnswer: string }
  | { status: "upstream-error" };

type ChatStreamServiceResult =
  | { status: "ok"; body: ReadableStream<Uint8Array> }
  | { status: "upstream-error" };

export async function sendChatMessageService(userMessage: string): Promise<ChatServiceResult> {
  let response: Response;

  try {
    response = await fetch(LLM_CHAT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage }),
      signal: AbortSignal.timeout(LLM_CHAT_TIMEOUT_MS),
    });
  } catch {
    return { status: "upstream-error" };
  }

  if (!response.ok) {
    return { status: "upstream-error" };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return { status: "upstream-error" };
  }

  const parsed = HostedChatResponse.safeParse(payload);
  if (!parsed.success) {
    return { status: "upstream-error" };
  }

  return { status: "ok", llmAnswer: parsed.data.llm_answer };
}

export async function streamChatMessageService(
  userMessage: string,
  signal: AbortSignal,
): Promise<ChatStreamServiceResult> {
  let response: Response;

  try {
    response = await fetch(LLM_CHAT_STREAM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage }),
      signal,
    });
  } catch {
    return { status: "upstream-error" };
  }

  if (!response.ok || !response.body) {
    return { status: "upstream-error" };
  }

  return { status: "ok", body: response.body };
}
