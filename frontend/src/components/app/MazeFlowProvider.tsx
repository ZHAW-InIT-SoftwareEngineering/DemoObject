import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { NodePath } from "@/lib/path/transforms";

type MazeAnimationState = {
  status: "idle" | "playing";
  nodePath: NodePath;
  userNodePath: NodePath;
  shortestNodePath: NodePath;
};

type StartAnimationOptions = {
  nodePath: NodePath;
  userNodePath: NodePath;
  shortestNodePath: NodePath;
};

type MazeFlowContextValue = {
  animationState: MazeAnimationState;
  startAnimation: (options: StartAnimationOptions) => boolean;
  completeAnimation: () => void;
  closePlayback: () => void;
};

function createIdleAnimationState(): MazeAnimationState {
  return {
    status: "idle",
    nodePath: [],
    userNodePath: [],
    shortestNodePath: [],
  };
}

const MazeFlowContext = createContext<MazeFlowContextValue | null>(null);

export function MazeFlowProvider({ children }: { children: ReactNode }) {
  const [animationState, setAnimationState] = useState<MazeAnimationState>(
    createIdleAnimationState,
  );
  const animationStateRef = useRef(animationState);

  animationStateRef.current = animationState;

  const startAnimation = useCallback(
    ({
      nodePath,
      userNodePath,
      shortestNodePath,
    }: StartAnimationOptions) => {
      if (nodePath.length < 2) return false;
      if (animationStateRef.current.status !== "idle") return false;

      const nextAnimationState: MazeAnimationState = {
        status: "playing",
        nodePath: [...nodePath],
        userNodePath: [...userNodePath],
        shortestNodePath: [...shortestNodePath],
      };

      animationStateRef.current = nextAnimationState;
      setAnimationState(nextAnimationState);
      return true;
    },
    [],
  );

  const completeAnimation = useCallback(() => {
    setAnimationState((currentState) => {
      if (currentState.status !== "playing") {
        return currentState;
      }

      const nextAnimationState = createIdleAnimationState();
      animationStateRef.current = nextAnimationState;
      return nextAnimationState;
    });
  }, []);

  const closePlayback = useCallback(() => {
    setAnimationState((currentState) => {
      if (currentState.status === "idle") {
        return currentState;
      }

      const nextAnimationState = createIdleAnimationState();
      animationStateRef.current = nextAnimationState;
      return nextAnimationState;
    });
  }, []);

  const value = useMemo<MazeFlowContextValue>(
    () => ({
      animationState,
      startAnimation,
      completeAnimation,
      closePlayback,
    }),
    [animationState, closePlayback, completeAnimation, startAnimation],
  );

  return (
    <MazeFlowContext.Provider value={value}>
      {children}
    </MazeFlowContext.Provider>
  );
}

export function useMazeFlow() {
  const context = useContext(MazeFlowContext);

  if (!context) {
    throw new Error("useMazeFlow must be used within a MazeFlowProvider.");
  }

  return context;
}
