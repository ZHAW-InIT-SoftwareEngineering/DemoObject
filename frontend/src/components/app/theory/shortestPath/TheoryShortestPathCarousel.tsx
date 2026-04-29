import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
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

  return (
    <section className="space-y-4">
      <Card className="py-4">
        <CardHeader className="px-4 sm:px-6">
          <div className="space-y-2">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Demonstrationen
            </div>
            <CardTitle className="text-2xl text-slate-900">
              Demo {activeIndex + 1} von {SLIDES.length}
            </CardTitle>
            <CardDescription className="text-base leading-7 text-slate-700">
              {activeSlide.eyebrow} - {activeSlide.title}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-600">Wechsle zwischen den Demos.</p>

          <div className="grid w-full grid-cols-2 gap-2 md:flex md:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveIndex((currentIndex) => currentIndex - 1)}
              disabled={activeIndex === 0}
            >
              Zurück
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveIndex((currentIndex) => currentIndex + 1)}
              disabled={activeIndex === SLIDES.length - 1}
            >
              Weiter
            </Button>
          </div>
        </CardContent>
      </Card>

      <ActiveSlideComponent
        key={`${activeSlide.id}-${activeSlideKey}`}
        onRestart={restartActiveSlide}
      />
    </section>
  );
}
