import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";

export function TheoryShortestPathIntro() {
  return (
    <Card className="py-4">
      <CardHeader className="px-4 sm:px-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Theorie
          </p>
          <CardTitle className="text-3xl tracking-tight text-slate-900">
            Kürzester Pfad
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-4 text-base leading-7 text-slate-700 sm:px-6">
        <p>
          Ein <span className="font-semibold">kürzester Pfad</span> ist nicht
          irgendein Weg zum Ziel, sondern der beste Weg nach einer klaren Regel.
        </p>

        <p>
          Damit wir nicht jedes Labyrinth von Hand lösen müssen, nutzen wir einen{" "}
          <span className="font-semibold">Algorithmus</span>: eine Methode, die
          immer wieder bei ähnlichen Aufgaben hilft.
        </p>

        <p>
          Unten siehst du zuerst zwei <span className="font-semibold">BFS</span>{" "} und danach {" "}
          <span className="font-semibold">Dijkstra</span>. So erkennst du, welcher
          Algorithmus in welcher Situation die Glace retten kann.
        </p>

        <p>
          Hast du eine Frage? Tippe unten rechts auf das{" "}
          <span className="font-semibold">Fragezeichen-Icon</span>.
        </p>
      </CardContent>
    </Card>
  );
}
