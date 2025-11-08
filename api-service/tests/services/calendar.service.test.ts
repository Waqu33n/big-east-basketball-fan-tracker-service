// tests/services/games.service.test.ts
import { getGamesService } from "../../src/services/calendar.service";
import { createClient } from "@supabase/supabase-js";
import { Game } from "../../src/types/calendar.types";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnValue({
        data: [{ contest_id: 1, utc_start_time: "2025-11-08T00:30:00Z" }],
        error: null,
      }),
    })),
  })),
}));

test("returns games in range", async () => {
  const mockSupabase = createClient("fake", "fake");
  const games: Game[] = await getGamesService(
    "2025-10-01T00:00:00Z",
    "2026-04-01T00:00:00Z",
    mockSupabase as any
  );
  expect(games).toHaveLength(1);
  expect(games[0]?.contest_id).toBe(1);
});
