import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface TokenPayload {
    sub: string;
}

export function signToken(userId: string): string {
    return jwt.sign({}, env.JWT_SECRET, {
        subject: userId,
        expiresIn: env.JWT_EXPIRES_IN_SECONDS,
        algorithm: "HS256",
    });
}

export function verifyToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] });

    if (typeof decoded === "string" || !decoded.sub) {
        throw new Error("Invalid token payload");
    }

    return { sub: decoded.sub };
}