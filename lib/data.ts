export type Step = { id: string; title: string; description: string; isComplex: boolean; resources: string[]; tips: string };
export type Phase = { name: string; steps: Step[] };
export type Plan = {
  slug: string; title: string; summary: string; difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string; emoji: string; phases: Phase[]; resources: string[];
  risks: { risk: string; mitigation: string }[]; videos: { title: string; url: string }[];
  model?: Shape[];
  materials?: Material[];
  tools?: string[];
  safety?: string[];
  cost?: string;
  source?: "curated" | "ai" | "template" | "online";
  images?: Record<string, string[]>;
  sourceUrl?: string;
  author?: string;
  views?: number;
  alternatives?: { id: string; title: string; image?: string; views?: number }[];
};
export type Material = { item: string; qty: string; spec?: string; cost?: string };
export const BASIC_KINDS = ["box", "cylinder", "sphere", "cone"] as const;
export const PRO_KINDS = ["torus", "pyramid", "hemisphere", "tube", "wedge", "capsule", "ring", "octahedron", "icosahedron", "dodecahedron", "plane", "knot"] as const;
export type ShapeKind = (typeof BASIC_KINDS)[number] | (typeof PRO_KINDS)[number] | "gltf";
export type Shape = { kind: ShapeKind; pos: [number, number, number]; scale: [number, number, number]; rot?: [number, number, number]; color: string; label?: string; metal?: number; rough?: number; url?: string };

export const s = (id: string, title: string, description: string, isComplex: boolean, resources: string[], tips: string): Step => ({ id, title, description, isComplex, resources, tips });
export const yt = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

export const BASE_PLANS: Plan[] = [
  {
    slug: "birdhouse", title: "Build a Wooden Birdhouse", emoji: "🐦", difficulty: "Beginner", estimatedTime: "1 weekend (6–8 hrs)",
    summary: "A classic cedar birdhouse sized for small songbirds like wrens and chickadees. You'll learn measuring, cutting, assembling with screws, and weatherproofing.",
    phases: [
      { name: "Plan & Prepare", steps: [
        s("b1", "Choose your bird species", "Entrance hole size decides who moves in: 1-1/8\" for wrens, 1-1/4\" for chickadees, 1-1/2\" for bluebirds.", false, ["Local bird guide"], "Check which birds are common in your area in spring."),
        s("b2", "Draw a cut list", "Sketch the 6 panels: front, back, 2 sides, floor, roof (2 pieces). Write dimensions on each.", false, ["Pencil", "Graph paper"], "Use the 3D sketchpad to preview proportions."),
        s("b3", "Buy materials", "One 1x6 cedar board, 6 ft long, is enough. Cedar resists rot without chemicals.", false, ["1x6 cedar board", "1-1/4\" exterior screws"], "Never use pressure-treated wood — chemicals can harm birds."),
      ]},
      { name: "Cut & Drill", steps: [
        s("b4", "Measure and mark panels", "Measure twice, mark with a square so cuts are perpendicular.", false, ["Tape measure", "Speed square"], "Mark the waste side of each line with an X."),
        s("b5", "Cut the panels", "Cut panels with a handsaw or circular saw. Side panels get a 10° angle on top for roof slope.", true, ["Circular saw or handsaw", "Clamps", "Safety glasses"], "Clamp the board firmly; never hold small pieces by hand near a blade."),
        s("b6", "Drill the entrance hole", "Use a spade bit or hole saw, 6–7\" above the floor. Drill from both sides to avoid tear-out.", true, ["Drill", "Spade bit / hole saw"], "Put scrap wood behind the panel for a clean exit."),
        s("b7", "Drill ventilation & drainage", "Two 1/4\" holes near the top of each side, four in the floor corners.", false, ["1/4\" drill bit"], "Recess the floor 1/4\" so water drips off."),
      ]},
      { name: "Assemble", steps: [
        s("b8", "Pre-drill and attach sides to back", "Pre-drill pilot holes to prevent splitting, then screw sides to the back.", false, ["3/32\" pilot bit", "Screwdriver"], "Pilot holes are the #1 trick for splitting-free cedar."),
        s("b9", "Install floor and front", "Attach floor, then the front. Make one side a pivoting door for cleaning.", true, ["2 pivot nails"], "A pivot door lets you clean out old nests each fall."),
        s("b10", "Attach the roof", "Overlap roof pieces at the peak and overhang the front by 2\" to keep rain out.", false, ["Wood glue (exterior)"], "Run a bead of glue along the peak seam."),
      ]},
      { name: "Finish & Mount", steps: [
        s("b11", "Sand and seal outside", "Sand edges and apply a water-based exterior finish to the outside only.", false, ["120-grit sandpaper", "Water-based sealer"], "Leave inside unfinished — birds prefer natural wood."),
        s("b12", "Mount 5–10 ft high", "Mount on a pole or tree facing away from prevailing wind.", false, ["Mounting bracket", "Lag screws"], "Add a predator baffle if cats or raccoons are around."),
      ]},
    ],
    resources: ["1x6 cedar board (6 ft)", "Exterior screws", "Drill + bits", "Saw", "Tape measure", "Speed square", "Sandpaper", "Water-based sealer", "Safety glasses"],
    risks: [
      { risk: "Wood splits when screwing", mitigation: "Always pre-drill pilot holes, keep screws 3/4\" from edges." },
      { risk: "Injury from saw", mitigation: "Clamp workpieces, wear glasses, keep hands 6\" from blade." },
      { risk: "No birds move in", mitigation: "Match hole size to local species and mount before early spring." },
    ],
    videos: [
      { title: "Easy Birdhouse From One Board", url: yt("birdhouse from one board") },
      { title: "How to Use a Hole Saw Cleanly", url: yt("how to use hole saw clean") },
      { title: "Pilot Holes Explained", url: yt("why drill pilot holes wood") },
      { title: "Where to Mount a Birdhouse", url: yt("where to mount birdhouse") },
    ],
  },
  {
    slug: "podcast", title: "Launch a Podcast", emoji: "🎙️", difficulty: "Intermediate", estimatedTime: "3–4 weeks",
    summary: "Go from concept to a published show on Spotify and Apple Podcasts with 3 launch episodes, consistent branding, and a sustainable recording workflow.",
    phases: [
      { name: "Concept", steps: [
        s("p1", "Define niche and listener", "Write one sentence: 'A show for [who] about [what] so they can [benefit].'", false, ["Notebook"], "Narrow beats broad. 'Gardening for renters' > 'Gardening'."),
        s("p2", "Pick format & length", "Solo, co-host, or interview? 20, 40 or 60 min? Weekly or biweekly?", false, ["Competitor shows list"], "Listen to 5 shows in your niche and note what you'd do differently."),
        s("p3", "Name and cover art", "Choose a searchable name; create 3000x3000 px cover art.", false, ["Canva (free)"], "Make the title readable at thumbnail size."),
      ]},
      { name: "Gear & Setup", steps: [
        s("p4", "Get a USB dynamic mic", "Dynamic mics reject room noise better than condensers for home recording.", false, ["USB dynamic mic", "Headphones"], "Speak 2–4 inches from the mic, slightly off-axis."),
        s("p5", "Treat your room", "Record in a small room with soft furnishings; closets full of clothes work great.", false, ["Blankets", "Rug"], "Clap test: if you hear echo, add more soft stuff."),
        s("p6", "Install recording software", "Audacity (free) for solo; Riverside/Zencastr free tier for remote guests.", false, ["Audacity"], "Record each person on a separate track."),
      ]},
      { name: "Produce", steps: [
        s("p7", "Outline episodes 1–3", "Hook, 3 key segments, call-to-action. Avoid word-for-word scripts.", false, ["Episode template"], "Episode 1 should explain who the show is for."),
        s("p8", "Record and edit", "Cut long pauses and mistakes; normalize to -16 LUFS for stereo.", true, ["Audacity", "Loudness plugin"], "Edit for clarity, not perfection — keep personality."),
        s("p9", "Add intro/outro music", "Use royalty-free music; keep the intro under 15 seconds.", false, ["Free Music Archive"], "Check license terms — CC-BY requires credit in show notes."),
      ]},
      { name: "Publish & Grow", steps: [
        s("p10", "Set up hosting and RSS", "Use a free host like Spotify for Creators to generate your RSS feed.", true, ["Podcast host"], "Fill in categories carefully — they affect discovery."),
        s("p11", "Submit to directories", "Submit RSS to Apple Podcasts, Spotify, YouTube Music. Approval takes 1–5 days.", false, ["Apple ID"], "Launch with 3 episodes so new listeners can binge."),
        s("p12", "Launch promo plan", "Share clips, ask 10 friends for honest reviews, guest on related shows.", false, ["Audiogram tool"], "Consistency beats virality: publish on a fixed day."),
      ]},
    ],
    resources: ["USB dynamic microphone", "Closed-back headphones", "Audacity", "Canva", "Podcast host (free)", "Royalty-free music"],
    risks: [
      { risk: "Podfade after 7 episodes", mitigation: "Batch-record 4 episodes ahead before launching." },
      { risk: "Poor audio quality", mitigation: "Prioritize room treatment and mic technique over expensive gear." },
      { risk: "Copyright strikes on music", mitigation: "Use only clearly licensed royalty-free tracks." },
    ],
    videos: [
      { title: "How to Start a Podcast (Complete Guide)", url: yt("how to start a podcast complete guide") },
      { title: "Audacity Podcast Editing Basics", url: yt("audacity podcast editing tutorial") },
      { title: "Dynamic vs Condenser Mics", url: yt("dynamic vs condenser mic podcast") },
      { title: "Submitting to Apple Podcasts", url: yt("submit podcast apple podcasts") },
    ],
  },
  {
    slug: "mobile-game", title: "Make a 2D Mobile Game", emoji: "🎮", difficulty: "Advanced", estimatedTime: "6–10 weeks",
    summary: "Design, build and publish a small 2D endless-runner game with Godot (free), from paper prototype to a store-ready build.",
    phases: [
      { name: "Design", steps: [
        s("g1", "Write a one-page game design", "Core loop, controls, win/lose conditions, art style in one page.", false, ["GDD template"], "If you can't describe the fun in one sentence, simplify."),
        s("g2", "Paper prototype", "Test the mechanic with paper cutouts or a quick sketch with friends.", false, ["Paper", "Markers"], "Find the fun before writing any code."),
      ]},
      { name: "Core Build", steps: [
        s("g3", "Install Godot & set up project", "Create a 2D project with portrait orientation 1080x1920.", false, ["Godot 4"], "Use version control (Git) from day one."),
        s("g4", "Player movement & input", "Implement tap-to-jump with gravity and a CharacterBody2D.", true, ["GDScript docs"], "Tune jump feel with 'coyote time' and jump buffering."),
        s("g5", "Obstacle spawner", "Spawn obstacles on a timer with increasing speed for difficulty.", true, ["Timer node"], "Use object pooling to avoid stutter on low-end phones."),
        s("g6", "Scoring & game over", "Track distance score, save high score to user://, show restart screen.", false, ["ConfigFile API"], "Show 'New best!' — tiny rewards boost retention."),
      ]},
      { name: "Art & Audio", steps: [
        s("g7", "Create or source sprites", "Draw in Aseprite/LibreSprite or use CC0 assets from Kenney.nl.", false, ["Kenney.nl assets"], "Consistent palette makes simple art look pro."),
        s("g8", "Add sound effects", "Generate jump/hit sounds with jsfxr; add looping music.", false, ["jsfxr"], "Lower music volume ~30% under SFX."),
      ]},
      { name: "Polish & Test", steps: [
        s("g9", "Playtest with 5 people", "Watch silently; note where they get confused or bored.", false, ["Feedback form"], "Don't explain — if you need to, the UI needs work."),
        s("g10", "Optimize for mobile", "Profile FPS on a real device; reduce draw calls and texture sizes.", true, ["Android phone", "Godot profiler"], "Target 60 FPS on a 4-year-old phone."),
      ]},
      { name: "Publish", steps: [
        s("g11", "Export Android build", "Install Android SDK, configure export templates, sign the APK/AAB.", true, ["Android SDK", "Keystore"], "Back up your keystore — losing it means you can't update."),
        s("g12", "Release on itch.io / Play Store", "Start with itch.io (free); Play Store requires a one-time $25 fee.", false, ["Store screenshots"], "Record a 30-second trailer from real gameplay."),
      ]},
    ],
    resources: ["Godot 4 (free)", "Git", "Kenney.nl CC0 assets", "jsfxr", "Android phone for testing", "Android SDK"],
    risks: [
      { risk: "Scope creep", mitigation: "Freeze features after the core loop is fun; keep a 'v2 ideas' list." },
      { risk: "Poor performance on phones", mitigation: "Test on a real device every week, use pooling." },
      { risk: "Losing the signing key", mitigation: "Store keystore in 2 backed-up locations." },
    ],
    videos: [
      { title: "Godot 4 2D Beginner Tutorial", url: yt("godot 4 2d beginner tutorial") },
      { title: "Make an Endless Runner in Godot", url: yt("godot endless runner tutorial") },
      { title: "Game Feel: Juice It or Lose It", url: yt("juice it or lose it game feel") },
      { title: "Exporting Godot to Android", url: yt("godot 4 export android") },
    ],
  },
  {
    slug: "garden-bed", title: "Raised Garden Bed", emoji: "🌱", difficulty: "Beginner", estimatedTime: "1 day",
    summary: "A 4x8 ft raised bed for vegetables, built from untreated lumber with good soil mix and drainage.",
    phases: [
      { name: "Plan", steps: [
        s("r1", "Pick a sunny spot", "Vegetables need 6–8 hours of direct sun.", false, ["Compass app"], "Observe the spot at morning, noon, evening."),
        s("r2", "Buy lumber & hardware", "Six 2x10 boards (8ft), corner brackets, screws.", false, ["2x10 cedar boards", "Corner brackets"], "Cut two boards in half at the store for 4 ft ends."),
      ]},
      { name: "Build", steps: [
        s("r3", "Assemble the frame", "Screw corners with brackets on a flat surface.", false, ["Drill", "3\" deck screws"], "Check diagonals are equal for a square frame."),
        s("r4", "Level and place", "Dig out high spots so the frame sits level.", true, ["Level", "Shovel"], "A level bed waters evenly."),
      ]},
      { name: "Fill & Plant", steps: [
        s("r5", "Lay cardboard and fill", "Cardboard smothers weeds; fill with 60% topsoil, 30% compost, 10% aeration.", false, ["Cardboard", "Topsoil", "Compost"], "Fill slightly over the top — soil settles."),
        s("r6", "Plant and mulch", "Plant seedlings by spacing chart, mulch, water deeply.", false, ["Seedlings", "Straw mulch"], "Put tall plants on the north side."),
      ]},
    ],
    resources: ["2x10 lumber", "Corner brackets", "Deck screws", "Drill", "Level", "Soil mix", "Cardboard"],
    risks: [{ risk: "Boards bow outward", mitigation: "Add a mid-span cross brace on 8 ft sides." }, { risk: "Poor drainage", mitigation: "Loosen ground beneath with a fork before filling." }],
    videos: [
      { title: "Build a Raised Bed in 1 Hour", url: yt("build raised garden bed easy") },
      { title: "Best Raised Bed Soil Mix", url: yt("raised bed soil mix") },
      { title: "Square Foot Gardening Intro", url: yt("square foot gardening beginner") },
    ],
  },
  {
    slug: "portfolio-site", title: "Personal Portfolio Website", emoji: "💻", difficulty: "Intermediate", estimatedTime: "2 weeks",
    summary: "Design and deploy a fast, responsive portfolio site with HTML/CSS/JS, hosted free with a custom domain option.",
    phases: [
      { name: "Content", steps: [
        s("w1", "Collect 3–5 best projects", "Write a short case study for each: problem, process, result.", false, ["Screenshots"], "Quality beats quantity."),
        s("w2", "Write your bio", "Who you are, what you do, what you're looking for — in 3 sentences.", false, [], "Read it aloud; cut anything that sounds stiff."),
      ]},
      { name: "Design", steps: [
        s("w3", "Wireframe pages", "Home, Projects, About, Contact. Sketch layout on mobile first.", false, ["Figma (free)"], "Mobile-first prevents cramped designs."),
        s("w4", "Choose type & colors", "One font pair, 1 accent color, generous whitespace.", false, ["Google Fonts"], "Check contrast with a WCAG checker."),
      ]},
      { name: "Build", steps: [
        s("w5", "Code the layout", "Semantic HTML, CSS grid/flex, responsive breakpoints.", true, ["VS Code"], "Use <main>, <nav>, <section> for accessibility."),
        s("w6", "Add a contact form", "Use a free form service or mailto link.", false, ["Formspree free tier"], "Add a honeypot field to block spam."),
      ]},
      { name: "Launch", steps: [
        s("w7", "Deploy to Netlify/Vercel", "Push to GitHub and connect the repo for auto-deploys.", true, ["GitHub", "Netlify"], "Every push = new deploy. Use branches for experiments."),
        s("w8", "Test & share", "Run Lighthouse, fix issues, share on LinkedIn.", false, ["Lighthouse"], "Aim for 90+ on performance and accessibility."),
      ]},
    ],
    resources: ["VS Code", "GitHub account", "Figma", "Netlify or Vercel", "Google Fonts"],
    risks: [{ risk: "Endless redesigning", mitigation: "Ship v1 in 2 weeks, iterate after." }, { risk: "Slow images", mitigation: "Compress and use modern formats like WebP." }],
    videos: [
      { title: "Build a Portfolio with HTML & CSS", url: yt("build portfolio website html css") },
      { title: "Deploy to Netlify in 5 Minutes", url: yt("deploy site netlify") },
      { title: "Portfolio Tips from Recruiters", url: yt("portfolio tips recruiters") },
    ],
  },
  {
    slug: "led-lamp", title: "Smart LED Desk Lamp", emoji: "💡", difficulty: "Advanced", estimatedTime: "2–3 weekends",
    summary: "An Arduino-powered desk lamp with addressable LEDs, a touch dimmer, and a 3D-printed or wooden enclosure.",
    phases: [
      { name: "Electronics Prototype", steps: [
        s("l1", "Breadboard the circuit", "Wire a WS2812B strip to an Arduino Nano with a 330Ω resistor and 1000µF cap.", true, ["Arduino Nano", "WS2812B strip", "Breadboard"], "Always share ground between the power supply and Arduino."),
        s("l2", "Write the firmware", "Use the FastLED library for color modes and brightness.", true, ["Arduino IDE", "FastLED"], "Limit brightness in code to protect your power supply."),
        s("l3", "Add touch sensor", "TTP223 touch module toggles modes; long-press dims.", false, ["TTP223 module"], "Debounce input in software."),
      ]},
      { name: "Enclosure", steps: [
        s("l4", "Sketch the lamp shape", "Use the 3D sketchpad to block out base, arm and shade.", false, ["MakerPath 3D sketchpad"], "Leave room for cable routing."),
        s("l5", "Build or print the body", "3D-print in PETG or build from plywood with a diffuser.", true, ["3D printer or plywood", "Opal acrylic diffuser"], "PETG handles LED heat better than PLA."),
      ]},
      { name: "Assemble & Test", steps: [
        s("l6", "Solder permanent connections", "Move from breadboard to perfboard; heat-shrink every joint.", true, ["Soldering iron", "Heat shrink"], "Tin wires before joining."),
        s("l7", "Burn-in test", "Run at full brightness for 2 hours, check temperatures.", false, ["Thermometer"], "Anything too hot to touch needs more ventilation."),
      ]},
    ],
    resources: ["Arduino Nano", "WS2812B LED strip", "5V 3A power supply", "TTP223 touch sensor", "Soldering iron", "Diffuser", "Enclosure material"],
    risks: [{ risk: "Overheating / fire", mitigation: "Use correctly rated supply, fuse, and brightness cap." }, { risk: "Burnt LEDs from voltage spike", mitigation: "Add capacitor across power and resistor on data line." }],
    videos: [
      { title: "FastLED Beginner Guide", url: yt("fastled arduino beginner") },
      { title: "Soldering for Beginners", url: yt("soldering for beginners") },
      { title: "DIY Arduino Lamp Build", url: yt("diy arduino led lamp") },
    ],
  },
];

import { PROJECTS } from "./projects";
export const PLANS: Plan[] = [...PROJECTS, ...BASE_PLANS.filter((p) => !PROJECTS.some((x) => x.slug === p.slug))];

export function genericPlan(idea: string): Plan {
  const t = idea.trim().replace(/^./, (c) => c.toUpperCase());
  const id = (n: number) => `x${n}`;
  return {
    slug: "custom-" + idea.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40), title: t, emoji: "✨", difficulty: "Intermediate", estimatedTime: "2–4 weeks",
    summary: `A structured roadmap to turn "${idea}" into reality — from defining the goal to shipping and reflecting. Steps move from simple to complex.`,
    phases: [
      { name: "Define", steps: [
        s(id(1), "Write a one-sentence goal", `Describe what "${idea}" is, who it's for, and what "done" looks like.`, false, ["Notebook"], "A clear finish line prevents scope creep."),
        s(id(2), "Research 3 existing examples", "Find similar projects; list what you like and dislike.", false, ["Web search", "YouTube"], "Check the Reference Videos section below."),
        s(id(3), "Set a budget and timeline", "List costs and deadlines for each phase.", false, ["Spreadsheet"], "Add a 20% buffer to both."),
      ]},
      { name: "Design", steps: [
        s(id(4), "Sketch the concept", "Draw or model the main parts. Try the 3D sketchpad for physical ideas.", false, ["Paper", "3D sketchpad"], "Rough is fine — clarity over beauty."),
        s(id(5), "Break it into components", "List every part/module and how they connect.", true, ["Mind map"], "If a component feels scary, break it down again."),
      ]},
      { name: "Build", steps: [
        s(id(6), "Build a minimum version", "Create the simplest version that works end-to-end.", true, ["Core tools & materials"], "Ugly but working beats pretty but unfinished."),
        s(id(7), "Test with real users or conditions", "Try it in the real world; write down every issue.", false, ["Feedback form"], "Watch, don't explain."),
      ]},
      { name: "Refine & Ship", steps: [
        s(id(8), "Iterate on top 3 issues", "Fix the most important problems first.", true, [], "Prioritize by impact ÷ effort."),
        s(id(9), "Document and share", "Photograph/record, write what you learned, and share it.", false, ["Camera"], "Your documentation helps the next builder."),
      ]},
    ],
    resources: ["Notebook", "Budget spreadsheet", "Core tools/materials for your domain", "Camera for documentation"],
    risks: [
      { risk: "Scope creep", mitigation: "Define 'done' up front and keep a v2 list." },
      { risk: "Losing motivation", mitigation: "Track progress daily — keep your streak alive!" },
      { risk: "Budget overrun", mitigation: "Price everything before buying; keep a 20% buffer." },
    ],
    videos: [
      { title: `How to ${idea} — beginner guide`, url: yt(`how to ${idea} beginner`) },
      { title: `${t}: common mistakes`, url: yt(`${idea} mistakes to avoid`) },
      { title: "How to plan any project", url: yt("how to plan a project step by step") },
    ],
  };
}

export function findPlan(idea: string): Plan {
  const q = idea.toLowerCase();
  const map: [RegExp, string][] = [
    [/drone|quad|uav|fpv/, "drone"], [/shed|playhouse|house|cabin|hut/, "shed"], [/turbine|wind/, "wind-turbine"],
    [/boat|skiff|punt|canoe|kayak|raft/, "boat"], [/rocket/, "water-rocket"], [/rc car|remote control|robot car|bluetooth car|\bcar\b/, "rc-car"],
    [/pump|well|irrigat/, "water-pump"], [/charcoal|biochar/, "charcoal"], [/fuel|briquette|biomass/, "fuel-briquettes"],
    [/solar|charger|power bank/, "solar-charger"], [/compost/, "compost-bin"],
    [/bird|nest/, "birdhouse"], [/podcast|audio show|radio/, "podcast"], [/game|godot|unity/, "mobile-game"],
    [/garden|raised bed|vegetable|plant/, "garden-bed"], [/portfolio|website|web site|landing page/, "portfolio-site"], [/lamp|led|arduino|light/, "led-lamp"],
  ];
  for (const [re, slug] of map) if (re.test(q)) return PLANS.find((p) => p.slug === slug)!;
  const exact = PLANS.find((p) => p.slug === q);
  return exact ?? genericPlan(idea);
}

export type Lesson = { id: string; title: string; emoji: string; points: string[]; quiz: { q: string; options: string[]; answer: number; explain: string } };
export const LESSONS: Lesson[] = [
  { id: "read-plan", title: "Reading a build plan", emoji: "📋", points: ["Skim the whole plan before starting — know the finish line.", "Phases group related steps; finish one phase before the next.", "Complex steps deserve extra prep time and research.", "Gather all resources listed before you begin a phase."], quiz: { q: "What should you do before starting step 1?", options: ["Start cutting immediately", "Read the entire plan", "Buy the most expensive tools"], answer: 1, explain: "Reading everything first reveals dependencies and surprises." } },
  { id: "budget", title: "Budgeting materials", emoji: "💰", points: ["List every material with quantity and unit price.", "Add a 10–20% buffer for waste and mistakes.", "Borrow or rent tools you'll only use once.", "Track actual spend vs. estimate as you go."], quiz: { q: "How much buffer is a good rule of thumb?", options: ["0%", "10–20%", "100%"], answer: 1, explain: "10–20% covers waste and mistakes without inflating budgets." } },
  { id: "3d", title: "Basic 3D thinking", emoji: "🧊", points: ["Every object has width (X), height (Y), and depth (Z).", "Complex shapes are built from simple primitives.", "Rotate your model to check every angle before building.", "Scale matters — keep real-world proportions."], quiz: { q: "Which axis usually represents height?", options: ["X", "Y", "Z"], answer: 1, explain: "In most 3D tools (including Three.js) Y is up." } },
  { id: "testing", title: "Testing your prototype", emoji: "🧪", points: ["Test early with the roughest possible version.", "Define what success looks like before testing.", "Watch users silently; don't explain.", "Change one thing at a time so you know what helped."], quiz: { q: "Why change one variable at a time?", options: ["It's faster", "To know what caused the improvement", "It looks professional"], answer: 1, explain: "Isolating changes shows cause and effect." } },
  { id: "docs", title: "Documenting your build", emoji: "📸", points: ["Take photos at every step — before & after.", "Note measurements, settings, and versions.", "Record mistakes and how you fixed them.", "Share a write-up: it helps others and your future self."], quiz: { q: "What's most valuable to record?", options: ["Only the final result", "Mistakes and fixes along the way", "Nothing, memory is enough"], answer: 1, explain: "Mistakes and fixes are the most reusable knowledge." } },
  { id: "safety", title: "Workshop safety basics", emoji: "🦺", points: ["Wear eye protection whenever cutting, drilling or soldering.", "Clamp work pieces — never hold them by hand near blades.", "Keep a tidy, well-lit workspace.", "Know where your first-aid kit and fire extinguisher are."], quiz: { q: "When should you wear safety glasses?", options: ["Only with power tools", "Whenever cutting, drilling or soldering", "Never"], answer: 1, explain: "Flying debris and solder splashes happen with hand tools too." } },
];

export type Referee = { id: string; name: string; specialty: string; bio: string; avatar: string; prompt: string };
export const REFEREES: Referee[] = [
  { id: "r1", name: "Maya Okafor", specialty: "Woodworking & Carpentry", bio: "20 years building furniture and teaching community workshops. Believes every project starts with a good cut list.", avatar: "🪚", prompt: "What wood and tools should a beginner use?" },
  { id: "r2", name: "Dev Raman", specialty: "Game Development", bio: "Indie dev with 4 shipped mobile games. Obsessed with game feel and tight scope.", avatar: "🕹️", prompt: "How do I keep my game scope small?" },
  { id: "r3", name: "Lena Fischer", specialty: "Audio & Podcasting", bio: "Sound engineer and host of a top-100 podcast. Room treatment evangelist.", avatar: "🎧", prompt: "Which microphone should I buy for my podcast?" },
  { id: "r4", name: "Carlos Mendes", specialty: "Electronics & Arduino", bio: "Hardware hacker and maker-space founder. Has burnt every LED so you don't have to.", avatar: "🔌", prompt: "How do I safely power an LED strip?" },
  { id: "r5", name: "Aiko Tanaka", specialty: "Product Design & 3D", bio: "Industrial designer who prototypes everything in cardboard first.", avatar: "📐", prompt: "How should I sketch my idea in 3D before building?" },
  { id: "r6", name: "Sam Whitfield", specialty: "Project Management", bio: "Helped 100+ teams ship on time. Master of budgets and timelines.", avatar: "📊", prompt: "How do I budget and schedule my project?" },
];
