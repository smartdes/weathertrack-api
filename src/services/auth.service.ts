import { hashSync } from "bcryptjs";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { hashPassword, verifyPassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import type { LoginInput, RegisterInput } from "../validators/auth.schemas";

const DUMMY_HASH = hashSync("not-a-real-password", 12);

const publicUser = { id: true, email: true, createdAt: true } as const;

export async function registerUser({ email, password }: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw new AppError("Email is already registered", 409);
    }

    const passwordHash = await hashPassword(password);

    try {
        const user = await prisma.user.create({
            data: { email, passwordHash },
            select: publicUser,
        });
        return { user, token: signToken(user.id) };
    } catch (err) {
        if ((err as { code?: string }).code === "P2002") {
            throw new AppError("Email is already registered", 409);
        }
        throw err;
    }
}

export async function loginUser({ email, password }: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email } });

    const valid = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

    if (!user || !valid) {
        throw new AppError("Invalid email or password", 401);
    }

    return {
        user: { id: user.id, email: user.email, createdAt: user.createdAt },
        token: signToken(user.id),
    };
}