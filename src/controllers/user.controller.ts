import { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { getUserById } from "../services/user.service";

export async function getMe(req: Request, res: Response) {
    if (!req.user) {
        throw new AppError("Authentication required", 401);
    }

    const user = await getUserById(req.user.id);
    res.status(200).json({ user });
}