import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { validateBody } from "../middleware/validate";
import { loginSchema, registerSchema } from "../validators/auth.schemas";
import { login, register } from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.post("/register", validateBody(registerSchema), asyncHandler(register));
authRouter.post("/login", validateBody(loginSchema), asyncHandler(login));