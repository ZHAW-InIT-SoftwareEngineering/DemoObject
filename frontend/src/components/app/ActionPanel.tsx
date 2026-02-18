import type {
  MazesMazeIdGet200Response,
  MazesMazeIdPathsDslPostRequest,
} from "@/api";
import { Card, CardContent } from "@/components/ui";
import { ActionButton } from "./ActionButton";
import type { NodePath } from "@/lib/path/transforms";

type ActionPanelProps = {
  maze: MazesMazeIdGet200Response | null;
  pathState: {
    nodePath: NodePath;
    apiRequest: MazesMazeIdPathsDslPostRequest | null;
    submitting: boolean;
    pathKey: string;
    lastSubmittedKey: string | null;
    hasShortestPathForCurrentSubmission: boolean;
  };
  actions: {
    onReset: () => void;
    onSubmit: () => void;
    onShortestPath: () => void;
  };
};

export function ActionPanel({ maze, pathState, actions }: ActionPanelProps) {
  const {
    nodePath,
    apiRequest,
    submitting,
    pathKey,
    lastSubmittedKey,
    hasShortestPathForCurrentSubmission,
  } = pathState;
  const { onReset, onSubmit, onShortestPath } = actions;

  const canSubmit =
    Boolean(apiRequest) &&
    !submitting &&
    nodePath.length >= 2 &&
    pathKey !== lastSubmittedKey &&
    maze !== null;

  const canRequestShortestPath =
    Boolean(lastSubmittedKey) && pathKey === lastSubmittedKey;
  const isResetDisabled = nodePath.length === 0;
  const isSubmitDisabled = !canSubmit;
  const isShortestDisabled =
    !canRequestShortestPath || hasShortestPathForCurrentSubmission;

  return (
    <Card className="py-4">
      <CardContent className="px-4">
        <div className="flex flex-col items-stretch gap-2">
          <ActionButton
            label="Reset Path"
            onClick={onReset}
            disabled={isResetDisabled}
            variant="secondary"
          />
          <ActionButton
            label={submitting ? "Submitting..." : "Submit Path"}
            onClick={onSubmit}
            disabled={isSubmitDisabled}
          />
          <ActionButton
            label="Shortest Path"
            onClick={onShortestPath}
            disabled={isShortestDisabled}
          />
        </div>
      </CardContent>
    </Card>
  );
}
