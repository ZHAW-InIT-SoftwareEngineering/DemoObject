import { RouteBackButton } from "@/components/ui/RouteBackButton";

export function TheoryShortestPathPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <RouteBackButton fallbackTo="/maze" />
        <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm sm:p-8">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Theorie
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Kuerzester Pfad
            </h1>
          </div>
          <p className="text-base leading-7 text-slate-700">
            Der kuerzeste Pfad ist die Route vom Start zum Ziel mit den
            wenigsten Schritten. Genau darum geht es in dieser Aufgabe: nicht
            irgendeinen Weg zu finden, sondern die effizienteste Verbindung
            durch das Labyrinth.
          </p>
        </section>
      </div>
    </main>
  );
}
