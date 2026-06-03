import type { ComponentType, ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Maze } from "@/components/app/maze";
import { MazeLegendSection } from "@/components/app/maze/MazeLegendSection";
import {
  THEORY_SHORTEST_PATH_ALGORITHM,
  useTheoryShortestPathDemo,
} from "./useTheoryShortestPathDemo";

type TheoryShortestPathAlgorithm =
  typeof THEORY_SHORTEST_PATH_ALGORITHM[keyof typeof THEORY_SHORTEST_PATH_ALGORITHM];

export type TheoryShortestPathDemoSlideConfig = {
  id: string;
  mazeId: number;
  algorithm: TheoryShortestPathAlgorithm;
  eyebrow: string;
  title: string;
  description: string;
  viewportScale?: number;
  shadowUnobserved?: boolean;
  showAllWeights?: boolean;
  hint: string;
};

export type TheoryShortestPathCarouselItem = {
  id: string;
  eyebrow: string;
  title: string;
  SlideComponent: ComponentType<TheoryShortestPathSlideComponentProps>;
};

export type TheoryShortestPathSlideComponentProps = {
  controls: ReactNode;
};

export function TheoryShortestPathDemoSlide({
  controls,
  slide,
}: TheoryShortestPathSlideComponentProps & {
  slide: TheoryShortestPathDemoSlideConfig;
}) {
  const demo = useTheoryShortestPathDemo({
    mazeId: slide.mazeId,
    algorithm: slide.algorithm,
    isActive: true,
    explorationStepMs:
      slide.algorithm === THEORY_SHORTEST_PATH_ALGORITHM.Dijkstra ? 120 : 60,
    shortestPathStepMs:
      slide.algorithm === THEORY_SHORTEST_PATH_ALGORITHM.Dijkstra ? 170 : 120,
  });

  return (
    <Card className="py-4">
      <CardHeader className="px-4 sm:px-6">
        <div className="space-y-2">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            {slide.eyebrow}
          </div>
          <CardTitle className="text-2xl text-slate-900">
            {slide.title}
          </CardTitle>
          <CardDescription className="max-w-3xl text-base leading-7 text-slate-700">
            {slide.description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="px-4 sm:px-6">
        <div className="grid items-stretch gap-3 md:grid-cols-2">
          <div className="aspect-square h-full w-full touch-none overscroll-contain">
            {demo.maze ? (
              <Maze
                maze={demo.maze}
                className="h-full w-full rounded border bg-white"
                secondaryHighlightedNodePath={demo.displayedShortestPathNodePath}
                explorationDiscoveredEdgeKeys={
                  demo.explorationDiscoveredEdgeKeys
                }
                explorationSeenEdgeKeys={demo.explorationSeenEdgeKeys}
                currentExplorationEdgeKey={demo.currentExplorationEdgeKey}
                currentExplorationEdgeDiscovered={
                  demo.currentExplorationEdgeDiscovered
                }
                shadowOverlay={
                  slide.shadowUnobserved
                    ? {
                        observedNodeIds: demo.observedNodeIds,
                        observedEdgeKeys: demo.observedEdgeKeys,
                        focusNodeId: demo.isAnimating ? demo.focusNodeId : null,
                      }
                    : null
                }
                viewportCenterNodeId={
                  slide.viewportScale ? demo.focusNodeId : null
                }
                viewportScale={slide.viewportScale ?? 1}
                edgeWeightLabelMode={slide.showAllWeights ? "all" : "none"}
              />
            ) : (
              <div className="flex h-full items-center justify-center rounded border bg-white text-sm text-slate-600">
                {demo.loading ? "Labyrinth wird geladen..." : demo.error}
              </div>
            )}
          </div>

          <div className="flex h-full w-full flex-col md:aspect-square">
            <MazeLegendSection
              className="space-y-2 rounded-b-none px-2 py-1.5 text-xs"
              title="Legende:"
              explorationLegend={{
                additionalItems: [
                  {
                    color: "#f59e0b",
                    label: "Finaler bester Pfad",
                  },
                ],
              }}
            />
            {controls}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
