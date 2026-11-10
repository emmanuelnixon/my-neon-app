import type { Plan, Shape } from "./data";
import { OFFLINE_LIBRARY, searchModels } from "./library";

const b = (pos: Shape["pos"], scale: Shape["scale"], color: string, label: string, rot?: Shape["rot"]): Shape => ({ kind: "box", pos, scale, color, label, rot });
const c = (pos: Shape["pos"], scale: Shape["scale"], color: string, label: string, rot?: Shape["rot"]): Shape => ({ kind: "cylinder", pos, scale, color, label, rot });
const sp = (pos: Shape["pos"], scale: Shape["scale"], color: string, label: string): Shape => ({ kind: "sphere", pos, scale, color, label });
const cn = (pos: Shape["pos"], scale: Shape["scale"], color: string, label: string, rot?: Shape["rot"]): Shape => ({ kind: "cone", pos, scale, color, label, rot });
const WOOD = "#c08a5a", DARK = "#3f3f46", ROOF = "#8b5a3c";

const house = (wall = "#e7d3b5"): Shape[] => [
  b([0, 0.05, 0], [5, 0.1, 4], "#4d7c0f", "Ground"),
  b([0, 1.1, 0], [3, 2, 2.5], wall, "Walls"),
  b([-0.8, 2.75, 0], [1.9, 0.12, 2.9], ROOF, "Roof left", [0, 0, 0.6]),
  b([0.8, 2.75, 0], [1.9, 0.12, 2.9], ROOF, "Roof right", [0, 0, -0.6]),
  b([0, 0.65, 1.26], [0.6, 1.1, 0.05], "#7c4a2d", "Door"),
  b([0.9, 1.3, 1.26], [0.5, 0.5, 0.05], "#93c5fd", "Window"),
];

export const MODELS: Record<string, Shape[]> = {
  birdhouse: [
    c([0, 1.5, 0], [0.15, 3, 0.15], DARK, "Mounting pole"),
    b([0, 3.6, 0], [1.2, 1.4, 1.2], WOOD, "Body (front/back/sides)"),
    b([0, 2.9, 0], [1.3, 0.08, 1.3], "#a87444", "Floor"),
    b([-0.38, 4.5, 0], [0.95, 0.08, 1.5], ROOF, "Roof left", [0, 0, 0.7]),
    b([0.38, 4.5, 0], [0.95, 0.08, 1.5], ROOF, "Roof right", [0, 0, -0.7]),
    c([0, 3.85, 0.61], [0.35, 0.03, 0.35], "#1c1917", "Entrance hole", [Math.PI / 2, 0, 0]),
    c([0, 3.45, 0.75], [0.04, 0.3, 0.04], "#78350f", "Perch", [Math.PI / 2, 0, 0]),
  ],
  podcast: [
    b([0, 1, 0], [3.5, 0.12, 1.8], WOOD, "Desk"),
    c([-1.5, 0.5, -0.7], [0.08, 1, 0.08], DARK, "Desk leg"), c([1.5, 0.5, -0.7], [0.08, 1, 0.08], DARK, "Desk leg"),
    c([-1.5, 0.5, 0.7], [0.08, 1, 0.08], DARK, "Desk leg"), c([1.5, 0.5, 0.7], [0.08, 1, 0.08], DARK, "Desk leg"),
    c([0, 1.1, 0.2], [0.35, 0.06, 0.35], "#27272a", "Mic base"),
    c([0, 1.55, 0.2], [0.05, 0.9, 0.05], "#52525b", "Mic stand"),
    c([0, 2.15, 0.2], [0.22, 0.6, 0.22], "#18181b", "Dynamic mic"),
    sp([0, 2.5, 0.2], [0.24, 0.24, 0.24], "#a1a1aa", "Mic grille"),
    b([1, 1.45, -0.4], [1.2, 0.8, 0.06], "#1e1b4b", "Laptop screen", [-0.2, 0, 0]),
    sp([-0.9, 1.25, 0.1], [0.25, 0.12, 0.25], "#a78bfa", "Headphones"),
  ],
  "mobile-game": [
    b([0, 2, 0], [1.6, 3.2, 0.15], "#18181b", "Phone body"),
    b([0, 2, 0.08], [1.45, 2.9, 0.02], "#1e3a8a", "Screen"),
    b([0, 1.0, 0.1], [1.4, 0.15, 0.02], "#22c55e", "Ground platform"),
    b([-0.3, 1.25, 0.12], [0.25, 0.3, 0.02], "#fbbf24", "Player"),
    b([0.45, 1.2, 0.12], [0.15, 0.25, 0.02], "#ef4444", "Obstacle"),
    sp([0.4, 3.1, 0.12], [0.12, 0.12, 0.02], "#fde047", "Coin"),
  ],
  "garden-bed": [
    b([0, 0.4, 1.5], [6, 0.8, 0.2], WOOD, "Long side board"), b([0, 0.4, -1.5], [6, 0.8, 0.2], WOOD, "Long side board"),
    b([3, 0.4, 0], [0.2, 0.8, 3.2], WOOD, "End board"), b([-3, 0.4, 0], [0.2, 0.8, 3.2], WOOD, "End board"),
    b([0, 0.7, 0], [5.8, 0.1, 2.8], "#3f2a1d", "Soil"),
    sp([-1.8, 1.1, 0.5], [0.5, 0.5, 0.5], "#16a34a", "Plant"), sp([0, 1.1, -0.5], [0.5, 0.5, 0.5], "#22c55e", "Plant"),
    sp([1.8, 1.1, 0.5], [0.5, 0.5, 0.5], "#15803d", "Plant"),
  ],
  "portfolio-site": [
    b([0, 0.05, 0.4], [3, 0.1, 2], "#a1a1aa", "Laptop base"),
    b([0, 1.05, -0.6], [3, 1.9, 0.08], "#3f3f46", "Laptop lid"),
    b([0, 1.05, -0.55], [2.8, 1.7, 0.02], "#111827", "Screen"),
    b([0, 1.65, -0.53], [2.6, 0.25, 0.02], "#8b5cf6", "Header/nav"),
    b([-0.7, 1.0, -0.53], [1.1, 0.7, 0.02], "#6ee7b7", "Project card"),
    b([0.7, 1.0, -0.53], [1.1, 0.7, 0.02], "#f9a8d4", "Project card"),
  ],
  "led-lamp": [
    c([0, 0.15, 0], [1.2, 0.3, 1.2], "#27272a", "Base (Arduino inside)"),
    sp([0.5, 0.32, 0.5], [0.12, 0.05, 0.12], "#6ee7b7", "Touch sensor"),
    c([0, 1.5, 0], [0.08, 2.5, 0.08], "#a1a1aa", "Arm"),
    c([0.6, 2.75, 0], [0.06, 1.3, 0.06], "#a1a1aa", "Upper arm", [0, 0, Math.PI / 2.5]),
    cn([1.2, 2.6, 0], [0.7, 0.8, 0.7], "#a78bfa", "Shade"),
    sp([1.2, 2.3, 0], [0.3, 0.15, 0.3], "#fef3c7", "LED diffuser"),
  ],
};

export function genericModel(idea: string): Shape[] {
  const q = idea.toLowerCase();
  const stop = new Set(["build", "make", "a", "an", "the", "my", "own", "diy", "create", "for", "of", "to", "launch", "design"]);
  const hit = searchModels(q.split(/\W+/).filter((w) => w && !stop.has(w)).join(" "), "offline")[0];
  if (hit && hit.source === "offline") return hit.shapes;
  if (/house|shed|cabin|treehouse|dog ?house|kennel|home/.test(q)) {
    const m = house(/tree/.test(q) ? WOOD : undefined);
    if (/tree/.test(q)) return [c([0, 1.5, 0], [0.5, 3, 0.5], "#78350f", "Tree trunk"), sp([0, 6.5, 0], [3, 2, 3], "#166534", "Canopy"), ...m.slice(1).map((s) => ({ ...s, pos: [s.pos[0], s.pos[1] + 3, s.pos[2]] as Shape["pos"] })), b([0, 3, 0], [3.4, 0.12, 2.9], WOOD, "Platform")];
    return m;
  }
  if (/table|desk|bench|workbench/.test(q)) return [b([0, 1.5, 0], [4, 0.15, 2], WOOD, "Tabletop"), ...[[-1.8, -0.8], [1.8, -0.8], [-1.8, 0.8], [1.8, 0.8]].map(([x, z]) => b([x, 0.72, z], [0.15, 1.45, 0.15], "#8b5a3c", "Leg"))];
  if (/chair|stool|seat/.test(q)) return [b([0, 1, 0], [1.4, 0.12, 1.4], WOOD, "Seat"), b([0, 1.8, -0.65], [1.4, 1.5, 0.1], WOOD, "Backrest"), ...[[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].map(([x, z]) => b([x, 0.5, z], [0.1, 1, 0.1], "#8b5a3c", "Leg"))];
  if (/shelf|bookcase|cabinet/.test(q)) return [b([-1, 1.5, 0], [0.1, 3, 1], WOOD, "Side"), b([1, 1.5, 0], [0.1, 3, 1], WOOD, "Side"), ...[0.05, 1, 2, 2.95].map((y) => b([0, y, 0], [2.1, 0.08, 1], "#a87444", "Shelf"))];
  if (/robot|drone|car|rover|vehicle/.test(q)) return [b([0, 0.8, 0], [2, 0.6, 1.2], "#a78bfa", "Chassis"), ...[[-0.8, 0.65], [0.8, 0.65], [-0.8, -0.65], [0.8, -0.65]].map(([x, z]) => c([x, 0.4, z], [0.4, 0.15, 0.4], DARK, "Wheel", [Math.PI / 2, 0, 0])), b([0, 1.4, 0], [0.8, 0.6, 0.8], "#6ee7b7", "Sensor head"), sp([0.3, 1.5, 0.41], [0.1, 0.1, 0.05], "#fef08a", "Eye")];
  if (/app|website|software|saas|platform|game/.test(q)) return MODELS["portfolio-site"];
  if (/box|planter|crate|container/.test(q)) return [b([0, 0.6, 0], [2, 1.2, 1.4], WOOD, "Box body"), b([0, 1.25, 0], [2.1, 0.08, 1.5], "#a87444", "Lid")];
  return [c([0, 0.25, 0], [1.6, 0.5, 1.6], "#3f3f46", "Pedestal"), b([0, 1.2, 0], [1.2, 1.4, 1.2], "#a78bfa", "Main body"), sp([0, 2.3, 0], [0.6, 0.6, 0.6], "#6ee7b7", "Top feature"), c([0.9, 1.2, 0], [0.12, 1, 0.12], "#f9a8d4", "Attachment", [0, 0, Math.PI / 2])];
}

const LIB_FOR: Record<string, string> = { drone: "drone", shed: "house", "wind-turbine": "turbine", boat: "boat", "water-rocket": "rocket", "rc-car": "rover", "water-pump": "pump", charcoal: "charcoal-retort", "fuel-briquettes": "briquette-press", "solar-charger": "solar-charger", "compost-bin": "compost", birdhouse: "birdhouse-lib", podcast: "podcast-setup", "mobile-game": "phone-game", "portfolio-site": "laptop", "led-lamp": "lamp" };
export const modelFor = (p: Plan): Shape[] => p.model ?? OFFLINE_LIBRARY.find((m) => m.id === LIB_FOR[p.slug])?.shapes ?? MODELS[p.slug] ?? genericModel(p.title);

/** Simplified steps: short action + one short sentence. */
export function simpleSteps(p: Plan) {
  return p.phases.flatMap((ph) => ph.steps.map((s) => ({ id: s.id, phase: ph.name, title: s.title, short: s.description.split(/(?<=[.!?])\s/)[0] })));
}
