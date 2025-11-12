import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { configDotenv } from "dotenv";

if (process.env.NODE_ENV !== "production") {
  configDotenv();
}

export function getSupabaseClient(
  accessToken: string | undefined
): SupabaseClient {
  const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_ANON_KEY as string,
    {
      global: {
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {},
      },
    }
  );
  return supabase;
}

export default getSupabaseClient;
