
export function TheoryDslIntro() {
  return (
    <section className="space-y-4 rounded-xl border bg-card p-6 shadow-sm sm:p-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Theorie
          </p>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          DSL
        </h1>
      </div>
      <div className="space-y-3 text-base leading-7 text-slate-700">
    <p>
      <span className="font-semibold">DSL</span> bedeutet{" "}
      <span className="font-semibold">domänenspezifische Sprache</span>.
      Das ist eine Sprache, die nur für eine bestimmte Aufgabe gemacht ist.
    </p>

    <p>
      In diesem Fall ist die Aufgabe: den Weg durch ein Labyrinth angeben.
      Dafür gibt es nur wenige Befehle:{" "}
      <span className="font-semibold">Hoch</span>,{" "}
      <span className="font-semibold">Rechts</span>,{" "}
      <span className="font-semibold">Runter</span> und{" "}
      <span className="font-semibold">Links</span>.
    </p>

    <p>
      Unten kannst du es direkt ausprobieren und selbst einen Weg
      „programmieren“. Stelle dir dabei vor, dass du so ein Computer-Programm programmierst. 
    </p>

    <p>
      Hast du eine Frage? Tippe unten rechts auf das{" "}
      <span className="font-semibold">Fragezeichen-Icon</span>.
    </p>

    </div>
  </section>
  );
}
