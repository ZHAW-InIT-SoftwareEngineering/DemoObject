import {
  TheoryShortestPathDemoSlide,
  type TheoryShortestPathCarouselItem,
  type TheoryShortestPathDemoSlideConfig,
  type TheoryShortestPathSlideComponentProps,
} from "../TheoryShortestPathDemoSlide";
import { THEORY_SHORTEST_PATH_ALGORITHM } from "../useTheoryShortestPathDemo";

const slide = {
  id: "dijkstra-weighted",
  mazeId: 3,
  algorithm: THEORY_SHORTEST_PATH_ALGORITHM.Dijkstra,
  eyebrow: "Dijkstra",
  title: "Verschiedene Pfad-Kosten?",
  description:
    "Die direktere Route ist kürzer, aber teurer als oben durch (siehe Kosten = 9 beim Durchgang). \
    Dijkstra wählt deshalb den längeren Umweg mit kleineren Kosten. Stelle dir vor das wäre zum Beispiel benötigtest Benzin, \
    weil die kürzere Strecke extrem Steil ist.",
  showAllWeights: true,
  hint: "Die Zahlen an den Kanten sind die Reisekosten. Dijkstra minimiert die Summe dieser Zahlen.",
} satisfies TheoryShortestPathDemoSlideConfig;

function TheoryShortestPathDijkstraWeightedSlide({
  onRestart,
}: TheoryShortestPathSlideComponentProps) {
  return <TheoryShortestPathDemoSlide slide={slide} onRestart={onRestart} />;
}

export const theoryShortestPathDijkstraWeightedSlide = {
  id: slide.id,
  eyebrow: slide.eyebrow,
  title: slide.title,
  SlideComponent: TheoryShortestPathDijkstraWeightedSlide,
} satisfies TheoryShortestPathCarouselItem;
