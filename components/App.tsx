"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { HashRouter, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { LESSONS, PLANS, REFEREES, type Plan } from "@/lib/data";
import { StoreProvider, streak, useStore, type ChatMsg } from "./store";
import Visualizer from "./Visualizer";
import Pricing from "./Pricing";
import { modelFor, simpleSteps } from "@/lib/models";

const NAV = [
  { to: "/", label: "Build", icon: "🛠️" }, { to: "/explore", label: "Explore", icon: "🌍" }, { to: "/gallery", label: "Guides", icon: "🖼️" }, { to: "/sketch", label: "3D", icon: "🧊" },
  { to: "/learn", label: "Learn", icon: "🎓" }, { to: "/mentors", label: "Mentors", icon: "🧑‍🏫" }, { to: "/dashboard", label: "Progress", icon: "📈" }, { to: "/pricing", label: "Pricing", icon: "💎" },
];
const diffColor = (d: string) => (d === "Beginner" ? "text-emerald-300 bg-emerald-400/10" : d === "Intermediate" ? "text-amber-300 bg-amber-400/10" : "text-rose-300 bg-rose-400/10");
const allSteps = (p: Plan) => p.phases.flatMap((ph) => ph.steps);

function Bar({ pct, label }: { pct: number; label: string }) {
  return (
    <div role="progressbar" aria-label={label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} className="h-2 rounded-full bg-white/5 overflow-hidden">
      <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-emerald-300 transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const { session, tier } = useStore();
  const link = ({ isActive }: { isActive: boolean }) => `flex items-center gap-3 px-3 py-2 rounded-xl transition ${isActive ? "bg-violet-500/20 text-violet-200" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"}`;
  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden md:flex w-60 shrink-0 flex-col gap-1 p-4 border-r border-white/5 sticky top-0 h-screen" aria-label="Main navigation">
        <div className="text-xl font-bold mb-6 px-3"><span className="text-violet-300">Maker</span><span className="text-emerald-300">Path</span></div>
        {NAV.map((n) => <NavLink key={n.to} to={n.to} end className={link}><span aria-hidden>{n.icon}</span>{n.label}</NavLink>)}
        <div className="mt-auto space-y-2">
          <NavLink to="/pricing" className="block mx-1 rounded-xl p-3 text-xs bg-gradient-to-br from-violet-500/20 to-emerald-400/10 border border-violet-400/20">
            <div className="font-semibold uppercase text-violet-200">{tier} plan</div>
            <div className="text-zinc-400">{tier === "free" ? "Upgrade for better 3D models →" : "Thanks for supporting MakerPath 💜"}</div>
          </NavLink>
          <NavLink to="/signin" className={link}><span aria-hidden>👤</span>{session ? session.email : "Sign in · Guest"}</NavLink>
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-4 md:p-8 pb-24 md:pb-8">
        <div className="md:hidden flex justify-between items-center mb-4">
          <div className="text-lg font-bold"><span className="text-violet-300">Maker</span><span className="text-emerald-300">Path</span></div>
          <NavLink to="/signin" className="text-sm text-zinc-400" aria-label="Account">{session ? "👤 " + session.email.split("@")[0] : "Sign in"}</NavLink>
        </div>
        {children}
      </main>
      <nav className="md:hidden fixed bottom-0 inset-x-0 glass border-t border-white/10 flex justify-around py-2 z-50" aria-label="Mobile navigation">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end aria-label={n.label} className={({ isActive }) => `flex flex-col items-center text-[9px] px-0.5 ${isActive ? "text-violet-300" : "text-zinc-500"}`}>
            <span className="text-lg" aria-hidden>{n.icon}</span>{n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function BuildPage() {
  const { plan, setPlan } = useStore();
  const [idea, setIdea] = useState(""); const [loading, setLoading] = useState(false); const [err, setErr] = useState("");
  const [ai, setAi] = useState<boolean | null>(null);
  useEffect(() => { fetch("/api/plan").then((r) => r.json()).then((j) => setAi(!!j.aiEnabled)).catch(() => setAi(false)); }, []);
  const generate = async (text: string) => {
    if (!text.trim()) { setErr("Tell me what you want to build first."); return; }
    setErr(""); setLoading(true);
    try {
      const r = await fetch("/api/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idea: text }) });
      const j = await r.json(); if (!r.ok) throw new Error(j.error); setPlan(j as Plan);
    } catch (e) { setErr(e instanceof Error ? e.message : "Something went wrong"); } finally { setLoading(false); }
  };
  const submit = (e: FormEvent) => { e.preventDefault(); generate(idea); };
  return (
    <div className="space-y-6">
      <section className="glass rounded-3xl p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold">What do you want to build?</h1>
        <p className="text-zinc-400 mt-1">Describe any idea — physical or digital. Get real steps, a full materials list, safety notes and a 3D model.</p>
        <p className="text-xs mt-2">{ai === null ? <span className="text-zinc-500">Checking connection…</span> : ai ? <span className="text-sky-300">🌐 Online: AI guides + thousands of community projects.</span> : <span className="text-sky-300">🌐 Online: {PLANS.length} verified guides + thousands of community projects with real steps & photos. <NavLink to="/explore" className="underline">Browse all →</NavLink></span>}</p>
        <form onSubmit={submit} className="mt-5 flex flex-col sm:flex-row gap-3">
          <label htmlFor="idea" className="sr-only">Your idea</label>
          <input id="idea" value={idea} onChange={(e) => setIdea(e.target.value)} placeholder='e.g. "build a birdhouse", "launch a podcast", "make a mobile game"' className="input flex-1 text-base py-3" />
          <button disabled={loading} className="btn-primary px-6 py-3">{loading ? "Forging plan…" : "Generate plan ✨"}</button>
        </form>
        {err && <p role="alert" className="text-rose-300 text-sm mt-2">{err}</p>}
        <div className="flex flex-wrap gap-2 mt-4">
          {["Build a drone", "Build a small house", "Wind turbine", "Plywood boat", "Water rocket", "RC car", "Water pump", "Make charcoal", "Fuel briquettes", "Solar charger"].map((x) => (
            <button key={x} onClick={() => { setIdea(x); generate(x); }} className="chip">{x}</button>
          ))}
        </div>
      </section>
      {loading && <div className="glass rounded-3xl p-8 animate-pulse text-zinc-400">Building your guide: sequencing steps, listing every material, checking safety… (searching online sources can take a few seconds)</div>}
      {plan && !loading ? (
        <div className="grid xl:grid-cols-[1fr_380px] gap-6 items-start">
          <PlanView plan={plan} />
          <div className="xl:sticky xl:top-8"><Mentor plan={plan} /></div>
        </div>
      ) : !loading && <div className="text-center text-zinc-500 py-10">No plan yet — try one of the suggestions above or pick from the <NavLink to="/gallery" className="text-violet-300 underline">Gallery</NavLink>.</div>}
    </div>
  );
}

function PlanView({ plan }: { plan: Plan }) {
  const { progress, toggleStep } = useStore();
  const done = progress[plan.slug] ?? []; const steps = allSteps(plan);
  const pct = (done.filter((d) => steps.some((s) => s.id === d)).length / steps.length) * 100;
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [mode, setMode] = useState<"simple" | "full">("simple");
  const quick = simpleSteps(plan);
  return (
    <div className="space-y-6 min-w-0">
      <section className="glass rounded-3xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl" aria-hidden>{plan.emoji}</div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{plan.title}</h2>
            <p className="text-zinc-400 mt-1">{plan.summary}</p>
            <div className="flex flex-wrap gap-2 mt-3 text-xs">
              <span className={`px-2 py-1 rounded-full ${diffColor(plan.difficulty)}`}>{plan.difficulty}</span>
              <span className="px-2 py-1 rounded-full bg-white/5 text-zinc-300">⏱ {plan.estimatedTime}</span>
              <span className="px-2 py-1 rounded-full bg-white/5 text-zinc-300">{steps.length} steps</span>
              {plan.cost && <span className="px-2 py-1 rounded-full bg-white/5 text-zinc-300">💵 {plan.cost}</span>}
              <span className={`px-2 py-1 rounded-full ${plan.source === "ai" || plan.source === "online" ? "bg-sky-400/10 text-sky-300" : plan.source === "curated" ? "bg-emerald-400/10 text-emerald-300" : "bg-zinc-400/10 text-zinc-300"}`}>{plan.source === "ai" ? "🤖 AI-generated (online)" : plan.source === "online" ? "🌐 Online community guide" : plan.source === "curated" ? "✔ Verified step-by-step guide" : "📦 Offline template"}</span>
            </div>
          </div>
        </div>
        {plan.sourceUrl && <p className="mt-4 text-xs rounded-xl bg-sky-400/10 text-sky-200 p-3">🌐 Steps and photos from <a href={plan.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline font-semibold">this Instructables guide</a>{plan.author && <> by <b>{plan.author}</b></>}{plan.views ? ` · ${plan.views.toLocaleString()} views` : ""}. All credit goes to the original author. Open the original to see comments and any files.</p>}
        {plan.source === "template" && <p className="mt-4 text-xs rounded-xl bg-amber-400/10 text-amber-200 p-3">This is a general planning template. For detailed real steps and materials, pick a verified guide from the Gallery (drone, house, turbine, boat, rocket, RC car, pump, charcoal, fuel briquettes…) or connect the online AI (set OPENAI_API_KEY) for any idea.</p>}
        {plan.safety && plan.safety.length > 0 && (
          <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-4">
            <div className="font-semibold text-amber-200 text-sm mb-1">⚠️ Safety first</div>
            <ul className="text-sm text-amber-100/90 space-y-1">{plan.safety.map((x) => <li key={x}>• {x}</li>)}</ul>
          </div>
        )}
        <div className="mt-5"><div className="flex justify-between text-sm mb-1"><span>Overall progress</span><span className="text-emerald-300">{Math.round(pct)}%</span></div><Bar pct={pct} label="Overall progress" /></div>
      </section>

      <section className="glass rounded-3xl p-6">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
          <div><h3 className="font-semibold text-lg">🧊 3D model of your project</h3><p className="text-xs text-zinc-400">Generated from your prompt. Rotate, zoom, click parts to edit, or download as an image.</p></div>
        </div>
        <Visualizer key={plan.slug} initial={modelFor(plan)} storageKey={`fm_model_${plan.slug}`} title={plan.title} height={420} defaultQuery={plan.title.split(" ").slice(-1)[0]} />
      </section>

      <Materials key={plan.slug} plan={plan} />

      <div role="tablist" aria-label="Step view" className="inline-flex glass rounded-2xl p-1">
        {(["simple", "full"] as const).map((m) => (
          <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={`px-4 py-2 rounded-xl text-sm transition ${mode === m ? "bg-violet-500/30 text-violet-100" : "text-zinc-400 hover:text-zinc-200"}`}>{m === "simple" ? "⚡ Quick steps" : "📋 Full plan"}</button>
        ))}
      </div>

      {mode === "simple" && (
        <section className="glass rounded-3xl p-6">
          <h3 className="font-semibold text-lg mb-1">Simplified build steps</h3>
          <p className="text-xs text-zinc-400 mb-4">One line per step. Switch to Full plan for tools, tips and complex-step details.</p>
          <ol className="space-y-2">
            {quick.map((q, i) => {
              const checked = done.includes(q.id);
              return (
                <li key={q.id} className="pop">
                  <label className={`flex gap-3 items-start rounded-xl p-3 cursor-pointer border transition ${checked ? "border-emerald-400/30 bg-emerald-400/5" : "border-white/5 hover:border-violet-400/30"}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleStep(plan.slug, q.id)} className="mt-1 h-5 w-5 accent-emerald-400 shrink-0" />
                    <span className="h-7 w-7 shrink-0 grid place-items-center rounded-full bg-violet-500/20 text-violet-200 text-sm font-semibold">{i + 1}</span>
                    <span className="min-w-0"><span className={`block font-medium ${checked ? "line-through text-zinc-500" : ""}`}>{q.title}</span><span className="block text-sm text-zinc-400">{q.short}</span></span>
                    {plan.images?.[q.id]?.[0] && <img src={plan.images[q.id][0]} alt="" loading="lazy" className="ml-auto h-14 w-20 object-cover rounded-lg shrink-0" />}
                  </label>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {mode === "full" && plan.phases.map((ph, pi) => {
        const pp = (ph.steps.filter((s) => done.includes(s.id)).length / ph.steps.length) * 100;
        return (
          <section key={ph.name} className="glass rounded-3xl p-6">
            <div className="flex justify-between items-center mb-2"><h3 className="font-semibold text-lg">Phase {pi + 1}: {ph.name}</h3><span className="text-xs text-zinc-400">{Math.round(pp)}%</span></div>
            <Bar pct={pp} label={`${ph.name} progress`} />
            <ol className="mt-4 space-y-3">
              {ph.steps.map((st, si) => {
                const checked = done.includes(st.id); const isOpen = open[st.id] ?? false;
                return (
                  <li key={st.id} className={`rounded-2xl p-4 border transition ${checked ? "border-emerald-400/30 bg-emerald-400/5" : "border-white/5 bg-white/[0.02] hover:border-violet-400/30"}`}>
                    <div className="flex gap-3">
                      <input type="checkbox" checked={checked} onChange={() => toggleStep(plan.slug, st.id)} aria-label={`Mark step ${st.title} complete`} className="mt-1 h-5 w-5 accent-emerald-400 shrink-0 cursor-pointer" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`font-medium ${checked ? "line-through text-zinc-500" : ""}`}>{pi + 1}.{si + 1} {st.title}</span>
                          {st.isComplex && <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-200">Complex</span>}
                        </div>
                        <p className="text-sm text-zinc-400 mt-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{st.description}</p>
                        <StepImages urls={plan.images?.[st.id]} title={st.title} />
                        <button onClick={() => setOpen({ ...open, [st.id]: !isOpen })} aria-expanded={isOpen} className="text-xs text-violet-300 mt-2 hover:underline">{isOpen ? "Hide details ▲" : st.isComplex ? "Expand complex-step details ▼" : "Details ▼"}</button>
                        {isOpen && (
                          <div className="mt-2 text-sm space-y-2 pop">
                            {st.resources.length > 0 && <div><span className="text-zinc-300">Needs:</span> <span className="text-zinc-400">{st.resources.join(", ")}</span></div>}
                            <div className="text-emerald-200/90">💡 {st.tips}</div>
                            {st.isComplex && <div className="text-violet-200/90">⚠️ This is a complex step: read it fully, gather resources first, allow extra time, and ask the AI Mentor if anything is unclear.</div>}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}

      <section className="glass rounded-3xl p-6"><h3 className="font-semibold mb-3">🛡️ Risks & how to avoid them</h3>
        <ul className="grid md:grid-cols-2 gap-3 text-sm">{plan.risks.map((r) => <li key={r.risk} className="rounded-xl bg-white/[0.02] p-3"><div className="text-rose-200">{r.risk}</div><div className="text-zinc-400">→ {r.mitigation}</div></li>)}</ul></section>
      <section className="glass rounded-3xl p-6"><h3 className="font-semibold mb-3">▶️ Reference videos</h3>
        <div className="grid sm:grid-cols-2 gap-3">{plan.videos.map((v) => (
          <a key={v.url} href={v.url} target="_blank" rel="noopener noreferrer" className="card flex items-center gap-3 p-4">
            <span className="h-10 w-10 grid place-items-center rounded-xl bg-rose-500/20 text-rose-300" aria-hidden>▶</span>
            <span className="text-sm">{v.title}<span className="block text-xs text-zinc-500">YouTube · opens in new tab</span></span>
          </a>))}</div>
      </section>
      {plan.alternatives && plan.alternatives.length > 0 && <Alternatives items={plan.alternatives} />}
    </div>
  );
}

function StepImages({ urls, title }: { urls?: string[]; title: string }) {
  const [big, setBig] = useState<string | null>(null);
  if (!urls || !urls.length) return null;
  return (
    <>
      <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
        {urls.map((u, i) => (
          <button key={u} onClick={() => setBig(u)} className="shrink-0 rounded-xl overflow-hidden border border-white/10 hover:border-violet-400/50" aria-label={`Enlarge photo ${i + 1} for ${title}`}>
            <img src={u} alt={`${title} — photo ${i + 1}`} loading="lazy" className="h-28 w-40 object-cover" />
          </button>
        ))}
      </div>
      {big && (
        <div className="fixed inset-0 z-[70] bg-black/80 grid place-items-center p-4" onClick={() => setBig(null)} role="dialog" aria-label="Photo">
          <img src={big.replace(/width=\d+/, "width=1280")} alt={title} className="max-h-[90vh] max-w-full rounded-2xl" />
        </div>
      )}
    </>
  );
}

function useLoadOnline() {
  const { setPlan } = useStore(); const nav = useNavigate();
  const [loadingId, setLoadingId] = useState<string | null>(null); const [error, setError] = useState("");
  const load = async (id: string) => {
    setLoadingId(id); setError("");
    try {
      const r = await fetch(`/api/online/project?id=${encodeURIComponent(id)}`); const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setPlan(j as Plan); nav("/"); window.scrollTo({ top: 0 });
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to load"); } finally { setLoadingId(null); }
  };
  return { load, loadingId, error };
}

function Alternatives({ items }: { items: NonNullable<Plan["alternatives"]> }) {
  const { load, loadingId, error } = useLoadOnline();
  return (
    <section className="glass rounded-3xl p-6">
      <h3 className="font-semibold mb-1">🌍 More guides for this project (online)</h3>
      <p className="text-xs text-zinc-500 mb-3">Real step-by-step builds by makers worldwide. Click one to load its full steps and photos.</p>
      {error && <p role="alert" className="text-sm text-rose-300 mb-2">{error}</p>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((a) => (
          <button key={a.id} onClick={() => load(a.id)} className="card overflow-hidden text-left" disabled={!!loadingId}>
            {a.image ? <img src={a.image + "?auto=webp&fit=bounds&width=320"} alt="" loading="lazy" className="h-24 w-full object-cover" /> : <div className="h-24 bg-violet-500/10" />}
            <div className="p-2 text-xs"><div className="line-clamp-2 font-medium">{loadingId === a.id ? "Loading…" : a.title}</div>{a.views ? <div className="text-zinc-500 mt-1">{a.views.toLocaleString()} views</div> : null}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

const CATS = ["All", "Workshop", "Circuits", "Outside", "Living", "Craft", "Cooking", "Design", "Teachers"];
const QUICK = ["drone", "wind turbine", "solar", "boat", "rocket", "rc car", "water pump", "charcoal", "biogas", "robot", "furniture", "greenhouse", "go kart", "arduino", "raspberry pi", "3D printing", "workbench", "bike", "speaker", "LED"];
type Hit = { id: string; title: string; image?: string; category?: string; channel?: string; views?: number; author?: string };

function ExplorePage() {
  const { online } = useStore();
  const { load, loadingId, error: loadErr } = useLoadOnline();
  const [q, setQ] = useState(""); const [query, setQuery] = useState(""); const [cat, setCat] = useState("Workshop");
  const [hits, setHits] = useState<Hit[]>([]); const [found, setFound] = useState(0); const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const fetchPage = async (qq: string, c: string, p: number) => {
    setBusy(true); setErr("");
    try {
      const r = await fetch(`/api/online/search?q=${encodeURIComponent(qq)}&category=${c === "All" ? "" : c}&page=${p}`); const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setFound(j.found); setHits((h) => (p === 1 ? j.hits : [...h, ...j.hits]));
    } catch (e) { setErr(e instanceof Error ? e.message : "Search failed"); } finally { setBusy(false); }
  };
  useEffect(() => { setPage(1); fetchPage(query, cat, 1); }, [query, cat]);
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold">Explore {found > 1000 ? `${found.toLocaleString()}+` : "thousands of"} projects</h1>
      <p className="text-zinc-400 mt-1">Live from the online maker community (Instructables): real step-by-step builds with photos, materials and tips. Pick one to load it into your planner with a 3D model, progress tracker and AI mentor.</p>
      {!online && <p className="mt-3 text-sm text-amber-200">You're offline. Explore needs internet. The {PLANS.length} built-in guides on the Guides tab still work.</p>}
      <form onSubmit={(e) => { e.preventDefault(); setQuery(q); }} className="mt-5 flex gap-2">
        <label htmlFor="exq" className="sr-only">Search projects</label>
        <input id="exq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search: wind turbine, chicken coop, arduino weather station…" className="input flex-1 py-3" />
        <button className="btn-primary px-5">Search</button>
      </form>
      <div className="flex flex-wrap gap-2 mt-3">{QUICK.map((x) => <button key={x} onClick={() => { setQ(x); setQuery(x); setCat("All"); }} className="chip">{x}</button>)}</div>
      <div className="flex flex-wrap gap-1 mt-4" role="tablist" aria-label="Categories">
        {CATS.map((c) => <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className={`px-3 py-1.5 rounded-full text-sm border ${cat === c ? "border-violet-400 bg-violet-500/20 text-violet-100" : "border-white/10 text-zinc-400 hover:text-zinc-200"}`}>{c}</button>)}
      </div>
      {(err || loadErr) && <p role="alert" className="mt-4 text-rose-300 text-sm">{err || loadErr}</p>}
      <p className="text-xs text-zinc-500 mt-4">{found.toLocaleString()} results{query ? ` for "${query}"` : ""}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-3">
        {hits.map((h) => (
          <button key={h.id} onClick={() => load(h.id)} disabled={!!loadingId} className="card overflow-hidden text-left relative" aria-label={`Load ${h.title}`}>
            {h.image ? <img src={h.image + "?auto=webp&fit=bounds&width=480"} alt="" loading="lazy" className="h-36 w-full object-cover" /> : <div className="h-36 bg-violet-500/10" />}
            <div className="p-3">
              <div className="font-medium text-sm line-clamp-2">{h.title}</div>
              <div className="text-[11px] text-zinc-500 mt-1">{[h.channel ?? h.category, h.views ? `${h.views.toLocaleString()} views` : "", h.author ? `by ${h.author}` : ""].filter(Boolean).join(" · ")}</div>
            </div>
            {loadingId === h.id && <div className="absolute inset-0 bg-black/60 grid place-items-center text-sm">Loading steps…</div>}
          </button>
        ))}
      </div>
      {busy && <p className="text-center text-zinc-400 mt-6 animate-pulse">Searching online…</p>}
      {!busy && hits.length > 0 && hits.length < found && <div className="text-center mt-6"><button onClick={() => { const p = page + 1; setPage(p); fetchPage(query, cat, p); }} className="btn-ghost px-6 py-2">Load more</button></div>}
    </div>
  );
}

function Materials({ plan }: { plan: Plan }) {
  const key = `mp_bought_${plan.slug}`;
  const [bought, setBought] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem(key) ?? "[]"); } catch { return []; } });
  const toggle = (k: string) => { const n = bought.includes(k) ? bought.filter((x) => x !== k) : [...bought, k]; setBought(n); localStorage.setItem(key, JSON.stringify(n)); };
  const mats = plan.materials ?? plan.resources.map((r) => ({ item: r, qty: "", spec: undefined, cost: undefined }));
  const copy = () => navigator.clipboard?.writeText(`${plan.title} — shopping list\n` + mats.map((x) => `[ ] ${x.qty ? x.qty + " × " : ""}${x.item}${x.spec ? " (" + x.spec + ")" : ""}${x.cost ? " — " + x.cost : ""}`).join("\n") + (plan.tools?.length ? "\n\nTools:\n" + plan.tools.map((t) => "[ ] " + t).join("\n") : ""));
  return (
    <section className="glass rounded-3xl p-6">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
        <h3 className="font-semibold text-lg">🧾 Materials needed ({mats.length}){plan.cost && <span className="text-sm font-normal text-zinc-400"> · est. total {plan.cost}</span>}</h3>
        <div className="flex gap-2"><button onClick={copy} className="btn-ghost text-xs px-3 py-1.5">📋 Copy list</button><button onClick={() => window.print()} className="btn-ghost text-xs px-3 py-1.5">🖨 Print</button></div>
      </div>
      <p className="text-xs text-zinc-500 mb-3">Tick items as you buy or collect them ({bought.filter((b) => mats.some((x) => x.item === b)).length}/{mats.length} ready).</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead><tr className="text-left text-zinc-400 text-xs"><th className="py-2 w-8 font-normal"><span className="sr-only">Have it</span></th><th className="font-normal">Item</th><th className="font-normal">Qty</th><th className="font-normal">Notes / spec</th><th className="font-normal text-right">Est. cost</th></tr></thead>
          <tbody>{mats.map((x) => {
            const on = bought.includes(x.item);
            return (
              <tr key={x.item} className="border-t border-white/5 align-top">
                <td className="py-2"><input type="checkbox" checked={on} onChange={() => toggle(x.item)} aria-label={`Have ${x.item}`} className="h-4 w-4 accent-emerald-400" /></td>
                <td className={`py-2 pr-3 ${on ? "line-through text-zinc-500" : "text-zinc-200"}`}>{x.item}</td>
                <td className="py-2 pr-3 text-emerald-300 whitespace-nowrap">{x.qty}</td>
                <td className="py-2 pr-3 text-zinc-400">{x.spec}</td>
                <td className="py-2 text-right text-zinc-300 whitespace-nowrap">{x.cost}</td>
              </tr>);
          })}</tbody>
        </table>
      </div>
      {plan.tools && plan.tools.length > 0 && (
        <div className="mt-5"><h4 className="font-semibold mb-2">🔧 Tools needed</h4>
          <div className="flex flex-wrap gap-2">{plan.tools.map((t) => <span key={t} className="text-xs px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-400/20 text-violet-100">{t}</span>)}</div></div>
      )}
    </section>
  );
}

function Mentor({ plan }: { plan: Plan | null }) {
  const { getChat, setChat, mentorPrompt, setMentorPrompt } = useStore();
  const key = plan?.slug ?? "general";
  const msgs = getChat(key);
  const [input, setInput] = useState(""); const [typing, setTyping] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { if (mentorPrompt) { setInput(mentorPrompt); setMentorPrompt(""); } }, [mentorPrompt, setMentorPrompt]);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [msgs.length, typing]);
  const send = async (e: FormEvent) => {
    e.preventDefault(); const text = input.trim(); if (!text || typing) return;
    const next: ChatMsg[] = [...msgs, { role: "user", text }]; setChat(key, next); setInput(""); setTyping(true);
    try {
      const r = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text, projectTitle: plan?.title, summary: plan?.summary, steps: plan ? allSteps(plan).map((x) => x.title) : [], history: msgs }) });
      const j = await r.json(); setChat(key, [...next, { role: "mentor", text: j.reply }]);
    } catch { setChat(key, [...next, { role: "mentor", text: "I couldn't reach the server — please try again." }]); } finally { setTyping(false); }
  };
  return (
    <section className="glass rounded-3xl p-4 flex flex-col h-[560px]" aria-label="AI Mentor chat">
      <div className="flex justify-between items-center px-2 pb-3 border-b border-white/5">
        <div><h3 className="font-semibold">🤖 AI Mentor</h3><p className="text-xs text-zinc-500">{plan ? `Context: ${plan.title}` : "General questions"}</p></div>
        {msgs.length > 0 && <button onClick={() => setChat(key, [])} className="text-xs text-zinc-500 hover:text-zinc-300">Clear</button>}
      </div>
      <div className="flex-1 overflow-y-auto py-3 space-y-3 px-1" aria-live="polite">
        {msgs.length === 0 && <div className="text-sm text-zinc-500 p-2">Ask anything — “What drill bit do I need?”, “How do I budget this?”, “Is this safe?”</div>}
        {msgs.map((m, i) => (
          <div key={i} className={`pop max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${m.role === "user" ? "ml-auto bg-violet-500/30 text-violet-50 rounded-br-sm" : "bg-white/5 text-zinc-200 rounded-bl-sm"}`}>{m.text}</div>
        ))}
        {typing && <div className="pop bg-white/5 rounded-2xl px-4 py-3 w-16 flex gap-1" aria-label="Mentor is typing">{[0, 1, 2].map((d) => <span key={d} className="h-2 w-2 rounded-full bg-emerald-300 animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />)}</div>}
        <div ref={end} />
      </div>
      <form onSubmit={send} className="flex gap-2 pt-2">
        <label htmlFor="chat" className="sr-only">Message the mentor</label>
        <input id="chat" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask your mentor…" className="input flex-1" />
        <button className="btn-primary px-4" aria-label="Send message">➤</button>
      </form>
    </section>
  );
}

function GalleryPage() {
  const { setPlan } = useStore(); const nav = useNavigate();
  const grads = ["from-violet-500/40 to-emerald-400/20", "from-emerald-500/30 to-sky-400/20", "from-rose-500/30 to-violet-400/20"];
  return (
    <div><h1 className="text-2xl font-bold mb-1">Sample Projects</h1><p className="text-zinc-400 mb-6">Verified built-in guides with full materials lists (work offline). Want more? <NavLink to="/explore" className="text-violet-300 underline">Explore thousands of online projects →</NavLink></p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {PLANS.map((p, i) => (
          <button key={p.slug} onClick={() => { setPlan(p); nav("/"); }} className="card text-left overflow-hidden" aria-label={`Load ${p.title} plan`}>
            <div className={`h-36 bg-gradient-to-br ${grads[i % 3]} grid place-items-center text-6xl`} aria-hidden>{p.emoji}</div>
            <div className="p-4"><div className="font-semibold">{p.title}</div>
              <div className="flex gap-2 mt-2 text-xs"><span className={`px-2 py-0.5 rounded-full ${diffColor(p.difficulty)}`}>{p.difficulty}</span><span className="text-zinc-400">⏱ {p.estimatedTime}</span></div>
              <div className="text-xs text-zinc-500 mt-1">{allSteps(p).length} steps · {(p.materials ?? p.resources).length} materials{p.cost ? ` · ${p.cost}` : ""}</div></div>
          </button>
        ))}
      </div>
    </div>
  );
}

function LearnPage() {
  const { lessonsDone, completeLesson } = useStore();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  return (
    <div><h1 className="text-2xl font-bold mb-1">Education Corner</h1><p className="text-zinc-400 mb-2">Short lessons to level up your building skills.</p>
      <p className="text-sm text-emerald-300 mb-6">{lessonsDone.length} / {LESSONS.length} lessons completed</p>
      <div className="grid lg:grid-cols-2 gap-5">
        {LESSONS.map((l) => {
          const a = answers[l.id]; const correct = a === l.quiz.answer; const done = lessonsDone.includes(l.id);
          return (
            <article key={l.id} className="glass rounded-3xl p-6">
              <div className="flex justify-between"><h2 className="font-semibold text-lg">{l.emoji} {l.title}</h2>{done && <span className="text-xs text-emerald-300">✓ Done</span>}</div>
              <ul className="mt-3 space-y-1 text-sm text-zinc-300">{l.points.map((p) => <li key={p}>• {p}</li>)}</ul>
              <fieldset className="mt-4"><legend className="text-sm font-medium text-violet-200 mb-2">Quiz: {l.quiz.q}</legend>
                <div className="space-y-2">{l.quiz.options.map((o, i) => (
                  <button key={o} onClick={() => { setAnswers({ ...answers, [l.id]: i }); if (i === l.quiz.answer) completeLesson(l.id); }}
                    className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition ${a === i ? (correct ? "border-emerald-400 bg-emerald-400/10" : "border-rose-400 bg-rose-400/10") : "border-white/10 hover:border-violet-400/50"}`}>{o}</button>
                ))}</div>
                {a !== undefined && <p role="status" className={`text-sm mt-2 pop ${correct ? "text-emerald-300" : "text-rose-300"}`}>{correct ? "✅ Correct! " : "❌ Not quite. "}{correct ? l.quiz.explain : "Try again."}</p>}
              </fieldset>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function MentorsPage() {
  const { setMentorPrompt, plan } = useStore(); const nav = useNavigate();
  return (
    <div><h1 className="text-2xl font-bold mb-1">Referees & Mentors</h1><p className="text-zinc-400 mb-6">Expert profiles to guide your build. “Ask a question” opens the AI Mentor with a prefilled prompt.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {REFEREES.map((r) => (
          <div key={r.id} className="card p-5 flex flex-col">
            <div className="flex items-center gap-3"><div className="h-12 w-12 rounded-2xl bg-violet-500/20 grid place-items-center text-2xl" aria-hidden>{r.avatar}</div>
              <div><div className="font-semibold">{r.name}</div><div className="text-xs text-emerald-300">{r.specialty}</div></div></div>
            <p className="text-sm text-zinc-400 mt-3 flex-1">{r.bio}</p>
            <button onClick={() => { setMentorPrompt(`[To ${r.name}] ${r.prompt}`); nav(plan ? "/" : "/ask"); }} className="btn-primary mt-4 py-2">Ask a question</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AskPage() {
  const { plan } = useStore();
  return <div className="max-w-2xl"><h1 className="text-2xl font-bold mb-4">AI Mentor</h1><Mentor plan={plan} /></div>;
}

function SketchPage() {
  const { plan } = useStore();
  return (
    <div><h1 className="text-2xl font-bold mb-1">Sketch your idea in 3D</h1>
      <p className="text-zinc-400 mb-6">{plan ? `Editing the generated model for "${plan.title}". Changes are saved automatically.` : "A blank 3D sketchpad. Generate a plan on the Build tab to get an automatic 3D model."}</p>
      {plan ? <Visualizer key={plan.slug} initial={modelFor(plan)} storageKey={`fm_model_${plan.slug}`} title={plan.title} height={600} defaultQuery={plan.title.split(" ").slice(-1)[0]} /> : <Visualizer storageKey="fm_model_blank" height={600} />}
    </div>
  );
}

function SignInPage() {
  const { session, signIn, signOut } = useStore(); const nav = useNavigate();
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [err, setErr] = useState("");
  if (session) return (
    <div className="glass rounded-3xl p-8 max-w-md"><h1 className="text-xl font-bold">Signed in</h1><p className="text-zinc-400 mt-1">{session.email}</p>
      <div className="flex gap-3 mt-6"><button onClick={() => nav("/dashboard")} className="btn-primary px-4 py-2">Dashboard</button><button onClick={signOut} className="btn-ghost px-4 py-2">Sign out</button></div></div>
  );
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter a valid email.");
    if (pw.length < 6) return setErr("Password must be at least 6 characters.");
    signIn(email); nav("/dashboard");
  };
  return (
    <form onSubmit={submit} className="glass rounded-3xl p-8 max-w-md space-y-4" aria-label="Sign in">
      <h1 className="text-xl font-bold">Sign in to MakerPath</h1><p className="text-sm text-zinc-400">Demo auth — your session is stored only in this browser.</p>
      <div><label htmlFor="email" className="text-sm text-zinc-300">Email</label><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input mt-1" autoComplete="email" /></div>
      <div><label htmlFor="pw" className="text-sm text-zinc-300">Password</label><input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="input mt-1" autoComplete="current-password" /></div>
      {err && <p role="alert" className="text-sm text-rose-300">{err}</p>}
      <button className="btn-primary w-full py-2">Sign in</button>
      <button type="button" onClick={() => nav("/")} className="btn-ghost w-full py-2">Continue as guest</button>
    </form>
  );
}

function DashboardPage() {
  const { session, projects, progress, lessonsDone, activity, setPlan } = useStore(); const nav = useNavigate();
  const totalDone = projects.reduce((n, p) => n + (progress[p.slug] ?? []).filter((id) => allSteps(p).some((s) => s.id === id)).length, 0);
  const stats = [["Projects started", projects.length, "🚀"], ["Steps completed", totalDone, "✅"], ["Lessons finished", lessonsDone.length, "🎓"], ["Day streak", streak(activity), "🔥"]] as const;
  return (
    <div><h1 className="text-2xl font-bold">{session ? `Welcome back, ${session.email.split("@")[0]}` : "Your progress (Guest)"}</h1>
      {!session && <p className="text-sm text-zinc-400 mt-1">Guest mode — progress is saved in this browser. <NavLink to="/signin" className="text-violet-300 underline">Sign in</NavLink> to personalize.</p>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {stats.map(([l, v, e]) => <div key={l} className="glass rounded-3xl p-5"><div className="text-2xl" aria-hidden>{e}</div><div className="text-3xl font-bold mt-2 text-emerald-300">{v}</div><div className="text-sm text-zinc-400">{l}</div></div>)}
      </div>
      <h2 className="font-semibold text-lg mt-8 mb-3">Your projects</h2>
      {projects.length === 0 ? <p className="text-zinc-500">No projects yet. <NavLink to="/" className="text-violet-300 underline">Generate your first plan</NavLink>.</p> : (
        <div className="space-y-3">{projects.map((p) => {
          const st = allSteps(p); const d = (progress[p.slug] ?? []).filter((id) => st.some((s) => s.id === id)).length;
          return (
            <button key={p.slug} onClick={() => { setPlan(p); nav("/"); }} className="card w-full text-left p-4">
              <div className="flex justify-between text-sm mb-2"><span>{p.emoji} {p.title}</span><span className="text-zinc-400">{d}/{st.length}</span></div><Bar pct={(d / st.length) * 100} label={`${p.title} progress`} />
            </button>);
        })}</div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Shell>
          <Routes>
            <Route path="/" element={<BuildPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/sketch" element={<SketchPage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/mentors" element={<MentorsPage />} />
            <Route path="/ask" element={<AskPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="*" element={<BuildPage />} />
          </Routes>
        </Shell>
      </HashRouter>
    </StoreProvider>
  );
}
