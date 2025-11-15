export type Game = {
  contest_id: number;
  utc_start_time: Date;
  home_team: string; // team_short
  away_team: string; // team_short
  is_conference_game: boolean;
};

export type Team = {
  team_short: string;
  team_name: string;
};
