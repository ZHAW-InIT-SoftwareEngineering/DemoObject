import { TheoryShortestPathCarousel } from "./TheoryShortestPathCarousel";
import { TheoryShortestPathIntro } from "./TheoryShortestPathIntro";

export function TheoryShortestPathPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-3xl space-y-4 sm:space-y-6">
        <TheoryShortestPathIntro />
        <TheoryShortestPathCarousel />
      </div>
    </main>
  );
}
