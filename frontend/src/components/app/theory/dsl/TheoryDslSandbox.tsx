import type {
  MazesMazeIdGet200Response,
  MazesMazeIdGet200ResponseNodesInner,
} from "@/api";
import { DslStrip } from "@/components/app/maze/DslStrip";
import { Badge, Card, CardContent, CardHeader, CardTitle, Maze } from "@/components/ui";
import type { TheoryDslToken } from "@/lib/theoryDsl";
import { TheoryDslDirectionPad } from "./TheoryDslDirectionPad";

type TheoryDslSandboxProps = {
  maze: MazesMazeIdGet200Response;
  nodePath: readonly number[];
  theoryDslTokens: readonly TheoryDslToken[];
  moveChoiceByToken: ReadonlyMap<
    TheoryDslToken,
    MazesMazeIdGet200ResponseNodesInner
  >;
  onSelectNode: (node: MazesMazeIdGet200ResponseNodesInner) => void;
};

export function TheoryDslSandbox({
  maze,
  nodePath,
  theoryDslTokens,
  moveChoiceByToken,
  onSelectNode,
}: TheoryDslSandboxProps) {
  return (
    <Card className="py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-base text-slate-900">
          Theorie-Sandbox
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-800">
              Legende
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-green-600 ring-2 ring-green-900" />
                <span>Start</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-600 ring-2 ring-red-900" />
                <span>Ziel</span>
              </div>
            </div>
          </div>
        </div>

        <DslStrip
          dsl={theoryDslTokens.length > 0 ? [...theoryDslTokens] : null}
          autoScrollToLatest
        />

        <div className="w-full aspect-square touch-none overscroll-contain">
          <Maze
            maze={maze}
            className="pointer-events-none h-full w-full rounded border bg-white"
            selectedNodePath={[...nodePath]}
            highlightedNodePath={[...nodePath]}
          />
        </div>

        <TheoryDslDirectionPad
          moveChoiceByToken={moveChoiceByToken}
          onSelectNode={onSelectNode}
        />

        <div className="w-full">
          <Badge
            variant="outline"
            className="max-w-full whitespace-normal px-3 py-2 text-center leading-5 text-slate-700 sm:w-auto"
          >
            Jeder Block erweitert den markierten Pfad im Demo-Labyrinth.
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
