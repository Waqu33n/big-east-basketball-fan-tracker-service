import { Request, Response } from "express";
import {
  BIG_EAST_TEAMS,
  updateSchedulesService,
} from "../services/calendar.service";

export async function updateSchedules(req: Request, res: Response) {
  try {
    const schedule = await updateSchedulesService(
      (req.query.season as string) || "2025-26"
    );
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({
      message: "Error encountered while webscrapping Big East Schedule",
    });
  }
}
