import {
  TheoryShortestPathDemoSlide,
  type TheoryShortestPathCarouselItem,
  type TheoryShortestPathDemoSlideConfig,
  type TheoryShortestPathSlideComponentProps,
} from "../TheoryShortestPathDemoSlide";
import { THEORY_SHORTEST_PATH_ALGORITHM } from "../useTheoryShortestPathDemo";

const slide = {
  id: "bfs-large",
  mazeId: 2,
  algorithm: THEORY_SHORTEST_PATH_ALGORITHM.Bfs,
  eyebrow: "BFS in Action",
  title: "Zu Gross?",
  description:
    "In einem grossen Labyrinth verliert man leicht den Überblick. \
    Die Breitensuche (BFS) sucht den Weg deshalb nicht zufällig, sondern nach einer festen Regel: \
    Sie untersucht Schritt für Schritt benachbarte Felder, bis das Ziel erreicht ist. \
    So wird auch ein grosses und unübersichtliches Problem mit einer klaren Methode lösbar.",
  hint: "Was für Menschen schnell unübersichtlich wird, bearbeitet der Algorithmus ruhig und systematisch Schritt für Schritt.",
} satisfies TheoryShortestPathDemoSlideConfig;

function TheoryShortestPathBfsLargeSlide({
  onRestart,
}: TheoryShortestPathSlideComponentProps) {
  return <TheoryShortestPathDemoSlide slide={slide} onRestart={onRestart} />;
}

export const theoryShortestPathBfsLargeSlide = {
  id: slide.id,
  eyebrow: slide.eyebrow,
  title: slide.title,
  SlideComponent: TheoryShortestPathBfsLargeSlide,
} satisfies TheoryShortestPathCarouselItem;