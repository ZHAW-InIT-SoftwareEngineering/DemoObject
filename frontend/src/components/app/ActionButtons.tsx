import type {
  MazesMazeIdGet200Response,
  MazesMazeIdPathsDslPostRequest,
} from "@/api";
import { Button } from "@/components/ui";

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

  return (
    <div className="flex flex-col items-stretch gap-2">
      <Button
        onClick={onReset}
        variant="secondary"
        disabled={!selectedNodeIds.length}
      >
        Reset Path
      </Button>
      <Button onClick={onSubmit} disabled={!canSubmit}>
        {submitting ? "Submitting..." : "Submit Path"}
      </Button>
      <Button onClick={onShortestPath} disabled={!canRequestShortestPath}>
        Shortest Path
      </Button>
    </div>
  );
}
