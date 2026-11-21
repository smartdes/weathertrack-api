import { Request, Response } from "express";
import { requireUserId } from "../utils/requireUserId";
import { addCity, getCity, listCities, removeCity } from "../services/city.service";
import { getWeather } from "../services/weather.service";

export async function createCity(req: Request, res: Response) {
    const city = await addCity(requireUserId(req), req.body);
    res.status(201).json({ city });
}

export async function getCities(req: Request, res: Response) {
    const cities = await listCities(requireUserId(req));
    res.status(200).json({ cities });
}

export async function deleteCity(req: Request, res: Response) {
    await removeCity(requireUserId(req), String(req.params.id));
    res.status(204).send();
}

export async function getCityWeather(req: Request, res: Response) {
    const city = await getCity(requireUserId(req), String(req.params.id));
    const { weather, cached } = await getWeather(city.latitude, city.longitude);
    res.status(200).json({ city, weather, cached });
}