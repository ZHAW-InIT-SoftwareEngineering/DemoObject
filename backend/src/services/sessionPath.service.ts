import type { Path, Session } from "../domain";
import { getSession, updateSession } from "../repositories";
import { isCompleteStartToGoalPath } from "../util";
import { getMazeById } from "./maze.service";
import { computeDSLFromPath } from "./path.service";

type SubmittedSessionPath = Session & {
  path: NonNullable<Session["path"]>;
  dsl: NonNullable<Session["dsl"]>;
  elapsedMs: NonNullable<Session["elapsedMs"]>;
  submittedAt: NonNullable<Session["submittedAt"]>;
};

export type SubmitSessionPathResult =
  | { status: "submitted"; session: SubmittedSessionPath }
  | { status: "session-not-found" }
  | { status: "maze-not-found" }
  | { status: "already-submitted" }
  | { status: "invalid-path" };

export type RetrieveSessionPathResult =
  | { status: "found"; session: SubmittedSessionPath }
  | { status: "not-found" };

export async function submitSessionPathService(
  sessionId: string,
  path: Path,
  elapsedMs: number,
): Promise<SubmitSessionPathResult> {
  const session = await getSession(sessionId);
  if (!session) return { status: "session-not-found" };
  if (session.submittedAt) return { status: "already-submitted" };

  const maze = getMazeById(session.mazeId);
  if (!maze) return { status: "maze-not-found" };
  if (!isCompleteStartToGoalPath(maze, path)) {
    return { status: "invalid-path" };
  }

  const updated = await updateSession(sessionId, {
    path,
    dsl: computeDSLFromPath(path),
    elapsedMs,
    submittedAt: new Date(),
  });

  if (!updated) return { status: "session-not-found" };
  return { status: "submitted", session: updated as SubmittedSessionPath };
}

export async function retrieveSessionPathService(
  sessionId: string,
): Promise<RetrieveSessionPathResult> {
  const session = await getSession(sessionId);

  if (
    !session ||
    !session.path ||
    !session.dsl ||
    session.elapsedMs === undefined ||
    !session.submittedAt
  ) {
    return { status: "not-found" };
  }

  return { status: "found", session: session as SubmittedSessionPath };
}
