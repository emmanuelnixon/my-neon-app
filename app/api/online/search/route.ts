import { NextResponse } from "next/server";
import { searchOnline } from "@/lib/online";

export async function GET(req: Request) {
  const u = new URL(req.url);
  try {
    const r = await searchOnline(u.searchParams.get("q") ?? "", { category: u.searchParams.get("category") || undefined, page: Number(u.searchParams.get("page") ?? 1), perPage: 24 });
    return NextResponse.json(r, { headers: { "Cache-Control": "public, max-age=600" } });
  } catch (e) {
    return NextResponse.json({ error: "Online source unavailable", detail: String(e), found: 0, hits: [] }, { status: 502 });
  }
}
