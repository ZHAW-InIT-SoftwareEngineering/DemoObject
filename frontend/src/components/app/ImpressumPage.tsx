import { RouteBackButton } from "@/components/app/RouteBackButton";

export function ImpressumPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <RouteBackButton />
        <h1 className="text-3xl font-semibold tracking-tight">Impressum</h1>
        <div className="space-y-8 rounded-xl border bg-card p-6 text-sm leading-6 text-card-foreground shadow-sm sm:p-8">
          <section className="space-y-2">
            <h2 className="text-base font-semibold">Herausgeberin</h2>
            <div>
              <p>ZHAW - InIT</p>
              <p>Obere Krichgasse 2</p>
              <p>CH-8400 Winterthur</p>
              <p>Telefon: +41 (0)58 934 69 60</p>
              <p>E-Mail: info.init@zhaw.ch</p>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">Developer</h2>
            <div>
              <p>Cyril Gabriele</p>
              <p>E-Mail: gabc@zhaw.ch</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-base font-semibold">Kontakt</h2>

            <div className="space-y-2">
              <div>
                <p>Sekretariat InIT</p>
                <p>Obere Krichgasse 2</p>
              <p>CH-8400 Winterthur</p>
              <p>Telefon: +41 (0)58 934 69 60</p>
              <p>E-Mail: info.init@zhaw.ch</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
