import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui";

type RouteBackButtonProps = {
  fallbackTo?: string;
};

export function RouteBackButton({
  fallbackTo = "/",
}: RouteBackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
      return;
    }

    void navigate({ to: fallbackTo as never });
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      <ArrowLeft />
      Zurück
    </Button>
  );
}
