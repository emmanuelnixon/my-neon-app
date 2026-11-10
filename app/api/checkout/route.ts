import { NextResponse } from "next/server";

const PRICES: Record<string, number> = { pro: 9, studio: 29 };

export async function POST(req: Request) {
  const { plan, yearly } = (await req.json().catch(() => ({}))) as { plan?: string; yearly?: boolean };
  if (!plan || !(plan in PRICES)) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  await new Promise((r) => setTimeout(r, 800));
  const amount = yearly ? PRICES[plan] * 10 : PRICES[plan];
  return NextResponse.json({ ok: true, plan, amount, currency: "USD", interval: yearly ? "year" : "month", receiptId: "FM-" + Date.now().toString(36).toUpperCase(), demo: true });
}
