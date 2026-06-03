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
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-center">Pfad zurücksetzen</DialogTitle>
          <DialogDescription className="text-center">
            Möchtest du den Pfad wirklich zurücksetzen?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-center">
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
