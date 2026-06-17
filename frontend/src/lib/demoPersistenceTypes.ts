import type {
  MazesMazeIdDisplayFeedGet200ResponseLeaderboardInnerPathInner,
  MazesMazeIdShortestPathGet200Response,
  SessionsPost201Response,
} from "@/api";
import type { NodePath } from "@/lib/path/transforms";

export type PersistedDemoSession = {
  mazeId: number;
  createdAt: string;
  session: SessionsPost201Response;
};

export type PersistedDemoDraftPath = {
  mazeId: number;
  sessionId: string;
  nodePath: NodePath;
  updatedAt: string;
};

export type PersistedDemoMazeTimer = {
  mazeId: number;
  sessionId: string;
  startedAt: number;
  submittedAt: number | null;
  updatedAt: string;
};

export type PersistedDemoTheoryProgress = {
  mazeId: number;
  sessionId: string;
  visitedDsl: boolean;
  visitedShortestPath: boolean;
  updatedAt: string;
};

export type PersistedDemoPathSubmission = {
  mazeId: number;
  sessionId: string;
  pathKey: string;
  dsl: string[] | null;
  shortestPath: MazesMazeIdShortestPathGet200Response | null;
  updatedAt: string;
};

export type PersistedDemoStreamingNotice = {
  mazeId: number;
  sessionId: string;
  seenAt: string;
  updatedAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isCoordPathEntry(
  value: unknown,
): value is MazesMazeIdDisplayFeedGet200ResponseLeaderboardInnerPathInner {
  if (!isRecord(value)) return false;

  return isFiniteNumber(value.x) && isFiniteNumber(value.y);
}

export function isShortestPathResponse(
  value: unknown,
): value is MazesMazeIdShortestPathGet200Response {
  if (!isRecord(value)) return false;

  return (
    (value.algorithm === "bfs" || value.algorithm === "dijkstra") &&
    Array.isArray(value.path) &&
    value.path.every(isCoordPathEntry) &&
    Array.isArray(value.explorationSteps) &&
    value.explorationSteps.every((step) => {
      if (!isRecord(step)) return false;

      return (
        isCoordPathEntry(step.from) &&
        isCoordPathEntry(step.to) &&
        typeof step.discovered === "boolean" &&
        typeof step.improved === "boolean" &&
        isFiniteNumber(step.candidateCost)
      );
    }) &&
    isFiniteNumber(value.length) &&
    isFiniteNumber(value.cost)
  );
}

export function isPersistedDemoSession(
  value: unknown,
): value is PersistedDemoSession {
  if (!isRecord(value)) return false;

  const session = value.session;
  if (!isRecord(session)) return false;

  return (
    isFiniteNumber(value.mazeId) &&
    typeof value.createdAt === "string" &&
    typeof session.sessionId === "string" &&
    typeof session.userName === "string" &&
    typeof session.qrPayload === "string"
  );
}

export function isPersistedDemoDraftPath(
  value: unknown,
): value is PersistedDemoDraftPath {
  if (!isRecord(value)) return false;

  return (
    isFiniteNumber(value.mazeId) &&
    typeof value.sessionId === "string" &&
    Array.isArray(value.nodePath) &&
    value.nodePath.every(isFiniteNumber) &&
    typeof value.updatedAt === "string"
  );
}

export function isPersistedDemoMazeTimer(
  value: unknown,
): value is PersistedDemoMazeTimer {
  if (!isRecord(value)) return false;

  return (
    isFiniteNumber(value.mazeId) &&
    typeof value.sessionId === "string" &&
    isFiniteNumber(value.startedAt) &&
    (value.submittedAt === null || isFiniteNumber(value.submittedAt)) &&
    typeof value.updatedAt === "string"
  );
}

export function isPersistedDemoTheoryProgress(
  value: unknown,
): value is PersistedDemoTheoryProgress {
  if (!isRecord(value)) return false;

  return (
    isFiniteNumber(value.mazeId) &&
    typeof value.sessionId === "string" &&
    typeof value.visitedDsl === "boolean" &&
    typeof value.visitedShortestPath === "boolean" &&
    typeof value.updatedAt === "string"
  );
}

export function isPersistedDemoPathSubmission(
  value: unknown,
): value is PersistedDemoPathSubmission {
  if (!isRecord(value)) return false;

  return (
    isFiniteNumber(value.mazeId) &&
    typeof value.sessionId === "string" &&
    typeof value.pathKey === "string" &&
    (value.dsl === null ||
      (Array.isArray(value.dsl) &&
        value.dsl.every((token) => typeof token === "string"))) &&
    (value.shortestPath === null || isShortestPathResponse(value.shortestPath)) &&
      typeof value.updatedAt === "string"
  );
}

export function isPersistedDemoStreamingNotice(
  value: unknown,
): value is PersistedDemoStreamingNotice {
  if (!isRecord(value)) return false;

  return (
    isFiniteNumber(value.mazeId) &&
    typeof value.sessionId === "string" &&
    typeof value.seenAt === "string" &&
    typeof value.updatedAt === "string"
  );
}
