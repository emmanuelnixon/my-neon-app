import type { Material, Plan, Step } from "./data";

/**
 * Online project source: Instructables (public search index + public JSON project API).
 * Millions of community projects with real step-by-step instructions and photos.
 * Content belongs to the original authors — we always show the author and link back.
 */
const BASE = "https://www.instructables.com";
const UA = { "User-Agent": "Mozilla/5.0 (compatible; MakerPath/1.0)" };
let keyCache: { key: string; at: number } | null = null;

async function searchKey(force = false): Promise<string> {
  if (!force && keyCache && Date.now() - keyCache.at < 60 * 60 * 1000) return keyCache.key;
  const html = await fetch(`${BASE}/search/?q=diy`, { headers: UA, signal: AbortSignal.timeout(15000) }).then((r) => r.text());
  const m = html.match(/typesenseApiKey\\?"\s*:\s*\\?"([^"\\]+)/);
  if (!m) throw new Error("search key not found");
  keyCache = { key: m[1], at: Date.now() };
  return m[1];
}

export type OnlineHit = { id: string; title: string; image?: string; category?: string; channel?: string; views?: number; author?: string; url: string };
export const CATEGORIES = ["Workshop", "Circuits", "Outside", "Living", "Craft", "Cooking", "Design", "Teachers"] as const;

export async function searchOnline(q: string, opts: { category?: string; page?: number; perPage?: number } = {}): Promise<{ found: number; hits: OnlineHit[] }> {
  const params = new URLSearchParams({
    q: q.trim() || "*", query_by: "title,stepBody,screenName", page: String(opts.page ?? 1), per_page: String(opts.perPage ?? 24),
    include_fields: "title,urlString,coverImageUrl,category,channel,views,screenName",
    sort_by: q.trim() ? "_text_match:desc,views:desc" : "views:desc",
  });
  if (opts.category) params.set("filter_by", `category:=${opts.category}`);
  const run = async (force: boolean) => {
    const key = await searchKey(force);
    return fetch(`${BASE}/api_proxy/search/collections/projects/documents/search?${params}`, { headers: { ...UA, "x-typesense-api-key": key }, signal: AbortSignal.timeout(15000) });
  };
  let r = await run(false);
  if (r.status === 401 || r.status === 403) r = await run(true);
  if (!r.ok) throw new Error("search failed " + r.status);
  const j = await r.json();
  type Doc = { title: string; urlString: string; coverImageUrl?: string; category?: string[]; channel?: string[]; views?: number; screenName?: string };
  return {
    found: j.found ?? 0,
    hits: (j.hits ?? []).map((h: { document: Doc }) => ({
      id: h.document.urlString, title: h.document.title.trim(), image: h.document.coverImageUrl, category: h.document.category?.[0], channel: h.document.channel?.[0],
      views: h.document.views, author: h.document.screenName, url: `${BASE}/${h.document.urlString}/`,
    })),
  };
}

const decode = (s: string) => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&rsquo;|&lsquo;/g, "'").replace(/&ldquo;|&rdquo;/g, '"').replace(/&deg;/g, "°").replace(/&frac12;/g, "½").replace(/&times;/g, "×").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
export function htmlToText(html: string): string {
  return decode(
    html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<br\s*\/?>/gi, "\n").replace(/<li[^>]*>/gi, "\n• ").replace(/<\/(p|div|h\d|ul|ol|pre)>/gi, "\n").replace(/<[^>]+>/g, ""),
  ).replace(/[ \t]+/g, " ").replace(/\n\s*\n\s*\n+/g, "\n\n").replace(/^\s+|\s+$/g, "");
}
const listItems = (html: string) => [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => htmlToText(m[1])).filter((x) => x && x.length < 200);

const TOOL_RE = /\b(drill|saw|hammer|screwdriver|soldering|solder iron|iron|pliers|wrench|clamp|sander|glue gun|router|chisel|file|multimeter|knife|scissors|tape measure|ruler|square|level|printer|laser|cutter|grinder|welder|lathe|computer|laptop|pc|vise|stapler|heat gun|dremel|rotary tool|marker|pencil|brush|gloves|goggles|glasses|mask)\b/i;
const COMPLEX_RE = /\b(solder|weld|wiring|wire up|code|program|firmware|epoxy|resin|router|lathe|mortise|calibrat|voltage|circuit|cnc|3d print|upload)\b/i;
const SUPPLY_RE = /suppl|material|what you('| wi)?ll need|you will need|parts|tools|ingredients|bill of|bom|components|things you need|requirements|gather/i;

const MAT_NOUNS = "pvc|pipe|pipes|tube|tubing|drum|barrel|bucket|container|tank|plywood|board|boards|lumber|wood|2x4|2x6|4x4|dowel|screws?|bolts?|nuts?|washers?|nails?|hinges?|brackets?|glue|epoxy|tape|wire|cable|sheet|panel|motor|motors|battery|batteries|arduino|esp32|raspberry pi|leds|led strip|resistors?|capacitors?|switch|sensor|servo|hose|valve|fittings?|elbow|tee|cap|caps|coupling|clamp|clamps|paint|stain|varnish|concrete|cement|gravel|sand|bricks?|blocks?|fabric|foam|plastic|acrylic|aluminum|steel|metal|chain|rope|string|wheels?|bearing|bearings|spring|magnets?|solar panel|charge controller|mesh|wire mesh|chicken wire|roofing|shingles|tarp|silicone|caulk|plexiglass|glass|jar|bottle|bottles|cardboard|paper|resin|filament";
const MAT_RE = new RegExp(`((?:\\d+(?:[./-]\\d+)?\\s*(?:-|\\s)?(?:inch|in|"|'|ft|foot|feet|mm|cm|m|gallon|gal|liter|l|lb|oz|v|volt|w|watt|awg|x\\d+)?\\s*(?:x\\s*\\d+[\\d./]*\\s*(?:"|in|ft|')?)?\\s*)?(?:[a-z-]+\\s){0,2}(?:${MAT_NOUNS}))\\b`, "gi");
function extractMaterials(texts: string[]): Material[] {
  const seen = new Map<string, Material>();
  texts.forEach((t, i) => {
    for (const m of t.matchAll(MAT_RE)) {
      let item = m[1].replace(/^(the|a|an|some|my|of|and|with|to|into|this|that|these|two|three)\s+/i, "").trim();
      item = item.replace(/^(the|a|an|some|my|of|and|with|to|into|this|that)\s+/i, "").trim();
      if (item.length < 3 || item.length > 60) continue;
      const key = item.toLowerCase().replace(/s$/, "");
      if (!seen.has(key)) seen.set(key, { item: item.charAt(0).toUpperCase() + item.slice(1), qty: /^\d/.test(item) ? "see step" : "as needed", spec: i === 0 ? "mentioned in intro" : `used in step ${i}` });
    }
  });
  const list = [...seen.values()];
  const sized = list.filter((x) => /\d/.test(x.item));
  return [...sized, ...list.filter((x) => !/\d/.test(x.item))].slice(0, 25);
}
function extractTools(text: string): string[] {
  const all = text.match(new RegExp(TOOL_RE.source, "gi")) ?? [];
  const uniq = [...new Set(all.map((x) => x.toLowerCase()))].filter((x) => !["file", "iron", "square", "level", "marker", "brush"].includes(x) || all.length < 30);
  return uniq.slice(0, 15).map((x) => x.charAt(0).toUpperCase() + x.slice(1));
}

function parseQty(s: string): Material {
  const m = s.match(/^\s*(\(?\d+[\d./]*\)?\s*(x|×|pcs?|pieces?)?)\s+(.*)$/i);
  const item = (m ? m[3] : s).replace(/\s*-\s*\$.*$/, "").trim();
  const cost = s.match(/\$\s?\d+[\d.,]*/)?.[0];
  return { item, qty: m ? m[1].replace(/[()]/g, "").trim() : "1", cost };
}

export async function fetchOnlineProject(urlString: string): Promise<Plan & { images: Record<string, string[]>; sourceUrl: string; author?: string; views?: number }> {
  const clean = urlString.replace(/^https?:\/\/(www\.)?instructables\.com\//, "").replace(/\/.*$/, "");
  const r = await fetch(`${BASE}/json-api/showInstructableModel?urlString=${encodeURIComponent(clean)}`, { headers: UA, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error("project fetch failed");
  const j = await r.json();
  if (j.error || !Array.isArray(j.steps)) throw new Error("project not found");
  type RawStep = { title: string; body: string; wordCount?: number; files?: { image?: boolean; downloadUrl?: string }[] };
  const raw: RawStep[] = j.steps;
  const intro = raw[0];
  const supplyStep = raw.find((st, i) => i <= 3 && SUPPLY_RE.test(st.title)) ?? (raw[0] && listItems(raw[0].body).length >= 3 ? raw[0] : undefined);
  let supplies = supplyStep ? listItems(supplyStep.body) : [];
  if (!supplies.length && intro) { const after = intro.body.split(/<h\d[^>]*>\s*(supplies|materials|you will need)/i)[2]; if (after) supplies = listItems(after); }
  let tools = supplies.filter((x) => TOOL_RE.test(x) && x.length < 80);
  let materials = supplies.filter((x) => !tools.includes(x)).map(parseQty);
  if (!materials.length) materials = extractMaterials(raw.map((x) => htmlToText(x.body || "")));
  if (!tools.length) tools = extractTools(raw.map((x) => htmlToText(x.body || "")).join(" "));

  const images: Record<string, string[]> = {};
  const steps: Step[] = raw.slice(1).filter((st) => st !== supplyStep || raw.length < 4).map((st, i) => {
    const id = `on${i + 1}`;
    const text = htmlToText(st.body || "");
    images[id] = (st.files ?? []).filter((f) => f.image && f.downloadUrl).slice(0, 4).map((f) => f.downloadUrl! + "?auto=webp&fit=bounds&width=640");
    const sentences = text.split(/(?<=[.!?])\s+/);
    const tip = sentences.find((x) => /\b(tip|note|make sure|be careful|important|don't|do not|avoid)\b/i.test(x)) ?? "";
    return {
      id, title: (st.title || `Step ${i + 1}`).replace(/^step\s*\d+[:.)-]?\s*/i, "").trim() || `Step ${i + 1}`,
      description: text || "(This step is shown in the photos — open the original for details.)",
      isComplex: (st.wordCount ?? text.split(/\s+/).length) > 220 || COMPLEX_RE.test(text),
      resources: (st.files ?? []).some((f) => f.image) ? ["See step photos"] : [], tips: tip.length < 300 ? tip : "",
    };
  });
  // Group steps into phases of ~5 for readability
  const size = steps.length > 12 ? 5 : steps.length > 6 ? 4 : steps.length || 1;
  const phaseNames = ["Getting Started", "Main Build", "Assembly", "Finishing", "Final Touches", "Extras", "Bonus"];
  const phases = [];
  for (let i = 0; i < steps.length; i += size) phases.push({ name: `${phaseNames[phases.length] ?? "Part " + (phases.length + 1)} (steps ${i + 1}–${Math.min(i + size, steps.length)})`, steps: steps.slice(i, i + size) });
  if (!phases.length) phases.push({ name: "Overview", steps: [{ id: "on1", title: "Follow the original guide", description: htmlToText(intro?.body ?? ""), isComplex: false, resources: [], tips: "" }] });

  const title = String(j.title).trim();
  const n = steps.length;
  const summary = htmlToText(intro?.body ?? "").slice(0, 600) || title;
  const allText = raw.map((x) => x.body).join(" ");
  const difficulty = COMPLEX_RE.test(allText) && n > 8 ? "Advanced" : n > 8 || COMPLEX_RE.test(allText) ? "Intermediate" : "Beginner";
  const sourceUrl = `${BASE}/${clean}/`;
  return {
    slug: "web-" + clean.toLowerCase().slice(0, 60), title, emoji: "🌐", summary, difficulty,
    estimatedTime: n <= 5 ? "1–3 hours" : n <= 10 ? "Half a day – 1 day" : n <= 18 ? "1–2 weekends" : "Several weekends",
    phases, materials: materials.length ? materials : undefined, tools: tools.length ? tools : undefined,
    resources: [...materials.map((x) => `${x.qty} × ${x.item}`), ...tools],
    safety: COMPLEX_RE.test(allText) ? ["Read every step fully before starting, and wear eye protection when cutting, drilling or soldering.", "Follow the tool manufacturer's safety instructions. Students should work with adult supervision."] : ["Read every step fully before starting. Students should work with adult supervision for cutting tools."],
    risks: [
      { risk: "Missing a detail shown only in photos", mitigation: "Open each step's photos and the original guide link." },
      { risk: "Different material sizes than the author used", mitigation: "Measure your actual parts and adjust dimensions before cutting." },
      { risk: "Injury from tools", mitigation: "Clamp workpieces, wear safety glasses, work slowly." },
    ],
    videos: [
      { title: `${title} — video tutorials`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(title + " diy")}` },
      { title: `How to ${title.toLowerCase()} (beginner)`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent("how to " + title + " beginner")}` },
      { title: "Original guide on Instructables", url: sourceUrl },
    ],
    source: "online", images, sourceUrl, author: j.author?.screenName, views: j.views,
  };
}
