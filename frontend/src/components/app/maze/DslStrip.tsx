import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

type DslStripProps = {
  dsl: string[] | null;
};

export function DslStrip({ dsl }: DslStripProps) {
  if (!dsl || dsl.length === 0) return null;

  return (
    <Card className="py-4 gap-3">
      <CardHeader className="px-4">
        <CardTitle className="text-sm text-center">Domain Specific Language (DSL)</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {dsl.map((token, index) => (
            <div key={`${token}-${index}`} className="flex items-center gap-2 shrink-0">
              <Badge variant="secondary" className="uppercase tracking-wide">
                {token}
              </Badge>
              {index < dsl.length - 1 && (
                <span className="text-gray-400">➞</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
