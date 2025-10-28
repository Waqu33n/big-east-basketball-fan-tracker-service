import { Game } from "../types/calendar.types";

const BIG_EAST_CONF = "big-east";

export const BIG_EAST_TEAMS: Set<string> = new Set([]);

const mockSchedule: Game[] = [
  { date: "Today", homeTeam: "UConn", awayTeam: "Butler" },
];

export async function updateSchedulesService(
  seasonYear: number
): Promise<Game[]> {
  const fullYearSchedule = await fetchFullYearSchedule(seasonYear);
  const bigEastYearSchedule = fullYearSchedule.filter(function (contest) {
    for (const team of contest.teams) {
      if (BIG_EAST_CONF === team.conferenceSeo) {
        BIG_EAST_TEAMS.add(team.nameShort);
        return true;
      }
    }
    return false;
  });
  return bigEastYearSchedule;
}

async function fetchDayService(seasonYear: number, dateStr: string) {
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

export async function fetchFullYearSchedule(seasonYear: number) {
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
    const games = await fetchDayService(seasonYear, dateStr);
    allGames.push(...games);
    current.setDate(current.getDate() + 1);
  }

  return allGames;
}
