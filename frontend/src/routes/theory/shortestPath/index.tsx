import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TheoryShortestPathPage } from "@/components/app/theory/shortestPath/TheoryShortestPathPage";
import { useDemoSession, useMazeTheoryProgress } from "@/hooks";

export const Route = createFileRoute("/theory/shortestPath/")({
  component: TheoryShortestPathRoutePage,
});

function TheoryShortestPathRoutePage() {
  const { maze, session } = useDemoSession();
  const { markVisited } = useMazeTheoryProgress({
    mazeId: maze?.mazeId,
    sessionId: session?.sessionId,
  });

  useEffect(() => {
    markVisited("shortestPath");
  }, [markVisited]);

  return <TheoryShortestPathPage />;
}
