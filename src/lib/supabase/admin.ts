import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "./server";

/**
 * Verifies the current request belongs to the portfolio administrator.
 *
 * Server Actions and data access code must call this again before performing
 * an administrative operation; rendering a protected layout is not enough to
 * authorize a mutation.
 */
export const requireAdmin = cache(async () => {
  const supabase = await createClient();
  let result: Awaited<ReturnType<typeof supabase.auth.getUser>>;

  try {
    result = await supabase.auth.getUser();
  } catch {
    redirect("/admin/login");
  }

  if (
    result.error ||
    !result.data.user ||
    result.data.user.app_metadata.role !== "admin"
  ) {
    redirect("/admin/login");
  }

  return result.data.user;
});
