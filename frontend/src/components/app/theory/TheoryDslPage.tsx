import { RouteBackButton } from "@/components/ui/RouteBackButton";

export function TheoryDslPage() {
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
              DSL
            </h1>
          </div>
          <p className="text-base leading-7 text-slate-700">
            DSL steht fuer Domain Specific Language. In diesem Labyrinth bedeutet
            das: Ein Weg wird als klare, eindeutige Folge von Schritten
            beschrieben, damit ein System genau nachvollziehen kann, welche
            Route gewaehlt wurde.
          </p>
        </section>
      </div>
    </main>
  );
}
