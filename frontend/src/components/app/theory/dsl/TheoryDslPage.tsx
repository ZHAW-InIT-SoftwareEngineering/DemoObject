import { useMemo } from "react";
import type { MazesMazeIdGet200ResponseNodesInner } from "@/api";
import { RouteBackButton } from "@/components/ui/RouteBackButton";
import { useLocalMazePath, useMazeById } from "@/hooks";
import {
  getTheoryDslToken,
  nodePathToTheoryDslTokens,
  type TheoryDslToken,
} from "@/lib/theoryDsl";
import { Card, CardContent } from "@/components/ui";
import { TheoryDslIntro } from "./TheoryDslIntro";
import { TheoryDslSandbox } from "./TheoryDslSandbox";

const THEORY_DSL_MAZE_ID = 1;

export function TheoryDslPage() {
  const { loading, maze, error } = useMazeById(THEORY_DSL_MAZE_ID);
  const { nodePath, selectNode } = useLocalMazePath(maze);

  const nodeById = useMemo(
    () => new Map((maze?.nodes ?? []).map((node) => [node.mazeNodeId, node])),
    [maze?.nodes],
  );
  const currentNode = useMemo(() => {
    if (nodePath.length === 0) return null;
    return nodeById.get(nodePath[nodePath.length - 1]) ?? null;
  }, [nodeById, nodePath]);
  const theoryDslTokens = useMemo(
    () => nodePathToTheoryDslTokens(nodePath, nodeById),
    [nodeById, nodePath],
  );
  const moveChoices = useMemo(() => {
    if (!maze || !currentNode) return [];

    const seenNodeIds = new Set<number>();

    return (maze.edges ?? [])
      .flatMap((edge) => {
        if (edge.from === currentNode.mazeNodeId) return [edge.to];
        if (edge.to === currentNode.mazeNodeId) return [edge.from];
        return [];
      })
      .filter((nodeId) => {
        if (seenNodeIds.has(nodeId)) return false;
        seenNodeIds.add(nodeId);
        return true;
      })
      .map((nodeId) => nodeById.get(nodeId))
      .filter(
        (node): node is MazesMazeIdGet200ResponseNodesInner => node !== undefined,
      )
      .map((node) => ({
        node,
        token: getTheoryDslToken(currentNode, node),
      }))
      .sort((a, b) => a.node.mazeNodeId - b.node.mazeNodeId);
  }, [currentNode, maze, nodeById]);
  const moveChoiceByToken = useMemo(
    () => new Map<TheoryDslToken, MazesMazeIdGet200ResponseNodesInner>(
      moveChoices.map((choice) => [choice.token, choice.node]),
    ),
    [moveChoices],
  );

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <RouteBackButton fallbackTo="/maze" />

        <TheoryDslIntro />

        {loading ? (
          <Card className="py-4">
            <CardContent className="px-6 text-sm text-slate-600">
              Theorie-Labyrinth wird geladen...
            </CardContent>
          </Card>
        ) : null}

        {error ? (
          <Card className="py-4">
            <CardContent className="px-6 text-sm text-red-600">{error}</CardContent>
          </Card>
        ) : null}

        {maze ? (
          <TheoryDslSandbox
            maze={maze}
            nodePath={nodePath}
            theoryDslTokens={theoryDslTokens}
            moveChoiceByToken={moveChoiceByToken}
            onSelectNode={selectNode}
          />
        ) : null}
      </div>
    </main>
  );
}
