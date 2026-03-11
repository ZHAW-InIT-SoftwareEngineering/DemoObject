import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui";

export function RouteBackButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
      return;
    }

    void navigate({ to: "/" });
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      <ArrowLeft />
      Back
    </Button>
  );
}
