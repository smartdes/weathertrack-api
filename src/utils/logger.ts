import pino from "pino";
import { env } from "../config/env";

export const logger = pino({
    level: env.LOG_LEVEL,
    redact: {
        paths: ["req.headers.authorization", "req.headers.cookie", 'res.headers["set-cookie"]'],
        censor: "[REDACTED]",
    },
    transport: env.NODE_ENV === "development" ? { target: "pino-pretty" } : undefined,
});