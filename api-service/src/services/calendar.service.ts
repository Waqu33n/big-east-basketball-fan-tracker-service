import { Game } from "../types/calendar.types";
import { SupabaseClient } from "@supabase/supabase-js";

const BIG_EAST_CONF = "big-east";

export const BIG_EAST_TEAMS: Set<string> = new Set([]);

export async function updateSchedulesService(
  seasonYear: number,
  supabase: SupabaseClient
) {
  const fullYearSchedule: any[] = await fetchFullYearSchedule(seasonYear);
  const bigEastYearSchedule: any[] = fullYearSchedule.filter(function (
    contest
  ) {
    for (const team of contest.teams) {
      if (BIG_EAST_CONF === team.conferenceSeo) {
        BIG_EAST_TEAMS.add(team.nameShort);
        return true;
      }
    }
    return false;
  });
  const databaseEntries: Game[] = trimGameEntries(bigEastYearSchedule);

  const { error } = await supabase
    .from("YearSchedule")
    .upsert(databaseEntries, { onConflict: "contest_id" });
  if (error) {
    console.log("Error occured on entry: ", error.message);
  } else {
    console.log("Entries inserted successfully!");
  }
}

function trimGameEntries(bigEastYearSchedule: any[]): Game[] {
  const result: Game[] = bigEastYearSchedule.map((item: any) => {
    return {
      contest_id: item.contestId,
      utc_start_time: new Date(item.startTimeEpoch),
      home_team: item.teams[0].nameShort,
      away_team: item.teams[1].nameShort,
      is_conference_game:
        BIG_EAST_TEAMS.has(item.teams[0].nameShort) &&
        BIG_EAST_TEAMS.has(item.teams[1].nameShort),
    };
  });
  return result;
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

export async function fetchFullYearSchedule(
  seasonYear: number
): Promise<any[]> {
  const allGames = [];
  const current = new Date(`${seasonYear}-10-01`);
  const end = new Date(`${seasonYear + 1}-03-31`);

  while (current <= end) {
    console.log(current);
    const mm = String(current.getMonth() + 1).padStart(2, "0");
    const dd = String(current.getDate()).padStart(2, "0");
    const yyyy = current.getFullYear();
    const dateStr = `${mm}/${dd}/${yyyy}`;
    console.log(dateStr);
    const games = await fetchFullDaySchedule(seasonYear, dateStr);
    allGames.push(...games);
    current.setDate(current.getDate() + 1);
  }

  return allGames;
}
