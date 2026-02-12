import { groupBidirectionalEdges } from "./groupBidirectionalEdges";

function edgeToIds(edgeKey: string): [number, number] | null {
  const [fromRaw, toRaw] = edgeKey.split("-");
  const from = Number(fromRaw);
  const to = Number(toRaw);
  if (!Number.isInteger(from) || !Number.isInteger(to)) return null;
  return [from, to];
}

export function edgeKeysToNodePath(edgeKeys: string[]) {
  const groups = groupBidirectionalEdges(edgeKeys);
  const nodeIds: number[] = [];

  for (const group of groups) {
    const parsed = edgeToIds(group[0]);
    if (!parsed) continue;

    const [from, to] = parsed;
    if (nodeIds.length === 0) {
      nodeIds.push(from, to);
      continue;
    }

    const last = nodeIds[nodeIds.length - 1];
    if (last === from) {
      nodeIds.push(to);
      continue;
    }

    if (last === to) {
      nodeIds.push(from);
      continue;
    }

    nodeIds.push(from, to);
  }

  return nodeIds;
}
