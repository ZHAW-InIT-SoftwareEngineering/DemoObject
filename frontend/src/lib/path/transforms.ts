export type NodePath = number[];
export type CoordPoint = { x: number; y: number };

export function undirectedEdgeKey(a: number, b: number) {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

export function nodePathToUndirectedEdgeKeySet(
  nodePath: readonly number[],
): Set<string> {
  const keys = new Set<string>();

  for (let i = 0; i < nodePath.length - 1; i += 1) {
    keys.add(undirectedEdgeKey(nodePath[i], nodePath[i + 1]));
  }

  return keys;
}

export function nodePathToCoordPath(
  nodePath: readonly number[],
  nodeById: ReadonlyMap<number, CoordPoint>,
): CoordPoint[] {
  const points: CoordPoint[] = [];

  for (const nodeId of nodePath) {
    const node = nodeById.get(nodeId);
    if (!node) continue;
    points.push({ x: node.x, y: node.y });
  }

  return points;
}

export function coordPathToNodePath(
  coordPath: readonly CoordPoint[],
  nodeIdByCoord: ReadonlyMap<string, number>,
): NodePath {
  const nodePath: NodePath = [];

  for (const point of coordPath) {
    const nodeId = nodeIdByCoord.get(`${point.x},${point.y}`);
    if (nodeId !== undefined) nodePath.push(nodeId);
  }

  return nodePath;
}
