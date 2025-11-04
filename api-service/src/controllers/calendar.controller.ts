import { Request, Response } from "express";
import { updateSchedulesService } from "../services/calendar.service";
import { getSupabaseClient } from "../clients/supabaseClient";

export async function updateSchedules(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const supabase = getSupabaseClient(token);
    const schedule = await updateSchedulesService(
      parseInt(req.query.season as string),
      supabase
    );
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({
      message: "Error encountered while webscrapping Big East Schedule",
    });
  }
}
