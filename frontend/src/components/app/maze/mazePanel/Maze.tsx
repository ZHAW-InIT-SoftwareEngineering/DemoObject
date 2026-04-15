import type {
  MazesMazeIdGet200Response,
  MazesMazeIdGet200ResponseEdgesInner,
  MazesMazeIdGet200ResponseNodesInner,
} from "@/api";
import { useMemo } from "react";
import {
  buildMazeWallCoordSegments,
  getMazeBounds,
  type MazeBounds,
  type MazeCoordSegment,
} from "@/lib/mazeGeometry";
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

type CellBounds = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

type LayoutMetrics = {
  cellSize: number;
  offsetX: number;
  offsetY: number;
  wallStrokeWidth: number;
  routeStrokeWidth: number;
  routeOverlayStrokeWidth: number;
  currentOverlayStrokeWidth: number;
  markerRadius: number;
  selectionRingRadius: number;
};

const DEFAULT_SIZE = 520;
const PADDING = 20;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getNodeHoverLabel(node: MazesMazeIdGet200ResponseNodesInner) {
  return `ID ${node.mazeNodeId} (${node.x}, ${node.y})`;
}

function getLayoutMetrics(
  bounds: MazeBounds,
  width: number,
  height: number,
): LayoutMetrics {
  const columnCount = Math.max(1, bounds.maxX - bounds.minX + 1);
  const rowCount = Math.max(1, bounds.maxY - bounds.minY + 1);
  const availableWidth = Math.max(width - PADDING * 2, 1);
  const availableHeight = Math.max(height - PADDING * 2, 1);
  const cellSize = Math.min(availableWidth / columnCount, availableHeight / rowCount);
  const renderedWidth = columnCount * cellSize;
  const renderedHeight = rowCount * cellSize;

  return {
    cellSize,
    offsetX: (width - renderedWidth) / 2,
    offsetY: (height - renderedHeight) / 2,
    wallStrokeWidth: clamp(cellSize * 0.18, 4, 12),
    routeStrokeWidth: clamp(cellSize * 0.26, 6, 14),
    routeOverlayStrokeWidth: clamp(cellSize * 0.2, 5, 11),
    currentOverlayStrokeWidth: clamp(cellSize * 0.28, 7, 15),
    markerRadius: clamp(cellSize * 0.18, 4.5, 10),
    selectionRingRadius: clamp(cellSize * 0.24, 7, 13),
  };
}

function scalePoint(
  x: number,
  y: number,
  bounds: MazeBounds,
  layout: LayoutMetrics,
) {
  return {
    x: layout.offsetX + (x - bounds.minX + 0.5) * layout.cellSize,
    y: layout.offsetY + (y - bounds.minY + 0.5) * layout.cellSize,
  };
}

function getCellBounds(
  x: number,
  y: number,
  bounds: MazeBounds,
  layout: LayoutMetrics,
): CellBounds {
  const left = layout.offsetX + (x - bounds.minX) * layout.cellSize;
  const top = layout.offsetY + (y - bounds.minY) * layout.cellSize;

  return {
    left,
    right: left + layout.cellSize,
    top,
    bottom: top + layout.cellSize,
  };
}

function renderRouteEdge(
  edge: MazesMazeIdGet200ResponseEdgesInner,
  pointByNodeId: Map<number, { x: number; y: number }>,
  stroke: string,
  strokeWidth: number,
  opacity = 1,
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
      opacity={opacity}
      pointerEvents="none"
    />
  );
}

function renderWallSegment(
  segment: MazeCoordSegment,
  bounds: MazeBounds,
  layout: LayoutMetrics,
) {
  const from = scalePoint(segment.from.x, segment.from.y, bounds, layout);
  const to = scalePoint(segment.to.x, segment.to.y, bounds, layout);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  if (distance === 0) return null;

  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const perpendicularX = -dy / distance;
  const perpendicularY = dx / distance;
  const halfLength = layout.cellSize / 2;

  return (
    <line
      key={`wall-${segment.from.x}-${segment.from.y}-${segment.to.x}-${segment.to.y}`}
      x1={midX - perpendicularX * halfLength}
      y1={midY - perpendicularY * halfLength}
      x2={midX + perpendicularX * halfLength}
      y2={midY + perpendicularY * halfLength}
      stroke="#3f3f46"
      strokeWidth={layout.wallStrokeWidth}
      strokeLinecap="square"
      pointerEvents="none"
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
  const wallSegments = useMemo(() => buildMazeWallCoordSegments(maze), [maze]);

  const bounds = useMemo(() => getMazeBounds(nodes), [nodes]);
  const layout = useMemo(() => getLayoutMetrics(bounds, width, height), [
    bounds,
    height,
    width,
  ]);
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
  const highlightedEdges = useMemo(
    () => nodePathToUndirectedEdgeKeySet(highlightedNodePath),
    [highlightedNodePath],
  );
  const secondaryHighlightedEdges = useMemo(
    () => nodePathToUndirectedEdgeKeySet(secondaryHighlightedNodePath),
    [secondaryHighlightedNodePath],
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
      map.set(node.mazeNodeId, scalePoint(node.x, node.y, bounds, layout));
    }
    return map;
  }, [bounds, layout, nodes]);
  const cellBoundsByNodeId = useMemo(() => {
    const map = new Map<number, CellBounds>();
    for (const node of nodes) {
      map.set(node.mazeNodeId, getCellBounds(node.x, node.y, bounds, layout));
    }
    return map;
  }, [bounds, layout, nodes]);
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
    cellBoundsByNodeId,
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

      {nodes.map((node) => {
        const cell = cellBoundsByNodeId.get(node.mazeNodeId);
        if (!cell) return null;

        const isSelected = selected.has(node.mazeNodeId);
        const isStart = node.mazeNodeId === maze.startNodeId;
        const isEnd = node.mazeNodeId === maze.endNodeId;
        const fill = isStart
          ? "#ecfdf5"
          : isEnd
            ? "#fef2f2"
            : isSelected
              ? "#dbeafe"
              : "#f8fafc";
        const stroke = isSelected ? "#93c5fd" : "#e5e7eb";

        return (
          <rect
            key={`cell-${node.mazeNodeId}`}
            x={cell.left}
            y={cell.top}
            width={layout.cellSize}
            height={layout.cellSize}
            fill={fill}
            stroke={stroke}
            strokeWidth={1}
            pointerEvents={onNodeClick ? "visibleFill" : "none"}
            style={{ cursor: onNodeClick ? "pointer" : "default" }}
            onPointerDown={(event) => onNodePointerDown(event, node.mazeNodeId)}
            onPointerEnter={isPointerDrawing ? () => onNodePointerEnter(node) : undefined}
            onPointerLeave={() => onNodePointerLeave(node.mazeNodeId)}
            onClick={() => onNodeClick?.(node)}
          >
            {SHOW_NODE_COORDS && <title>{getNodeHoverLabel(node)}</title>}
          </rect>
        );
      })}

      {edges.map((edge) => {
        const key = undirectedEdgeKey(edge.from, edge.to);
        if (!secondaryHighlightedEdges.has(key)) return null;

        return renderRouteEdge(
          edge,
          pointByNodeId,
          "#f59e0b",
          layout.routeOverlayStrokeWidth,
          0.84,
        );
      })}

      {edges.map((edge) => {
        const key = undirectedEdgeKey(edge.from, edge.to);
        if (!highlightedEdges.has(key)) return null;

        return renderRouteEdge(
          edge,
          pointByNodeId,
          "#2563eb",
          layout.routeStrokeWidth,
          0.92,
        );
      })}

      {edges.map((edge) => {
        const key = undirectedEdgeKey(edge.from, edge.to);

        if (currentExplorationEdgeKey === key) {
          return renderRouteEdge(
            edge,
            pointByNodeId,
            currentExplorationEdgeDiscovered ? "#ff2d95" : "#7c3aed",
            layout.currentOverlayStrokeWidth,
          );
        }

        if (explorationSeenEdges.has(key)) {
          return renderRouteEdge(
            edge,
            pointByNodeId,
            "#a3e635",
            layout.routeOverlayStrokeWidth,
          );
        }

        if (explorationDiscoveredEdges.has(key)) {
          return renderRouteEdge(
            edge,
            pointByNodeId,
            "#fff200",
            layout.routeOverlayStrokeWidth,
          );
        }

        return null;
      })}

      {wallSegments.map((segment) => renderWallSegment(segment, bounds, layout))}

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
        return (
          <g key={node.mazeNodeId}>
            {isSelected && (
              <circle
                cx={p.x}
                cy={p.y}
                r={layout.selectionRingRadius}
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
              r={layout.markerRadius}
              fill={fill}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              pointerEvents="none"
            />
          </g>
        );
      })}
    </svg>
  );
}
