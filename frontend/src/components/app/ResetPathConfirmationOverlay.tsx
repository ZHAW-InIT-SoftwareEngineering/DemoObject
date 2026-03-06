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
          <DialogTitle>Reset Path</DialogTitle>
          <DialogDescription>
            Are you sure you want to reset the path?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirmReset}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
