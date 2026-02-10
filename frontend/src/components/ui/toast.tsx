import { ToastState } from "@/hooks/useToast";

type ToastProps = {
  toast: ToastState | null;
};

export function Toast({ toast }: ToastProps) {
  if (!toast) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-[520px] -translate-x-1/2 rounded px-3 py-2 text-sm font-medium shadow ${
        toast.kind === "success"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      {toast.message}
    </div>
  );
}
