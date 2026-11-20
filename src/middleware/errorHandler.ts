import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
    const statusCode =
        err instanceof AppError ? err.statusCode : (err as { status?: number }).status ?? 500;

    if (statusCode >= 500) {
        req.log.error(err);
    } else {
        req.log.warn(err.message);
    }

    const message =
        statusCode >= 500 && env.NODE_ENV === "production" ? "Internal server error" : err.message;

    res.status(statusCode).json({ error: { message } });
}