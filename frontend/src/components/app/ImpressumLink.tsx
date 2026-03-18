import { Link, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui";

export function ImpressumLink() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isActive = pathname === "/impressum";

  return (
    <div className="flex justify-center">
      <Button
        asChild
        variant={isActive ? "default" : "outline"}
        size="sm"
        className="rounded-full shadow-sm"
      >
        <Link to="/impressum" aria-current={isActive ? "page" : undefined}>
          Impressum
        </Link>
      </Button>
    </div>
  );
}
