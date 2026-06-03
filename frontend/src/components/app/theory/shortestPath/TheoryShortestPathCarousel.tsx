import { useState } from "react";
import { Button } from "@/components/ui";
import { theoryShortestPathBfsLargeSlide } from "./slides/TheoryShortestPathBfsLargeSlide";
import { theoryShortestPathBfsSmallSlide } from "./slides/TheoryShortestPathBfsSmallSlide";
import { theoryShortestPathDijkstraWeightedSlide } from "./slides/TheoryShortestPathDijkstraWeightedSlide";

const SLIDES = [
  theoryShortestPathBfsSmallSlide,
  theoryShortestPathBfsLargeSlide,
  theoryShortestPathDijkstraWeightedSlide,
];

export function TheoryShortestPathCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeSlideKey, setActiveSlideKey] = useState(0);
  const activeSlide = SLIDES[activeIndex];
  const ActiveSlideComponent = activeSlide.SlideComponent;
  const restartActiveSlide = () =>
    setActiveSlideKey((currentKey) => currentKey + 1);
  const controls = (
    <div className="flex min-h-0 flex-1 flex-col justify-center gap-2 rounded-b-md border border-t-0 border-blue-200 bg-white p-2">
      <div className="space-y-0.5">
        <p className="text-xs font-medium text-slate-900">
          Demo {activeIndex + 1} von {SLIDES.length}
        </p>
        <p className="text-xs text-slate-600">Wechsle zwischen den Demos:</p>
      </div>

      <div className="grid w-full grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          className="col-span-2 h-8 px-2 text-xs"
          onClick={restartActiveSlide}
        >
          Demo neu starten
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-8 px-2 text-xs"
          onClick={() => setActiveIndex((currentIndex) => currentIndex - 1)}
          disabled={activeIndex === 0}
        >
          Zurück
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-8 px-2 text-xs"
          onClick={() => setActiveIndex((currentIndex) => currentIndex + 1)}
          disabled={activeIndex === SLIDES.length - 1}
        >
          Weiter
        </Button>
      </div>
    </div>
  );

  return (
    <section>
      <ActiveSlideComponent
        key={`${activeSlide.id}-${activeSlideKey}`}
        controls={controls}
      />
    </section>
  );
}
