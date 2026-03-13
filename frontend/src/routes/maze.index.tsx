import { createFileRoute } from "@tanstack/react-router";
import { MazeEditorPage } from "@/components/app/MazeEditorPage";

export const Route = createFileRoute("/maze/")({
  component: MazeEditorPage,
});
