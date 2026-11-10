import { NextResponse } from "next/server";
import { findPlan, PLANS, type Plan } from "@/lib/data";
import { modelFor } from "@/lib/models";
import { aiEnabled, aiPlan } from "@/lib/ai";
import { fetchOnlineProject, searchOnline } from "@/lib/online";

const STOP = /\b(build|make|create|diy|a|an|the|my|own|how|to|i|want|homemade|simple|easy)\b/gi;

export async function POST(req: Request) {
  const { idea } = (await req.json().catch(() => ({}))) as { idea?: string };
  if (!idea || !idea.trim()) return NextResponse.json({ error: "Please describe what you want to build." }, { status: 400 });
  const query = idea.replace(STOP, " ").replace(/\s+/g, " ").trim() || idea;

  // Look up community guides online in parallel (used as the main plan or as alternatives)
  const onlineP = searchOnline(query, { perPage: 8 }).catch(() => null);

  let plan: Plan = findPlan(idea);
  const curated = PLANS.some((p) => p.slug === plan.slug);
  if (curated) plan = { ...plan, source: "curated" };
  else {
    const ai = aiEnabled() ? await aiPlan(idea) : null;
    if (ai) plan = ai;
    else {
      const online = await onlineP;
      let loaded: Plan | null = null;
      for (const hit of online?.hits.slice(0, 3) ?? []) {
        try { const p = await fetchOnlineProject(hit.id); if (p.phases.flatMap((x) => x.steps).length >= 3) { loaded = p; break; } } catch {}
      }
      plan = loaded ?? { ...plan, source: "template" };
    }
  }
  const online = await onlineP;
  if (online) plan.alternatives = online.hits.filter((h) => h.id !== plan.slug.replace(/^web-/, "")).slice(0, 8).map((h) => ({ id: h.id, title: h.title, image: h.image, views: h.views }));
  return NextResponse.json({ ...plan, model: modelFor(plan) });
}

export async function GET() {
  return NextResponse.json({ aiEnabled: aiEnabled(), projects: PLANS.map(({ slug, title, difficulty, estimatedTime, emoji, cost }) => ({ slug, title, difficulty, estimatedTime, emoji, cost })) });
}
