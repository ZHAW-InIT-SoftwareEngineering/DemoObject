import { ActionButton } from "../../../ui/ActionButton";
import { MazeTimer } from "@/components/app/maze/MazeTimer";
import type { NodePath } from "@/lib/path/transforms";

type MazePanelHeaderProps = {
  userName?: string | null;
  pathState: {
    nodePath: NodePath;
    isPathSubmitted: boolean;
    canShowAnimationButton: boolean;
    timerElapsedMs: number;
  };
  actions: {
    onUndo: () => void;
    onShowAnimation: () => void;
    onOpen3DPreview: () => void;
  };
};

export function MazePanelHeader({
  actions,
  pathState,
  userName,
}: MazePanelHeaderProps) {
  const { onUndo, onShowAnimation, onOpen3DPreview } = actions;

  const canUndo = pathState.nodePath.length >= 2;
  const { isPathSubmitted, canShowAnimationButton, timerElapsedMs } = pathState;
  return (
    <div className="flex justify-center">
      <div className="flex flex-col items-center gap-2">
        {userName ? (
          <div className="rounded border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700">
            {userName}
          </div>
        ) : null}
        <MazeTimer elapsedMs={timerElapsedMs} />
        <div className="flex flex-wrap items-center justify-center gap-2">
          {isPathSubmitted ? (
            <ActionButton
              label="Animation anzeigen"
              onClick={onShowAnimation}
              disabled={!canShowAnimationButton}
              fullWidth={false}
            />
          ) : (
            <ActionButton
              label="Schritt rückgängig"
              onClick={onUndo}
              disabled={!canUndo}
              fullWidth={false}
            />
          )}
          <ActionButton
            label="Labyrinth in 3D"
            onClick={onOpen3DPreview}
            fullWidth={false}
            variant="secondary"
          />
        </div>
      </div>
    </div>
  );
}
