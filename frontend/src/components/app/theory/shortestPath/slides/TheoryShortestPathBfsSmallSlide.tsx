import {
  TheoryShortestPathDemoSlide,
  type TheoryShortestPathCarouselItem,
  type TheoryShortestPathDemoSlideConfig,
  type TheoryShortestPathSlideComponentProps,
} from "../TheoryShortestPathDemoSlide";
import { THEORY_SHORTEST_PATH_ALGORITHM } from "../useTheoryShortestPathDemo";

const slide = {
  id: "bfs-small",
  mazeId: 1,
  algorithm: THEORY_SHORTEST_PATH_ALGORITHM.Bfs,
  eyebrow: "Was weiss der Algorithmus gerade?",
  title: "Schritt für Schritt",
  description:
    "Dieser Algorithmus heisst Breitensuche, auf Englisch breadth-first search (BFS). \
    Er untersucht von einem Startpunkt aus zuerst die direkt benachbarten Felder, dann die nächsten, und so weiter. \
    Wenn alle Wege gleich viel kosten, findet er damit einen kürzesten Weg. \
    Wichtig ist: Der Algorithmus hat keinen Blick auf das ganze Labyrinth auf einmal. \
    Er entdeckt neue Bereiche nur nach und nach. Somit alles Schritt für Schritt.",
  shadowUnobserved: true,
  hint: "Das ganze Labyrinth ist sichtbar. Alles, was der Algorithmus bereits entdeckt hat, liegt im Licht. Der noch unbekannte Rest bleibt im Schatten.",
} satisfies TheoryShortestPathDemoSlideConfig;

function TheoryShortestPathBfsSmallSlide({
  onRestart,
}: TheoryShortestPathSlideComponentProps) {
  return <TheoryShortestPathDemoSlide slide={slide} onRestart={onRestart} />;
}

export const theoryShortestPathBfsSmallSlide = {
  id: slide.id,
  eyebrow: slide.eyebrow,
  title: slide.title,
  SlideComponent: TheoryShortestPathBfsSmallSlide,
} satisfies TheoryShortestPathCarouselItem;
