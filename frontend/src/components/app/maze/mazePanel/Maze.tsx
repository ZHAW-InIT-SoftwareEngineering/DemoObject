import type {
  MazesMazeIdGet200Response,
  MazesMazeIdGet200ResponseEdgesInner,
  MazesMazeIdGet200ResponseNodesInner,
} from "@/api";
import { useId, useMemo } from "react";
import { IceCreamCone, SignpostBig } from "lucide-react";
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

type EdgeWeightLabelMode = "none" | "all" | "non-default";

type MazeShadowOverlay = {
  observedNodeIds: readonly number[];
  observedEdgeKeys: readonly string[];
  focusNodeId?: number | null;
};

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
  shadowOverlay?: MazeShadowOverlay | null;
  viewportCenterNodeId?: number | null;
  viewportScale?: number;
  edgeWeightLabelMode?: EdgeWeightLabelMode;
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
  weightLabelFontSize: number;
  weightLabelRadius: number;
  weightLabelPaddingX: number;
  weightLabelPaddingY: number;
};

const DEFAULT_SIZE = 520;
const PADDING = 20;
const SHADOW_OVERLAY_OPACITY = 0.5;
const USER_PATH_COLOR = "#2563eb";
const SHORTEST_PATH_COLOR = "#f59e0b";
const OVERLAPPING_PATH_COLOR = "#be123c";
const START_ICON_COLOR = "#b91c1c";
const START_ICON_BACKGROUND_COLOR = "#fee2e2";
const START_ICON_BORDER_COLOR = "#fecaca";
const GOAL_ICON_COLOR = "#15803d";
const GOAL_ICON_BACKGROUND_COLOR = "#dcfce7";
const GOAL_ICON_BORDER_COLOR = "#bbf7d0";

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
    weightLabelFontSize: clamp(cellSize * 0.34, 9, 14),
    weightLabelRadius: clamp(cellSize * 0.14, 4, 8),
    weightLabelPaddingX: clamp(cellSize * 0.12, 4, 7),
    weightLabelPaddingY: clamp(cellSize * 0.08, 2, 4),
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

function getMazeAreaBounds(bounds: MazeBounds, layout: LayoutMetrics) {
  const columnCount = Math.max(1, bounds.maxX - bounds.minX + 1);
  const rowCount = Math.max(1, bounds.maxY - bounds.minY + 1);

  return {
    x: layout.offsetX - layout.wallStrokeWidth,
    y: layout.offsetY - layout.wallStrokeWidth,
    width: columnCount * layout.cellSize + layout.wallStrokeWidth * 2,
    height: rowCount * layout.cellSize + layout.wallStrokeWidth * 2,
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

function renderEdgeWeightLabel(
  edge: MazesMazeIdGet200ResponseEdgesInner,
  pointByNodeId: Map<number, { x: number; y: number }>,
  layout: LayoutMetrics,
) {
  const p1 = pointByNodeId.get(edge.from);
  const p2 = pointByNodeId.get(edge.to);
  if (!p1 || !p2) return null;

  const label = String(edge.weight);
  const midX = (p1.x + p2.x) / 2;
  const midY = (p1.y + p2.y) / 2;
  const estimatedCharWidth = layout.weightLabelFontSize * 0.62;
  const boxWidth =
    label.length * estimatedCharWidth + layout.weightLabelPaddingX * 2;
  const boxHeight =
    layout.weightLabelFontSize + layout.weightLabelPaddingY * 2;

  return (
    <g key={`weight-${edge.from}-${edge.to}`} pointerEvents="none">
      <rect
        x={midX - boxWidth / 2}
        y={midY - boxHeight / 2}
        width={boxWidth}
        height={boxHeight}
        rx={layout.weightLabelRadius}
        fill="rgba(255,255,255,0.94)"
        stroke="#cbd5e1"
        strokeWidth={1}
      />
      <text
        x={midX}
        y={midY}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#0f172a"
        fontSize={layout.weightLabelFontSize}
        fontWeight={700}
      >
        {label}
      </text>
    </g>
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
  shadowOverlay = null,
  viewportCenterNodeId = null,
  viewportScale = 1,
  edgeWeightLabelMode = "none",
  className,
}: MazeViewProps) {
  const shadowMaskId = useId().replace(/:/g, "");
  const shadowHaloGradientId = useId().replace(/:/g, "");
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
  const overlappingHighlightedEdges = useMemo(() => {
    const edges = new Set<string>();
    for (const key of highlightedEdges) {
      if (secondaryHighlightedEdges.has(key)) {
        edges.add(key);
      }
    }
    return edges;
  }, [highlightedEdges, secondaryHighlightedEdges]);
  const explorationDiscoveredEdges = useMemo(
    () => new Set(explorationDiscoveredEdgeKeys),
    [explorationDiscoveredEdgeKeys],
  );
  const explorationSeenEdges = useMemo(
    () => new Set(explorationSeenEdgeKeys),
    [explorationSeenEdgeKeys],
  );
  const shadowObservedNodes = useMemo(
    () => new Set(shadowOverlay?.observedNodeIds ?? []),
    [shadowOverlay?.observedNodeIds],
  );
  const shadowObservedEdges = useMemo(
    () => new Set(shadowOverlay?.observedEdgeKeys ?? []),
    [shadowOverlay?.observedEdgeKeys],
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
  const mazeAreaBounds = useMemo(() => getMazeAreaBounds(bounds, layout), [
    bounds,
    layout,
  ]);
  const shadowRevealInset = Math.max(layout.wallStrokeWidth * 0.8, 4);
  const shadowRevealEdgeStrokeWidth = Math.max(
    layout.routeOverlayStrokeWidth * 1.6,
    layout.wallStrokeWidth * 1.35,
  );
  const shadowRevealNodeRadius = Math.max(
    layout.selectionRingRadius,
    layout.markerRadius * 1.8,
  );
  const shadowFocusPoint = useMemo(() => {
    const focusNodeId = shadowOverlay?.focusNodeId;
    if (focusNodeId === null || focusNodeId === undefined) {
      return null;
    }

    return pointByNodeId.get(focusNodeId) ?? null;
  }, [pointByNodeId, shadowOverlay?.focusNodeId]);
  const shadowFocusRadius = Math.max(layout.cellSize * 2.6, 44);
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

  const effectiveViewportScale = Math.max(viewportScale, 1);
  const viewportCenterPoint = useMemo(() => {
    if (viewportCenterNodeId === null || viewportCenterNodeId === undefined) {
      return {
        x: width / 2,
        y: height / 2,
      };
    }

    return (
      pointByNodeId.get(viewportCenterNodeId) ?? {
        x: width / 2,
        y: height / 2,
      }
    );
  }, [height, pointByNodeId, viewportCenterNodeId, width]);
  const viewportTranslateX =
    width / 2 - viewportCenterPoint.x * effectiveViewportScale;
  const viewportTranslateY =
    height / 2 - viewportCenterPoint.y * effectiveViewportScale;

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
      {shadowOverlay ? (
        <defs>
          <mask
            id={shadowMaskId}
            maskUnits="userSpaceOnUse"
            maskContentUnits="userSpaceOnUse"
          >
            <rect
              x={mazeAreaBounds.x}
              y={mazeAreaBounds.y}
              width={mazeAreaBounds.width}
              height={mazeAreaBounds.height}
              fill="#ffffff"
            />
            {nodes.map((node) => {
              if (!shadowObservedNodes.has(node.mazeNodeId)) return null;
              const cell = cellBoundsByNodeId.get(node.mazeNodeId);
              if (!cell) return null;

              return (
                <rect
                  key={`shadow-cell-${node.mazeNodeId}`}
                  x={cell.left - shadowRevealInset}
                  y={cell.top - shadowRevealInset}
                  width={layout.cellSize + shadowRevealInset * 2}
                  height={layout.cellSize + shadowRevealInset * 2}
                  rx={Math.max(layout.wallStrokeWidth * 0.5, 3)}
                  fill="#000000"
                />
              );
            })}
            {edges.map((edge) => {
              const key = undirectedEdgeKey(edge.from, edge.to);
              if (!shadowObservedEdges.has(key)) return null;

              const p1 = pointByNodeId.get(edge.from);
              const p2 = pointByNodeId.get(edge.to);
              if (!p1 || !p2) return null;

              return (
                <line
                  key={`shadow-edge-${key}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="#000000"
                  strokeWidth={shadowRevealEdgeStrokeWidth}
                  strokeLinecap="round"
                />
              );
            })}
            {nodes.map((node) => {
              if (!shadowObservedNodes.has(node.mazeNodeId)) return null;
              const point = pointByNodeId.get(node.mazeNodeId);
              if (!point) return null;

              return (
                <circle
                  key={`shadow-node-${node.mazeNodeId}`}
                  cx={point.x}
                  cy={point.y}
                  r={shadowRevealNodeRadius}
                  fill="#000000"
                />
              );
            })}
          </mask>
          {shadowFocusPoint ? (
            <radialGradient
              id={shadowHaloGradientId}
              gradientUnits="userSpaceOnUse"
              cx={shadowFocusPoint.x}
              cy={shadowFocusPoint.y}
              r={shadowFocusRadius}
            >
              <stop offset="0%" stopColor="#fef3c7" stopOpacity={0.42} />
              <stop offset="45%" stopColor="#fde68a" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#fde68a" stopOpacity={0} />
            </radialGradient>
          ) : null}
        </defs>
      ) : null}
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill="#ffffff"
        stroke="#e5e7eb"
      />

      <g transform={`translate(${viewportTranslateX} ${viewportTranslateY})`}>
        <g transform={`scale(${effectiveViewportScale})`}>
          {nodes.map((node) => {
            const cell = cellBoundsByNodeId.get(node.mazeNodeId);
            if (!cell) return null;

            const isSelected = selected.has(node.mazeNodeId);
            const isStart = node.mazeNodeId === maze.startNodeId;
            const isEnd = node.mazeNodeId === maze.endNodeId;
            const fill = isStart
              ? "#fef2f2"
              : isEnd
                ? "#ecfdf5"
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
                onPointerDown={(event) =>
                  onNodePointerDown(event, node.mazeNodeId)
                }
                onPointerEnter={
                  isPointerDrawing ? () => onNodePointerEnter(node) : undefined
                }
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
              SHORTEST_PATH_COLOR,
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
              USER_PATH_COLOR,
              layout.routeStrokeWidth,
              0.92,
            );
          })}

          {edges.map((edge) => {
            const key = undirectedEdgeKey(edge.from, edge.to);
            if (!overlappingHighlightedEdges.has(key)) return null;

            return renderRouteEdge(
              edge,
              pointByNodeId,
              OVERLAPPING_PATH_COLOR,
              layout.routeStrokeWidth,
              0.96,
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

          {edgeWeightLabelMode !== "none"
            ? edges.map((edge) => {
                if (
                  edgeWeightLabelMode === "non-default" &&
                  edge.weight === 1
                ) {
                  return null;
                }

                return renderEdgeWeightLabel(edge, pointByNodeId, layout);
              })
            : null}

          {nodes.map((node) => {
            const point = pointByNodeId.get(node.mazeNodeId);
            if (!point) return null;

            const isSelected = selected.has(node.mazeNodeId);
            const isStart = node.mazeNodeId === maze.startNodeId;
            const isEnd = node.mazeNodeId === maze.endNodeId;
            const iconSize = clamp(layout.cellSize * 0.56, 18, 32);
            const iconBackgroundRadius = clamp(layout.cellSize * 0.25, 11, 20);
            const fill = isStart
              ? "#ef4444"
              : isEnd
                ? "#22c55e"
                : isSelected
                  ? "#111827"
                  : "#64748b";
            const strokeColor = isStart
              ? "#7f1d1d"
              : isEnd
                ? "#166534"
                : "#ffffff";
            const strokeWidth = isStart || isEnd ? 3 : 2;
            const selectionRingColor = isStart
              ? "#991b1b"
              : isEnd
                ? "#166534"
                : "#111827";

            return (
              <g key={node.mazeNodeId}>
                {isSelected && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={layout.selectionRingRadius}
                    fill="none"
                    stroke={selectionRingColor}
                    strokeWidth={3}
                    opacity={0.6}
                    pointerEvents="none"
                  />
                )}
                {isStart || isEnd ? (
                  <>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={iconBackgroundRadius}
                      fill={
                        isStart
                          ? START_ICON_BACKGROUND_COLOR
                          : GOAL_ICON_BACKGROUND_COLOR
                      }
                      stroke={
                        isStart
                          ? START_ICON_BORDER_COLOR
                          : GOAL_ICON_BORDER_COLOR
                      }
                      strokeWidth={2}
                      pointerEvents="none"
                    />
                    {isStart ? (
                      <SignpostBig
                        x={point.x - iconSize / 2}
                        y={point.y - iconSize / 2}
                        width={iconSize}
                        height={iconSize}
                        color={START_ICON_COLOR}
                        strokeWidth={2.6}
                        pointerEvents="none"
                        aria-hidden="true"
                      />
                    ) : (
                      <IceCreamCone
                        x={point.x - iconSize / 2}
                        y={point.y - iconSize / 2}
                        width={iconSize}
                        height={iconSize}
                        color={GOAL_ICON_COLOR}
                        strokeWidth={2.6}
                        pointerEvents="none"
                        aria-hidden="true"
                      />
                    )}
                  </>
                ) : (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={layout.markerRadius}
                    fill={fill}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    pointerEvents="none"
                  />
                )}
              </g>
            );
          })}
          {shadowOverlay ? (
            <>
              <rect
                x={mazeAreaBounds.x}
                y={mazeAreaBounds.y}
                width={mazeAreaBounds.width}
                height={mazeAreaBounds.height}
                fill="#0f172a"
                opacity={SHADOW_OVERLAY_OPACITY}
                mask={`url(#${shadowMaskId})`}
                pointerEvents="none"
              />
              {shadowFocusPoint ? (
                <circle
                  cx={shadowFocusPoint.x}
                  cy={shadowFocusPoint.y}
                  r={shadowFocusRadius}
                  fill={`url(#${shadowHaloGradientId})`}
                  pointerEvents="none"
                />
              ) : null}
            </>
          ) : null}
        </g>
      </g>
    </svg>
  );
}
