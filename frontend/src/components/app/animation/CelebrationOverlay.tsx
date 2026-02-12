import { PartyPopper, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui";

type CelebrationOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export function CelebrationOverlay({ open, onClose }: CelebrationOverlayProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-2xl">
        <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-amber-200/40 animate-ping" />
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-emerald-200/40 animate-pulse" />

        <button
          type="button"
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          onClick={onClose}
          aria-label="Close celebration"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative space-y-4 p-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 ring-8 ring-amber-200/60">
            <PartyPopper className="h-10 w-10 text-amber-600 animate-bounce" />
          </div>

          <div className="flex items-center justify-center gap-2 text-amber-600">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Perfect Path
            </span>
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>

          <p className="text-lg font-semibold text-slate-900">
            You matched the shortest route.
          </p>

          <p className="text-sm text-slate-600">
            Nice solution. This run is optimal.
          </p>

          <Button type="button" onClick={onClose}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
