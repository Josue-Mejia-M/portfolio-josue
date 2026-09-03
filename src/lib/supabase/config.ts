const configuredSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const configuredSupabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!configuredSupabaseUrl?.trim()) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
}

if (!configuredSupabasePublishableKey?.trim()) {
  throw new Error(
    "Missing environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );
}

export const supabaseUrl: string = configuredSupabaseUrl;
export const supabasePublishableKey: string = configuredSupabasePublishableKey;
