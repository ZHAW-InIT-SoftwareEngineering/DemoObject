import type { MazesMazeIdGet200ResponseNodesInner } from "@/api";

export type TheoryDslToken = "UP" | "RIGHT" | "DOWN" | "LEFT" | "MOVE";

type TheoryDslTokenMeta = {
  label: string;
  shortLabel: string;
  order: number;
};

const THEORY_DSL_TOKEN_META: Record<TheoryDslToken, TheoryDslTokenMeta> = {
  UP: {
    label: "Nach oben",
    shortLabel: "Hoch",
    order: 0,
  },
  RIGHT: {
    label: "Nach rechts",
    shortLabel: "Rechts",
    order: 1,
  },
  DOWN: {
    label: "Nach unten",
    shortLabel: "Runter",
    order: 2,
  },
  LEFT: {
    label: "Nach links",
    shortLabel: "Links",
    order: 3,
  },
  MOVE: {
    label: "Zum Nachbarknoten",
    shortLabel: "Schritt",
    order: 4,
  },
};

export function getTheoryDslToken(
  from: Pick<MazesMazeIdGet200ResponseNodesInner, "x" | "y">,
  to: Pick<MazesMazeIdGet200ResponseNodesInner, "x" | "y">,
): TheoryDslToken {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (dx === 0 && dy === -1) return "UP";
  if (dx === 1 && dy === 0) return "RIGHT";
  if (dx === 0 && dy === 1) return "DOWN";
  if (dx === -1 && dy === 0) return "LEFT";

  return "MOVE";
}

export function getTheoryDslTokenMeta(token: TheoryDslToken): TheoryDslTokenMeta {
  return THEORY_DSL_TOKEN_META[token];
}

export function nodePathToTheoryDslTokens(
  nodePath: readonly number[],
  nodeById: ReadonlyMap<number, MazesMazeIdGet200ResponseNodesInner>,
): TheoryDslToken[] {
  const tokens: TheoryDslToken[] = [];

  for (let index = 0; index < nodePath.length - 1; index += 1) {
    const from = nodeById.get(nodePath[index]);
    const to = nodeById.get(nodePath[index + 1]);

    if (!from || !to) continue;

    tokens.push(getTheoryDslToken(from, to));
  }

  return tokens;
}
