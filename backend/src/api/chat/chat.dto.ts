import { z } from "zod";

export const ChatRequest = z.object({
  userMessage: z.string().trim().min(1).max(512),
});

export const ChatResponse = z.object({
  llmAnswer: z.string(),
});

export const ChatErrorResponse = z.object({
  error: z.string(),
});

export const HostedChatResponse = z.object({
  llm_answer: z.string(),
});
