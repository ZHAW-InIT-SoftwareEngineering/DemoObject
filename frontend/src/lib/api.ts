import { Configuration, MazesApi, SessionsApi } from "../api";

const basePath =
    import.meta.env.VITE_API_BASE_URL ?? "/api";

const config = new Configuration({ basePath });

export const sessionsApi = new SessionsApi(config);
export const mazeApi = new MazesApi(config);
