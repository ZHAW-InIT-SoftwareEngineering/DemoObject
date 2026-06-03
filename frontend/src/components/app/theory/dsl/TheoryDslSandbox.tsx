import type {
  MazesMazeIdGet200Response,
  MazesMazeIdGet200ResponseNodesInner,
} from "@/api";
import { Maze } from "@/components/app/maze";
import { MazeLegendSection } from "@/components/app/maze/MazeLegendSection";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { TheoryDslToken } from "@/lib/theoryDsl";
import { TheoryDslDirectionPad } from "./TheoryDslDirectionPad";

type TheoryDslSandboxProps = {
  maze: MazesMazeIdGet200Response;
  nodePath: readonly number[];
  moveChoiceByToken: ReadonlyMap<
    TheoryDslToken,
    MazesMazeIdGet200ResponseNodesInner
  >;
  onSelectNode: (node: MazesMazeIdGet200ResponseNodesInner) => void;
};

export function TheoryDslSandbox({
  maze,
  nodePath,
  moveChoiceByToken,
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
            <div className="flex flex-1 items-center justify-center">
              <TheoryDslDirectionPad
                className="h-full w-full rounded-t-none border-t-0 shadow-none"
                moveChoiceByToken={moveChoiceByToken}
                onSelectNode={onSelectNode}
              />
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
