import { Game } from "../types/calendar.types";
import Cheerio from "cheerio";

export const BIG_EAST_TEAMS = new Set([
  "UConn",
  "Creighton",
  "DePaul",
  "Georgetown",
  "Marquette",
  "Providence",
  "Seton Hall",
  "St. John's",
  "Villanova",
  "Butler",
  "Xavier",
]);

const mockSchedule: Game[] = [
  { date: "Today", homeTeam: "UConn", awayTeam: "Butler" },
];

export async function updateSchedulesService(
  season = "2025-26"
): Promise<Game[]> {
  return mockSchedule;
}
