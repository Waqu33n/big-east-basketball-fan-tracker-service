import { Request, Response } from "express";
import {
  updateSchedulesService,
  getBigEastTeamsService,
} from "../services/calendar.service";
import { getSupabaseClient } from "../clients/supabaseClient";
import { Game, Team } from "../types/calendar.types";

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
      message: `Error encountered while webscrapping Big East Schedule or uploading to database: ${error}`,
    });
  }
}

export async function getBigEastTeams(req: Request, res: Response) {
  try {
    const supabase = getSupabaseClient("");
    const schedule: Team[] = await getBigEastTeamsService(supabase);
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({
      message: `Error encountered when selecting teams: ${error}`,
    });
  }
}
