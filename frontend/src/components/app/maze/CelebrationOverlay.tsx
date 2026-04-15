import { PartyPopper, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CelebrationOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export function CelebrationOverlay({ open, onClose }: CelebrationOverlayProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="overflow-hidden rounded-2xl border-amber-200 p-8 text-center sm:max-w-md">
        <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-amber-200/40 animate-ping" />
        <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-emerald-200/40 animate-pulse" />

        <div className="relative space-y-4 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 ring-8 ring-amber-200/60">
            <PartyPopper className="h-10 w-10 text-amber-600 animate-bounce" />
          </div>

          <div className="flex items-center justify-center gap-2 text-amber-600">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Perfekter Pfad
            </span>
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>

          <DialogHeader className="space-y-2 text-center sm:text-center">
            <DialogTitle className="text-center text-lg font-semibold text-slate-900">
              Du hast den kürzesten Weg gefunden.
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-slate-600">
              Starke Lösung. Dieser Durchlauf ist optimal.
            </DialogDescription>
          </DialogHeader>

          <Button type="button" onClick={onClose}>
            Weiter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
