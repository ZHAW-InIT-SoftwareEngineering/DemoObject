import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui";

type RouteBackButtonProps = {
  fallbackTo?: string;
  className?: string;
};

export function RouteBackButton({
  fallbackTo = "/",
  className,
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
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={handleClick}
    >
      <ArrowLeft />
      Zurück
    </Button>
  );
}
