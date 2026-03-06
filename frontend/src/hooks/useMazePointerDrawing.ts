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
  onNodePointerEnter: (node: MazesMazeIdGet200ResponseNodesInner) => void;
  onNodePointerLeave: (nodeId: number) => void;
};

const REHOVER_DESELECT_DELAY_MS = 250;
const MIN_REENTER_GAP_MS = 120;

export function useMazePointerDrawing({
  currentEndpointNodeId,
  adjacencyByNodeId,
  onSelectNode,
}: UseMazePointerDrawingOptions): UseMazePointerDrawingResult {
  const isPointerDrawingRef = useRef(false);
  const lastInteractedNodeIdRef = useRef<number | null>(null);
  const lastHoveredNodeIdRef = useRef<number | null>(null);
  const currentEndpointLeaveAtMsRef = useRef<number | null>(null);
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
    lastInteractedNodeIdRef.current = null;
    lastHoveredNodeIdRef.current = null;
    currentEndpointLeaveAtMsRef.current = null;
    setIsPointerDrawing(false);
  }, [clearPendingDeselect]);

  useEffect(() => {
    clearPendingDeselect();
    lastHoveredNodeIdRef.current = currentEndpointNodeId ?? null;
    currentEndpointLeaveAtMsRef.current = null;
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

      clearPendingDeselect();
      isPointerDrawingRef.current = true;
      lastInteractedNodeIdRef.current = nodeId;
      lastHoveredNodeIdRef.current = nodeId;
      currentEndpointLeaveAtMsRef.current = null;
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

  const onNodePointerEnter = useCallback(
    (node: MazesMazeIdGet200ResponseNodesInner) => {
      if (!isPointerDrawingRef.current) return;
      const nodeId = node.mazeNodeId;
      const isCurrentEndpointNode = node.mazeNodeId === currentEndpointNodeId;
      const isReHoverOfSameNode =
        lastInteractedNodeIdRef.current === node.mazeNodeId;
      const didReEnterFromDifferentNode =
        lastHoveredNodeIdRef.current !== node.mazeNodeId;
      const wasAwayLongEnough =
        currentEndpointLeaveAtMsRef.current !== null &&
        performance.now() - currentEndpointLeaveAtMsRef.current >= MIN_REENTER_GAP_MS;
      lastHoveredNodeIdRef.current = node.mazeNodeId;

      if (
        isCurrentEndpointNode &&
        isReHoverOfSameNode &&
        didReEnterFromDifferentNode &&
        wasAwayLongEnough
      ) {
        scheduleEndpointDeselect(node);
        return;
      }

      clearPendingDeselect();
      if (isCurrentEndpointNode && !isReHoverOfSameNode) return;
      if (!isCurrentEndpointNode && isReHoverOfSameNode) return;
      if (currentEndpointNodeId === undefined) return;
      const canConnect =
        adjacencyByNodeId.get(currentEndpointNodeId)?.has(nodeId) ?? false;
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

  const onNodePointerLeave = useCallback(
    (nodeId: number) => {
      if (nodeId === currentEndpointNodeId) {
        currentEndpointLeaveAtMsRef.current = performance.now();
      }
      if (lastHoveredNodeIdRef.current === nodeId) {
        lastHoveredNodeIdRef.current = null;
      }
      if (pendingDeselectNodeIdRef.current !== nodeId) return;
      clearPendingDeselect();
    },
    [clearPendingDeselect, currentEndpointNodeId],
  );

  return {
    isPointerDrawing,
    stopPointerDrawing,
    onNodePointerDown,
    onNodePointerEnter,
    onNodePointerLeave,
  };
}
