import { Button } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type AnimationPathChoice = "user" | "shortest";

type AnimationPathSelectionOverlayProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPath: (choice: AnimationPathChoice) => void;
  canUseUserPath: boolean;
  canUseShortestPath: boolean;
  userPathLength: number;
  shortestPathLength?: number | null;
};

export function AnimationPathSelectionOverlay({
  open,
  onOpenChange,
  onSelectPath,
  canUseUserPath,
  canUseShortestPath,
  userPathLength,
  shortestPathLength,
}: AnimationPathSelectionOverlayProps) {
  const choiceButtonClassName = "w-full justify-between";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Path Animation</DialogTitle>
          <DialogDescription>
            Select which route you want to animate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Button
            type="button"
            variant="secondary"
            className={choiceButtonClassName}
            onClick={() => onSelectPath("user")}
            disabled={!canUseUserPath}
          >
            <span>User Path</span>
            <span className="text-xs opacity-80">{userPathLength} steps</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            className={choiceButtonClassName}
            onClick={() => onSelectPath("shortest")}
            disabled={!canUseShortestPath}
          >
            <span>Shortest Path</span>
            <span className="text-xs opacity-80">
              {shortestPathLength !== undefined && shortestPathLength !== null
                ? `${shortestPathLength} steps`
                : "not loaded"}
            </span>
          </Button>
        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}
