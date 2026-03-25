import { ActionButton } from "../../../ui/ActionButton";
import type { NodePath } from "@/lib/path/transforms";

type MazePanelHeaderProps = {
  pathState: {
    nodePath: NodePath;
    isPathSubmitted: boolean;
    canShowAnimationButton: boolean;
  };
  actions: {
    onUndo: () => void;
    onShowAnimation: () => void;
    onOpen3DPreview: () => void;
  };
};

export function MazePanelHeader({ actions, pathState }: MazePanelHeaderProps) {
  const { onUndo, onShowAnimation, onOpen3DPreview } = actions;

  const canUndo = pathState.nodePath.length >= 2;
  const { isPathSubmitted, canShowAnimationButton } = pathState;
  return (
    <div className="flex justify-center">
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
  );
}
