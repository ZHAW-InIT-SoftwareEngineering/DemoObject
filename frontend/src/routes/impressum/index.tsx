import { createFileRoute } from "@tanstack/react-router";
import { ImpressumPage } from "@/components/app/impressum/ImpressumPage";

export const Route = createFileRoute("/impressum/")({
  component: ImpressumPage,
});
