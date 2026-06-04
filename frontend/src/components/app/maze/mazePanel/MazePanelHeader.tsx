import { ActionButton } from "../../../ui/ActionButton";
import { MazeTimer } from "@/components/app/maze/MazeTimer";

type MazePanelHeaderProps = {
  userName?: string | null;
  pathState: {
    timerElapsedMs: number;
  };
  actions: {
    onOpen3DPreview: () => void;
  };
};

export function MazePanelHeader({
  actions,
  pathState,
  userName,
}: MazePanelHeaderProps) {
  const { onOpen3DPreview } = actions;

  const { timerElapsedMs } = pathState;
  return (
    <div className="flex h-full flex-col justify-center rounded-md border border-slate-200 bg-white p-3">
      <div className="flex flex-col items-center gap-2">
        {userName ? (
          <div className="w-full rounded border border-slate-200 bg-slate-50 px-3 py-1 text-center text-sm font-semibold text-slate-700">
            {userName}
          </div>
        ) : null}
        <MazeTimer elapsedMs={timerElapsedMs} />
        <div className="grid w-full gap-2">
          <ActionButton
            label="Labyrinth in 3D"
            onClick={onOpen3DPreview}
            variant="secondary"
            className="h-9 px-2 text-xs"
          />
        </div>
      </div>
    </div>
  );
}
