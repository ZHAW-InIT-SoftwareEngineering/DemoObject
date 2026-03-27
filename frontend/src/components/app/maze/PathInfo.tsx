import { Card, CardContent } from "@/components/ui";

type PathInfoProps = {
  userPathLength: number;
  shortestPathLength: number | null | undefined;
};

export function PathInfo({
  userPathLength,
  shortestPathLength,
}: PathInfoProps) {
  return (
    <Card className="py-4">
      <CardContent className="px-4">
        <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-2 text-sm text-gray-700">
          <span className="font-medium underline decoration-2 underline-offset-4 decoration-[#2563eb]">
            Länge deines Pfads
          </span>
          <span className="text-right tabular-nums">{userPathLength}</span>

          <span className="font-medium underline decoration-2 underline-offset-4 decoration-[#f59e0b]">
            Länge des kürzesten Pfads
          </span>
          <span className="text-right tabular-nums">
            {shortestPathLength ?? "❓"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
