import { Configuration, MazesApi, SessionsApi } from "../api";

function normalizeApiBasePath(value?: string) {
    const raw = value?.trim();

    if (!raw) return "/api";
    if (/^https?:\/\//i.test(raw)) return raw.replace(/\/+$/, "");

    return `/${raw.replace(/^\/+|\/+$/g, "")}`;
}

const basePath = normalizeApiBasePath(import.meta.env.VITE_API_BASE_URL);

const config = new Configuration({ basePath });

export const sessionsApi = new SessionsApi(config);
export const mazeApi = new MazesApi(config);
