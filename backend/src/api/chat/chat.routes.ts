import { Router } from "express";
import { registry } from "../../openapi/openapiRegistry";
import { sendChatMessageService } from "../../services/chat.service";
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
