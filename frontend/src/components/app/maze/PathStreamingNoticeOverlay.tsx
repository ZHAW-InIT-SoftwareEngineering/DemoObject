import { Button } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PathStreamingNoticeOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export function PathStreamingNoticeOverlay({
  open,
  onClose,
}: PathStreamingNoticeOverlayProps) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-center">Geschafft</DialogTitle>
          <DialogDescription className="text-center">
            Dein Pfad wird bald auf dem grossen Bildschirm gezeigt. Du hast die
            Konzepte gemeistert und kannst jetzt dein Eis abholen.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-center">
          <Button type="button" onClick={onClose}>
            Weiter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
