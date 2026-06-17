import { Router } from "express";
import { z } from "zod";
import { LLM_CHAT_TIMEOUT_MS } from "../../config/config";
import { registry } from "../../openapi/openapiRegistry";
import { sendChatMessageService, streamChatMessageService } from "../../services/chat.service";
import { ChatErrorResponse, ChatRequest, ChatResponse } from "./chat.dto";

export const chatRouter = Router();

registry.registerPath({
  method: "post",
  path: "/chat",
  summary: "Send a chat message to the hosted LLM through the backend proxy",
  tags: ["chat"],
  request: {
    body: { content: { "application/json": { schema: ChatRequest } } },
  },
  responses: {
    200: {
      description: "LLM response",
      content: { "application/json": { schema: ChatResponse } },
    },
    400: { description: "Invalid request" },
    502: {
      description: "Hosted LLM request failed",
      content: { "application/json": { schema: ChatErrorResponse } },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/chat/stream",
  summary: "Stream a hosted LLM chat response through the backend proxy",
  tags: ["chat"],
  request: {
    body: { content: { "application/json": { schema: ChatRequest } } },
  },
  responses: {
    200: {
      description: "LLM response stream",
      content: { "text/event-stream": { schema: z.string() } },
    },
    400: { description: "Invalid request" },
    502: {
      description: "Hosted LLM request failed",
      content: { "application/json": { schema: ChatErrorResponse } },
    },
  },
});

chatRouter.post("/", async (req, res) => {
  const parsed = ChatRequest.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }

  const result = await sendChatMessageService(parsed.data.userMessage);
  if (result.status === "upstream-error") {
    return res.status(502).json({ error: "Hosted LLM request failed" });
  }

  return res.json(ChatResponse.parse({ llmAnswer: result.llmAnswer }));
});

chatRouter.post("/stream", async (req, res) => {
  const parsed = ChatRequest.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), LLM_CHAT_TIMEOUT_MS);

  res.on("close", () => {
    abortController.abort();
  });

  try {
    const result = await streamChatMessageService(parsed.data.userMessage, abortController.signal);
    if (result.status === "upstream-error") {
      if (!res.writableEnded) {
        return res.status(502).json({ error: "Hosted LLM request failed" });
      }
      return;
    }

    res.status(200);
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const reader = result.body.getReader();
    while (!res.writableEnded) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }

    res.end();
  } catch {
    if (!res.headersSent) {
      res.status(502).json({ error: "Hosted LLM request failed" });
    } else if (!res.writableEnded) {
      res.end();
    }
  } finally {
    clearTimeout(timeout);
  }
});
