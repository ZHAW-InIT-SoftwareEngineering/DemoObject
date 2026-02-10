import type {
  MazesMazeIdGet200Response,
  MazesMazeIdPathsDslPostRequest,
} from "@/api";
import { Button, Card, CardContent } from "@/components/ui";

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

  const renderButton = (
    id: string,
    label: string,
    onClick: () => void,
    disabled: boolean,
    variant: "default" | "secondary" = "default",
  ) => {
    return (
      <Button
        key={id}
        onClick={onClick}
        variant={variant}
        disabled={disabled}
        className="w-full"
      >
        {label}
      </Button>
    );
  };

  return (
    <Card className="py-4">
      <CardContent className="px-4">
        <div className="flex flex-col items-stretch gap-2">
          {renderButton(
            "reset",
            "Reset Path",
            onReset,
            isResetDisabled,
            "secondary",
          )}
          {renderButton(
            "submit",
            submitting ? "Submitting..." : "Submit Path",
            onSubmit,
            isSubmitDisabled,
          )}
          {renderButton(
            "shortest",
            "Shortest Path",
            onShortestPath,
            isShortestDisabled,
          )}
        </div>
      </CardContent>
    </Card>
  );
}
