function parseEdgeKey(edgeKey: string): [string, string] | null {
  const parts = edgeKey.split("-");
  if (parts.length !== 2) return null;
  const [from, to] = parts;
  if (!from || !to) return null;
  return [from, to];
}

function isReverseEdge(a: string, b: string) {
  const parsedA = parseEdgeKey(a);
  const parsedB = parseEdgeKey(b);
  if (!parsedA || !parsedB) return false;

  const [fromA, toA] = parsedA;
  const [fromB, toB] = parsedB;
  return fromA === toB && toA === fromB;
}

export function groupBidirectionalEdges(edgeKeys: string[]) {
  const groups: string[][] = [];

  for (let i = 0; i < edgeKeys.length; i += 1) {
    const current = edgeKeys[i];
    const next = edgeKeys[i + 1];

    if (next && isReverseEdge(current, next)) {
      groups.push([current, next]);
      i += 1;
      continue;
    }

    groups.push([current]);
  }

  return groups;
}
