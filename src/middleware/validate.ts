import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import { AppError } from "../utils/AppError";

export function validateBody(schema: ZodType) {
    return (req: Request, _res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const details = result.error.issues
                .map((issue) => `${issue.path.map(String).join(".") || "body"}: ${issue.message}`)
                .join("; ");
            return next(new AppError(details, 400));
        }

        req.body = result.data;
        next();
    };
}