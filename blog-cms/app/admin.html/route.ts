import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdmin();
  const html = await readFile(join(process.cwd(), "..", "admin.html"), "utf8");

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
