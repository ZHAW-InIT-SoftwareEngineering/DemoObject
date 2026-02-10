import { useCallback, useEffect, useState } from "react";

export type ToastKind = "success" | "error";

export type ToastState = {
  message: string;
  kind: ToastKind;
};

export function useToast(durationMs = 2500) {
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), durationMs);
    return () => window.clearTimeout(timeout);
  }, [toast, durationMs]);

  const showToast = useCallback((message: string, kind: ToastKind) => {
    setToast({ message, kind });
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  return { toast, showToast, clearToast };
}
