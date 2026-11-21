import { Request } from "express";
import { AppError } from "./AppError";

export function requireUserId(req: Request): string {
    if (!req.user) {
        throw new AppError("Authentication required", 401);
    }
    return req.user.id;
}