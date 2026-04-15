
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
          DSL steht für <span className="font-semibold">Domain Specific Language</span>. Statt einen Pfad im
          Labyrinth zu zeichnen, beschreibst du ihn als Folge klarer
          Richtungsbloecke wie <span className="font-semibold">Hoch</span>,{" "}
          <span className="font-semibold">Rechts</span>,{" "}
          <span className="font-semibold">Runter</span> und{" "}
          <span className="font-semibold">Links</span>.
        </p>
        <p>
          Anstatt Programmiersprachen zu lernen, kann man mit DSLs programmieren. Dies hat jedoch auch Nachteile.
          Zum Beispiel ist man durch die DSL darin eingeschränkt, was man alles programmieren kann. 
          Dies ist normalerweise bei einer sogenannten High-Level-Sprache nicht der Fall.
        </p>
        <p>
          Unten siehst du ein separates Theorie-Labyrinth. Den Pfad gibst du ausschliesslich über das
          Steuerkreuz mit den DSL-Blöcken ein. Stelle dir vor du schreibst ein Programm anstatt einen Pfad. 
        </p>
      </div>
    </section>
  );
}
