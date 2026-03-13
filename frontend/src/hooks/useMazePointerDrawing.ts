import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import type { MazesMazeIdGet200ResponseNodesInner } from "@/api";

type UseMazePointerDrawingOptions = {
  currentEndpointNodeId: number | undefined;
  adjacencyByNodeId: Map<number, Set<number>>;
  nodeById: Map<number, MazesMazeIdGet200ResponseNodesInner>;
  pointByNodeId: Map<number, { x: number; y: number }>;
  onSelectNode?: (
    node: MazesMazeIdGet200ResponseNodesInner,
  ) => boolean | void;
};

type UseMazePointerDrawingResult = {
  isPointerDrawing: boolean;
  stopPointerDrawing: () => void;
  onNodePointerDown: (
    event: PointerEvent<SVGCircleElement>,
    nodeId: number,
  ) => void;
  onMazePointerMove: (event: PointerEvent<SVGSVGElement>) => void;
  onNodePointerEnter: (node: MazesMazeIdGet200ResponseNodesInner) => void;
  onNodePointerLeave: (nodeId: number) => void;
};

const REHOVER_DESELECT_DELAY_MS = 250;
const POINTER_HIT_RADIUS = 16;

export function useMazePointerDrawing({
  currentEndpointNodeId,
  adjacencyByNodeId,
  nodeById,
  pointByNodeId,
  onSelectNode,
}: UseMazePointerDrawingOptions): UseMazePointerDrawingResult {
  const isPointerDrawingRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const lastInteractedNodeIdRef = useRef<number | null>(null);
  const lastHoveredNodeIdRef = useRef<number | null>(null);
  const pendingDeselectNodeIdRef = useRef<number | null>(null);
  const pendingDeselectTimerRef = useRef<number | null>(null);
  const [isPointerDrawing, setIsPointerDrawing] = useState(false);

  const clearPendingDeselect = useCallback(() => {
    if (pendingDeselectTimerRef.current !== null) {
      window.clearTimeout(pendingDeselectTimerRef.current);
      pendingDeselectTimerRef.current = null;
    }
    pendingDeselectNodeIdRef.current = null;
  }, []);


  const stopPointerDrawing = useCallback(() => {
    if (!isPointerDrawingRef.current) return;
    clearPendingDeselect();
    isPointerDrawingRef.current = false;
    activePointerIdRef.current = null;
    lastInteractedNodeIdRef.current = null;
    lastHoveredNodeIdRef.current = null;
    setIsPointerDrawing(false);
  }, [clearPendingDeselect]);

  useEffect(() => {
    clearPendingDeselect();
    lastHoveredNodeIdRef.current = currentEndpointNodeId ?? null;
  }, [clearPendingDeselect, currentEndpointNodeId]);

  useEffect(() => {
    window.addEventListener("pointerup", stopPointerDrawing);
    window.addEventListener("pointercancel", stopPointerDrawing);
    return () => {
      window.removeEventListener("pointerup", stopPointerDrawing);
      window.removeEventListener("pointercancel", stopPointerDrawing);
      clearPendingDeselect();
    };
  }, [clearPendingDeselect, stopPointerDrawing]);

  const trySelectNode = useCallback(
    (node: MazesMazeIdGet200ResponseNodesInner) => {
      if (!onSelectNode) return;
      const didSelect = onSelectNode(node);
      if (didSelect === false) return;
      lastInteractedNodeIdRef.current = node.mazeNodeId;
    },
    [onSelectNode],
  );

  const onNodePointerDown = useCallback(
    (event: PointerEvent<SVGCircleElement>, nodeId: number) => {
      if (!onSelectNode) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if (nodeId !== currentEndpointNodeId) return;

      event.preventDefault();
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Some mobile browsers can throw if capture is unavailable.
      }

      clearPendingDeselect();
      isPointerDrawingRef.current = true;
      activePointerIdRef.current = event.pointerId;
      lastInteractedNodeIdRef.current = nodeId;
      lastHoveredNodeIdRef.current = nodeId;
      setIsPointerDrawing(true);
    },
    [clearPendingDeselect, currentEndpointNodeId, onSelectNode],
  );

  const scheduleEndpointDeselect = useCallback(
    (node: MazesMazeIdGet200ResponseNodesInner) => {
      clearPendingDeselect();
      pendingDeselectNodeIdRef.current = node.mazeNodeId;
      pendingDeselectTimerRef.current = window.setTimeout(() => {
        if (!isPointerDrawingRef.current) return;
        if (pendingDeselectNodeIdRef.current !== node.mazeNodeId) return;
        trySelectNode(node);
        clearPendingDeselect();
      }, REHOVER_DESELECT_DELAY_MS);
    },
    [clearPendingDeselect, trySelectNode],
  );

  const handleHoveredNode = useCallback(
    (node: MazesMazeIdGet200ResponseNodesInner) => {
      if (!isPointerDrawingRef.current) return;
      const nodeId = node.mazeNodeId;
      const endpointNodeId =
        lastInteractedNodeIdRef.current ?? currentEndpointNodeId;
      if (endpointNodeId === null || endpointNodeId === undefined) return;
      const isEndpointNode = nodeId === endpointNodeId;
      const didReEnterNode = lastHoveredNodeIdRef.current !== nodeId;
      lastHoveredNodeIdRef.current = nodeId;

      if (isEndpointNode && didReEnterNode) {
        scheduleEndpointDeselect(node);
        return;
      }

      clearPendingDeselect();
      if (isEndpointNode) return;
      const canConnect = adjacencyByNodeId.get(endpointNodeId)?.has(nodeId) ?? false;
      if (!canConnect) return;
      trySelectNode(node);
    },
    [
      adjacencyByNodeId,
      clearPendingDeselect,
      currentEndpointNodeId,
      scheduleEndpointDeselect,
      trySelectNode,
    ],
  );

  const onNodePointerEnter = useCallback(
    (node: MazesMazeIdGet200ResponseNodesInner) => {
      handleHoveredNode(node);
    },
    [handleHoveredNode],
  );

  const findNodeAtPointer = useCallback(
    (x: number, y: number) => {
      let closestNodeId: number | null = null;
      let closestDistanceSq = POINTER_HIT_RADIUS * POINTER_HIT_RADIUS;

      for (const [nodeId, point] of pointByNodeId) {
        const dx = point.x - x;
        const dy = point.y - y;
        const distanceSq = dx * dx + dy * dy;
        if (distanceSq > closestDistanceSq) continue;
        closestDistanceSq = distanceSq;
        closestNodeId = nodeId;
      }

      return closestNodeId;
    },
    [pointByNodeId],
  );

  const onMazePointerMove = useCallback(
    (event: PointerEvent<SVGSVGElement>) => {
      if (!isPointerDrawingRef.current) return;
      if (
        activePointerIdRef.current !== null &&
        event.pointerId !== activePointerIdRef.current
      ) {
        return;
      }

      event.preventDefault();

      const svg = event.currentTarget;
      const rect = svg.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const viewBox = svg.viewBox.baseVal;
      const x = ((event.clientX - rect.left) / rect.width) * viewBox.width + viewBox.x;
      const y = ((event.clientY - rect.top) / rect.height) * viewBox.height + viewBox.y;
      const hoveredNodeId = findNodeAtPointer(x, y);

      if (hoveredNodeId === null) {
        if (lastHoveredNodeIdRef.current !== null) {
          lastHoveredNodeIdRef.current = null;
        }
        clearPendingDeselect();
        return;
      }

      const hoveredNode = nodeById.get(hoveredNodeId);
      if (!hoveredNode) return;
      handleHoveredNode(hoveredNode);
    },
    [clearPendingDeselect, findNodeAtPointer, handleHoveredNode, nodeById],
  );

  const onNodePointerLeave = useCallback(
    (nodeId: number) => {
      if (lastHoveredNodeIdRef.current === nodeId) {
        lastHoveredNodeIdRef.current = null;
      }
      if (pendingDeselectNodeIdRef.current !== nodeId) return;
      clearPendingDeselect();
    },
    [clearPendingDeselect],
  );

  return {
    isPointerDrawing,
    stopPointerDrawing,
    onNodePointerDown,
    onMazePointerMove,
    onNodePointerEnter,
    onNodePointerLeave,
  };
}
