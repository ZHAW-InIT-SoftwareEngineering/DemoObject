import { apiBasePath } from "@/lib/api";
import type { CoordPoint } from "@/lib/path/transforms";

export type DisplayLeaderboardEntry = {
  userName: string;
  mazeId: number;
  path: CoordPoint[];
  elapsedMs: number;
  submittedAt: string;
  rank: number;
  moveCount: number;
  pathLength: number;
};

export type DisplayFeed = {
  mazeId: number;
  generatedAt: string;
  leaderboard: DisplayLeaderboardEntry[];
};

export type DisplayNext = {
  mazeId: number;
  generatedAt: string;
  animation: DisplayLeaderboardEntry | null;
};

export async function getDisplayFeed(mazeId: number, signal?: AbortSignal) {
  const response = await fetch(
    `${apiBasePath}/mazes/${encodeURIComponent(String(mazeId))}/display-feed`,
    { signal },
  );

  if (!response.ok) {
    throw new Error(`Display feed request failed: ${response.status}`);
  }

  return (await response.json()) as DisplayFeed;
}

export async function getDisplayNext(mazeId: number, signal?: AbortSignal) {
  const response = await fetch(
    `${apiBasePath}/mazes/${encodeURIComponent(String(mazeId))}/display-next`,
    { signal },
  );

  if (!response.ok) {
    throw new Error(`Display next request failed: ${response.status}`);
  }

  return (await response.json()) as DisplayNext;
}
