import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import type { CreateCityInput } from "../validators/city.schemas";

const MAX_CITIES_PER_USER = 20;

const cityFields = {
    id: true,
    name: true,
    country: true,
    latitude: true,
    longitude: true,
    createdAt: true,
} as const;

export async function addCity(userId: string, input: CreateCityInput) {
    const count = await prisma.favoriteCity.count({ where: { userId } });
    if (count >= MAX_CITIES_PER_USER) {
        throw new AppError(`You can save at most ${MAX_CITIES_PER_USER} cities`, 400);
    }

    try {
        return await prisma.favoriteCity.create({
            data: { ...input, userId },
            select: cityFields,
        });
    } catch (err) {
        const code = (err as { code?: string }).code;
        if (code === "P2002") {
            throw new AppError("This city is already in your favorites", 409);
        }
        if (code === "P2003") {
            throw new AppError("Account no longer exists", 401);
        }
        throw err;
    }
}

export function listCities(userId: string) {
    return prisma.favoriteCity.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: cityFields,
    });
}

export async function removeCity(userId: string, cityId: string) {
    const result = await prisma.favoriteCity.deleteMany({
        where: { id: cityId, userId },
    });

    if (result.count === 0) {
        throw new AppError("City not found", 404);
    }
}
export async function getCity(userId: string, cityId: string) {
    const city = await prisma.favoriteCity.findFirst({
        where: { id: cityId, userId },
        select: cityFields,
    });

    if (!city) {
        throw new AppError("City not found", 404);
    }

    return city;
}