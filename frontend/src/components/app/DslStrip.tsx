type DslStripProps = {
  dsl: string[] | null;
};

export function DslStrip({ dsl }: DslStripProps) {
  if (!dsl || dsl.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">DSL</div>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {dsl.map((token, index) => (
          <div key={`${token}-${index}`} className="flex items-center gap-2 shrink-0">
            <span className="rounded bg-gray-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white whitespace-nowrap">
              {token}
            </span>
            {index < dsl.length - 1 && (
              <span className="text-gray-400">➞</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
