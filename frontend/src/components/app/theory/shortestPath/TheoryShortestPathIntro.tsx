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
          einfach irgendein Weg zum Ziel, sondern der beste Weg nach einer klaren
          Regel.
        </p>

        <p>
          In der Informatik ist das besonders spannend, weil wir den Weg nicht
          für jedes neue Labyrinth von Hand suchen wollen. Stattdessen entwickeln
          wir einen <span className="font-semibold">Algorithmus</span>, also eine
          allgemeine Methode, die immer wieder auf neue Probleme angewendet werden
          kann.
        </p>

        <p>
          Genau das macht Software nachhaltiger: Eine gute Lösung funktioniert
          nicht nur einmal, sondern auch bei vielen ähnlichen Aufgaben. Ein Algorithmus namens {" "}
          <span className="font-semibold">BFS</span> findet den kürzesten Weg,
          wenn alle Schritte gleich viel kosten.{" "}
          <span className="font-semibold">Dijkstra</span> wird gebraucht, wenn
          verschiedene Wege unterschiedlich teuer sind.
        </p>

        <p>
          Beide Algorithmen können somit für verschiedene Anwedungsfälle das Eis vor dem schmelzen retten!
        </p>

        <p>
          Unten siehst du zuerst BFS und danach Dijkstra. So kannst du direkt
          erleben, wie aus derselben Grundidee verschiedene Algorithmen für
          verschiedene Situationen entstehen.
        </p>
      </CardContent>
    </Card>
  );
}