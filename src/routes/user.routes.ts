import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { getMe } from "../controllers/user.controller";

export const userRouter = Router();

userRouter.get("/me", requireAuth, asyncHandler(getMe));