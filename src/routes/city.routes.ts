import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { validateBody, validateParams } from "../middleware/validate";
import { cityIdParamsSchema, createCitySchema } from "../validators/city.schemas";
import { createCity, deleteCity, getCities, getCityWeather } from "../controllers/city.controller";

export const cityRouter = Router();

cityRouter.use(requireAuth);

cityRouter.post("/", validateBody(createCitySchema), asyncHandler(createCity));
cityRouter.get("/", asyncHandler(getCities));
cityRouter.get("/:id/weather", validateParams(cityIdParamsSchema), asyncHandler(getCityWeather));
cityRouter.delete("/:id", validateParams(cityIdParamsSchema), asyncHandler(deleteCity));