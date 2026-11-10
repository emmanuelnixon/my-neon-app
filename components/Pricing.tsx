"use client";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useStore, type Tier } from "./store";

const PLANS: { id: Tier; name: string; monthly: number; tagline: string; features: string[]; highlight?: boolean }[] = [
  { id: "free", name: "Free", monthly: 0, tagline: "Everything you need to start building.", features: ["Unlimited build plans & quick steps", "AI Mentor (offline answers)", "4 basic 3D shapes", "Offline model library (20+ models)", "Education Corner & quizzes", "PNG export (watermarked)"] },
  { id: "pro", name: "Pro", monthly: 9, tagline: "Better 3D models & online search.", highlight: true, features: ["Everything in Free", "12 Pro shapes: torus, wedge, capsule, knot…", "🌐 Online model search (detailed glTF models)", "Pro-only library models", "Watermark-free PNG export", "Priority mentor responses"] },
  { id: "studio", name: "Studio", monthly: 29, tagline: "For makers, teams and classrooms.", features: ["Everything in Pro", "Up to 10 team seats", "Shared project boards", "Commercial license for exports", "Classroom progress reports", "Email support (24h)"] },
];

const ROWS: [string, string, string, string][] = [
  ["Build plans + quick steps", "✓", "✓", "✓"], ["Works offline", "✓", "✓", "✓"], ["Basic 3D shapes", "4", "16", "16"],
  ["Offline model library", "✓", "✓ + Pro models", "✓ + Pro models"], ["Online model search", "—", "✓", "✓"], ["PNG export", "Watermark", "Clean", "Clean + commercial"], ["Team seats", "1", "1", "10"],
];

export default function Pricing() {
  const { tier, setTier, online, session } = useStore(); const nav = useNavigate();
  const [yearly, setYearly] = useState(false);
  const [checkout, setCheckout] = useState<Tier | null>(null);
  const [card, setCard] = useState({ name: session?.email ?? "", num: "", exp: "", cvc: "" });
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false); const [done, setDone] = useState("");
  const price = (m: number) => (yearly ? Math.round(m * 10) : m);

  const pay = async (e: FormEvent) => {
    e.preventDefault(); setErr("");
    if (!card.name.trim()) return setErr("Enter the name on the card.");
    if (card.num.replace(/\s/g, "").length !== 16) return setErr("Card number must be 16 digits (try 4242 4242 4242 4242).");
    if (!/^\d{2}\/\d{2}$/.test(card.exp)) return setErr("Expiry must be MM/YY.");
    if (!/^\d{3,4}$/.test(card.cvc)) return setErr("CVC must be 3–4 digits.");
    setBusy(true);
    let receipt = "OFFLINE-" + Date.now().toString(36).toUpperCase();
    try {
      if (online) { const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: checkout, yearly }) }); const j = await r.json(); receipt = j.receiptId; }
    } catch {}
    setTier(checkout!); setBusy(false); setDone(receipt); setCheckout(null);
  };

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold">Pricing</h1>
      <p className="text-zinc-400 mt-1">Start free and upgrade when you want better 3D models. Your current plan: <span className="text-emerald-300 font-semibold uppercase">{tier}</span></p>
      {done && <div role="status" className="mt-4 pop rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-4 text-sm">🎉 You're on <b className="uppercase">{tier}</b>! Receipt <code>{done}</code>. <button onClick={() => nav("/sketch")} className="underline text-emerald-300">Open the 3D studio →</button></div>}

      <div className="inline-flex glass rounded-2xl p-1 mt-6" role="group" aria-label="Billing period">
        <button onClick={() => setYearly(false)} aria-pressed={!yearly} className={`px-4 py-2 rounded-xl text-sm ${!yearly ? "bg-violet-500/30" : "text-zinc-400"}`}>Monthly</button>
        <button onClick={() => setYearly(true)} aria-pressed={yearly} className={`px-4 py-2 rounded-xl text-sm ${yearly ? "bg-violet-500/30" : "text-zinc-400"}`}>Yearly <span className="text-emerald-300 text-xs">2 months free</span></button>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mt-6">
        {PLANS.map((p) => {
          const current = tier === p.id;
          return (
            <div key={p.id} className={`card p-6 flex flex-col relative ${p.highlight ? "border-violet-400/60 shadow-[0_0_40px_-10px_rgba(139,92,246,.5)]" : ""}`}>
              {p.highlight && <span className="absolute -top-3 left-6 text-[11px] px-3 py-1 rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 text-white font-semibold">Most popular</span>}
              <h2 className="text-xl font-bold">{p.name}</h2>
              <p className="text-sm text-zinc-400">{p.tagline}</p>
              <div className="mt-4"><span className="text-4xl font-bold">${price(p.monthly)}</span><span className="text-zinc-400 text-sm"> /{yearly ? "year" : "month"}</span></div>
              <ul className="mt-4 space-y-2 text-sm flex-1">{p.features.map((f) => <li key={f} className="flex gap-2"><span className="text-emerald-300">✓</span>{f}</li>)}</ul>
              {current ? <button disabled className="btn-ghost mt-6 py-2 opacity-70">Current plan</button>
                : p.id === "free" ? <button onClick={() => { setTier("free"); setDone(""); }} className="btn-ghost mt-6 py-2">Downgrade to Free</button>
                : <button onClick={() => { setCheckout(p.id); setErr(""); }} className="btn-primary mt-6 py-2">Upgrade to {p.name}</button>}
            </div>
          );
        })}
      </div>

      <section className="glass rounded-3xl p-6 mt-8 overflow-x-auto">
        <h2 className="font-semibold mb-3">Compare plans</h2>
        <table className="w-full text-sm min-w-[520px]">
          <thead><tr className="text-left text-zinc-400"><th className="py-2 font-normal">Feature</th><th className="font-normal">Free</th><th className="font-normal">Pro</th><th className="font-normal">Studio</th></tr></thead>
          <tbody>{ROWS.map((r) => <tr key={r[0]} className="border-t border-white/5">{r.map((c, i) => <td key={i} className={`py-2 ${i === 0 ? "text-zinc-300" : "text-zinc-400"}`}>{c}</td>)}</tr>)}</tbody>
        </table>
        <p className="text-xs text-zinc-500 mt-3">🌐 Online = needs internet (online model search, glTF downloads). 📦 Offline = plans, quick steps, mentor, lessons and the offline model library keep working with no connection once the app is loaded.</p>
      </section>

      {checkout && (
        <div className="fixed inset-0 z-[60] bg-black/60 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Checkout">
          <form onSubmit={pay} className="glass rounded-3xl p-6 w-full max-w-md space-y-3 pop bg-[#18181f]">
            <div className="flex justify-between items-center"><h2 className="text-lg font-bold">Upgrade to {checkout === "pro" ? "Pro" : "Studio"}</h2><button type="button" onClick={() => setCheckout(null)} aria-label="Close" className="text-zinc-400">✕</button></div>
            <p className="text-sm text-zinc-400">${price(PLANS.find((p) => p.id === checkout)!.monthly)} / {yearly ? "year" : "month"} · cancel anytime</p>
            <p className="text-xs rounded-lg bg-amber-400/10 text-amber-200 p-2">Demo checkout: no real payment is made. Use 4242 4242 4242 4242, any future date and any CVC.</p>
            <label className="block text-sm">Name on card<input className="input mt-1" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} /></label>
            <label className="block text-sm">Card number<input className="input mt-1" inputMode="numeric" placeholder="4242 4242 4242 4242" value={card.num} onChange={(e) => setCard({ ...card, num: e.target.value.replace(/[^\d]/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim() })} /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">Expiry<input className="input mt-1" placeholder="MM/YY" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value.replace(/[^\d]/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2") })} /></label>
              <label className="block text-sm">CVC<input className="input mt-1" inputMode="numeric" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })} /></label>
            </div>
            {err && <p role="alert" className="text-sm text-rose-300">{err}</p>}
            <button disabled={busy} className="btn-primary w-full py-2.5">{busy ? "Processing…" : "Pay & upgrade"}</button>
          </form>
        </div>
      )}
    </div>
  );
}
