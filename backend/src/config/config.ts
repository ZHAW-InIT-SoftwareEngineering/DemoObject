import 'dotenv/config'

const DEFAULT_PORT = 3000;
const DEFAULT_LLM_CHAT_TIMEOUT_MS = 30_000;

function parsePort(value: string | undefined): number {
    if (!value) {
        return DEFAULT_PORT;
    }

    const parsedPort = Number(value);
    if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
        throw new Error(`Invalid PORT value: ${value}`);
    }

    return parsedPort;
}

function parsePositiveInteger(value: string | undefined, defaultValue: number, name: string): number {
    if (!value) {
        return defaultValue;
    }

    const parsedValue = Number(value);
    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
        throw new Error(`Invalid ${name} value: ${value}`);
    }

    return parsedValue;
}

export const PORT = parsePort(process.env.PORT);
export const LLM_CHAT_ENDPOINT =
    process.env.LLM_CHAT_ENDPOINT ?? "https://llm-backend.cloudlab.zhaw.ch/chat";
export const LLM_CHAT_STREAM_ENDPOINT =
    process.env.LLM_CHAT_STREAM_ENDPOINT ?? `${LLM_CHAT_ENDPOINT.replace(/\/$/, "")}/stream`;
export const LLM_CHAT_TIMEOUT_MS = parsePositiveInteger(
    process.env.LLM_CHAT_TIMEOUT_MS,
    DEFAULT_LLM_CHAT_TIMEOUT_MS,
    "LLM_CHAT_TIMEOUT_MS",
);
