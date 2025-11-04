export type Game = {
  contest_id: number;
  utc_start_time: Date;
  home_team: string;
  away_team: string;
  is_conference_game: boolean;
};

export type Team = {
  team_name: string;
};
