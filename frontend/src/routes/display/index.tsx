import { createFileRoute } from "@tanstack/react-router";
import { DisplayPage } from "@/components/app/display/DisplayPage";

type DisplaySearch = {
  mazeId?: number;
};

export const Route = createFileRoute("/display/")({
  validateSearch: (search: Record<string, unknown>): DisplaySearch => ({
    mazeId: Number.isInteger(Number(search.mazeId))
      ? Math.max(0, Number(search.mazeId))
      : 0,
  }),
  component: DisplayRoute,
});

function DisplayRoute() {
  const { mazeId = 0 } = Route.useSearch();

  return <DisplayPage mazeId={mazeId} />;
}
