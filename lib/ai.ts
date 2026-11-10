import type { Plan } from "./data";

const KEY = () => process.env.OPENAI_API_KEY;
const MODEL = () => process.env.OPENAI_MODEL || "gpt-4o-mini";
export const aiEnabled = () => !!KEY();

async function chat(messages: { role: string; content: string }[], json: boolean, maxTokens = 6000): Promise<string | null> {
  if (!KEY()) return null;
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY()}` },
      body: JSON.stringify({ model: MODEL(), messages, temperature: 0.4, max_tokens: maxTokens, ...(json ? { response_format: { type: "json_object" } } : {}) }),
      signal: AbortSignal.timeout(60000),
    });
    if (!r.ok) return null;
    const j = await r.json();
    return j.choices?.[0]?.message?.content ?? null;
  } catch { return null; }
}

const PLAN_PROMPT = `You are an expert maker, engineer and shop teacher. Write a REAL, followable build guide that a student or adult with NO professional experience can complete safely.
Return ONLY JSON matching:
{"title":string,"emoji":string,"summary":string (3-4 sentences),"difficulty":"Beginner"|"Intermediate"|"Advanced","estimatedTime":string,"cost":string (USD range),
"materials":[{"item":string (exact spec/size),"qty":string,"spec":string,"cost":string}] (EVERY material, 8-20 items, exact sizes and quantities),
"tools":[string] (every tool),
"safety":[string] (3-5 concrete safety rules incl. legal/permit notes if relevant),
"phases":[{"name":string,"steps":[{"title":string,"description":string (specific: measurements, settings, order of operations, how to check it's right),"isComplex":boolean,"resources":[string],"tips":string}]}] (4-5 phases, 10-18 steps total, simple to complex),
"risks":[{"risk":string,"mitigation":string}] (3-5),
"videoQueries":[string] (3 YouTube search queries)}
Use real measurements, real part names and real techniques. No placeholders.`;

export async function aiPlan(idea: string): Promise<Plan | null> {
  const out = await chat([{ role: "system", content: PLAN_PROMPT }, { role: "user", content: `Project: ${idea}` }], true);
  if (!out) return null;
  try {
    const j = JSON.parse(out);
    if (!Array.isArray(j.phases) || !j.phases.length) return null;
    let n = 0;
    const phases = j.phases.map((ph: { name: string; steps: { title: string; description: string; isComplex?: boolean; resources?: string[]; tips?: string }[] }) => ({
      name: String(ph.name),
      steps: (ph.steps ?? []).map((st) => ({ id: `ai${++n}`, title: String(st.title), description: String(st.description), isComplex: !!st.isComplex, resources: Array.isArray(st.resources) ? st.resources.map(String) : [], tips: String(st.tips ?? "") })),
    }));
    const materials = Array.isArray(j.materials) ? j.materials.map((x: Record<string, unknown>) => ({ item: String(x.item ?? ""), qty: String(x.qty ?? ""), spec: x.spec ? String(x.spec) : undefined, cost: x.cost ? String(x.cost) : undefined })) : [];
    const tools: string[] = Array.isArray(j.tools) ? j.tools.map(String) : [];
    return {
      slug: "ai-" + idea.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40),
      title: String(j.title || idea), emoji: String(j.emoji || "🛠️"), summary: String(j.summary || ""),
      difficulty: ["Beginner", "Intermediate", "Advanced"].includes(j.difficulty) ? j.difficulty : "Intermediate",
      estimatedTime: String(j.estimatedTime || ""), cost: j.cost ? String(j.cost) : undefined,
      phases, materials, tools, safety: Array.isArray(j.safety) ? j.safety.map(String) : [],
      resources: [...materials.map((x: { qty: string; item: string }) => `${x.qty} × ${x.item}`), ...tools],
      risks: Array.isArray(j.risks) ? j.risks.map((r: Record<string, unknown>) => ({ risk: String(r.risk), mitigation: String(r.mitigation) })) : [],
      videos: (Array.isArray(j.videoQueries) ? j.videoQueries : [idea]).slice(0, 4).map((q: string) => ({ title: String(q), url: `https://www.youtube.com/results?search_query=${encodeURIComponent(String(q))}` })),
      source: "ai",
    };
  } catch { return null; }
}

export async function aiChat(message: string, plan?: { title?: string; summary?: string; steps?: string[] }, history: { role: string; text: string }[] = []) {
  const sys = `You are MakerPath's friendly build mentor — an experienced maker and teacher. Give practical, specific, safe answers (exact sizes, part names, settings). Keep answers under 180 words, use short bullet points when helpful.${plan?.title ? `\nThe user is building: "${plan.title}". ${plan.summary ?? ""}\nSteps: ${(plan.steps ?? []).slice(0, 25).join("; ")}` : ""}`;
  const msgs = [{ role: "system", content: sys }, ...history.slice(-8).map((h) => ({ role: h.role === "user" ? "user" : "assistant", content: h.text })), { role: "user", content: message }];
  return chat(msgs, false, 600);
}
