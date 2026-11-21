import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";

export async function getUserById(id: string) {
    const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true, createdAt: true },
    });

    if (!user) {
        throw new AppError("Account no longer exists", 401);
    }

    return user;
}