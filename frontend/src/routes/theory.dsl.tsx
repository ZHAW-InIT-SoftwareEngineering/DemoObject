import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TheoryDslPage } from "@/components/app/theory/dsl/TheoryDslPage";
import { useDemoSession, useMazeTheoryProgress } from "@/hooks";

export const Route = createFileRoute("/theory/dsl")({
  component: TheoryDslRoutePage,
});

function TheoryDslRoutePage() {
  const { maze, session } = useDemoSession();
  const { markVisited } = useMazeTheoryProgress({
    mazeId: maze?.mazeId,
    sessionId: session?.sessionId,
  });

  useEffect(() => {
    markVisited("dsl");
  }, [markVisited]);

  return <TheoryDslPage />;
}
