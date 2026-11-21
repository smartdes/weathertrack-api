import { NextFunction, Request, Response } from "express";
import { ZodError, ZodType } from "zod";
import { AppError } from "../utils/AppError";

function formatIssues(error: ZodError): string {
    return error.issues
        .map((issue) => `${issue.path.map(String).join(".") || "input"}: ${issue.message}`)
        .join("; ");
}

export function validateBody(schema: ZodType) {
    return (req: Request, _res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            return next(new AppError(formatIssues(result.error), 400));
        }

        req.body = result.data;
        next();
    };
}

export function validateParams(schema: ZodType) {
    return (req: Request, _res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.params);

        if (!result.success) {
            return next(new AppError(formatIssues(result.error), 400));
        }

        next();
    };
}