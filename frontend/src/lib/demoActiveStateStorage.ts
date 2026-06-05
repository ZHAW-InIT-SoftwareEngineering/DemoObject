import {
  isPersistedDemoDraftPath,
  isPersistedDemoMazeTimer,
  isPersistedDemoPathSubmission,
  isPersistedDemoSession,
  isPersistedDemoStreamingNotice,
  isPersistedDemoTheoryProgress,
  type PersistedDemoDraftPath,
  type PersistedDemoMazeTimer,
  type PersistedDemoPathSubmission,
  type PersistedDemoSession,
  type PersistedDemoStreamingNotice,
  type PersistedDemoTheoryProgress,
} from "@/lib/demoPersistenceTypes";

const ACTIVE_STATE_STORAGE_KEY = "demo-object.active-state";
const ACTIVE_STATE_VERSION = 1;
const MAX_PATH_SUBMISSIONS = 12;

export type DemoActiveStateData = {
  session: PersistedDemoSession | null;
  draftPath: PersistedDemoDraftPath | null;
  mazeTimer: PersistedDemoMazeTimer | null;
  theoryProgress: PersistedDemoTheoryProgress | null;
  pathSubmissions: Record<string, PersistedDemoPathSubmission>;
  streamingNotice: PersistedDemoStreamingNotice | null;
};

type DemoActiveStateEnvelope = {
  version: typeof ACTIVE_STATE_VERSION;
  updatedAt: string;
  data: DemoActiveStateData;
};

type UpdatedRecord = {
  updatedAt: string;
};

export function createEmptyDemoActiveStateData(): DemoActiveStateData {
  return {
    session: null,
    draftPath: null,
    mazeTimer: null,
    theoryProgress: null,
    pathSubmissions: {},
    streamingNotice: null,
  };
}

export function readDemoActiveStateData(): DemoActiveStateData {
  const activeStateData = readStoredDemoActiveStateData();

  return activeStateData ?? createEmptyDemoActiveStateData();
}

export function writeDemoActiveStateData(data: DemoActiveStateData) {
  const envelope: DemoActiveStateEnvelope = {
    version: ACTIVE_STATE_VERSION,
    updatedAt: new Date().toISOString(),
    data: normalizeDemoActiveStateData(data),
  };

  return writeStorageItem(ACTIVE_STATE_STORAGE_KEY, envelope);
}

export function updateDemoActiveStateData(
  updater: (data: DemoActiveStateData) => DemoActiveStateData,
) {
  const currentStateData = readDemoActiveStateData();
  const nextStateData = updater(cloneDemoActiveStateData(currentStateData));

  return writeDemoActiveStateData(nextStateData);
}

export function clearDemoActiveStateData() {
  removeStorageItem(ACTIVE_STATE_STORAGE_KEY);
}

function readStoredDemoActiveStateData(): DemoActiveStateData | null {
  const storedEnvelope = readStorageItem(ACTIVE_STATE_STORAGE_KEY);
  if (!storedEnvelope) {
    return null;
  }

  if (!isActiveStateEnvelope(storedEnvelope)) {
    removeStorageItem(ACTIVE_STATE_STORAGE_KEY);
    return null;
  }

  return normalizeDemoActiveStateData(storedEnvelope.data);
}

function normalizeDemoActiveStateData(
  data: DemoActiveStateData,
): DemoActiveStateData {
  return {
    session: data.session,
    draftPath: data.draftPath,
    mazeTimer: data.mazeTimer,
    theoryProgress: data.theoryProgress,
    pathSubmissions: trimPathSubmissions(data.pathSubmissions),
    streamingNotice: data.streamingNotice ?? null,
  };
}

function cloneDemoActiveStateData(data: DemoActiveStateData): DemoActiveStateData {
  return {
    session: data.session,
    draftPath: data.draftPath,
    mazeTimer: data.mazeTimer,
    theoryProgress: data.theoryProgress,
    pathSubmissions: { ...data.pathSubmissions },
    streamingNotice: data.streamingNotice,
  };
}

function trimPathSubmissions(
  pathSubmissions: Record<string, PersistedDemoPathSubmission>,
): Record<string, PersistedDemoPathSubmission> {
  const entries = Object.entries(pathSubmissions)
    .filter(([, record]) => isPersistedDemoPathSubmission(record))
    .sort(([, left], [, right]) => compareUpdatedAtDesc(left, right))
    .slice(0, MAX_PATH_SUBMISSIONS);

  return Object.fromEntries(entries);
}

function compareUpdatedAtDesc(left: UpdatedRecord, right: UpdatedRecord) {
  return parseUpdatedAt(right.updatedAt) - parseUpdatedAt(left.updatedAt);
}

function parseUpdatedAt(value: string) {
  const timestamp = Date.parse(value);

  return Number.isFinite(timestamp) ? timestamp : 0;
}

function readStorageItem(key: string): unknown {
  const rawValue = readRawStorageItem(key);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as unknown;
  } catch {
    removeStorageItem(key);
    return null;
  }
}

function writeStorageItem(key: string, value: unknown) {
  const storage = getSessionStorage();
  if (!storage) {
    return false;
  }

  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function readRawStorageItem(key: string) {
  const storage = getSessionStorage();
  if (!storage) {
    return null;
  }

  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function removeStorageItem(key: string) {
  const storage = getSessionStorage();
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(key);
  } catch {
    return;
  }
}

function getSessionStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function isActiveStateEnvelope(
  value: unknown,
): value is DemoActiveStateEnvelope {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const envelope = value as Partial<DemoActiveStateEnvelope>;
  return (
    envelope.version === ACTIVE_STATE_VERSION &&
    typeof envelope.updatedAt === "string" &&
    isActiveStateData(envelope.data)
  );
}

function isActiveStateData(value: unknown): value is DemoActiveStateData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const data = value as Partial<DemoActiveStateData>;
  return (
    (data.session === null || isPersistedDemoSession(data.session)) &&
    (data.draftPath === null || isPersistedDemoDraftPath(data.draftPath)) &&
    (data.mazeTimer === null || isPersistedDemoMazeTimer(data.mazeTimer)) &&
    (data.theoryProgress === null ||
      isPersistedDemoTheoryProgress(data.theoryProgress)) &&
    isPathSubmissionRecord(data.pathSubmissions) &&
    (data.streamingNotice === undefined ||
      data.streamingNotice === null ||
      isPersistedDemoStreamingNotice(data.streamingNotice))
  );
}

function isPathSubmissionRecord(
  value: unknown,
): value is Record<string, PersistedDemoPathSubmission> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every(isPersistedDemoPathSubmission);
}
