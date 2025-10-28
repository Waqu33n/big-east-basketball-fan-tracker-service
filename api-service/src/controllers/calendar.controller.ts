import { Request, Response } from "express";
import { updateSchedulesService } from "../services/calendar.service";

export async function updateSchedules(req: Request, res: Response) {
  try {
    const schedule = await updateSchedulesService(
      parseInt(req.query.season as string) || 2025
    );
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({
      message: "Error encountered while webscrapping Big East Schedule",
    });
  }
}
