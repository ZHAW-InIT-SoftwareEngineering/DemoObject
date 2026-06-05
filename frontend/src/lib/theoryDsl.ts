import type { MazesMazeIdGet200ResponseNodesInner } from "@/api";

export type TheoryDslToken = "UP" | "RIGHT" | "DOWN" | "LEFT";

type TheoryDslTokenMeta = {
  label: string;
  shortLabel: string;
  order: number;
};

const THEORY_DSL_TOKEN_META: Record<TheoryDslToken, TheoryDslTokenMeta> = {
  UP: {
    label: "Nach oben",
    shortLabel: "HOCH",
    order: 0,
  },
  RIGHT: {
    label: "Nach rechts",
    shortLabel: "RECHTS",
    order: 1,
  },
  DOWN: {
    label: "Nach unten",
    shortLabel: "RUNTER",
    order: 2,
  },
  LEFT: {
    label: "Nach links",
    shortLabel: "LINKS",
    order: 3,
  },
};

function isTheoryDslToken(token: string): token is TheoryDslToken {
  return Object.prototype.hasOwnProperty.call(THEORY_DSL_TOKEN_META, token);
}

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

  throw new Error;
}

export function getTheoryDslTokenMeta(token: TheoryDslToken): TheoryDslTokenMeta {
  return THEORY_DSL_TOKEN_META[token];
}

export function getDslTokenMeta(token: string): TheoryDslTokenMeta {
  if (isTheoryDslToken(token)) {
    return getTheoryDslTokenMeta(token);
  }

  return {
    label: token,
    shortLabel: token,
    order: Number.MAX_SAFE_INTEGER,
  };
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
