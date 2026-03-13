import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/app/HomePage";

export const Route = createFileRoute("/")({
  component: HomePage,
});
