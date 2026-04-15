import type { MazesMazeIdGet200ResponseNodesInner } from "@/api";
import { Button } from "@/components/ui";
import { getTheoryDslTokenMeta, type TheoryDslToken } from "@/lib/theoryDsl";
import { cn } from "@/lib/utils";

const DIRECTION_BUTTON_LAYOUT: Array<{
  token: TheoryDslToken;
  className: string;
}> = [
  { token: "UP", className: "col-start-2 row-start-1" },
  { token: "LEFT", className: "col-start-1 row-start-2" },
  { token: "RIGHT", className: "col-start-3 row-start-2" },
  { token: "DOWN", className: "col-start-2 row-start-3" },
];

type TheoryDslDirectionPadProps = {
  moveChoiceByToken: ReadonlyMap<
    TheoryDslToken,
    MazesMazeIdGet200ResponseNodesInner
  >;
  onSelectNode: (node: MazesMazeIdGet200ResponseNodesInner) => void;
};

export function TheoryDslDirectionPad({
  moveChoiceByToken,
  onSelectNode,
}: TheoryDslDirectionPadProps) {
  return (
    <div className="mx-auto w-fit rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        DSL-Steuerkreuz
      </div>
      <div className="mt-3 grid grid-cols-3 grid-rows-3 gap-1.5 sm:gap-2">
        {DIRECTION_BUTTON_LAYOUT.map(({ token, className }) => {
          const meta = getTheoryDslTokenMeta(token);
          const node = moveChoiceByToken.get(token);

          return (
            <Button
              key={token}
              type="button"
              variant={node ? "default" : "outline"}
              className={cn(
                "h-auto min-h-12 w-16 shrink-0 flex-col gap-0.5 px-2 py-2 text-center sm:min-h-14 sm:w-20 sm:gap-1 sm:px-3",
                className,
                node
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "border-slate-200 bg-slate-100 text-slate-400 disabled:opacity-100",
              )}
              onClick={() => {
                if (node) {
                  onSelectNode(node);
                }
              }}
              disabled={!node}
            >
              <span className="text-[9px] uppercase tracking-[0.18em] sm:text-[10px]">
                {token}
              </span>
              <span className="text-xs font-medium sm:text-sm">
                {meta.shortLabel}
              </span>
            </Button>
          );
        })}
        <div className="col-start-2 row-start-2 flex min-h-12 w-16 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:min-h-14 sm:w-20 sm:text-xs">
          DSL
        </div>
      </div>
    </div>
  );
}
