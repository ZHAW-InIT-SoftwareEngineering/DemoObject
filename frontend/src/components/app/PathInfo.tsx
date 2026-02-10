type PathInfoProps = {
  userPathLength: number;
  shortestPathLength: number | null | undefined;
};

export function PathInfo({ userPathLength, shortestPathLength }: PathInfoProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
      <div>
        <span className="font-medium">Your path length:</span>{" "}
        <span>{userPathLength}</span>
      </div>
      <div>
        <span className="font-medium">Shortest path length:</span>{" "}
        <span>{shortestPathLength ?? "—"}</span>
      </div>
    </div>
  );
}
