import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/app/index/HomePage";

export const Route = createFileRoute("/")({
  component: HomePage,
});
