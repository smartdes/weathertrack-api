import { Request, Response } from "express";
import { requireUserId } from "../utils/requireUserId";
import { addCity, listCities, removeCity } from "../services/city.service";

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