import { ChatApi, Configuration, MazesApi, SessionsApi } from "../api";

export const apiBasePath =
    import.meta.env.VITE_API_BASE_URL ?? "/api";

const config = new Configuration({ basePath: apiBasePath });

export const sessionsApi = new SessionsApi(config);
export const mazeApi = new MazesApi(config);
export const chatApi = new ChatApi(config);
