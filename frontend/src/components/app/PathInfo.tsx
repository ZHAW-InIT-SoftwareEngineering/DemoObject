import { Card, CardContent, Separator } from "@/components/ui";

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
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
          <div className="flex items-baseline gap-2">
            <span className="font-medium underline decoration-2 underline-offset-4 decoration-[#2563eb]">
              Länge deines Pfads
            </span>
            <span>{userPathLength}</span>
          </div>
          <Separator orientation="vertical" className="hidden h-4 sm:block" />
          <div className="flex items-baseline gap-2">
            <span className="font-medium underline decoration-2 underline-offset-4 decoration-[#f59e0b]">
              Länge des kürzesten Pfads
            </span>
            <span>{shortestPathLength ?? "❓"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
