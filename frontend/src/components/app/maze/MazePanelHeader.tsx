import { ActionButton } from "../ActionButton";
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
    const isDevMode = import.meta.env.DEV;

    return (
        <div className="flex items-center justify-between gap-3 text-sm text-gray-700">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-600 ring-2 ring-green-900" />
              <span>Start</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-600 ring-2 ring-red-900" />
              <span>End</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isPathSubmitted ? (
              <ActionButton
                label="Show Animation"
                onClick={onShowAnimation}
                disabled={!canShowAnimationButton}
                fullWidth={false}
              />
            ) : (
              <ActionButton
                label="Undo Step"
                onClick={onUndo}
                disabled={!canUndo}
                fullWidth={false}
              />
            )}
            {isDevMode && (
              <ActionButton
                label="Open 3D (dev)"
                onClick={onOpen3DPreview}
                fullWidth={false}
                variant="outline"
              />
            )}
          </div>
        </div>
    );
}
