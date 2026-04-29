import { useEffect, useRef } from "react";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { getDslTokenMeta } from "@/lib/theoryDsl";

type DslStripProps = {
  dsl: string[] | null;
  autoScrollToLatest?: boolean;
};

export function DslStrip({
  dsl,
  autoScrollToLatest = false,
}: DslStripProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!autoScrollToLatest || !dsl?.length || !scrollContainerRef.current) {
      return;
    }

    scrollContainerRef.current.scrollTo({
      left: scrollContainerRef.current.scrollWidth,
      behavior: "smooth",
    });
  }, [autoScrollToLatest, dsl?.length]);

  if (!dsl || dsl.length === 0) return null;

  return (
    <Card className="py-4 gap-3">
      <CardHeader className="px-4">
        <CardTitle className="text-sm text-center">Pfad in DSL</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto pb-2"
        >
          {dsl.map((token, index) => {
            const meta = getDslTokenMeta(token);

            return (
              <div key={`${token}-${index}`} className="flex items-center gap-2 shrink-0">
                <Badge
                  variant="secondary"
                  className="tracking-wide"
                  title={meta.label}
                >
                  {meta.shortLabel}
                </Badge>
                {index < dsl.length - 1 && (
                  <span className="text-gray-400">➞</span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
