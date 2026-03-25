import type {
  MazesMazeIdGet200Response,
  MazesMazeIdGet200ResponseEdgesInner,
  MazesMazeIdGet200ResponseNodesInner,
} from "@/api";
import { useMemo } from "react";
import {
  nodePathToUndirectedEdgeKeySet,
  undirectedEdgeKey,
  type NodePath,
} from "@/lib/path/transforms";
import { SHOW_NODE_COORDS } from "@/lib/env";
import { useMazePointerDrawing } from "@/hooks/useMazePointerDrawing";

type MazeViewProps = {
  maze: MazesMazeIdGet200Response;
  width?: number;
  height?: number;
  onNodeClick?: (node: MazesMazeIdGet200ResponseNodesInner) => boolean | void;
  selectedNodePath?: NodePath;
  highlightedNodePath?: NodePath;
  secondaryHighlightedNodePath?: NodePath;
  explorationDiscoveredEdgeKeys?: readonly string[];
  explorationSeenEdgeKeys?: readonly string[];
  currentExplorationEdgeKey?: string | null;
  currentExplorationEdgeDiscovered?: boolean;
  className?: string;
};

type Bounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

const DEFAULT_SIZE = 520;
const PADDING = 20;

function getBounds(nodes: MazesMazeIdGet200ResponseNodesInner[]): Bounds {
  if (nodes.length === 0) {
    return {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    };
  }

  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

function scalePoint(
  x: number,
  y: number,
  bounds: Bounds,
  width: number,
  height: number,
) {
  const rangeX = Math.max(1, bounds.maxX - bounds.minX);
  const rangeY = Math.max(1, bounds.maxY - bounds.minY);
  const sx = (width - PADDING * 2) / rangeX;
  const sy = (height - PADDING * 2) / rangeY;
  const scale = Math.min(sx, sy);

  return {
    x: PADDING + (x - bounds.minX) * scale,
    y: PADDING + (y - bounds.minY) * scale,
  };
}

function renderEdge(
  edge: MazesMazeIdGet200ResponseEdgesInner,
  pointByNodeId: Map<number, { x: number; y: number }>,
  stroke: string,
  strokeWidth: number,
) {
  const p1 = pointByNodeId.get(edge.from);
  const p2 = pointByNodeId.get(edge.to);
  if (!p1 || !p2) return null;

  return (
    <line
      key={`${edge.from}-${edge.to}`}
      x1={p1.x}
      y1={p1.y}
      x2={p2.x}
      y2={p2.y}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  );
}

export function Maze({
  maze,
  width = DEFAULT_SIZE,
  height = DEFAULT_SIZE,
  onNodeClick,
  selectedNodePath = [],
  highlightedNodePath = [],
  secondaryHighlightedNodePath = [],
  explorationDiscoveredEdgeKeys = [],
  explorationSeenEdgeKeys = [],
  currentExplorationEdgeKey = null,
  currentExplorationEdgeDiscovered = false,
  className,
}: MazeViewProps) {
  const nodes = useMemo(() => maze.nodes ?? [], [maze.nodes]);
  const edges = useMemo(() => maze.edges ?? [], [maze.edges]);

  const bounds = useMemo(() => getBounds(nodes), [nodes]);
  const nodeById = useMemo(
    () => new Map(nodes.map((node) => [node.mazeNodeId, node])),
    [nodes],
  );
  const adjacencyByNodeId = useMemo(() => {
    const map = new Map<number, Set<number>>();
    for (const edge of edges) {
      const fromNeighbors = map.get(edge.from) ?? new Set<number>();
      fromNeighbors.add(edge.to);
      map.set(edge.from, fromNeighbors);
      const toNeighbors = map.get(edge.to) ?? new Set<number>();
      toNeighbors.add(edge.from);
      map.set(edge.to, toNeighbors);
    }
    return map;
  }, [edges]);
  const selected = useMemo(() => new Set(selectedNodePath), [selectedNodePath]);
  const highlightedEdges = nodePathToUndirectedEdgeKeySet(highlightedNodePath);
  const secondaryHighlightedEdges = nodePathToUndirectedEdgeKeySet(
    secondaryHighlightedNodePath,
  );
  const explorationDiscoveredEdges = useMemo(
    () => new Set(explorationDiscoveredEdgeKeys),
    [explorationDiscoveredEdgeKeys],
  );
  const explorationSeenEdges = useMemo(
    () => new Set(explorationSeenEdgeKeys),
    [explorationSeenEdgeKeys],
  );
  const pointByNodeId = useMemo(() => {
    const map = new Map<number, { x: number; y: number }>();
    for (const node of nodes) {
      map.set(node.mazeNodeId, scalePoint(node.x, node.y, bounds, width, height));
    }
    return map;
  }, [bounds, height, nodes, width]);
  const currentEndpointNodeId = selectedNodePath[selectedNodePath.length - 1];
  const {
    isPointerDrawing,
    stopPointerDrawing,
    onNodePointerDown,
    onMazePointerMove,
    onNodePointerEnter,
    onNodePointerLeave,
  } = useMazePointerDrawing({
    currentEndpointNodeId,
    adjacencyByNodeId,
    nodeById,
    pointByNodeId,
    onSelectNode: onNodeClick,
  });

  if (nodes.length === 0) return null;

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: "100%", height: "100%", touchAction: "none" }}
      onPointerMove={onMazePointerMove}
      onPointerUp={stopPointerDrawing}
      onPointerLeave={stopPointerDrawing}
      onPointerCancel={stopPointerDrawing}
    >
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill="#ffffff"
        stroke="#e5e7eb"
      />

      {edges.map((edge) => {
        const key = undirectedEdgeKey(edge.from, edge.to);
        const isHighlighted = highlightedEdges.has(key);
        const isSecondaryHighlighted = secondaryHighlightedEdges.has(key);
        const stroke = isHighlighted
          ? "#2563eb"
          : isSecondaryHighlighted
            ? "#f59e0b"
            : "#d1d5db";
        const strokeWidth = isHighlighted || isSecondaryHighlighted ? 3 : 2;
        return renderEdge(
          edge,
          pointByNodeId,
          stroke,
          strokeWidth,
        );
      })}

      {edges.map((edge) => {
        const key = undirectedEdgeKey(edge.from, edge.to);

        if (currentExplorationEdgeKey === key) {
          return renderEdge(
            edge,
            pointByNodeId,
            currentExplorationEdgeDiscovered ? "#ff2d95" : "#7c3aed",
            6,
          );
        }

        if (explorationSeenEdges.has(key)) {
          return renderEdge(
            edge,
            pointByNodeId,
            "#a3e635",
            4,
          );
        }

        if (explorationDiscoveredEdges.has(key)) {
          return renderEdge(
            edge,
            pointByNodeId,
            "#fff200",
            4,
          );
        }

        return null;
      })}

      {nodes.map((node) => {
        const p = pointByNodeId.get(node.mazeNodeId);
        if (!p) return null;
        const isSelected = selected.has(node.mazeNodeId);
        const isStart = node.mazeNodeId === maze.startNodeId;
        const isEnd = node.mazeNodeId === maze.endNodeId;
        const fill = isStart
          ? "#22c55e"
          : isEnd
            ? "#ef4444"
            : isSelected
              ? "#111827"
              : "#64748b";
        const strokeColor = isStart ? "#166534" : isEnd ? "#7f1d1d" : "#ffffff";
        const strokeWidth = isStart || isEnd ? 3 : 2;
        const selectionRingColor = isStart
          ? "#166534"
          : isEnd
            ? "#991b1b"
            : "#111827";
        const selectionRingRadius = isStart || isEnd ? 12 : 10;
        return (
          <g key={node.mazeNodeId}>
            {isSelected && (
              <circle
                cx={p.x}
                cy={p.y}
                r={selectionRingRadius}
                fill="none"
                stroke={selectionRingColor}
                strokeWidth={3}
                opacity={0.6}
                pointerEvents="none"
              />
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={8}
              fill={fill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              pointerEvents={onNodeClick ? "visibleFill" : "none"}
              style={{ cursor: onNodeClick ? "pointer" : "default" }}
              onPointerDown={(event) => onNodePointerDown(event, node.mazeNodeId)}
              onPointerEnter={isPointerDrawing ? () => onNodePointerEnter(node) : undefined}
              onPointerLeave={() => onNodePointerLeave(node.mazeNodeId)}
              onClick={() => onNodeClick?.(node)}
            >
              {SHOW_NODE_COORDS && <title>{`(${node.x},${node.y})`}</title>}
            </circle>
          </g>
        );
      })}
    </svg>
  );
}
