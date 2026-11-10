import { NextResponse } from "next/server";
import { searchModels } from "@/lib/library";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const q = u.searchParams.get("q") ?? "";
  const src = (u.searchParams.get("source") ?? "all") as "all" | "offline" | "online";
  const results = searchModels(q, src).map((m) =>
    m.source === "online"
      ? { id: m.id, name: m.name, category: m.category, source: m.source, url: m.url, credit: m.credit, pro: true }
      : { id: m.id, name: m.name, category: m.category, source: m.source, parts: m.shapes.length, pro: !!m.pro, shapes: m.shapes },
  );
  return NextResponse.json({ query: q, count: results.length, results });
}
