import { Request, Response } from "express";
import {
  updateSchedulesService,
  getBigEastTeamsService,
  getGamesService,
} from "../services/calendar.service";
import { getSupabaseClient } from "../clients/supabaseClient";
import { Game, Team } from "../types/calendar.types";
import { SupabaseClient } from "@supabase/supabase-js";

export async function updateSchedules(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const supabase: SupabaseClient = getSupabaseClient(token);
    await updateSchedulesService(
      parseInt(req.query.season as string),
      supabase
    );
    res.status(200);
  } catch (error) {
    res.status(500).json({
      message: `Error encountered while webscrapping Big East Schedule or uploading to database: ${error}`,
    });
  }
}

export async function getBigEastTeams(req: Request, res: Response) {
  try {
    const supabase: SupabaseClient = getSupabaseClient("");
    const schedule: Team[] = await getBigEastTeamsService(supabase);
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({
      message: `Error encountered when selecting teams: ${error}`,
    });
  }
}

export async function getGames(req: Request, res: Response) {
  try {
    const supabase: SupabaseClient = getSupabaseClient("");
    const startDate: string =
      (req.query.startDate as string) || "2025-10-01T00:00:00Z";
    const endDate: string =
      (req.query.endDate as string) || "2026-04-01T00:00:00Z";
    const games: Game[] = await getGamesService(startDate, endDate, supabase);
    res.status(200).json(games);
  } catch (error) {
    res.status(500).json({
      message: `Error encountered while getting requested time frame of games: ${error}`,
    });
  }
}
