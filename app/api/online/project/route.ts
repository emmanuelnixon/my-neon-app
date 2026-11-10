import { NextResponse } from "next/server";
import { fetchOnlineProject } from "@/lib/online";
import { modelFor } from "@/lib/models";

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    const plan = await fetchOnlineProject(id);
    return NextResponse.json({ ...plan, model: modelFor(plan) });
  } catch (e) {
    return NextResponse.json({ error: "Couldn't load that project from the online source.", detail: String(e) }, { status: 502 });
  }
}
