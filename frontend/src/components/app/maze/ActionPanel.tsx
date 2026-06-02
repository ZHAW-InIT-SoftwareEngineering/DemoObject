import type {
  MazesMazeIdGet200Response,
  MazesMazeIdPathsDslPostRequest,
} from "@/api";
import { Card, CardContent } from "@/components/ui";
import { ActionButton } from "../../ui/ActionButton";
import { ImpressumLink } from "../impressum/ImpressumLink";
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
  const endsAtGoal =
    maze !== null &&
    nodePath.length > 0 &&
    nodePath[nodePath.length - 1] === maze.endNodeId;
  const startsAtStart =
    maze !== null && nodePath.length > 0 && nodePath[0] === maze.startNodeId;

  const canSubmit =
    Boolean(apiRequest) &&
    !submitting &&
    nodePath.length >= 2 &&
    startsAtStart &&
    endsAtGoal &&
    pathKey !== lastSubmittedKey &&
    maze !== null;

  const canRequestShortestPath =
    Boolean(lastSubmittedKey) && pathKey === lastSubmittedKey;
  const isResetDisabled = nodePath.length === 0;
  const isSubmitDisabled = !canSubmit;
  const isShortestDisabled =
    !canRequestShortestPath || hasShortestPathForCurrentSubmission;

  return (
    <div className="space-y-4">
      <Card className="py-4">
        <CardContent className="px-4">
          <div className="flex flex-col items-stretch gap-2">
            <ActionButton
              label="Pfad zurücksetzen"
              onClick={onReset}
              disabled={isResetDisabled}
              variant="secondary"
            />
            <ActionButton
              label={submitting ? "Wird gesendet..." : "Pfad senden"}
              onClick={onSubmit}
              disabled={isSubmitDisabled}
            />
            <ActionButton
              label="Kürzester Pfad"
              onClick={onShortestPath}
              disabled={isShortestDisabled}
            />
          </div>
        </CardContent>
      </Card>
      <ImpressumLink />
    </div>
  );
}
