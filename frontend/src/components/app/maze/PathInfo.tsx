import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui";

type PathInfoProps = {
  className?: string;
  userPathLength: number;
  shortestPathLength: number | null | undefined;
  variant?: "plain" | "surface";
};

export function PathInfo({
  className,
  userPathLength,
  shortestPathLength,
  variant = "surface",
}: PathInfoProps) {
  const content = (
    <div
      className={cn(
        "grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-2 text-sm",
        variant === "surface" ? "text-gray-700" : null,
      )}
    >
      <span className="font-medium underline decoration-2 underline-offset-4 decoration-[#2563eb]">
        Länge deines Pfads
      </span>
      <span className="text-right tabular-nums">{userPathLength}</span>

      <span className="font-medium underline decoration-2 underline-offset-4 decoration-[#f59e0b]">
        Länge des kürzesten Pfads
      </span>
      <span className="text-right tabular-nums">
        {shortestPathLength ?? "-"}
      </span>

      <span className="font-medium underline decoration-2 underline-offset-4 decoration-[#be123c]">
        Überlappende Strecken
      </span>
    </div>
  );

  if (variant === "plain") {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card className={cn("py-4", className)}>
      <CardContent className="px-4">
        {content}
      </CardContent>
    </Card>
  );
}
