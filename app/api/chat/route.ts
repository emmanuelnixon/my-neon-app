import { NextResponse } from "next/server";
import { aiChat } from "@/lib/ai";

const RULES: [RegExp, string][] = [
  [/drill bit|pilot|screw/, "For pilot holes in softwood like cedar, use a bit about 2/3 the screw's shank diameter — for #8 screws that's a 3/32\" bit. For entrance holes, a spade bit or hole saw matching the size is ideal. Drill from both sides to avoid tear-out."],
  [/wood|lumber|cedar|plywood/, "For outdoor builds, cedar or redwood naturally resist rot. For indoor projects, pine is cheap and forgiving, and birch plywood is stable for flat panels. Avoid pressure-treated lumber for anything touching food, animals, or kids."],
  [/mic|microphone|audio|record/, "For home podcasting, a USB dynamic mic is the best value: it rejects room noise. Speak 2–4 inches away, slightly off-axis, and record in a small, soft-furnished room. Gear matters less than room and technique."],
  [/scope|feature|too big|overwhelm/, "Cut your idea to the smallest version that still delivers the core value. Write every extra feature on a 'v2 list' — that way nothing is lost, but nothing blocks shipping. Finish one phase before starting the next."],
  [/budget|cost|price|money|cheap/, "Make a materials list with quantity × unit price, then add a 10–20% buffer. Borrow or rent one-off tools, and buy consumables in the quantity you need. Track actual spend in a simple spreadsheet."],
  [/time|schedule|deadline|how long/, "Estimate each step in hours, sum per phase, then multiply by 1.5 — first-time builds always take longer. Block regular sessions on your calendar and protect your streak."],
  [/led|arduino|power|solder|circuit|electr/, "For WS2812B LEDs: budget ~60mA per LED at full white, use a 5V supply with headroom, add a 1000µF capacitor across power and a 330Ω resistor on the data line, and always share ground. Cap brightness in code."],
  [/game|godot|unity|sprite|code|program/, "Start with the core loop only — one mechanic that's fun in 30 seconds. In Godot, use CharacterBody2D for the player, Timers for spawning, and object pooling for performance. Playtest weekly on a real device."],
  [/3d|sketch|model|shape/, "Block your idea with primitives in the 3D sketchpad: boxes for panels and bodies, cylinders for legs/posts, spheres for knobs. Keep real proportions, then rotate to check every angle before building."],
  [/safe|danger|injur|glasses/, "Wear eye protection when cutting, drilling, or soldering. Clamp work pieces, keep blades sharp, and keep hands at least 6\" from cutting edges. Work in a ventilated area with paint, finish, or solder."],
  [/test|prototype|feedback/, "Test the roughest version first. Define what success means, observe without explaining, and change one variable at a time. Write down every issue, then fix the top three by impact."],
  [/start|begin|first step|where/, "Begin by reading the entire plan, then gather every resource listed for Phase 1. Check off steps as you go — the progress bar keeps you motivated. Ask me about any step that feels unclear!"],
  [/propeller|prop|motor|betaflight|esc|lipo/, "Drone basics: motors spin in 'props in' or 'props out' configuration — check in Betaflight's Motors tab with PROPS OFF. The thick, curved leading edge of each prop faces the direction of rotation. Charge LiPos at 1C, store at 3.8 V/cell, and land at ~3.6 V/cell."],
  [/rafter|roof|shingle|stud|frame|foundation|skid/, "Framing rules of thumb: studs and joists 16\" on center, rafters 24\" on center. Check square by measuring diagonals — equal = square. For a 6/12 roof, rise 6\" per 12\" of run (26.5°). Shingles: starter strip first, 4 nails per shingle, offset each course 6\"."],
  [/blade|turbine|wind|generator/, "For a small wind turbine: blades from 8\" PVC pipe, ~24\" long, tapered from 3\" at the root to 1.5\" at the tip. Balance the rotor until it stays still in any position. Always connect battery → charge controller before connecting the turbine, and use a 20 A fuse near the battery."],
  [/epoxy|fiberglass|hull|boat|leak/, "Epoxy tips: mix exact ratio in small batches, thicken with silica for glue or wood flour for fillets. Lay fiberglass tape onto still-tacky fillets and wet out until clear. Always wear nitrile gloves. Test float in shallow water with a life jacket."],
  [/water rocket|bottle|psi|launch/, "Water rocket: fill 1/3 with water, max 60 psi for a 2 L carbonated bottle, add 50–100 g of clay in the nose for stability, and keep everyone 10 m back. Do a swing test — it should fly nose-first."],
  [/pump|valve|piston|well/, "Hand pump: both check valves must point UP. If it won't prime, pour a cup of water down the piston to wet the seals and make sure the O-ring seal is snug. The foot valve should sit 20–30 cm above the bottom of the source."],
  [/charcoal|biochar|retort|kiln/, "Charcoal: only untreated, dry hardwood; one 3–4 mm vent hole in the lid. It's done when the flame jet from the hole dies out. Plug the hole and let it cool completely (overnight) before opening, or it will ignite."],
  [/briquette|fuel|sawdust|pulp/, "Briquettes: soak paper 2–3 days, mash to pulp, mix 1 part pulp to 1–2 parts sawdust/charcoal dust, press in a perforated mold with a lever (longer lever = denser), then sun-dry 1–2 weeks until hard all the way through."],
  [/hi|hello|hey/, "Hey there! I'm your MakerPath mentor. Ask me about tools, materials, techniques, budget, timeline, or any step in your plan."],
];

export async function POST(req: Request) {
  const { message, projectTitle, summary, steps, history } = (await req.json().catch(() => ({}))) as { message?: string; projectTitle?: string; summary?: string; steps?: string[]; history?: { role: string; text: string }[] };
  if (message) {
    const ai = await aiChat(message, { title: projectTitle, summary, steps }, history ?? []);
    if (ai) return NextResponse.json({ reply: ai, source: "ai" });
  }
  const q = (message ?? "").toLowerCase();
  await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));
  const hit = RULES.find(([re]) => re.test(q));
  const ctx = projectTitle ? ` For "${projectTitle}", ` : " ";
  const reply = hit
    ? hit[1] + (projectTitle ? `\n\nTip for "${projectTitle}": check the complex-step badges in your plan — those deserve extra prep.` : "")
    : `(Offline mentor) Great question!${ctx}I'd break it down like this: 1) identify exactly what's blocking you, 2) look at the step's listed resources and tips, 3) try the smallest experiment that answers the question. Try asking me about tools, materials, budget, timeline, safety, or testing for more specific guidance.`;
  return NextResponse.json({ reply, source: "offline" });
}
