import type {
  MazesMazeIdGet200Response,
  MazesMazeIdPathsDslPostRequest,
} from "@/api";
import {
  Button,
  Card,
  CardContent,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui";

type ActionButtonsProps = {
  maze: MazesMazeIdGet200Response | null;
  selectedNodeIds: number[];
  apiRequest: MazesMazeIdPathsDslPostRequest | null;
  submitting: boolean;
  pathKey: string;
  lastSubmittedKey: string | null;
  onReset: () => void;
  onSubmit: () => void;
  onShortestPath: () => void;
};

export function ActionButtons({
  maze,
  selectedNodeIds,
  apiRequest,
  submitting,
  pathKey,
  lastSubmittedKey,
  onReset,
  onSubmit,
  onShortestPath,
}: ActionButtonsProps) {
  const canSubmit =
    Boolean(apiRequest) &&
    !submitting &&
    selectedNodeIds.length >= 2 &&
    pathKey !== lastSubmittedKey &&
    maze !== null;

  const canRequestShortestPath = Boolean(lastSubmittedKey);
  const isResetDisabled = selectedNodeIds.length === 0;
  const isSubmitDisabled = !canSubmit;
  const isShortestDisabled = !canRequestShortestPath;

  const renderTooltipButton = (
    id: string,
    label: string,
    tooltip: string,
    onClick: () => void,
    disabled: boolean,
    variant: "default" | "secondary" = "default",
  ) => {
    if (disabled) {
      return (
        <Tooltip key={id}>
          <TooltipTrigger asChild>
            <span className="block w-full" tabIndex={0} aria-disabled="true">
              <Button
                onClick={onClick}
                variant={variant}
                disabled
                className="w-full pointer-events-none"
              >
                {label}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={6}>
            {tooltip}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Tooltip key={id}>
        <TooltipTrigger asChild>
          <Button onClick={onClick} variant={variant} className="w-full">
            {label}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={6}>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <Card className="py-4">
      <CardContent className="px-4">
        <div className="flex flex-col items-stretch gap-2">
          {renderTooltipButton(
            "reset",
            "Reset Path",
            "Clears your current selection.",
            onReset,
            isResetDisabled,
            "secondary",
          )}
          {renderTooltipButton(
            "submit",
            submitting ? "Submitting..." : "Submit Path",
            "Submit your path for validation.",
            onSubmit,
            isSubmitDisabled,
          )}
          {renderTooltipButton(
            "shortest",
            "Shortest Path",
            "Compare with the shortest path after you submit.",
            onShortestPath,
            isShortestDisabled,
          )}
        </div>
      </CardContent>
    </Card>
  );
}
