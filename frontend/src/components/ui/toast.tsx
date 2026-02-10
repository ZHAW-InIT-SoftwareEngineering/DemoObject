import { ToastState } from "@/hooks/useToast";

type ToastProps = {
  toast: ToastState | null;
};

export function Toast({ toast }: ToastProps) {
  if (!toast) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 w-[calc(100%-3rem)] max-w-[360px] rounded px-3 py-2 text-sm font-medium shadow ${
        toast.kind === "success"
          ? "bg-emerald-50/80 text-emerald-700"
          : "bg-red-50/80 text-red-700"
      }`}
    >
      {toast.message}
    </div>
  );
}
