import { apiBasePath, chatApi } from "@/lib/api";

export async function sendChatMessage(userMessage: string, signal?: AbortSignal) {
  return chatApi.chatPost(
    {
      chatPostRequest: { userMessage },
    },
    { signal },
  );
}

type StreamChatMessageOptions = {
  signal?: AbortSignal;
  onDelta: (delta: string) => void;
};

export async function streamChatMessage(
  userMessage: string,
  { signal, onDelta }: StreamChatMessageOptions,
) {
  const response = await fetch(`${apiBasePath.replace(/\/$/, "")}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userMessage }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error("Chat stream request failed.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  function handleFrame(frame: string) {
    const dataLines = frame
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice("data:".length).trimStart());

    for (const data of dataLines) {
      if (data === "[DONE]") return;

      const parsed = JSON.parse(data) as { delta?: unknown };
      if (typeof parsed.delta === "string") {
        onDelta(parsed.delta);
      }
    }
  }

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });

    const frames = buffer.split(/\r?\n\r?\n/);
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      handleFrame(frame);
    }

    if (done) break;
  }

  if (buffer.trim()) {
    handleFrame(buffer);
  }
}
