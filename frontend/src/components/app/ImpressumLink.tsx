import { Link, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui";

export function ImpressumLink() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isActive = pathname === "/impressum";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <Button
        asChild
        variant={isActive ? "default" : "outline"}
        size="sm"
        className="pointer-events-auto rounded-full shadow-sm"
      >
        <Link to="/impressum" aria-current={isActive ? "page" : undefined}>
          Impressum
        </Link>
      </Button>
    </div>
  );
}
