import { Button } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ResetPathConfirmationOverlayProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmReset: () => void;
};

export function ResetPathConfirmationOverlay({
  open,
  onOpenChange,
  onConfirmReset,
}: ResetPathConfirmationOverlayProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Pfad zurücksetzen</DialogTitle>
          <DialogDescription>
            Möchtest du den Pfad wirklich zurücksetzen?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Abbrechen
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirmReset}>
            Zurücksetzen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
