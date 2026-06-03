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
    "Die Breitensuche, auf Englisch breadth-first search (BFS), schaut vom Start aus zuerst auf die direkten Nachbarn, dann auf die nächsten Felder. \
    Wenn alle Schritte gleich viel kosten, findet sie so einen kürzesten Weg. \
    Dabei kennt BFS nicht sofort das ganze Labyrinth, sondern entdeckt es Schritt für Schritt.",
  shadowUnobserved: true,
  hint: "Das ganze Labyrinth ist sichtbar. Alles, was der Algorithmus bereits entdeckt hat, liegt im Licht. Der noch unbekannte Rest bleibt im Schatten.",
} satisfies TheoryShortestPathDemoSlideConfig;

function TheoryShortestPathBfsSmallSlide({
  controls,
}: TheoryShortestPathSlideComponentProps) {
  return <TheoryShortestPathDemoSlide controls={controls} slide={slide} />;
}

export const theoryShortestPathBfsSmallSlide = {
  id: slide.id,
  eyebrow: slide.eyebrow,
  title: slide.title,
  SlideComponent: TheoryShortestPathBfsSmallSlide,
} satisfies TheoryShortestPathCarouselItem;
