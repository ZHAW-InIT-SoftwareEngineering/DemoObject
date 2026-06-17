import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MessageCircleQuestionMark, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { streamChatMessage } from "@/services/chat";

const CHAT_MESSAGE_LIMIT = 512;

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

export function TheoryChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const nextMessageIdRef = useRef(1);

  const trimmedDraft = useMemo(() => draft.trim(), [draft]);
  const canSend = trimmedDraft.length > 0 && draft.length <= CHAT_MESSAGE_LIMIT && !loading;

  useEffect(() => {
    if (open) return;

    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setLoading(false);
  }, [open]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const transcript = transcriptRef.current;
    if (!transcript) return;

    transcript.scrollTop = transcript.scrollHeight;
  }, [messages]);

  async function handleSend() {
    if (!canSend) return;

    const userText = trimmedDraft;
    const userMessage: ChatMessage = {
      id: nextMessageIdRef.current++,
      role: "user",
      text: userText,
    };
    const assistantMessageId = nextMessageIdRef.current++;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      text: "",
    };

    setMessages((currentMessages) => [...currentMessages, userMessage, assistantMessage]);
    setDraft("");
    setError(null);
    setLoading(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    let streamedText = "";

    try {
      await streamChatMessage(userText, {
        signal: abortController.signal,
        onDelta: (delta) => {
          streamedText += delta;
          setMessages((currentMessages) =>
            currentMessages.map((message) =>
              message.id === assistantMessageId ? { ...message, text: streamedText } : message,
            ),
          );
        },
      });
    } catch {
      if (abortController.signal.aborted) {
        if (!streamedText) {
          setMessages((currentMessages) =>
            currentMessages.filter((message) => message.id !== assistantMessageId),
          );
        }
        return;
      }
      setMessages((currentMessages) =>
        currentMessages.filter(
          (message) => message.id !== assistantMessageId || message.text.length > 0,
        ),
      );
      setError("Die Antwort konnte nicht geladen werden. Bitte versuche es erneut.");
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }

  function handleDraftChange(value: string) {
    setDraft(value.slice(0, CHAT_MESSAGE_LIMIT));
    if (error) setError(null);
  }

  return (
    <>
      <Button
        type="button"
        size="icon-lg"
        className="fixed right-4 bottom-4 z-40 size-12 rounded-full shadow-lg sm:right-6 sm:bottom-6"
        aria-label="Theorie-Chat öffnen"
        onClick={() => setOpen(true)}
      >
        <MessageCircleQuestionMark className="size-6" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="grid h-[min(680px,calc(100dvh-2rem))] grid-rows-[auto_minmax(0,1fr)_auto] gap-4 p-4 sm:max-w-md sm:p-5">
          <DialogHeader className="pr-8">
            <DialogTitle>Theorie-Chat</DialogTitle>
            <DialogDescription>Stelle eine kurze Frage zur Theorie.</DialogDescription>
          </DialogHeader>

          <div ref={transcriptRef} className="min-h-0 overflow-y-auto rounded-md border bg-slate-50 p-3">
            {messages.length === 0 ? (
              <p className="text-sm text-slate-600">Noch keine Nachrichten.</p>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "max-w-[88%] rounded-md px-3 py-2 text-sm leading-6",
                      message.role === "user"
                        ? "ml-auto bg-slate-900 text-white"
                        : "mr-auto border bg-white text-slate-900",
                    )}
                  >
                    {message.text || (
                      <span className="inline-flex items-center gap-2 text-slate-600">
                        <Loader2 className="size-4 animate-spin" />
                        Antwort wird geladen...
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {error ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            <div className="rounded-md border bg-white focus-within:ring-2 focus-within:ring-slate-300">
              <textarea
                value={draft}
                onChange={(event) => handleDraftChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void handleSend();
                  }
                }}
                className="min-h-24 w-full resize-none rounded-md bg-transparent px-3 py-2 text-sm outline-none"
                maxLength={CHAT_MESSAGE_LIMIT}
                disabled={loading}
                aria-label="Nachricht an den Theorie-Chat"
              />
              <div className="flex items-center justify-between gap-3 border-t px-3 py-2">
                <span className="text-xs text-slate-500">
                  {draft.length}/{CHAT_MESSAGE_LIMIT}
                </span>
                <Button type="button" size="sm" onClick={handleSend} disabled={!canSend}>
                  {loading ? <Loader2 className="animate-spin" /> : <Send />}
                  Senden
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
