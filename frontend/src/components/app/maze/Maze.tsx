import type {
  MazesMazeIdGet200Response,
  MazesMazeIdGet200ResponseEdgesInner,
  MazesMazeIdGet200ResponseNodesInner,
} from "@/api";
import {
  nodePathToUndirectedEdgeKeySet,
  undirectedEdgeKey,
  type NodePath,
} from "@/lib/path/transforms";

type MazeViewProps = {
  maze: MazesMazeIdGet200Response;
  width?: number;
  height?: number;
  onNodeClick?: (node: MazesMazeIdGet200ResponseNodesInner) => void;
  selectedNodePath?: NodePath;
  highlightedNodePath?: NodePath;
  secondaryHighlightedNodePath?: NodePath;
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
  nodeById: Map<number, MazesMazeIdGet200ResponseNodesInner>,
  bounds: Bounds,
  width: number,
  height: number,
  stroke: string,
  strokeWidth: number,
) {
  const from = nodeById.get(edge.from);
  const to = nodeById.get(edge.to);
  if (!from || !to) return null;

  const p1 = scalePoint(from.x, from.y, bounds, width, height);
  const p2 = scalePoint(to.x, to.y, bounds, width, height);

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
  className,
}: MazeViewProps) {
  const nodes = maze.nodes ?? [];
  const edges = maze.edges ?? [];

  if (nodes.length === 0) return null;

  const bounds = getBounds(nodes);
  const nodeById = new Map(nodes.map((n) => [n.mazeNodeId, n]));
  const selected = new Set(selectedNodePath);
  const highlightedEdges = nodePathToUndirectedEdgeKeySet(highlightedNodePath);
  const secondaryHighlightedEdges = nodePathToUndirectedEdgeKeySet(
    secondaryHighlightedNodePath,
  );

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: "100%", height: "100%" }}
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
          ? "#16a34a"
          : isSecondaryHighlighted
            ? "#f97316"
            : "#d1d5db";
        const strokeWidth = isHighlighted || isSecondaryHighlighted ? 3 : 2;
        return renderEdge(
          edge,
          nodeById,
          bounds,
          width,
          height,
          stroke,
          strokeWidth,
        );
      })}

      {nodes.map((node) => {
        const p = scalePoint(node.x, node.y, bounds, width, height);
        const isSelected = selected.has(node.mazeNodeId);
        const isStart = node.mazeNodeId === maze.startNodeId;
        const isEnd = node.mazeNodeId === maze.endNodeId;
        const fill = isSelected
          ? "#111827"
          : isStart
            ? "#16a34a"
            : isEnd
              ? "#dc2626"
              : "#3b82f6";
        const strokeColor = isStart ? "#14532d" : isEnd ? "#dd1b1b" : "#ffffff";
        const strokeWidth = isStart || isEnd ? 3 : 2;
        return (
          <g key={node.mazeNodeId}>
            <circle
              cx={p.x}
              cy={p.y}
              r={8}
              fill={fill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              style={{ cursor: onNodeClick ? "pointer" : "default" }}
              onClick={() => onNodeClick?.(node)}
            />
          </g>
        );
      })}
    </svg>
  );
}
