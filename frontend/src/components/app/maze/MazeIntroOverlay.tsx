import { Link } from "@tanstack/react-router";
import { IceCreamCone, Timer } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type MazeIntroOverlayProps = {
  open: boolean;
  visitedDsl: boolean;
  visitedShortestPath: boolean;
  canStart: boolean;
  onStart: () => void;
};

export function MazeIntroOverlay({
  open,
  visitedDsl,
  visitedShortestPath,
  canStart,
  onStart,
}: MazeIntroOverlayProps) {
  const getTheoryStatusClasses = (visited: boolean) =>
    visited
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <Dialog open={open} onOpenChange={() => undefined}>
      <DialogContent
        className="max-h-[calc(100dvh-1rem)] overflow-y-auto rounded-xl border-slate-200 bg-white p-4 sm:max-w-md sm:rounded-2xl sm:p-8"
        showCloseButton={false}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <div className="relative space-y-4 sm:space-y-6">
          <div className="flex items-center justify-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-full border border-orange-200 bg-orange-100 text-orange-700 shadow-sm sm:size-14">
              <IceCreamCone className="size-8 sm:size-9" />
            </div>
            <div className="flex size-12 items-center justify-center rounded-full bg-slate-900 text-white shadow-sm sm:size-14">
              <Timer className="size-6 sm:size-7" />
            </div>
          </div>

          <DialogHeader className="space-y-3 text-center sm:text-center">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">
              Deine Mission
            </div>
            <DialogTitle className="text-xl font-semibold text-slate-900 sm:text-2xl">
              Das Eis schmilzt
            </DialogTitle>
            <DialogDescription className="space-y-3 text-center text-sm leading-5 text-slate-700 sm:text-center sm:text-base sm:leading-6">
              <p>
                Am Ende des Labyrinths wartet ein Eis auf dich, aber nicht mehr
                lange.
              </p>
              <p>
                Sobald du auf <span className="font-semibold">Los geht&apos;s</span>{" "}
                klickst, startet die Zeit.
              </p>
              <p>
                Finde den kürzesten Weg zum Eis und gib genau diesen Pfad ein.
              </p>
              <p>
                Zuerst jedoch ein wenig benötigte Theorie.
              </p>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 sm:p-4">
            <p className="text-center text-sm font-medium text-slate-800">
              Lies zuerst beide Theorie-Seiten.
            </p>

            <div className="flex items-center gap-2 sm:gap-3">
              <Badge
                variant="outline"
                className={`min-w-20 h-8 px-3 ${getTheoryStatusClasses(visitedDsl)}`}
              >
                {visitedDsl ? "Gelesen" : "Offen"}
              </Badge>
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="min-w-0 flex-1 bg-slate-900 text-white hover:bg-slate-800"
              >
                <Link to="/theory/dsl">Theorie: DSL</Link>
              </Button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Badge
                variant="outline"
                className={`min-w-20 h-8 px-3 ${getTheoryStatusClasses(visitedShortestPath)}`}
              >
                {visitedShortestPath ? "Gelesen" : "Offen"}
              </Badge>
              <Button
                asChild
                variant="secondary"
                size="sm"
                className="min-w-0 flex-1 bg-slate-900 text-white hover:bg-slate-800"
              >
                <Link to="/theory/shortestPath">
                  Theorie: kürzester Pfad
                </Link>
              </Button>
            </div>
          </div>

          <Button
            type="button"
            className="w-full"
            onClick={onStart}
            disabled={!canStart}
          >
            Los geht&apos;s
          </Button>

          {!canStart ? (
            <p className="text-center text-sm text-slate-600">
              Los geht&apos;s wird freigeschaltet, sobald du beide Theorie-Seiten
              bearbeitet hast.
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
