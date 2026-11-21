import { z } from "zod";
import { env } from "../config/env";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import { TtlCache } from "../utils/TtlCache";
import { describeWeatherCode } from "../utils/weatherCodes";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const REQUEST_TIMEOUT_MS = 5000;

const openMeteoSchema = z.object({
    timezone: z.string(),
    current: z.object({
        time: z.string(),
        temperature_2m: z.number(),
        apparent_temperature: z.number(),
        relative_humidity_2m: z.number(),
        wind_speed_10m: z.number(),
        precipitation: z.number(),
        weather_code: z.number(),
    }),
    daily: z.object({
        time: z.array(z.string()),
        weather_code: z.array(z.number()),
        temperature_2m_max: z.array(z.number()),
        temperature_2m_min: z.array(z.number()),
        precipitation_sum: z.array(z.number()),
    }),
});

export interface Weather {
    timezone: string;
    current: {
        time: string;
        temperatureC: number;
        feelsLikeC: number;
        humidityPercent: number;
        windSpeedKmh: number;
        precipitationMm: number;
        conditions: string;
    };
    forecast: Array<{
        date: string;
        minC: number;
        maxC: number;
        precipitationMm: number;
        conditions: string;
    }>;
}

const cache = new TtlCache<Weather>(env.WEATHER_CACHE_TTL_SECONDS * 1000);

export async function getWeather(latitude: number, longitude: number) {
    const key = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;

    const hit = cache.get(key);
    if (hit) {
        return { weather: hit, cached: true };
    }

    const url = new URL(FORECAST_URL);
    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));
    url.searchParams.set(
        "current",
        "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,weather_code",
    );
    url.searchParams.set(
        "daily",
        "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum",
    );
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("forecast_days", "3");

    let payload: unknown;
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
        if (!response.ok) {
            throw new Error(`Open-Meteo responded with status ${response.status}`);
        }
        payload = await response.json();
    } catch (err) {
        logger.error({ err }, "Open-Meteo request failed");
        throw new AppError("Weather service is unavailable", 502);
    }

    const parsed = openMeteoSchema.safeParse(payload);
    if (!parsed.success) {
        logger.error({ issues: parsed.error.issues }, "Unexpected Open-Meteo response shape");
        throw new AppError("Weather service returned unexpected data", 502);
    }

    const { timezone, current, daily } = parsed.data;

    const weather: Weather = {
        timezone,
        current: {
            time: current.time,
            temperatureC: current.temperature_2m,
            feelsLikeC: current.apparent_temperature,
            humidityPercent: current.relative_humidity_2m,
            windSpeedKmh: current.wind_speed_10m,
            precipitationMm: current.precipitation,
            conditions: describeWeatherCode(current.weather_code),
        },
        forecast: daily.time.map((date, i) => ({
            date,
            minC: daily.temperature_2m_min[i],
            maxC: daily.temperature_2m_max[i],
            precipitationMm: daily.precipitation_sum[i],
            conditions: describeWeatherCode(daily.weather_code[i]),
        })),
    };

    cache.set(key, weather);
    return { weather, cached: false };
}