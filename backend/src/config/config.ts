import 'dotenv/config'

const DEFAULT_PORT = 3000;

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

export const PORT = parsePort(process.env.PORT);
