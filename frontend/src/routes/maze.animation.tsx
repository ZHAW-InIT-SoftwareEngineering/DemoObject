import { createFileRoute } from "@tanstack/react-router";
import { MazeAnimationPage } from "@/components/app/MazeAnimationPage";

export const Route = createFileRoute("/maze/animation")({
  component: MazeAnimationPage,
});
