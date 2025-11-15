import {
  getGamesService,
  getTeamsService,
  updateSchedulesService,
} from "../../src/services/calendar.service.js";
import { createClient } from "@supabase/supabase-js";

const mockFrom = jest.fn();

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    from: mockFrom,
  })),
}));

describe("Supabase service tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test("test getGamesService", async () => {
    mockFrom.mockImplementation((tableName: string) => {
      if (tableName === "YearSchedule") {
        return {
          select: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnValue({
            data: [{ contest_id: 1, utc_start_time: "2025-11-08T00:30:00Z" }],
            error: null,
          }),
        };
      }
      return { select: jest.fn().mockReturnValue({ data: [], error: null }) };
    });

    const supabase = createClient("test", "test");
    const games = await getGamesService(
      "2025-10-01T00:00:00Z",
      "2026-04-01T00:00:00Z",
      supabase
    );

    expect(games).toHaveLength(1);
    expect(games[0]?.contest_id).toBe(1);
  });

  test("test getGamesService error", async () => {
    mockFrom.mockImplementation((tableName: string) => {
      if (tableName === "YearSchedule") {
        return {
          select: jest.fn().mockReturnThis(),
          gte: jest.fn().mockReturnThis(),
          lte: jest.fn().mockReturnValue({
            data: null,
            error: { message: "something went wrong" },
          }),
        };
      }
      return { select: jest.fn().mockReturnValue({ data: [], error: null }) };
    });

    const mockSupabase = createClient("test", "test");
    await expect(
      getGamesService(
        "2025-10-01T00:00:00Z",
        "2026-04-01T00:00:00Z",
        mockSupabase
      )
    ).rejects.toThrow("something went wrong");
  });

  test("test getTeamsService", async () => {
    mockFrom.mockImplementation((tableName: string) => {
      if (tableName === "BigEastTeams") {
        return {
          select: jest.fn().mockReturnValue({
            data: [{ team_short: "UCONN", team_name: "UConn" }],
            error: null,
          }),
        };
      }
      return { select: jest.fn().mockReturnValue({ data: [], error: null }) };
    });

    const mockSupabase = createClient("test", "test");
    const teams = await getTeamsService(mockSupabase);
    expect(teams).toHaveLength(1);
    expect(teams[0]?.team_short).toBe("UCONN");
  });

  test("test getTeamsService error", async () => {
    mockFrom.mockImplementation((tableName: string) => {
      if (tableName === "BigEastTeams") {
        return {
          select: jest.fn().mockReturnValue({
            data: null,
            error: { message: "something went wrong" },
          }),
        };
      }
      return { select: jest.fn().mockReturnValue({ data: [], error: null }) };
    });
    const mockSupabase = createClient("test", "test");
    await expect(getTeamsService(mockSupabase)).rejects.toThrow(
      "something went wrong"
    );
  });

  test("test updateSchedulesService", async () => {
    mockFrom.mockImplementation((tableName: string) => {
      if (tableName === "YearSchedule") {
        return {
          upsert: jest.fn().mockReturnValue({ error: null }),
        };
      }
      if (tableName === "BigEastTeams") {
        return {
          upsert: jest.fn().mockReturnValue({ error: null }),
        };
      }
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          contests: [
            {
              contest_id: 1,
              utc_start_time: "2025-11-08T00:30:00Z",
              teams: [
                {
                  conferenceSeo: "big-east",
                  name6Char: "UCONN",
                  nameShort: "UConn",
                },
                {
                  conferenceSeo: "acc",
                  name6Char: "DUKE",
                  nameShort: "Duke",
                },
              ],
            },
            {
              contest_id: 2,
              utc_start_time: "2025-11-09T00:30:00Z",
              teams: [
                {
                  conferenceSeo: "big-ten",
                  name6Char: "MICH",
                  nameShort: "Michigan",
                },
                {
                  conferenceSeo: "acc",
                  name6Char: "DUKE",
                  nameShort: "Duke",
                },
              ],
            },
          ],
        },
      }),
    });

    const mockSupabase = createClient("test", "test");
    await expect(
      updateSchedulesService(2025, mockSupabase)
    ).resolves.not.toThrow();
  });

  test("test updateSchedulesService team upload fail", async () => {
    mockFrom.mockImplementation((tableName: string) => {
      if (tableName === "YearSchedule") {
        return {
          upsert: jest.fn().mockReturnValue({ error: null }),
        };
      }
      if (tableName === "BigEastTeams") {
        return {
          upsert: jest.fn().mockReturnValue({
            error: { message: "something went wrong with teams" },
          }),
        };
      }
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ contest_id: 1, utc_start_time: "2025-11-08T00:30:00Z" }],
      }),
    });

    const mockSupabase = createClient("test", "test");
    await expect(updateSchedulesService(2025, mockSupabase)).rejects.toThrow(
      "something went wrong with teams"
    );
  });

  test("test updateSchedulesService game upload fail", async () => {
    mockFrom.mockImplementation((tableName: string) => {
      if (tableName === "YearSchedule") {
        return {
          upsert: jest.fn().mockReturnValue({
            error: { message: "something went wrong with games" },
          }),
        };
      }
      if (tableName === "BigEastTeams") {
        return {
          upsert: jest.fn().mockReturnValue({ error: null }),
        };
      }
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ contest_id: 1, utc_start_time: "2025-11-08T00:30:00Z" }],
      }),
    });

    const mockSupabase = createClient("test", "test");
    await expect(updateSchedulesService(2025, mockSupabase)).rejects.toThrow(
      "something went wrong with games"
    );
  });

  test("test updateSchedulesService NCAA fetch fail", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      statusText: "bad gateway",
    });

    const mockSupabase = createClient("test", "test");
    await expect(updateSchedulesService(2025, mockSupabase)).rejects.toThrow(
      "Failed to fetch data from NCAA: bad gateway"
    );
  });
});
