import type { Session } from "../domain/session";
import { getFinalSessionsByMazeId } from "../repositories";
import { getMazeById } from "./maze.service";

type DisplayLeaderboardEntry = {
  userName: string;
  mazeId: number;
  path: NonNullable<Session["path"]>;
  elapsedMs: NonNullable<Session["elapsedMs"]>;
  submittedAt: NonNullable<Session["submittedAt"]>;
  rank: number;
  moveCount: number;
  pathLength: number;
};

type DisplayQueueState = {
  initialized: boolean;
  seenSessionIds: Set<string>;
  queuedSessionIds: string[];
  rankedCursor: number;
  restartRankedAfterQueue: boolean;
};

const displayQueues = new Map<number, DisplayQueueState>();

function getDisplayQueueState(mazeId: number): DisplayQueueState {
  const existing = displayQueues.get(mazeId);
  if (existing) return existing;

  const state: DisplayQueueState = {
    initialized: false,
    seenSessionIds: new Set(),
    queuedSessionIds: [],
    rankedCursor: 0,
    restartRankedAfterQueue: false,
  };
  displayQueues.set(mazeId, state);
  return state;
}

function getValidFinalSessions(sessions: Session[]) {
  return sessions.filter(
    (
      session,
    ): session is Session & {
      path: NonNullable<Session["path"]>;
      elapsedMs: NonNullable<Session["elapsedMs"]>;
      submittedAt: NonNullable<Session["submittedAt"]>;
    } =>
      Boolean(session.path) &&
      session.dsl !== undefined &&
      session.elapsedMs !== undefined &&
      session.submittedAt !== undefined,
  );
}

function sortSessionsByRank(sessions: ReturnType<typeof getValidFinalSessions>) {
  return [...sessions].sort((a, b) => {
    const elapsedDelta = a.elapsedMs - b.elapsedMs;
    if (elapsedDelta !== 0) return elapsedDelta;

    const submittedDelta = a.submittedAt.getTime() - b.submittedAt.getTime();
    if (submittedDelta !== 0) return submittedDelta;

    return a.userName.localeCompare(b.userName);
  });
}

function sortSessionsBySubmittedAt(
  sessions: ReturnType<typeof getValidFinalSessions>,
) {
  return [...sessions].sort((a, b) => {
    const submittedDelta = a.submittedAt.getTime() - b.submittedAt.getTime();
    if (submittedDelta !== 0) return submittedDelta;

    return a.userName.localeCompare(b.userName);
  });
}

function toDisplayLeaderboardEntry(
  session: ReturnType<typeof getValidFinalSessions>[number],
  rank: number,
): DisplayLeaderboardEntry {
  return {
    userName: session.userName,
    mazeId: session.mazeId,
    path: session.path,
    elapsedMs: session.elapsedMs,
    submittedAt: session.submittedAt,
    rank,
    moveCount: Math.max(session.path.length - 1, 0),
    pathLength: session.path.length,
  };
}

async function getRankedDisplayEntries(mazeId: number) {
  const maze = getMazeById(mazeId);
  if (!maze) return null;

  const sessions = await getFinalSessionsByMazeId(mazeId);
  const validSessions = getValidFinalSessions(sessions);
  const sortedSessions = sortSessionsByRank(validSessions);
  const entriesBySessionId = new Map<string, DisplayLeaderboardEntry>();
  const rankedEntries = sortedSessions.map((session, index) => {
    const entry = toDisplayLeaderboardEntry(session, index + 1);
    entriesBySessionId.set(session.sessionId, entry);
    return entry;
  });

  return {
    sessions: validSessions,
    rankedEntries,
    entriesBySessionId,
  };
}

export async function getDisplayFeedService(mazeId: number) {
  const displayEntries = await getRankedDisplayEntries(mazeId);
  if (!displayEntries) return null;

  return {
    mazeId,
    generatedAt: new Date(),
    leaderboard: displayEntries.rankedEntries,
  };
}

export async function getDisplayNextService(mazeId: number) {
  const displayEntries = await getRankedDisplayEntries(mazeId);
  if (!displayEntries) return null;

  const state = getDisplayQueueState(mazeId);
  const submittedSessions = sortSessionsBySubmittedAt(displayEntries.sessions);

  if (!state.initialized) {
    state.initialized = true;
    state.queuedSessionIds = submittedSessions.map(
      (session) => session.sessionId,
    );
    state.seenSessionIds = new Set(state.queuedSessionIds);
    state.rankedCursor = 0;
    state.restartRankedAfterQueue = state.queuedSessionIds.length > 0;
  } else {
    const newSessionIds = submittedSessions
      .filter((session) => !state.seenSessionIds.has(session.sessionId))
      .map((session) => session.sessionId);

    if (newSessionIds.length > 0) {
      state.queuedSessionIds.push(...newSessionIds);
      for (const sessionId of newSessionIds) state.seenSessionIds.add(sessionId);
      state.restartRankedAfterQueue = true;
    }
  }

  const queuedSessionId = state.queuedSessionIds.shift();
  if (queuedSessionId) {
    if (state.queuedSessionIds.length === 0 && state.restartRankedAfterQueue) {
      state.rankedCursor = 0;
      state.restartRankedAfterQueue = false;
    }

    const queuedEntry = displayEntries.entriesBySessionId.get(queuedSessionId);
    if (queuedEntry) {
      return {
        mazeId,
        generatedAt: new Date(),
        animation: queuedEntry,
      };
    }
  }

  if (displayEntries.rankedEntries.length === 0) {
    return {
      mazeId,
      generatedAt: new Date(),
      animation: null,
    };
  }

  const nextIndex = state.rankedCursor % displayEntries.rankedEntries.length;
  state.rankedCursor = nextIndex + 1;

  return {
    mazeId,
    generatedAt: new Date(),
    animation: displayEntries.rankedEntries[nextIndex],
  };
}
