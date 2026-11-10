import type { Shape, ShapeKind } from "./data";

type V = [number, number, number];
const P = (kind: ShapeKind, pos: V, scale: V, color: string, label: string, rot?: V, metal = 0, rough = 0.6): Shape => ({ kind, pos, scale, color, label, rot, metal, rough });
const WOOD = "#b5835a", DWOOD = "#7a4f32", METAL = "#9ca3af", BLACK = "#1f1f23", WHITE = "#f4f4f5";
const H = Math.PI / 2;
const legs4 = (w: number, d: number, h: number, t: number, color: string, metal = 0): Shape[] =>
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z]) => P("box", [x * w, h / 2, z * d], [t, h, t], color, "Leg", undefined, metal));
const wheel = (pos: V, r: number, w: number, label = "Wheel"): Shape[] => [
  P("cylinder", pos, [r * 2, w, r * 2], BLACK, label, [H, 0, 0], 0, 0.9),
  P("cylinder", [pos[0], pos[1], pos[2] + (pos[2] > 0 ? w / 2 : -w / 2)], [r * 1.1, 0.02, r * 1.1], METAL, "Hub cap", [H, 0, 0], 0.9, 0.3),
];

export type LibModel = { id: string; name: string; category: string; tags: string[]; source: "offline"; shapes: Shape[]; pro?: boolean };
export type OnlineModel = { id: string; name: string; category: string; tags: string[]; source: "online"; url: string; credit: string; pro: true };

export const OFFLINE_LIBRARY: LibModel[] = [
  { id: "turbine", name: "Wind Turbine", category: "Energy", tags: ["turbine", "wind", "generator", "energy", "windmill"], source: "offline", shapes: [
    P("cylinder", [0, 3, 0], [0.18, 6, 0.18], METAL, "Mast", undefined, 0.8, 0.3),
    P("box", [0, 6.15, -0.2], [0.35, 0.3, 1.4], "#52525b", "Body tube", undefined, 0.7, 0.3),
    P("cylinder", [0, 6.25, 0.55], [0.6, 0.8, 0.6], "#27272a", "Generator (DC motor)", [H, 0, 0], 0.6, 0.3),
    P("cone", [0, 6.25, 1.05], [0.35, 0.35, 0.35], "#e4e4e7", "Hub / nose", [H, 0, 0], 0.5, 0.3),
    ...[0, 1, 2].map((i) => { const a = (i * 2 * Math.PI) / 3; return P("box", [Math.sin(a) * 1.15, 6.25 + Math.cos(a) * 1.15, 1.0], [0.28, 2.2, 0.04], "#f4f4f5", "PVC blade", [0.25, 0, -a]); }),
    P("cylinder", [0, 6.15, -1.4], [0.06, 1.4, 0.06], METAL, "Tail boom", [H, 0, 0], 0.8, 0.3),
    P("box", [0, 6.35, -2.2], [0.03, 0.9, 1.1], "#a78bfa", "Tail fin", undefined, 0.6, 0.3),
    ...[0, 1, 2].map((i) => { const a = (i * 2 * Math.PI) / 3; return P("cylinder", [Math.cos(a) * 1.5, 2, Math.sin(a) * 1.5], [0.02, 4.6, 0.02], "#d4d4d8", "Guy wire", [Math.sin(a) * 0.36, 0, -Math.cos(a) * 0.36]); }),
    P("box", [1.6, 0.3, 0.8], [0.8, 0.6, 0.5], "#1e3a8a", "12V battery"),
  ]},
  { id: "pump", name: "PVC Hand Water Pump", category: "Water", tags: ["pump", "water", "well", "pvc", "irrigation"], source: "offline", shapes: [
    P("cylinder", [0, 0.6, 0], [2, 1.2, 2], "#1d4ed8", "Water barrel", undefined, 0.1, 0.4),
    P("cylinder", [0, 1.25, 0], [1.9, 0.04, 1.9], "#38bdf8", "Water surface", undefined, 0.3, 0.1),
    P("cylinder", [0, 1.8, 0], [0.32, 3.4, 0.32], WHITE, "1-1/4\" outer pipe", undefined, 0, 0.4),
    P("cylinder", [0, 0.15, 0], [0.4, 0.3, 0.4], "#ca8a04", "Foot valve", undefined, 0.9, 0.3),
    P("cylinder", [0, 3.8, 0], [0.2, 1.4, 0.2], "#e5e7eb", "3/4\" piston pipe"),
    P("box", [0, 4.5, 0], [0.9, 0.18, 0.18], "#e5e7eb", "T-handle"),
    P("cylinder", [0.3, 4.5, 0], [0.16, 0.6, 0.16], "#e5e7eb", "Spout", [0, 0, H]),
    P("cylinder", [0.6, 4.4, 0], [0.04, 0.6, 0.04], "#38bdf8", "Water stream"),
    P("cylinder", [0.6, 0.25, 0], [0.7, 0.5, 0.7], "#71717a", "Bucket", undefined, 0.6, 0.4),
  ]},
  { id: "charcoal-retort", name: "Charcoal Retort (Can in Fire)", category: "Energy", tags: ["charcoal", "biochar", "retort", "kiln", "fire"], source: "offline", shapes: [
    P("torus", [0, 0.2, 0], [3, 3, 3], "#78716c", "Stone fire ring", [H, 0, 0], 0, 1),
    ...[0, 1, 2, 3, 4, 5].map((i) => P("cylinder", [Math.cos(i) * 0.7, 0.35, Math.sin(i) * 0.7], [0.18, 1.4, 0.18], "#78350f", "Firewood log", [H, i, 0], 0, 1)),
    P("cylinder", [0, 0.6, 0], [0.8, 1, 0.8], "#a1a1aa", "Sealed can (retort)", undefined, 0.9, 0.4),
    P("cone", [0, 1.4, 0], [0.18, 0.5, 0.18], "#f97316", "Wood-gas flame jet"),
    ...[0, 1, 2].map((i) => P("cone", [Math.cos(i * 2) * 0.6, 0.6, Math.sin(i * 2) * 0.6], [0.4, 0.9, 0.4], "#fb923c", "Fire")),
    ...[0, 1, 2, 3].map((i) => P("dodecahedron", [1.8 + (i % 2) * 0.3, 0.12, -0.3 + i * 0.25], [0.25, 0.2, 0.25], "#18181b", "Charcoal lump", undefined, 0.2, 0.9)),
  ]},
  { id: "briquette-press", name: "Fuel Briquette Lever Press", category: "Energy", tags: ["briquette", "fuel", "press", "sawdust", "biomass"], source: "offline", shapes: [
    P("box", [0, 0.1, 0], [3, 0.2, 0.6], WOOD, "Base 2×4"),
    P("box", [-1.3, 1.1, 0], [0.3, 2, 0.4], WOOD, "Upright post"),
    P("box", [-0.9, 0.7, 0], [0.15, 1.3, 0.3], DWOOD, "Brace", [0, 0, -0.7]),
    P("box", [0, 2.05, 0], [3.2, 0.25, 0.3], WOOD, "Lever", [0, 0, -0.08]),
    P("cylinder", [-1.3, 2.05, 0], [0.12, 0.5, 0.12], METAL, "Pivot bolt", [H, 0, 0], 0.9, 0.3),
    P("cylinder", [-0.4, 0.55, 0], [0.6, 0.7, 0.6], "#a1a1aa", "Perforated can mold", undefined, 0.8, 0.4),
    P("cylinder", [-0.4, 1.3, 0], [0.5, 0.15, 0.5], DWOOD, "Plunger"),
    P("cylinder", [-0.4, 1.65, 0], [0.12, 0.6, 0.12], DWOOD, "Plunger rod"),
    ...[0, 1, 2].map((i) => P("cylinder", [0.6 + i * 0.45, 0.4, 0], [0.4, 0.4, 0.4], "#57534e", "Drying briquette", undefined, 0, 1)),
  ]},
  { id: "solar-charger", name: "Solar USB Charger", category: "Energy", tags: ["solar", "charger", "power bank", "usb", "panel"], source: "offline", shapes: [
    P("box", [0, 0.8, -0.2], [2.4, 0.06, 1.6], "#1e3a8a", "Solar panel", [-0.6, 0, 0], 0.5, 0.15),
    P("box", [0, 0.83, -0.18], [2.3, 0.02, 1.5], "#3b82f6", "Solar cells", [-0.6, 0, 0], 0.7, 0.1),
    P("box", [0, 0.2, 0.9], [1.2, 0.4, 0.7], "#27272a", "Project box"),
    P("cylinder", [-0.25, 0.25, 0.9], [0.3, 0.9, 0.3], "#16a34a", "18650 cell", [0, 0, H]),
    P("box", [0.4, 0.42, 0.9], [0.3, 0.04, 0.2], "#2563eb", "TP4056 board"),
    P("box", [0.6, 0.25, 1.25], [0.15, 0.08, 0.02], "#d4d4d8", "USB port", undefined, 0.9, 0.2),
    P("box", [1.6, 0.06, 0.9], [0.7, 0.08, 1.4], BLACK, "Phone", undefined, 0.5, 0.2),
  ]},
  { id: "compost", name: "Pallet Compost Bin", category: "Garden", tags: ["compost", "pallet", "bin", "garden"], source: "offline", shapes: [
    ...[[0, -1, 0], [-1, 0, H], [1, 0, H], [0, 1, 0]].flatMap(([x, z, r]) => [0.25, 0.75, 1.25].map((y) => P("box", [x, y, z], [2, 0.3, 0.06], WOOD, "Pallet slat", [0, r, 0]))),
    P("box", [0, 0.6, 0], [1.9, 1.1, 1.9], "#3f2a1d", "Compost", undefined, 0, 1),
  ]},
  { id: "chair", name: "Dining Chair", category: "Furniture", tags: ["chair", "seat", "furniture", "wood"], source: "offline", shapes: [
    P("box", [0, 1, 0], [1.4, 0.12, 1.4], WOOD, "Seat"), ...legs4(0.6, 0.6, 1, 0.1, DWOOD),
    P("box", [-0.6, 1.85, -0.65], [0.1, 1.6, 0.1], DWOOD, "Back post"), P("box", [0.6, 1.85, -0.65], [0.1, 1.6, 0.1], DWOOD, "Back post"),
    ...[1.4, 1.9, 2.4].map((y) => P("box", [0, y, -0.65], [1.2, 0.18, 0.06], WOOD, "Back slat")),
  ]},
  { id: "table", name: "Farmhouse Table", category: "Furniture", tags: ["table", "desk", "dining", "furniture", "wood"], source: "offline", shapes: [
    P("box", [0, 1.55, 0], [4.2, 0.15, 2.2], WOOD, "Tabletop"), P("box", [0, 1.38, 0], [3.8, 0.2, 1.8], DWOOD, "Apron"),
    ...legs4(1.8, 0.85, 1.45, 0.18, DWOOD), P("box", [0, 0.35, 0], [3.6, 0.1, 0.1], DWOOD, "Stretcher"),
  ]},
  { id: "desk", name: "Standing Desk", category: "Furniture", tags: ["desk", "office", "standing", "workstation", "table"], source: "offline", shapes: [
    P("box", [0, 2.2, 0], [3.6, 0.1, 1.6], "#e7e5e4", "Desktop"),
    P("box", [-1.4, 1.1, 0], [0.18, 2.2, 0.18], BLACK, "Column", undefined, 0.6), P("box", [1.4, 1.1, 0], [0.18, 2.2, 0.18], BLACK, "Column", undefined, 0.6),
    P("box", [-1.4, 0.05, 0], [0.2, 0.1, 1.4], BLACK, "Foot", undefined, 0.6), P("box", [1.4, 0.05, 0], [0.2, 0.1, 1.4], BLACK, "Foot", undefined, 0.6),
    P("box", [0, 2.95, -0.4], [1.6, 0.95, 0.06], "#111827", "Monitor"), P("box", [0, 2.45, -0.4], [0.1, 0.4, 0.1], METAL, "Monitor arm", undefined, 0.8),
    P("box", [0, 2.27, 0.2], [1, 0.04, 0.35], "#3f3f46", "Keyboard"),
  ]},
  { id: "bookshelf", name: "Bookshelf", category: "Furniture", tags: ["shelf", "bookcase", "storage", "books"], source: "offline", shapes: [
    P("box", [-1, 1.75, 0], [0.1, 3.5, 1], WOOD, "Side"), P("box", [1, 1.75, 0], [0.1, 3.5, 1], WOOD, "Side"), P("box", [0, 1.75, -0.48], [2.1, 3.5, 0.05], DWOOD, "Back panel"),
    ...[0.05, 1.2, 2.35, 3.45].map((y) => P("box", [0, y, 0], [2, 0.08, 1], WOOD, "Shelf")),
    ...["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7", "#f97316"].map((c, i) => P("box", [-0.75 + i * 0.22, 1.6, 0], [0.18, 0.75, 0.7], c, "Book")),
  ]},
  { id: "bed", name: "Platform Bed", category: "Furniture", tags: ["bed", "bedroom", "mattress", "furniture"], source: "offline", shapes: [
    P("box", [0, 0.35, 0], [3.2, 0.5, 4.2], DWOOD, "Frame"), P("box", [0, 0.8, 0.1], [3, 0.45, 4], WHITE, "Mattress", undefined, 0, 0.95),
    P("box", [0, 1.4, -2.1], [3.2, 1.8, 0.15], WOOD, "Headboard"), P("capsule", [-0.7, 1.15, -1.5], [1, 0.25, 0.5], "#c7d2fe", "Pillow", [0, 0, H]),
    P("capsule", [0.7, 1.15, -1.5], [1, 0.25, 0.5], "#c7d2fe", "Pillow", [0, 0, H]), P("box", [0, 1.05, 0.9], [3.05, 0.06, 2.3], "#7c3aed", "Blanket", undefined, 0, 0.95),
  ]},
  { id: "house", name: "Cottage House", category: "Buildings", tags: ["house", "home", "cottage", "building", "cabin", "shed"], source: "offline", shapes: [
    P("box", [0, 0.05, 0], [7, 0.1, 6], "#4d7c0f", "Lawn", undefined, 0, 1),
    P("box", [0, 1.3, 0], [4, 2.4, 3.2], "#e7d3b5", "Walls"), P("wedge", [0, 3.15, 0], [3.6, 1.3, 4.4], "#9a3412", "Roof", [0, H, 0]),
    P("box", [1.2, 3.4, -0.6], [0.4, 1.2, 0.4], "#78716c", "Chimney"), P("box", [0, 0.8, 1.61], [0.8, 1.4, 0.05], "#7c4a2d", "Door"),
    P("sphere", [0.25, 0.8, 1.66], [0.08, 0.08, 0.08], "#fbbf24", "Door knob", undefined, 1, 0.2),
    P("box", [-1.3, 1.5, 1.61], [0.8, 0.7, 0.05], "#93c5fd", "Window", undefined, 0.3, 0.1), P("box", [1.3, 1.5, 1.61], [0.8, 0.7, 0.05], "#93c5fd", "Window", undefined, 0.3, 0.1),
    P("box", [0, 0.15, 2.2], [1, 0.1, 1], "#a8a29e", "Path stone"),
  ]},
  { id: "treehouse", name: "Treehouse", category: "Buildings", tags: ["treehouse", "tree", "fort", "kids", "outdoor"], source: "offline", shapes: [
    P("cylinder", [0, 2.5, 0], [0.9, 5, 0.9], "#78350f", "Trunk", undefined, 0, 1), P("sphere", [0, 7, 0], [5, 3.2, 5], "#166534", "Canopy", undefined, 0, 1),
    P("sphere", [1.6, 6, 1], [2.6, 2, 2.6], "#15803d", "Canopy", undefined, 0, 1), P("box", [0, 3.2, 0], [3.4, 0.15, 3], WOOD, "Platform"),
    P("box", [0, 4.2, -0.5], [2.4, 1.8, 1.8], "#c08a5a", "Cabin"), P("wedge", [0, 5.5, -0.5], [2.1, 0.9, 2.7], "#9a3412", "Roof", [0, H, 0]),
    P("box", [1.6, 1.6, 1.2], [0.08, 3.2, 0.08], DWOOD, "Ladder rail"), P("box", [2.1, 1.6, 1.2], [0.08, 3.2, 0.08], DWOOD, "Ladder rail"),
    ...[0.5, 1.1, 1.7, 2.3, 2.9].map((y) => P("box", [1.85, y, 1.2], [0.5, 0.06, 0.06], DWOOD, "Rung")),
  ]},
  { id: "tower", name: "Lighthouse", category: "Buildings", tags: ["lighthouse", "tower", "coast", "beacon"], source: "offline", shapes: [
    P("cylinder", [0, 0.25, 0], [2.6, 0.5, 2.6], "#78716c", "Rock base", undefined, 0, 1),
    ...[0, 1, 2, 3].map((i) => P("cylinder", [0, 0.9 + i * 1.1, 0], [1.8 - i * 0.15, 1.1, 1.8 - i * 0.15], i % 2 ? WHITE : "#dc2626", "Tower band")),
    P("cylinder", [0, 5.2, 0], [1.6, 0.12, 1.6], BLACK, "Gallery deck", undefined, 0.6), P("cylinder", [0, 5.65, 0], [0.9, 0.8, 0.9], "#fef3c7", "Lantern room", undefined, 0.1, 0.1),
    P("cone", [0, 6.4, 0], [1.1, 0.7, 1.1], BLACK, "Cap", undefined, 0.6),
  ]},
  { id: "car", name: "Compact Car", category: "Vehicles", tags: ["car", "vehicle", "auto", "rc car", "toy"], source: "offline", shapes: [
    P("box", [0, 0.75, 0], [4, 0.7, 1.8], "#dc2626", "Body", undefined, 0.5, 0.3), P("box", [-0.2, 1.4, 0], [2.2, 0.7, 1.6], "#dc2626", "Cabin", undefined, 0.5, 0.3),
    P("box", [-0.2, 1.4, 0], [2.0, 0.55, 1.65], "#1e293b", "Windows", undefined, 0.4, 0.05),
    ...wheel([1.3, 0.42, 0.9], 0.42, 0.3), ...wheel([-1.3, 0.42, 0.9], 0.42, 0.3), ...wheel([1.3, 0.42, -0.9], 0.42, 0.3), ...wheel([-1.3, 0.42, -0.9], 0.42, 0.3),
    P("sphere", [2, 0.85, 0.6], [0.2, 0.2, 0.2], "#fef9c3", "Headlight", undefined, 0, 0.1), P("sphere", [2, 0.85, -0.6], [0.2, 0.2, 0.2], "#fef9c3", "Headlight", undefined, 0, 0.1),
  ]},
  { id: "rover", name: "Robot Rover", category: "Robotics", tags: ["robot", "rover", "arduino", "bot", "rc", "vehicle"], source: "offline", shapes: [
    P("box", [0, 0.8, 0], [2.2, 0.5, 1.4], "#a78bfa", "Chassis", undefined, 0.3, 0.4), P("box", [0, 1.15, 0], [1.4, 0.2, 1], "#065f46", "Circuit board"),
    ...wheel([0.85, 0.45, 0.8], 0.45, 0.25), ...wheel([-0.85, 0.45, 0.8], 0.45, 0.25), ...wheel([0.85, 0.45, -0.8], 0.45, 0.25), ...wheel([-0.85, 0.45, -0.8], 0.45, 0.25),
    P("cylinder", [0.6, 1.6, 0], [0.12, 0.8, 0.12], METAL, "Mast", undefined, 0.9, 0.3), P("box", [0.6, 2.1, 0], [0.5, 0.3, 0.7], "#e5e7eb", "Sensor head"),
    P("cylinder", [0.86, 2.1, 0.18], [0.16, 0.06, 0.16], BLACK, "Ultrasonic eye", [0, 0, H]), P("cylinder", [0.86, 2.1, -0.18], [0.16, 0.06, 0.16], BLACK, "Ultrasonic eye", [0, 0, H]),
    P("cylinder", [-0.7, 1.5, 0.4], [0.03, 0.8, 0.03], BLACK, "Antenna"), P("sphere", [-0.7, 1.92, 0.4], [0.1, 0.1, 0.1], "#ef4444", "Antenna tip"),
  ]},
  { id: "drone", name: "Quadcopter Drone", category: "Robotics", tags: ["drone", "quadcopter", "uav", "flying"], source: "offline", shapes: [
    P("box", [0, 1, 0], [0.9, 0.3, 0.9], "#27272a", "Body", undefined, 0.4, 0.4), P("hemisphere", [0, 1.15, 0], [0.7, 0.4, 0.7], "#6ee7b7", "Canopy", undefined, 0.2, 0.2),
    ...[[1, 1], [-1, 1], [1, -1], [-1, -1]].flatMap(([x, z]) => [
      P("box", [x * 0.65, 1, z * 0.65], [1.3, 0.08, 0.1], BLACK, "Arm", [0, x * z > 0 ? -Math.PI / 4 : Math.PI / 4, 0]),
      P("cylinder", [x * 1.1, 1.1, z * 1.1], [0.22, 0.2, 0.22], METAL, "Motor", undefined, 0.9, 0.3),
      P("cylinder", [x * 1.1, 1.22, z * 1.1], [1, 0.02, 1], "#a78bfa", "Propeller", undefined, 0, 0.5),
    ]),
    P("box", [0, 0.6, 0.3], [0.08, 0.5, 0.08], BLACK, "Landing leg"), P("box", [0, 0.6, -0.3], [0.08, 0.5, 0.08], BLACK, "Landing leg"),
  ]},
  { id: "rocket", name: "Model Rocket", category: "Vehicles", tags: ["rocket", "space", "launch", "model rocket"], source: "offline", shapes: [
    P("cylinder", [0, 2.5, 0], [0.8, 4, 0.8], WHITE, "Body tube", undefined, 0.3, 0.3), P("cone", [0, 5.1, 0], [0.8, 1.2, 0.8], "#dc2626", "Nose cone", undefined, 0.3, 0.3),
    P("cylinder", [0, 3.8, 0.4], [0.35, 0.05, 0.35], "#60a5fa", "Porthole", [H, 0, 0], 0.5, 0.1),
    ...[0, 1, 2].map((i) => P("wedge", [Math.cos((i * 2 * Math.PI) / 3) * 0.6, 0.9, Math.sin((i * 2 * Math.PI) / 3) * 0.6], [0.6, 1, 0.06], "#dc2626", "Fin", [0, -(i * 2 * Math.PI) / 3, 0])),
    P("cone", [0, 0.25, 0], [0.5, 0.5, 0.5], "#f97316", "Exhaust flame", [Math.PI, 0, 0]),
  ]},
  { id: "boat", name: "Sailboat", category: "Vehicles", tags: ["boat", "sail", "ship", "water"], source: "offline", shapes: [
    P("wedge", [0, 0.5, 0], [1.6, 0.8, 4], "#f4f4f5", "Hull", [Math.PI, 0, 0]), P("box", [0, 0.95, 0], [1.5, 0.1, 3.5], WOOD, "Deck"),
    P("cylinder", [0, 3, 0.2], [0.1, 4, 0.1], DWOOD, "Mast"), P("wedge", [0, 2.8, -0.6], [1.6, 3.2, 0.04], WHITE, "Main sail", [0, H, 0]),
    P("plane", [0, 0.02, 0], [10, 10, 1], "#0ea5e9", "Water", [-H, 0, 0], 0.2, 0.15),
  ]},
  { id: "bike", name: "Bicycle", category: "Vehicles", tags: ["bike", "bicycle", "cycle"], source: "offline", shapes: [
    P("torus", [-1.1, 0.7, 0], [1.4, 1.4, 1.4], BLACK, "Rear wheel"), P("torus", [1.1, 0.7, 0], [1.4, 1.4, 1.4], BLACK, "Front wheel"),
    P("cylinder", [0, 1.1, 0], [0.08, 1.6, 0.08], "#0ea5e9", "Top tube", [0, 0, H], 0.7, 0.3), P("cylinder", [-0.5, 0.9, 0], [0.08, 1.1, 0.08], "#0ea5e9", "Seat tube", [0, 0, -0.5], 0.7, 0.3),
    P("cylinder", [0.9, 1.05, 0], [0.07, 0.9, 0.07], METAL, "Fork", [0, 0, 0.35], 0.9, 0.3), P("capsule", [-0.7, 1.5, 0], [0.5, 0.12, 0.25], BLACK, "Saddle", [0, 0, H]),
    P("cylinder", [0.75, 1.55, 0], [0.06, 0.8, 0.06], METAL, "Handlebar", [H, 0, 0], 0.9, 0.3),
  ]},
  { id: "lamp", name: "Desk Lamp", category: "Electronics", tags: ["lamp", "light", "led", "desk lamp"], source: "offline", shapes: [
    P("cylinder", [0, 0.1, 0], [1.2, 0.2, 1.2], BLACK, "Base", undefined, 0.7, 0.3), P("sphere", [0, 0.25, 0], [0.18, 0.18, 0.18], METAL, "Joint", undefined, 0.9, 0.2),
    P("cylinder", [0.35, 1, 0], [0.08, 1.6, 0.08], METAL, "Lower arm", [0, 0, -0.45], 0.9, 0.2), P("sphere", [0.7, 1.75, 0], [0.16, 0.16, 0.16], METAL, "Elbow", undefined, 0.9, 0.2),
    P("cylinder", [1.2, 1.9, 0], [0.08, 1.1, 0.08], METAL, "Upper arm", [0, 0, -1.3], 0.9, 0.2), P("cone", [1.75, 1.75, 0], [0.8, 0.7, 0.8], "#a78bfa", "Shade", [0, 0, 0.4], 0.4, 0.4),
    P("sphere", [1.82, 1.5, 0], [0.3, 0.2, 0.3], "#fef9c3", "Bulb", undefined, 0, 0.05),
  ]},
  { id: "speaker", name: "Bluetooth Speaker", category: "Electronics", tags: ["speaker", "audio", "bluetooth", "electronics"], source: "offline", shapes: [
    P("capsule", [0, 0.7, 0], [1.2, 2.4, 1.2], "#334155", "Body", [0, 0, H], 0, 0.9),
    P("cylinder", [0.5, 0.7, 0.58], [0.7, 0.05, 0.7], BLACK, "Driver", [H, 0, 0]), P("cylinder", [-0.5, 0.7, 0.58], [0.7, 0.05, 0.7], BLACK, "Driver", [H, 0, 0]),
    P("box", [0, 1.32, 0], [0.8, 0.05, 0.25], "#6ee7b7", "Button strip"),
  ]},
  { id: "mug", name: "Coffee Mug", category: "Household", tags: ["mug", "cup", "ceramic", "pottery"], source: "offline", shapes: [
    P("tube", [0, 0.7, 0], [1.2, 1.4, 1.2], "#f97316", "Mug body", undefined, 0, 0.3), P("cylinder", [0, 0.05, 0], [1.15, 0.1, 1.15], "#f97316", "Base", undefined, 0, 0.3),
    P("torus", [0.65, 0.75, 0], [0.7, 0.7, 0.7], "#f97316", "Handle", [0, 0, 0]), P("cylinder", [0, 1.2, 0], [1.05, 0.02, 1.05], "#3f1d0b", "Coffee", undefined, 0, 0.1),
  ]},
  { id: "planter", name: "Plant Pot", category: "Garden", tags: ["plant", "pot", "planter", "garden", "succulent"], source: "offline", shapes: [
    P("cylinder", [0, 0.5, 0], [1.2, 1, 1.2], "#c2410c", "Pot", undefined, 0, 0.9), P("torus", [0, 1, 0], [1.25, 1.25, 1.25], "#c2410c", "Rim", [H, 0, 0]),
    P("cylinder", [0, 0.98, 0], [1.05, 0.04, 1.05], "#3f2a1d", "Soil", undefined, 0, 1),
    ...[0, 1, 2, 3, 4].map((i) => P("capsule", [Math.cos(i * 1.26) * 0.2, 1.5, Math.sin(i * 1.26) * 0.2], [0.25, 1, 0.12], "#16a34a", "Leaf", [Math.sin(i * 1.26) * 0.5, 0, Math.cos(i * 1.26) * 0.5])),
  ]},
  { id: "birdhouse-lib", name: "Birdhouse", category: "Garden", tags: ["birdhouse", "bird", "nest", "garden", "wood"], source: "offline", shapes: [
    P("cylinder", [0, 1.5, 0], [0.15, 3, 0.15], "#3f3f46", "Pole"), P("box", [0, 3.6, 0], [1.2, 1.4, 1.2], WOOD, "Body"), P("box", [0, 2.88, 0], [1.3, 0.08, 1.3], DWOOD, "Floor"),
    P("wedge", [0, 4.6, 0], [1.6, 0.7, 1.6], "#9a3412", "Roof", [0, H, 0]), P("cylinder", [0, 3.85, 0.61], [0.35, 0.03, 0.35], BLACK, "Entrance hole", [H, 0, 0]),
    P("cylinder", [0, 3.45, 0.75], [0.04, 0.3, 0.04], DWOOD, "Perch", [H, 0, 0]),
  ]},
  { id: "bench", name: "Garden Bench", category: "Garden", tags: ["bench", "park", "outdoor", "seat"], source: "offline", shapes: [
    ...[-0.3, 0, 0.3].map((z) => P("box", [0, 1, z], [3.6, 0.08, 0.25], WOOD, "Seat slat")), ...[1.5, 1.85].map((y) => P("box", [0, y, -0.5], [3.6, 0.25, 0.06], WOOD, "Back slat")),
    ...[-1.6, 1.6].flatMap((x) => [P("box", [x, 0.5, 0], [0.12, 1, 1], BLACK, "Iron leg", undefined, 0.8, 0.4), P("box", [x, 1.6, -0.5], [0.1, 1.2, 0.1], BLACK, "Back support", undefined, 0.8, 0.4)]),
  ]},
  { id: "podcast-setup", name: "Podcast Mic Setup", category: "Electronics", tags: ["podcast", "mic", "microphone", "studio", "audio"], source: "offline", shapes: [
    P("cylinder", [0, 0.06, 0], [0.8, 0.12, 0.8], BLACK, "Stand base", undefined, 0.8, 0.3), P("cylinder", [0, 0.8, 0], [0.06, 1.5, 0.06], METAL, "Stand pole", undefined, 0.9, 0.2),
    P("torus", [0, 1.75, 0], [0.7, 0.7, 0.7], BLACK, "Shock mount", [H, 0, 0]), P("capsule", [0, 1.75, 0], [0.4, 1, 0.4], "#27272a", "Mic body", undefined, 0.6, 0.3),
    P("sphere", [0, 2.25, 0], [0.42, 0.42, 0.42], METAL, "Grille", undefined, 0.9, 0.4), P("cylinder", [0, 2.25, 0.5], [0.7, 0.02, 0.7], "#18181b", "Pop filter", [H, 0, 0], 0, 0.9),
  ]},
  { id: "phone-game", name: "Phone with Game", category: "Digital", tags: ["phone", "mobile", "game", "app", "smartphone"], source: "offline", shapes: [
    P("box", [0, 2, 0], [1.6, 3.2, 0.15], BLACK, "Phone body", undefined, 0.6, 0.2), P("box", [0, 2, 0.08], [1.45, 3, 0.02], "#1e3a8a", "Screen", undefined, 0.2, 0.05),
    P("box", [0, 1, 0.1], [1.4, 0.15, 0.02], "#22c55e", "Platform"), P("box", [-0.3, 1.25, 0.12], [0.25, 0.3, 0.02], "#fbbf24", "Player"),
    P("box", [0.45, 1.2, 0.12], [0.15, 0.25, 0.02], "#ef4444", "Obstacle"), P("sphere", [0.4, 3.1, 0.12], [0.12, 0.12, 0.02], "#fde047", "Coin"),
  ]},
  { id: "laptop", name: "Laptop (Website)", category: "Digital", tags: ["laptop", "website", "portfolio", "computer", "software", "app"], source: "offline", shapes: [
    P("box", [0, 0.05, 0.4], [3, 0.1, 2], "#a1a1aa", "Base", undefined, 0.8, 0.3), P("box", [0, 1.05, -0.6], [3, 1.9, 0.08], "#3f3f46", "Lid", undefined, 0.8, 0.3),
    P("box", [0, 1.05, -0.55], [2.8, 1.7, 0.02], "#111827", "Screen"), P("box", [0, 1.65, -0.53], [2.6, 0.25, 0.02], "#8b5cf6", "Header"),
    P("box", [-0.7, 1.0, -0.53], [1.1, 0.7, 0.02], "#6ee7b7", "Card"), P("box", [0.7, 1.0, -0.53], [1.1, 0.7, 0.02], "#f9a8d4", "Card"),
  ]},
  { id: "gem", name: "Abstract Sculpture", category: "Art", tags: ["art", "sculpture", "abstract", "decor"], source: "offline", pro: true, shapes: [
    P("box", [0, 0.4, 0], [1.6, 0.8, 1.6], "#27272a", "Plinth"), P("knot", [0, 2, 0], [1.2, 1.2, 1.2], "#a78bfa", "Knot", undefined, 0.9, 0.15),
    P("icosahedron", [1.3, 1.1, 0.6], [0.5, 0.5, 0.5], "#6ee7b7", "Gem", undefined, 0.6, 0.1),
  ]},
];

const K = "https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0";
const k = (id: string, name: string, category: string, tags: string[], path: string): OnlineModel => ({ id, name, category, tags, source: "online", url: `${K}/${path}`, credit: "Khronos glTF Sample Models (CC-BY/CC0)", pro: true });
export const ONLINE_CATALOG: OnlineModel[] = [
  k("o-chair", "Velvet Sheen Chair", "Furniture", ["chair", "furniture", "seat", "sofa"], "SheenChair/glTF-Binary/SheenChair.glb"),
  k("o-lantern", "Old Lantern", "Household", ["lantern", "lamp", "light"], "Lantern/glTF-Binary/Lantern.glb"),
  k("o-boombox", "Boom Box", "Electronics", ["boombox", "speaker", "audio", "radio", "music", "podcast"], "BoomBox/glTF-Binary/BoomBox.glb"),
  k("o-camera", "Antique Camera", "Electronics", ["camera", "photo", "antique"], "AntiqueCamera/glTF-Binary/AntiqueCamera.glb"),
  k("o-truck", "Milk Truck", "Vehicles", ["truck", "car", "vehicle", "toy"], "CesiumMilkTruck/glTF-Binary/CesiumMilkTruck.glb"),
  k("o-toycar", "Toy Car", "Vehicles", ["car", "toy", "vehicle"], "ToyCar/glTF-Binary/ToyCar.glb"),
  k("o-buggy", "Buggy Chassis", "Vehicles", ["buggy", "car", "chassis", "rover", "robot"], "Buggy/glTF-Binary/Buggy.glb"),
  k("o-engine", "2-Cylinder Engine", "Mechanical", ["engine", "motor", "mechanical", "machine"], "2CylinderEngine/glTF-Binary/2CylinderEngine.glb"),
  k("o-gearbox", "Gearbox Assembly", "Mechanical", ["gearbox", "gear", "mechanical", "machine"], "GearboxAssy/glTF-Binary/GearboxAssy.glb"),
  k("o-saw", "Reciprocating Saw", "Tools", ["saw", "tool", "power tool"], "ReciprocatingSaw/glTF-Binary/ReciprocatingSaw.glb"),
  k("o-helmet", "Sci-Fi Helmet", "Art", ["helmet", "sci-fi", "armor", "cosplay"], "DamagedHelmet/glTF-Binary/DamagedHelmet.glb"),
  k("o-bottle", "Water Bottle", "Household", ["bottle", "water", "drink", "product"], "WaterBottle/glTF-Binary/WaterBottle.glb"),
  k("o-avocado", "Avocado", "Food", ["avocado", "food", "fruit"], "Avocado/glTF-Binary/Avocado.glb"),
  k("o-duck", "Rubber Duck", "Toys", ["duck", "toy", "bath"], "Duck/glTF-Binary/Duck.glb"),
  k("o-fox", "Low-poly Fox", "Animals", ["fox", "animal", "character", "game"], "Fox/glTF-Binary/Fox.glb"),
  k("o-fish", "Barramundi Fish", "Animals", ["fish", "animal", "aquarium"], "BarramundiFish/glTF-Binary/BarramundiFish.glb"),
  k("o-corset", "Corset", "Fashion", ["corset", "fashion", "clothing", "sewing"], "Corset/glTF-Binary/Corset.glb"),
  k("o-flight", "Flight Helmet", "Art", ["helmet", "pilot", "flight", "vintage"], "FlightHelmet/glTF/FlightHelmet.gltf"),
];

export function searchModels(q: string, source: "all" | "offline" | "online" = "all") {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const score = (m: { name: string; tags: string[]; category: string }) => {
    if (!terms.length) return 1;
    const hay = [m.name.toLowerCase(), m.category.toLowerCase(), ...m.tags];
    return terms.reduce((n, t) => n + (hay.some((h) => h === t) ? 3 : hay.some((h) => h.includes(t) || t.includes(h)) ? 1 : 0), 0);
  };
  const pool = [...(source !== "online" ? OFFLINE_LIBRARY : []), ...(source !== "offline" ? ONLINE_CATALOG : [])];
  return pool.map((m) => ({ m, s: score(m) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).map((x) => x.m);
}
