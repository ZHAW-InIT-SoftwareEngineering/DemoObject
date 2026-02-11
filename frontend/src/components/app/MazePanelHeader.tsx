import { ActionButton } from "./ActionButton";


type MazePanelHeaderProps = {
    pathState: {
        selectedNodeIds: number[];
        isPathSubmitted: boolean;
        canShowAnimation: boolean;
    };
    actions: {
        onUndo: () => void;
        onShowAnimation: () => void;
    };
};

export function MazePanelHeader({ actions, pathState }: MazePanelHeaderProps) {
    const { onUndo, onShowAnimation } = actions;

    const canUndo = pathState.selectedNodeIds.length >= 2;
    const { isPathSubmitted, canShowAnimation } = pathState;

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
          {isPathSubmitted ? (
            <ActionButton
              label="Show Animation"
              onClick={onShowAnimation}
              disabled={!canShowAnimation}
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
        </div>
    );
}
