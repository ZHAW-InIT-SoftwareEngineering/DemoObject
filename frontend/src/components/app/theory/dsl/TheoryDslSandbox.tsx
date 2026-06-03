import { useEffect, useRef } from "react";
import type {
  MazesMazeIdGet200Response,
  MazesMazeIdGet200ResponseNodesInner,
} from "@/api";
import { Maze } from "@/components/app/maze";
import { MazeLegendSection } from "@/components/app/maze/MazeLegendSection";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { getDslTokenMeta, type TheoryDslToken } from "@/lib/theoryDsl";
import { TheoryDslDirectionPad } from "./TheoryDslDirectionPad";

type TheoryDslSandboxProps = {
  maze: MazesMazeIdGet200Response;
  nodePath: readonly number[];
  moveChoiceByToken: ReadonlyMap<
    TheoryDslToken,
    MazesMazeIdGet200ResponseNodesInner
  >;
  dsl: TheoryDslToken[] | null;
  onSelectNode: (node: MazesMazeIdGet200ResponseNodesInner) => void;
};

export function TheoryDslSandbox({
  maze,
  nodePath,
  moveChoiceByToken,
  dsl,
  onSelectNode,
}: TheoryDslSandboxProps) {
  return (
    <Card className="py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-base text-slate-900">
          DSL: Pfad-Programmierung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="aspect-square w-full touch-none overscroll-contain">
            <Maze
              maze={maze}
              className="pointer-events-none h-full w-full rounded border bg-white"
              selectedNodePath={[...nodePath]}
              highlightedNodePath={[...nodePath]}
            />
          </div>

          <div className="flex w-full flex-col md:aspect-square">
            <MazeLegendSection title="Legende:" />
            <div className="flex min-h-0 flex-1 items-center">
              <div className="grid h-56 w-full min-h-0 grid-cols-[minmax(0,1fr)_4.5rem] gap-2 sm:h-64">
                <div className="flex min-w-0 items-stretch justify-center">
                  <TheoryDslDirectionPad
                    className="h-full w-full max-w-72 rounded-t-none border-t-0 p-2 shadow-none"
                    moveChoiceByToken={moveChoiceByToken}
                    onSelectNode={onSelectNode}
                  />
                </div>
                <TheoryDslVerticalPath dsl={dsl} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full justify-center">
          <Badge
            variant="outline"
            className="max-w-full whitespace-normal px-2.5 py-1.5 text-center text-[11px] leading-4 tracking-tight text-slate-700 min-[375px]:whitespace-nowrap sm:w-auto"
          >
            Jeder Block erweitert den markierten Pfad im Demo-Labyrinth.
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

type TheoryDslVerticalPathProps = {
  dsl: TheoryDslToken[] | null;
};

function TheoryDslVerticalPath({ dsl }: TheoryDslVerticalPathProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!dsl?.length || !scrollContainerRef.current) {
      return;
    }

    scrollContainerRef.current.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [dsl?.length]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-1.5 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        DSL
      </div>
      <div
        ref={scrollContainerRef}
        className="flex min-h-0 flex-1 flex-col items-center gap-1.5 overflow-y-auto px-1.5 py-2"
      >
        {dsl?.length ? (
          dsl.map((token, index) => {
            const meta = getDslTokenMeta(token);

            return (
              <div
                key={`${token}-${index}`}
                className="flex flex-col items-center gap-1"
              >
                <Badge
                  variant="secondary"
                  className="w-full justify-center px-1.5 text-[10px] tracking-wide"
                  title={meta.label}
                >
                  {meta.shortLabel}
                </Badge>
                {index < dsl.length - 1 && (
                  <span className="text-xs leading-none text-gray-400">↓</span>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex flex-1 items-center text-center text-[10px] leading-4 text-slate-400">
            Noch leer
          </div>
        )}
      </div>
    </div>
  );
}
