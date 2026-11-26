import { clearAdminSession } from "@/lib/auth";

export async function POST() {
  await clearAdminSession();
  return new Response(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
}
