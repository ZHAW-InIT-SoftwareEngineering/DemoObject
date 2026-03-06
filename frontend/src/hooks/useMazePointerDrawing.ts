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

export function useMazePointerDrawing({
  currentEndpointNodeId,
  adjacencyByNodeId,
  onSelectNode,
}: UseMazePointerDrawingOptions): UseMazePointerDrawingResult {
  const isPointerDrawingRef = useRef(false);
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

      clearPendingDeselect();
      isPointerDrawingRef.current = true;
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

  const onNodePointerEnter = useCallback(
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
    onNodePointerEnter,
    onNodePointerLeave,
  };
}
