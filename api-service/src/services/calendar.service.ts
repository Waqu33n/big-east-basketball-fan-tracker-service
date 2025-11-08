import { PostgresError } from "../errors/errors";
import { Game, Team } from "../types/calendar.types";
import { SupabaseClient } from "@supabase/supabase-js";

const BIG_EAST_CONF = "big-east";

export async function updateSchedulesService(
  seasonYear: number,
  supabase: SupabaseClient
) {
  const teamShortToTeam: Map<string, Team> = new Map();
  const fullYearSchedule: any[] = await fetchFullYearSchedule(seasonYear);
  const bigEastYearSchedule = fullYearSchedule.filter((contest) =>
    contest.teams.some((team: any) => {
      if (team.conferenceSeo === BIG_EAST_CONF) {
        teamShortToTeam.set(team.name6Char, {
          team_short: team.name6Char,
          team_name: team.nameShort,
        });
        return true;
      }
      return false;
    })
  );

  const databaseEntries: Game[] = parseToGameObjects(
    bigEastYearSchedule,
    teamShortToTeam
  );

  await uploadSchedule(databaseEntries, supabase);

  const teamsList: Team[] = Array.from(teamShortToTeam.values());
  await uploadTeams(teamsList, supabase);
}

async function uploadSchedule(entries: Game[], supabase: SupabaseClient) {
  const { error } = await supabase
    .from("YearSchedule")
    .upsert(entries, { onConflict: "contest_id" });
  if (error) {
    throw new PostgresError(error.message);
  }
}

async function uploadTeams(entries: Team[], supabase: SupabaseClient) {
  const { error } = await supabase
    .from("BigEastTeams")
    .upsert(entries, { onConflict: "team_name" });
  if (error) {
    throw new PostgresError(error.message);
  }
}

function parseToGameObjects(
  bigEastYearSchedule: any[],
  BIG_EAST_TEAMS: Map<string, Team>
): Game[] {
  return bigEastYearSchedule.map((item: any) => {
    return {
      contest_id: item.contestId,
      utc_start_time: new Date(item.startTimeEpoch * 1000),
      home_team: item.teams[0].name6Char,
      away_team: item.teams[1].name6Char,
      is_conference_game:
        BIG_EAST_TEAMS.has(item.teams[0].name6Char) &&
        BIG_EAST_TEAMS.has(item.teams[1].name6Char),
    };
  });
}

async function fetchFullYearSchedule(seasonYear: number): Promise<any[]> {
  const allGames = [];
  const current = new Date(`${seasonYear}-10-15`);
  const end = new Date(`${seasonYear + 1}-04-15`);

  while (current <= end) {
    const mm = String(current.getMonth() + 1).padStart(2, "0");
    const dd = String(current.getDate()).padStart(2, "0");
    const yyyy = current.getFullYear();
    const dateStr = `${mm}/${dd}/${yyyy}`;
    const games = await fetchFullDaySchedule(seasonYear, dateStr);
    allGames.push(...games);
    console.log(dateStr);
    current.setDate(current.getDate() + 1);
  }

  return allGames;
}

async function fetchFullDaySchedule(
  seasonYear: number,
  dateStr: string
): Promise<any[]> {
  const variables = encodeURIComponent(
    JSON.stringify({
      sportCode: "MBB",
      division: 1,
      seasonYear,
      month: parseInt(dateStr.split("/")[0] as string),
      contestDate: dateStr,
      week: null,
    })
  );

  const url = `https://sdataprod.ncaa.com/?meta=GetContests_web&extensions={"persistedQuery":{"version":1,"sha256Hash":"7287cda610a9326931931080cb3a604828febe6fe3c9016a7e4a36db99efdb7c"}}&queryName=GetContests_web&variables=${variables}`;

  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const json = await res.json();
  return json.data.contests || [];
}

export async function getTeamsService(
  supabase: SupabaseClient
): Promise<Team[]> {
  const { data, error } = await supabase.from("BigEastTeams").select();
  if (error) {
    throw new PostgresError(error.message);
  }
  return data;
}

export async function getGamesService(
  startDate: string,
  endDate: string,
  supabase: SupabaseClient
): Promise<Game[]> {
  const { data, error } = await supabase
    .from("YearSchedule")
    .select()
    .gte("utc_start_time", startDate)
    .lte("utc_start_time", endDate);
  if (error) {
    throw new PostgresError(error.message);
  }
  return data;
}
