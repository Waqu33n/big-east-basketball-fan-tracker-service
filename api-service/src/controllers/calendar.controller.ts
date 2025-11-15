import { Request, Response } from "express";
import {
  updateSchedulesService,
  getTeamsService,
  getGamesService,
} from "../services/calendar.service.js";
import { getSupabaseClient } from "../clients/supabaseClient.js";
import { Game, Team } from "../types/calendar.types.js";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  InvalidTokenError,
  PostgresError,
  ExternalAPIError,
} from "../errors/errors.js";

export async function updateSchedules(req: Request, res: Response) {
  try {
    if (!req.headers.authorization) {
      throw new InvalidTokenError(
        "Request header must include authorization token"
      );
    }
    const token: string = req.headers.authorization.replace("Bearer ", "");
    const supabase: SupabaseClient = getSupabaseClient(token);
    await updateSchedulesService(
      parseInt(req.query.season as string),
      supabase
    );
    res.status(200).json({ message: "Succesfully uploaded entire schedule" });
  } catch (error) {
    if (error instanceof InvalidTokenError) {
      res.status(401).json({ message: error.message });
    } else if (
      error instanceof PostgresError ||
      error instanceof ExternalAPIError
    ) {
      res.status(502).json({ message: error.message });
    } else {
      res.status(500).json({
        message: `Interal server error: ${error}`,
      });
    }
  }
}

export async function getTeams(req: Request, res: Response) {
  try {
    const supabase: SupabaseClient = getSupabaseClient(undefined);
    const teams: Team[] = await getTeamsService(supabase);
    res.status(200).json(teams);
  } catch (error) {
    console.error("Error in getTeams:", error);
    if (error instanceof PostgresError) {
      res.status(502).json({ message: error });
    } else {
      res.status(500).json({ message: error });
    }
  }
}

export async function getGames(req: Request, res: Response) {
  try {
    const supabase: SupabaseClient = getSupabaseClient(undefined);
    const startDate: string =
      (req.query.startDate as string) || "2025-10-01T00:00:00Z";
    const endDate: string =
      (req.query.endDate as string) || "2026-04-15T00:00:00Z";
    const games: Game[] = await getGamesService(startDate, endDate, supabase);
    res.status(200).json(games);
  } catch (error) {
    if (error instanceof PostgresError) {
      res.status(502).json({ message: error });
    } else {
      res.status(500).json({ message: error });
    }
  }
}
