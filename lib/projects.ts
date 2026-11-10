import type { Plan, Step, Material } from "./data";

const s = (id: string, title: string, description: string, isComplex: boolean, resources: string[], tips: string): Step => ({ id, title, description, isComplex, resources, tips });
const yt = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
const m = (item: string, qty: string, spec?: string, cost?: string): Material => ({ item, qty, spec, cost });
const finish = (p: Omit<Plan, "resources" | "source">): Plan => ({ ...p, source: "curated", resources: [...(p.materials ?? []).map((x) => `${x.qty} × ${x.item}`), ...(p.tools ?? [])] });

export const PROJECTS: Plan[] = [
  // ───────────────────────────── DRONE ─────────────────────────────
  finish({
    slug: "drone", title: "Build a 5-inch FPV Quadcopter Drone", emoji: "🚁", difficulty: "Intermediate", estimatedTime: "2–3 weekends (12–16 hrs)", cost: "$180–$320 (without goggles)",
    summary: "A 250 mm-class quadcopter running Betaflight. You'll assemble the frame, solder motors and power, wire a flight controller and receiver, configure everything on a laptop and fly your first hover. No prior experience needed — just patience with a soldering iron.",
    materials: [
      m("5-inch carbon fiber frame (220–250 mm wheelbase)", "1", "e.g. 'Mark4' or 'Source One' style, includes screws & standoffs", "$25–40"),
      m("Brushless motors 2205–2306, 2300–2600 KV", "4", "for 4S battery; 2 CW + 2 CCW or universal", "$50–80"),
      m("4-in-1 ESC, 35–45 A, BLHeli_32 or BlueJay, 30.5×30.5 mm", "1", "simpler wiring than 4 single ESCs", "$35–50"),
      m("Flight controller F4 or F7, 30.5×30.5 mm, Betaflight", "1", "ideally sold as a 'stack' with the ESC + matching cable", "$30–45"),
      m("ExpressLRS (ELRS) 2.4 GHz receiver", "1", "nano size", "$12–20"),
      m("Radio transmitter with ELRS (e.g. RadioMaster Pocket / Boxer)", "1", "must match receiver protocol", "$60–140"),
      m("4S LiPo battery 1300–1500 mAh, 75C+, XT60", "2–3", "", "$22 each"),
      m("LiPo balance charger (e.g. ISDT/ToolkitRC) + power supply", "1", "", "$40–60"),
      m("5-inch tri-blade props (5040 / 5043)", "4 sets", "half CW, half CCW — you will break some", "$3/set"),
      m("Low-ESR capacitor 470–1000 µF, 35 V", "1", "solder on battery pads to kill voltage spikes", "$1"),
      m("XT60 male pigtail with 12–14 AWG silicone wire", "1", "", "$3"),
      m("Battery straps (20×250 mm) + anti-slip pad", "2", "", "$4"),
      m("M3 nylon lock nuts, rubber grommets, heat shrink assortment, zip ties", "1 pack each", "", "$8"),
      m("Optional FPV: camera + 5.8 GHz VTX + goggles (or analog box goggles)", "1 set", "line-of-sight flying works without it", "$60–400"),
    ],
    tools: ["Soldering iron 60 W+ with chisel tip", "63/37 rosin-core solder (0.8 mm) + flux pen", "Hex drivers 1.5/2/2.5 mm", "8 mm nut driver / prop wrench", "Multimeter", "Smoke stopper (fused XT60 adapter)", "Wire strippers & flush cutters", "Laptop with Betaflight Configurator + USB cable", "Helping hands / clamp", "Safety glasses"],
    safety: ["Never install propellers while the drone is connected to a computer or being configured.", "Use a smoke stopper for the first power-up — it prevents a short from destroying parts.", "LiPo batteries can catch fire: charge on a non-flammable surface, never unattended, and store at 3.8 V/cell.", "Fly in open fields away from people, roads and airports. In the US, drones over 250 g need FAA registration and Remote ID; recreational pilots must pass the free TRUST test. Check your country's rules."],
    phases: [
      { name: "Prepare & Check Parts", steps: [
        s("d1", "Unbox and inventory every part", "Lay all parts on a clean mat. Check the frame screws, standoffs and that the FC and ESC share the same mounting size (30.5 mm). Read each part's manual and pin-out diagram — print the FC pin-out.", false, ["Parts list", "Printed FC pin-out"], "Use a magnetic tray for screws — M3 screws vanish fast."),
        s("d2", "Install Betaflight Configurator & ELRS Configurator", "Download Betaflight Configurator and ExpressLRS Configurator on your laptop. Plug the FC in via USB (no battery) and confirm it connects. Update the FC to the latest stable Betaflight using the Firmware Flasher tab with the correct target.", true, ["Laptop", "USB cable"], "If the FC doesn't show up on Windows, install the ImpulseRC Driver Fixer."),
        s("d3", "Bind the receiver to your radio", "Set the same binding phrase in the ELRS transmitter and receiver (flash both with the configurator), or use the bind mode button. The receiver LED goes solid when bound.", false, ["Radio", "Receiver"], "Bind on the bench before soldering — much easier to troubleshoot."),
      ]},
      { name: "Frame & Motors", steps: [
        s("d4", "Assemble the frame", "Bolt the arms to the bottom plate with the supplied screws. Add a drop of blue (medium) thread locker on metal-into-metal screws only. Leave the top plate off for now.", false, ["Frame kit", "Hex drivers", "Blue thread locker"], "Don't over-tighten into carbon — snug is enough."),
        s("d5", "Mount the motors", "Mount one motor per arm with 4 M3 screws. CRITICAL: screws must not touch the copper windings — screw in gently and spin the bell by hand; if it scrapes or feels rough, use shorter screws. Point motor wires toward the center.", true, ["4 motors", "M3 screws"], "Front-right and rear-left spin CCW in 'props in'; don't worry, direction is fixed in software later."),
      ]},
      { name: "Electronics & Soldering", steps: [
        s("d6", "Mount the ESC", "Put rubber grommets on the 4 standoff screws and place the 4-in-1 ESC with the battery pads at the rear. Arrow on ESC (if any) points forward.", false, ["4-in-1 ESC", "Grommets"], "Rear-facing battery pads keep the XT60 lead out of the props."),
        s("d7", "Solder motor wires to the ESC", "Cut each motor's 3 wires so they reach the pads with a little slack. Strip 2 mm, tin the wires and the pads with solder, then hold wire on pad and heat 2–3 s until it flows. Any order of the 3 wires is OK. Keep joints shiny and cone-shaped.", true, ["Soldering iron", "Solder", "Flux"], "Pre-tinning both sides is the secret to fast, clean joints. Heat pad + wire together."),
        s("d8", "Solder the XT60 lead and capacitor", "Solder the red XT60 wire to the + pad and black to – (double-check!). Solder the capacitor's long leg (+) to + and the striped side (–) to – on the same pads. Cover leads with heat shrink and zip-tie the cap where props can't reach.", true, ["XT60 pigtail", "Capacitor", "Heat shrink"], "Reversing polarity will destroy the ESC instantly — check with a multimeter."),
        s("d9", "Short-circuit check with the multimeter", "Set the multimeter to continuity. Touch the probes to the XT60 + and –: it must NOT beep continuously (a short beep from capacitors charging is OK). Check each motor pad is not bridged to its neighbor.", false, ["Multimeter"], "Do this every time after soldering power."),
        s("d10", "Stack the flight controller and connect", "Plug the ESC-to-FC harness into both boards, then mount the FC on top with grommets and nylon nuts. The FC arrow must point forward (or note its rotation for software).", false, ["FC", "ESC harness", "Nylon nuts"], "Don't crush the grommets — vibration isolation matters for flight."),
        s("d11", "Wire the receiver", "Solder 4 wires from the receiver to a free FC UART: 5V→5V, G→GND, receiver TX→FC RX, receiver RX→FC TX. Wrap the receiver in heat shrink and mount the antenna in a printed holder or zip tie pointing up/back away from props.", true, ["Receiver", "Thin silicone wire"], "TX goes to RX — it crosses over. That's the #1 beginner mistake."),
        s("d12", "First power-up with smoke stopper", "PROPS OFF. Plug a battery in through the smoke stopper. The ESC should beep its startup tune. If the smoke stopper bulb stays bright, unplug immediately and find the short.", false, ["Smoke stopper", "Charged LiPo"], "No beeps = check the battery is charged and the XT60 is soldered well."),
      ]},
      { name: "Configure in Betaflight", steps: [
        s("d13", "Ports & receiver setup", "In Ports, enable 'Serial RX' on the UART you used. In Receiver, choose 'Serial (via UART)' and provider 'CRSF'. Move your sticks — bars should move correctly (roll, pitch, yaw, throttle). Fix channel map if not (AETR).", true, ["Betaflight Configurator"], "Set endpoints so sticks read 1000–2000."),
        s("d14", "Motor direction & protocol", "PROPS OFF. In Configuration select DShot600 (or DShot300). In Motors, enable the safety switch and spin each motor slightly. Check order (1 = rear right, 2 = front right, 3 = rear left, 4 = front left) and direction. Reverse wrong ones in BLHeli/ESC Configurator or tick 'Motor direction is reversed' for props-out.", true, ["Betaflight"], "A small piece of tape on the bell makes the direction easy to see."),
        s("d15", "Accelerometer, modes & failsafe", "Place the drone on a level surface and click 'Calibrate Accelerometer'. In Modes, assign ARM to a switch and ANGLE (self-level) to another. In Failsafe, choose 'Drop' for beginners. Save & reboot.", false, ["Betaflight"], "Fly first in ANGLE mode — it self-levels when you let go."),
      ]},
      { name: "Finish & First Flight", steps: [
        s("d16", "Install top plate, battery strap & props", "Fit the top plate, battery pad and strap. Install props: each prop's leading (thicker, curved) edge leads in the direction of rotation. Tighten nuts with the prop wrench.", false, ["Props", "Strap"], "Wrong prop direction = the drone flips instantly on takeoff."),
        s("d17", "Pre-flight checklist", "Battery charged to 4.2 V/cell, props tight, receiver bound, failsafe tested (switch off radio — motors must stop), arm switch works, no loose wires near props.", false, ["Checklist"], "Practise in a free simulator (e.g. Liftoff, Uncrashed) for a few hours first."),
        s("d18", "First hover in an open field", "Stand 5 m behind the drone. Arm in ANGLE mode, raise throttle slowly until it lifts 1 m and hover. Land when the battery reaches ~3.6 V/cell (set a voltage alarm in the OSD/radio).", false, ["Open field", "Spare props"], "Short hops and gentle landings build skill faster than long flights."),
      ]},
    ],
    risks: [
      { risk: "Short circuit fries the ESC", mitigation: "Continuity test + smoke stopper for every first power-up." },
      { risk: "Flip on takeoff", mitigation: "Verify motor order/direction in Motors tab and prop orientation." },
      { risk: "LiPo fire", mitigation: "Balance charge at 1C in a LiPo bag, never charge puffed batteries." },
      { risk: "Fly-away / loss of signal", mitigation: "Set failsafe to Drop and test it before flying." },
    ],
    videos: [
      { title: "How to Build an FPV Drone — Complete Guide", url: yt("how to build 5 inch fpv drone complete guide") },
      { title: "Soldering for FPV Beginners", url: yt("fpv soldering beginners tutorial") },
      { title: "Betaflight Setup Step by Step", url: yt("betaflight configurator setup step by step") },
      { title: "ExpressLRS Binding Explained", url: yt("expresslrs binding phrase tutorial") },
    ],
  }),

  // ───────────────────────────── SHED / SMALL HOUSE ─────────────────────────────
  finish({
    slug: "shed", title: "Build a Small Wooden House / Shed (6 × 8 ft)", emoji: "🏠", difficulty: "Intermediate", estimatedTime: "3–4 weekends with a helper", cost: "$900–$1,600",
    summary: "A 6×8 ft gable-roof wooden building on skids — usable as a garden shed, playhouse or tiny workshop. Uses standard lumber and simple framing rules (16-inch on-center spacing), so two beginners can build it with basic tools.",
    materials: [
      m("Crushed gravel (3/4\")", "1 cubic yard", "for a level, draining base 8×10 ft × 4\" deep", "$40–60"),
      m("Solid concrete blocks 4×8×16\"", "6", "", "$15"),
      m("4×4 pressure-treated (PT) skids, 8 ft", "2", "ground-contact rated", "$40"),
      m("2×6 PT lumber, 8 ft (floor rim + joists)", "9", "2 rims + 7 joists (6 ft long) at 16\" OC", "$110"),
      m("3/4\" tongue-and-groove plywood/OSB subfloor 4×8", "2 sheets", "", "$90"),
      m("2×4 studs, 8 ft (walls, plates, headers)", "42", "kiln-dried, straight", "$170"),
      m("2×6 × 8 ft (ridge board + door header)", "2", "", "$22"),
      m("2×4 × 10 ft (rafters)", "10", "for 5 pairs at 24\" OC, 6/12 pitch", "$60"),
      m("T1-11 or LP SmartSide 4×8 siding panels, 5/8\"", "8 sheets", "includes gable ends + door", "$400"),
      m("1/2\" OSB roof sheathing 4×8", "4 sheets", "", "$70"),
      m("Synthetic roofing underlayment (or #15 felt)", "1 roll", "", "$35"),
      m("Architectural asphalt shingles", "3 bundles (1 square)", "plus 1 bundle starter or cut tabs", "$110"),
      m("Metal drip edge 10 ft", "4", "", "$30"),
      m("1×4 exterior trim boards 8 ft", "10", "corners, fascia, door trim", "$70"),
      m("16d galvanized framing nails (or 3-1/2\" framing screws)", "5 lb", "", "$20"),
      m("8d galvanized siding nails", "3 lb", "", "$12"),
      m("1-1/4\" roofing nails", "2 lb", "", "$8"),
      m("Hurricane ties / rafter ties", "10", "", "$15"),
      m("T-strap hinges 8\" + hasp & padlock", "3 + 1", "", "$30"),
      m("Exterior primer + paint", "2 gal", "", "$80"),
      m("Exterior caulk", "3 tubes", "", "$15"),
    ],
    tools: ["Circular saw", "Drill/driver", "Framing hammer (or nailer)", "Speed square + framing square", "4 ft level", "25 ft tape measure", "Chalk line", "Shovel + rake + hand tamper", "Step ladder 6 ft", "Utility knife", "Safety glasses, gloves, ear protection"],
    safety: ["Check local permits first — many areas exempt sheds under 100–200 sq ft, but rules differ.", "Call 811 (or your local utility locator) before digging.", "Always have a helper when raising walls and working on the roof.", "Wear eye/ear protection with saws; keep the blade guard working."],
    phases: [
      { name: "Site & Foundation", steps: [
        s("h1", "Check rules and choose the site", "Confirm permit/setback rules (often 3–5 ft from property lines). Choose a flat, well-drained spot with access for the door.", false, ["Local building office website"], "Avoid low spots where water pools."),
        s("h2", "Build a gravel pad", "Mark an 8×10 ft area with stakes and string. Remove sod, dig 4\" deep, fill with gravel, rake level and tamp firmly. Check level with a long straight board + level.", false, ["Gravel", "Shovel", "Tamper", "Level"], "A pad 1 ft larger than the shed on every side keeps rain splash off the walls."),
        s("h3", "Set blocks and skids", "Place 3 blocks under each skid (ends + middle), 6 ft apart center-to-center. Lay the two 8 ft 4×4 skids on top and level them with each other — shim under blocks with gravel, never wood.", true, ["Blocks", "4×4 skids", "Level"], "Measure diagonally across skids: equal diagonals = square."),
      ]},
      { name: "Floor", steps: [
        s("h4", "Build the floor frame", "Cut 2 rims at 8 ft and 7 joists at 5' 9\" (6 ft minus 2 × 1.5\"). Nail rims to joist ends with 3 × 16d nails each, joists every 16\" on center. Total frame: 6 × 8 ft.", true, ["2×6 PT", "16d nails"], "Mark 16\" OC on both rims at once so joists line up."),
        s("h5", "Square, attach and sheath the floor", "Set the frame on the skids, measure both diagonals and rack until equal (≈ 120\"). Toe-nail joists to skids. Glue and screw the 3/4\" subfloor with 2\" screws every 6\" on edges, 12\" in the field.", false, ["Subfloor", "Construction adhesive", "Screws"], "Stagger seams and run the long direction across joists."),
      ]},
      { name: "Walls", steps: [
        s("h6", "Frame the two long walls (8 ft)", "For each: 2 plates (bottom + top) at 8 ft, studs at 16\" OC cut to 6' 9\" (gives ~7 ft wall with plates). Nail through plates into studs (2 × 16d each end). Height can be adjusted for a playhouse.", true, ["2×4 studs", "16d nails"], "Build walls flat on the floor, then lift."),
        s("h7", "Frame the two short walls with a door", "Short walls are 5' 9\" long (fit between long walls). On the front wall, frame a 36\" wide × 72\" high rough opening with king studs, jack studs and a doubled 2×6 header on edge.", true, ["2×4", "2×6 header"], "Rough opening = door width + 2\" for clearance."),
        s("h8", "Raise, plumb and connect walls", "Lift the back wall, nail bottom plate to floor framing every 16\", brace with a diagonal 2×4. Repeat for others, nail corners together, check plumb on every corner with the level. Add a second top plate overlapping corners to lock walls together.", true, ["Helper", "Temporary braces", "Level"], "Cut the bottom plate out of the door opening AFTER walls are up."),
      ]},
      { name: "Roof", steps: [
        s("h9", "Cut a pattern rafter (6/12 pitch)", "Span 6 ft → run 3 ft → rise 18\". Rafter length ≈ 40\" plus 8\" overhang. Mark a plumb cut at the top and a 'birdsmouth' notch (1.5\" deep) where it sits on the wall using a speed square set to 6/12 (26.5°). Test fit, then copy it for all 10 rafters.", true, ["2×4 × 10 ft", "Speed square"], "Cut one pair and test before cutting all of them."),
        s("h10", "Install ridge board and rafters", "Cut a 2×6 ridge 8 ft + overhang. Have a helper hold it at height while you nail the end rafter pairs, then fill in pairs every 24\". Attach each rafter to the wall plate with a hurricane tie. Add a 2×4 collar tie on every other pair.", true, ["Ridge 2×6", "Hurricane ties"], "Check the ridge is level and centered before nailing middle rafters."),
        s("h11", "Sheath, drip edge and underlayment", "Nail 1/2\" OSB with 8d nails every 6\" on edges, staggered seams, 1/8\" gaps. Install drip edge on the eaves, then underlayment from the bottom up overlapping 4\", then drip edge on the rakes over the underlayment.", false, ["OSB", "Underlayment", "Drip edge"], "Leave the 1/8\" gaps — wood swells in humidity."),
        s("h12", "Shingle the roof", "Install a starter strip along the eave. Lay the first course flush with the starter, 4 nails per shingle 1\" above the cutouts. Offset each course by 6\". Finish with ridge cap shingles cut from 3-tab pieces.", true, ["Shingles", "Roofing nails", "Utility knife"], "Snap chalk lines every 5\" to keep courses straight."),
      ]},
      { name: "Siding, Door & Finish", steps: [
        s("h13", "Install siding", "Nail T1-11 panels vertically with 8d galvanized nails every 6\" on edges and 12\" in field, leaving 1/8\" gaps. Cut gable triangles from remaining sheets. Leave the door opening uncovered (use the cut-out piece for the door).", false, ["Siding", "8d nails"], "Start at a corner and check the first panel is plumb."),
        s("h14", "Build and hang the door", "Use the siding cutout (or a new panel) 1/2\" smaller than the opening. Glue and screw a 2×4 'Z' brace on the back. Hang with 3 T-strap hinges and add a hasp.", false, ["Hinges", "2×4", "Hasp"], "The diagonal of the Z goes from bottom hinge side up to the latch side to stop sagging."),
        s("h15", "Trim, caulk and paint", "Add 1×4 corner and door trim, fascia under the roof edge. Caulk all seams, prime and paint 2 coats.", false, ["Trim", "Caulk", "Paint"], "Paint the bottom edges of siding — they soak up water first."),
      ]},
    ],
    risks: [
      { risk: "Out-of-square building", mitigation: "Check diagonals at foundation, floor and walls stages." },
      { risk: "Roof leaks", mitigation: "Drip edge order (eave under, rake over underlayment) and 6\" shingle offsets." },
      { risk: "Rot", mitigation: "PT lumber below floor, gravel pad, keep siding 6\" above ground." },
      { risk: "Falls from ladder", mitigation: "Ladder on firm ground, 3 points of contact, helper holding it." },
    ],
    videos: [
      { title: "How to Build a Shed — Step by Step", url: yt("how to build a shed step by step 6x8") },
      { title: "Cutting Rafters with a Speed Square", url: yt("cut rafters speed square birdsmouth") },
      { title: "How to Shingle a Shed Roof", url: yt("how to shingle a shed roof beginner") },
      { title: "Framing a Wall for Beginners", url: yt("framing a wall for beginners") },
    ],
  }),

  // ───────────────────────────── WIND TURBINE ─────────────────────────────
  finish({
    slug: "wind-turbine", title: "Build a 12 V Backyard Wind Turbine", emoji: "🌬️", difficulty: "Intermediate", estimatedTime: "2 weekends", cost: "$150–$300",
    summary: "A small horizontal-axis wind turbine using a permanent-magnet DC motor (from an old treadmill) as a generator, blades cut from PVC pipe, a pivoting tail and a 12 V battery with charge controller. Produces roughly 50–150 W in good wind — enough to charge a battery for lights and USB devices.",
    materials: [
      m("Permanent-magnet DC motor, 90–180 V, 1,000–3,000 RPM rating (treadmill motor)", "1", "used treadmill motors are cheap online; low-RPM/high-voltage = more volts at slow speed", "$30–60"),
      m("8\" diameter PVC pipe (Schedule 40 or thin-wall sewer), 24\" long", "1", "for 3 blades", "$20"),
      m("Hub: 5\" steel disc / old saw-blade hub with motor-thread adapter", "1", "must match motor shaft thread (often left-hand thread)", "$15"),
      m("1/4\"-20 bolts 1\", nuts & lock washers", "6 sets", "2 per blade", "$5"),
      m("Square steel tube 1.5\" × 24\" (motor mount / body)", "1", "or 2×4 wood for a first prototype", "$15"),
      m("1-1/4\" steel pipe flange + 1\" steel pipe nipple 6\" (yaw bearing)", "1 + 1", "the 1\" pipe turns inside the flange", "$15"),
      m("Aluminum sheet 12 × 18\" (tail fin) + 1/2\" conduit 30\" (tail boom)", "1 + 1", "", "$20"),
      m("Hose clamps (stainless, to hold motor)", "2", "", "$4"),
      m("Mast: 1\" or 1-1/4\" galvanized pipe / EMT 10 ft", "1–2", "+ 3 guy wires & ground stakes", "$40"),
      m("Wind charge controller 12 V with dump load (or 40 A Schottky diode + PWM controller)", "1", "prevents battery overcharge & reverse current", "$25–40"),
      m("12 V deep-cycle battery (AGM or LiFePO4)", "1", "", "$70–180"),
      m("12 AWG two-conductor outdoor wire", "30 ft", "", "$20"),
      m("Inline fuse holder + 20 A fuse", "1", "", "$6"),
      m("Exterior spray paint", "1 can", "", "$7"),
    ],
    tools: ["Jigsaw with fine-tooth blade", "Drill + bits (1/4\", 5/16\")", "Angle grinder or hacksaw", "Marker, tape measure, straight edge", "Sandpaper 80/120 grit", "Wrenches", "Multimeter", "Safety glasses, gloves, ear protection"],
    safety: ["Spinning blades can seriously injure — never stand in the plane of rotation; tie blades still while working.", "Keep the mast away from power lines (at least 1.5× its height).", "Batteries can deliver huge currents: install the fuse close to the battery positive.", "Lower and secure the turbine before storms."],
    phases: [
      { name: "Test the Generator", steps: [
        s("t1", "Test the motor output", "Clamp the motor, connect a multimeter on DC volts to its two leads, and spin the shaft with a cordless drill. You want 12+ V at ~400 RPM. Note which lead is + when spinning in the turbine direction.", false, ["Motor", "Multimeter", "Drill"], "If it only reaches 12 V at very high RPM, find a lower-KV (higher voltage rated) motor."),
      ]},
      { name: "Make the Blades", steps: [
        s("t2", "Split the PVC pipe into blade blanks", "Cut the 24\" pipe lengthwise into 4 equal strips (each ~6.25\" wide on the curve). You'll use 3, one is spare. Draw lines with a straight edge along the pipe using a door frame as a guide.", false, ["8\" PVC", "Jigsaw"], "Tape the line first; jigsaws chip PVC less through tape."),
        s("t3", "Cut the blade profile", "On each strip draw: root end full width for 3\", then taper in a straight line to 1.5\" wide at the tip (24\"). Cut along the line on the trailing edge only. Round the leading edge and taper the trailing edge thin with sandpaper.", true, ["Jigsaw", "Sandpaper"], "Make one blade, then trace it for the other two so they are identical."),
        s("t4", "Drill and mount blades on the hub", "Mark 2 holes on each blade root and on the hub at exactly 120° spacing. Bolt blades on with the concave side facing the wind. Measure tip-to-tip distances — all three must match within 1/8\".", true, ["Hub", "Bolts", "Drill"], "Use a paper template printed with 120° lines to mark the hub."),
        s("t5", "Balance the rotor", "Hang the rotor on a bolt through the center and let it spin freely. If one blade always drops to the bottom, sand it lighter or add a washer to the other blades until it stays put in any position.", true, ["Washers", "Sandpaper"], "An unbalanced rotor vibrates and destroys bearings."),
      ]},
      { name: "Body, Tail & Yaw", steps: [
        s("t6", "Mount the motor to the body", "Attach the motor to the top of the square tube with 2 hose clamps (or bolts through its mounts), shaft pointing forward and slightly beyond the end of the tube.", false, ["Square tube", "Hose clamps"], "Put the motor's weight near the front so the yaw point balances."),
        s("t7", "Add the yaw bearing", "Find the balance point of motor + body + tail (assemble loosely). Bolt the 1-1/4\" flange under the body at that point. The 1\" pipe nipple slides inside it and screws onto the mast — the head can now turn freely into the wind.", true, ["Flange", "Pipe nipple"], "Add a dab of grease and a washer for smooth turning."),
        s("t8", "Build the tail", "Bolt the 30\" conduit to the back of the body, then cut a tail fin from aluminum (12×18\" trapezoid) and bolt it on vertically. The tail keeps the rotor facing the wind.", false, ["Conduit", "Aluminum sheet"], "Bigger tail = steadier tracking; too big = sluggish in gusts."),
        s("t9", "Run the wires through the yaw", "Pass the motor leads through the pipe nipple and down the mast. Leave a slack loop so the head can turn a few times; check and untwist periodically.", false, ["12 AWG wire"], "Advanced: use slip rings to allow unlimited rotation."),
      ]},
      { name: "Mast & Electrical", steps: [
        s("t10", "Raise the mast with guy wires", "Assemble the head on the mast lying on the ground. Attach 3 guy wires at 2/3 of the mast height, 120° apart. Walk the mast up with a helper and stake the guys at a distance of half the mast height.", true, ["Mast", "Guy wires", "Stakes", "Helper"], "Higher = smoother wind; at least 10 ft above nearby obstacles."),
        s("t11", "Wire charge controller and battery", "Connect: battery → 20 A fuse → controller BAT terminals FIRST. Then connect turbine leads to the controller WIND terminals (+/– as measured). Connect the dump load resistor if your controller has one.", true, ["Charge controller", "Battery", "Fuse"], "Always connect the battery to the controller before the turbine."),
        s("t12", "Test and log output", "In wind, measure voltage and current with the multimeter or a cheap inline watt meter. Log wind speed (phone app) vs. watts to learn your turbine's power curve.", false, ["Watt meter"], "Most turbines start charging around 3–4 m/s (7–9 mph)."),
      ]},
    ],
    risks: [
      { risk: "Blade failure flying off", mitigation: "Use thick PVC, lock washers, balance carefully, stay out of the rotor plane." },
      { risk: "Battery overcharge", mitigation: "Use a wind charge controller with dump load." },
      { risk: "Mast collapse", mitigation: "3 guy wires, solid stakes, lower before storms." },
    ],
    videos: [
      { title: "DIY Wind Turbine with Treadmill Motor", url: yt("diy wind turbine treadmill motor pvc blades") },
      { title: "Cutting PVC Wind Turbine Blades", url: yt("cut pvc wind turbine blades 8 inch") },
      { title: "Wind Charge Controller Wiring", url: yt("wind turbine charge controller wiring 12v") },
    ],
  }),

  // ───────────────────────────── BOAT ─────────────────────────────
  finish({
    slug: "boat", title: "Build an 8-ft Plywood Flat-Bottom Boat (Stitch & Glue)", emoji: "🛶", difficulty: "Intermediate", estimatedTime: "3–4 weekends (incl. curing time)", cost: "$300–$500",
    summary: "A simple one-person flat-bottom rowing boat (punt/skiff) built from two sheets of plywood using the 'stitch-and-glue' method: panels are stitched with zip ties, joined with thickened epoxy fillets and taped with fiberglass. No complex woodworking or molds — ideal for ponds and calm lakes.",
    materials: [
      m("1/4\" (6 mm) marine or exterior BS1088/AB-grade plywood, 4×8 ft", "2 sheets", "no voids; avoid construction-grade", "$120–200"),
      m("Epoxy resin + hardener kit (marine, e.g. 105/205)", "1.5 gallon kit", "", "$100–150"),
      m("Wood flour + colloidal silica (epoxy thickeners)", "1 lb each", "", "$25"),
      m("Fiberglass tape 3\" wide, 6 oz", "50 ft", "for seams", "$20"),
      m("Fiberglass cloth 6 oz, 50\" wide", "3 yards", "to cover outside bottom", "$40"),
      m("Zip ties 8\" (or copper wire)", "200", "for stitching", "$8"),
      m("Pine/fir 1×2 × 8 ft (gunwales/rub rails)", "4", "", "$20"),
      m("1×10 × 4 ft board (seat) + 1×2 cleats", "1", "", "$15"),
      m("Stainless steel screws #8 × 1\"", "50", "", "$10"),
      m("Oarlocks + sockets", "1 pair", "", "$20"),
      m("Oars 6 ft (or 1 double kayak paddle 7.5 ft)", "1 pair", "", "$40–60"),
      m("Marine/exterior primer + paint", "1 qt + 1 qt", "", "$50"),
      m("Disposable gloves, mixing cups, stir sticks, plastic spreaders, foam rollers", "1 pack each", "", "$20"),
      m("Coast-guard approved life jacket (PFD)", "1", "MANDATORY", "$25–60"),
    ],
    tools: ["Jigsaw or circular saw", "Drill + 1/8\" bit", "Random orbit sander + 80/120 grit", "Tape measure, long straightedge or batten, pencil", "Clamps (6+)", "Side cutters", "Respirator/dust mask"],
    safety: ["Epoxy can cause allergic skin reactions — always wear nitrile gloves and work in a ventilated area.", "Wear a dust mask when sanding cured epoxy and fiberglass.", "Always wear a life jacket on the water and test the boat close to shore in shallow water first.", "Check whether your area requires registration for non-motorized boats."],
    phases: [
      { name: "Layout & Cutting", steps: [
        s("bt1", "Mark the side panels", "On sheet 1, draw two side panels 96\" long × 14\" high. Taper both ends: at 18\" from each end, curve the bottom edge up so the ends are 10\" high (use a flexible batten bent between nails to draw a smooth curve).", true, ["Plywood", "Batten", "Nails"], "Cut both sides together (stacked & screwed) so they're identical."),
        s("bt2", "Mark bottom, transoms and seat parts", "On sheet 2: bottom panel 90\" long × 36\" wide with ends tapering to 30\" (matching side curves). Bow and stern transoms: trapezoids 30\" wide at bottom, 38\" at top, 11\" high. Save offcuts for seat supports.", true, ["Plywood", "Straightedge"], "Label every part and its inside face with pencil."),
        s("bt3", "Cut out all panels", "Cut just outside the lines with a jigsaw, then sand to the line. Keep edges square and smooth.", false, ["Jigsaw", "Sander"], "Support the sheet on 2×4s so the blade doesn't bind."),
      ]},
      { name: "Stitching", steps: [
        s("bt4", "Drill stitch holes", "Drill 1/8\" holes 3/8\" from the edges, every 4–6\" along all joining edges of bottom, sides and transoms (matching holes on both parts).", false, ["Drill", "1/8\" bit"], "Closer stitches on tight curves."),
        s("bt5", "Stitch the hull together", "Lay the bottom flat, stand the sides up against it and loosely zip-tie through the holes. Add the transoms. Gradually tighten all ties so panels meet edge-to-edge forming a 'V' groove. Check the hull is symmetrical by measuring diagonals.", true, ["Zip ties", "Helper"], "Twist the hull until the diagonals match before gluing — it locks shape forever."),
      ]},
      { name: "Glue & Fiberglass", steps: [
        s("bt6", "Tack-weld seams with epoxy", "Mix epoxy per the kit ratio, thicken with silica to peanut-butter consistency, and put small dabs between stitches on the inside seams. Let cure overnight, then cut and pull out the zip ties.", true, ["Epoxy", "Silica"], "Mix small batches (2–3 oz) — epoxy cures faster in a big cup."),
        s("bt7", "Make inside fillets", "Mix epoxy thickened with wood flour. Lay it into every inside seam and smooth with a rounded spreader (e.g. a plastic spoon) to a 3/4\" radius cove.", true, ["Epoxy", "Wood flour", "Spreaders"], "Mask both sides of the seam with tape for clean edges."),
        s("bt8", "Tape the seams", "While fillets are still tacky, lay 3\" fiberglass tape over them and wet it out with unthickened epoxy until clear. Squeeze out excess. Repeat on the outside seams after rounding the corners with sandpaper.", true, ["Fiberglass tape", "Epoxy", "Brush"], "White spots = dry glass; add a bit more epoxy."),
        s("bt9", "Glass the outside bottom", "Flip the hull, sand, drape fiberglass cloth over the bottom, wet it out working from center outward, then apply 2 fill coats when tacky.", true, ["Glass cloth", "Roller", "Squeegee"], "Work in shade at 60–80 °F; heat makes epoxy kick too fast."),
      ]},
      { name: "Outfit & Finish", steps: [
        s("bt10", "Add gunwales and seat", "Glue and screw 1×2 rails on the inside and outside top edges of the sides. Fit the seat across the middle on 1×2 cleats (center of the boat for rowing).", false, ["1×2 lumber", "Screws", "Seat board"], "Clamp gunwales while glue cures."),
        s("bt11", "Sand, prime and paint", "Sand all epoxy with 120 grit (wash amine blush off first with water + Scotch-Brite). Apply primer and 2 coats of marine/exterior paint.", false, ["Sander", "Paint"], "Epoxy breaks down in sunlight — paint is UV protection."),
        s("bt12", "Fit oarlocks and test float", "Mount oarlock sockets 12\" behind the seat edge on each gunwale. Test in shallow water close to shore wearing a PFD; check for leaks and stability.", false, ["Oarlocks", "PFD"], "Bring a sponge on the first test float."),
      ]},
    ],
    risks: [
      { risk: "Leaks at seams", mitigation: "Full fillets + glass tape inside and out; test float near shore." },
      { risk: "Epoxy allergy", mitigation: "Gloves, long sleeves, ventilation, never touch uncured epoxy." },
      { risk: "Capsizing", mitigation: "Life jacket always, calm water, sit low and centered." },
    ],
    videos: [
      { title: "Stitch and Glue Boat Building Basics", url: yt("stitch and glue boat building beginner") },
      { title: "How to Make Epoxy Fillets", url: yt("epoxy fillet boat building how to") },
      { title: "Build a Plywood Skiff in a Weekend", url: yt("build plywood skiff two sheets") },
    ],
  }),

  // ───────────────────────────── WATER ROCKET ─────────────────────────────
  finish({
    slug: "water-rocket", title: "Build a Water Bottle Rocket + Launcher", emoji: "🚀", difficulty: "Beginner", estimatedTime: "1 day (4–6 hrs)", cost: "$25–$45",
    summary: "A 2-liter soda bottle rocket powered by water and compressed air, plus a reusable PVC launch pad with a bicycle-pump valve. Flies 30–60 m high. Great for students to learn Newton's third law, center of gravity and aerodynamics.",
    materials: [
      m("2-liter soda bottles (carbonated drink bottles only)", "2", "one for the rocket body, one for the nose cone", "$2"),
      m("Corrugated plastic (Coroplast) or stiff cardboard 30×30 cm", "1", "for 3–4 fins", "$3"),
      m("Duct tape / electrical tape", "1 roll", "", "$5"),
      m("Modeling clay or play-dough", "50–100 g", "nose weight for stability", "$2"),
      m("1/2\" PVC pipe", "1.5 m", "launch tube + legs", "$5"),
      m("1/2\" PVC tee fittings", "2", "", "$2"),
      m("1/2\" PVC end caps", "3", "", "$2"),
      m("PVC primer + cement (small cans)", "1 each", "", "$8"),
      m("Bicycle tire valve (Schrader) from an old inner tube, or tubeless valve stem", "1", "", "$3"),
      m("Rubber stopper size #3 OR 1/2\" PVC to fit bottle mouth + O-ring", "1", "", "$2"),
      m("Bicycle floor pump with pressure gauge", "1", "", "(borrow)"),
      m("Hose clamps or cable ties (launch release)", "2", "", "$3"),
      m("Tent stakes (to anchor launcher)", "2–3", "", "$3"),
    ],
    tools: ["Hacksaw or PVC cutter", "Scissors / craft knife", "Drill + bit to match valve stem", "Ruler & marker", "Safety glasses for everyone"],
    safety: ["Maximum 60 psi (4 bar) for a single 2 L bottle. Never use damaged, scratched or non-carbonated bottles.", "Everyone stands at least 10 m back; nobody stands over the rocket while pressurizing.", "Launch only in large open fields away from people, cars and power lines.", "Wear safety glasses. If a launch fails, release pressure before approaching."],
    phases: [
      { name: "Build the Rocket", steps: [
        s("wr1", "Prepare the body bottle", "Remove labels and rinse. This is your pressure chamber — don't cut, heat or damage it. The mouth points down when launching.", false, ["2 L bottle"], "Smooth bottles (no deep ridges) fly straighter."),
        s("wr2", "Make the nose cone", "Cut the top 15 cm (the tapered part) off the second bottle. Put 50–100 g of clay inside its tip, then tape the cone on top of the body bottle's base (the flat bottom).", false, ["Second bottle", "Clay", "Tape"], "Weight in the nose moves the center of gravity forward = stable flight."),
        s("wr3", "Cut and attach fins", "Cut 3 (or 4) identical trapezoid fins: 12 cm root, 6 cm tip, 8 cm tall. Fold a 1 cm tab on the root for taping. Tape them evenly spaced (120° for 3) near the bottle mouth, perfectly straight.", false, ["Coroplast", "Tape"], "Use a paper strip wrapped around the bottle to mark even spacing."),
        s("wr4", "Stability check (swing test)", "Find the balance point (center of gravity) — it must be in the upper half, ideally near the top third. Tie a string there and swing the rocket in a circle: it should fly nose-first. If it wobbles, add nose clay or bigger fins.", true, ["String"], "This is the same rule real rocket engineers use (CG ahead of CP)."),
      ]},
      { name: "Build the Launcher", steps: [
        s("wr5", "Cut the PVC parts", "Cut: launch tube 40 cm, two legs 25 cm, two feet 20 cm, one valve arm 15 cm.", false, ["PVC pipe", "Hacksaw"], "Deburr cut edges with sandpaper."),
        s("wr6", "Install the valve", "Drill a hole in one end cap to fit the Schrader valve stem, push the valve through and seal it with epoxy or the valve's nut. This cap goes on the valve arm.", true, ["End cap", "Valve", "Drill"], "Test airtightness later with soapy water."),
        s("wr7", "Assemble and glue the launcher", "Prime and cement: launch tube vertical into the tee, valve arm on one side, legs/feet forming a stable base with the other tee. Let cement cure 2 hours.", false, ["Tees", "PVC cement"], "Dry fit first; cement sets in seconds."),
        s("wr8", "Make the seal", "Wrap tape around the top of the launch tube until the bottle mouth fits snugly (or use the rubber stopper with a hole for the tube). The bottle must hold pressure but slide off when released.", true, ["Tape / stopper"], "Too tight = no launch; too loose = water leaks out early."),
      ]},
      { name: "Launch", steps: [
        s("wr9", "Fill with water (1/3)", "Fill the rocket about 1/3 full (≈ 600–700 ml). Hold your thumb over the mouth, flip it and push it onto the launch tube.", false, ["Water"], "Test 1/4, 1/3 and 1/2 full — 1/3 usually flies highest."),
        s("wr10", "Pressurize and launch", "Anchor the launcher with stakes. Connect the pump, step back, and pump to 40–60 psi. The rocket launches when pressure overcomes the seal (or use a pull-string release clip).", false, ["Bike pump"], "Never exceed 60 psi with a 2 L bottle."),
        s("wr11", "Measure and improve", "Measure height: stand 20 m away, measure the angle to the top of the flight with a phone clinometer app; height = 20 × tan(angle) + your eye height. Change one variable at a time (water, fins, nose weight).", false, ["Phone clinometer app", "Notebook"], "Add a parachute in the nose cone as an upgrade."),
      ]},
    ],
    risks: [
      { risk: "Bottle bursts", mitigation: "Only undamaged carbonated bottles, max 60 psi, safety glasses." },
      { risk: "Rocket hits someone", mitigation: "10 m clearance, open field, countdown before each launch." },
      { risk: "Unstable tumbling flight", mitigation: "Swing test; add nose weight and straight fins." },
    ],
    videos: [
      { title: "How to Make a Water Bottle Rocket", url: yt("how to make water bottle rocket fins nose cone") },
      { title: "PVC Bottle Rocket Launcher Build", url: yt("pvc bottle rocket launcher bike pump") },
      { title: "Rocket Stability: CG and CP", url: yt("rocket stability center of gravity center of pressure") },
    ],
  }),

  // ───────────────────────────── RC CAR ─────────────────────────────
  finish({
    slug: "rc-car", title: "Build a Bluetooth RC Car with Arduino", emoji: "🏎️", difficulty: "Beginner", estimatedTime: "1 weekend (5–8 hrs)", cost: "$35–$60",
    summary: "A 4-wheel drive car controlled from your phone over Bluetooth. Uses an Arduino Uno, an L298N motor driver and an HC-05 Bluetooth module. No soldering required — all connections are jumper wires and screw terminals. You'll learn basic electronics and programming.",
    materials: [
      m("4WD robot car chassis kit (2 acrylic plates, 4 TT gear motors, 4 wheels, screws)", "1", "", "$15–20"),
      m("Arduino Uno R3 (or compatible) + USB cable", "1", "", "$10–25"),
      m("L298N dual H-bridge motor driver module", "1", "", "$4"),
      m("HC-05 (or HC-06) Bluetooth module", "1", "Android phones; for iPhone use an HM-10 BLE module", "$6"),
      m("2 × 18650 Li-ion battery holder with switch", "1", "", "$3"),
      m("18650 Li-ion cells 3.7 V (protected) + charger", "2 + 1", "or 6 × AA holder (9 V) as a simple option", "$12"),
      m("Jumper wires (male-male & male-female), 20 cm", "1 pack (40)", "", "$4"),
      m("Resistors 1 kΩ and 2 kΩ", "1 each", "voltage divider for HC-05 RX pin", "$1"),
      m("Mini breadboard", "1", "", "$2"),
      m("Double-sided foam tape & zip ties", "1 each", "", "$3"),
      m("Phone app: 'Arduino Bluetooth RC Car' (Android, free)", "1", "", "Free"),
    ],
    tools: ["Small Phillips screwdriver", "Small flat screwdriver (terminal blocks)", "Wire stripper", "Computer with Arduino IDE (free)", "Optional: soldering iron to attach wires to motors if not pre-wired"],
    safety: ["Li-ion cells: never short the terminals, use a proper charger, and remove from holder for storage.", "Disconnect the battery when uploading code or rewiring.", "Keep fingers clear of wheels when testing."],
    phases: [
      { name: "Assemble the Chassis", steps: [
        s("rc1", "Attach motors to the bottom plate", "Fit each TT gear motor into its brackets and screw them to the bottom acrylic plate, motor wires facing inward. If motors have no wires, solder red/black 15 cm wires to their tabs.", false, ["Chassis kit", "Screwdriver"], "Peel the protective paper off the acrylic first."),
        s("rc2", "Mount wheels and standoffs", "Push wheels onto the D-shaped motor shafts. Screw the 6 brass standoffs to the bottom plate for the top plate later.", false, ["Wheels", "Standoffs"], "Wheels should spin freely without rubbing the chassis."),
        s("rc3", "Mount electronics", "Use foam tape/screws to fix the L298N on the bottom plate, the Arduino on the top plate, and the battery holder at the back.", false, ["Foam tape"], "Keep the Arduino's USB port accessible for programming."),
      ]},
      { name: "Wiring", steps: [
        s("rc4", "Wire the motors to L298N", "Twist together the wires of the two LEFT motors (red with red, black with black) and connect them to OUT1/OUT2. Do the same for the two RIGHT motors on OUT3/OUT4.", false, ["L298N"], "If a side spins backwards later, just swap its two wires."),
        s("rc5", "Power wiring", "Battery + (through switch) → L298N '12V' terminal. Battery – → L298N 'GND'. Connect a jumper from L298N GND to Arduino GND (common ground!). Connect L298N '5V' output → Arduino 5V pin (keep the 5V-EN jumper on the L298N).", true, ["Battery holder", "Jumpers"], "Without the common ground the motors won't respond."),
        s("rc6", "Control wiring", "Remove the ENA/ENB jumpers. Connect: ENA → D5, IN1 → D7, IN2 → D8, IN3 → D9, IN4 → D10, ENB → D6.", false, ["Jumpers"], "D5 and D6 are PWM pins, used for speed control."),
        s("rc7", "Wire the Bluetooth module", "HC-05 VCC → 5V, GND → GND, TXD → Arduino D2, RXD → voltage divider (D3 → 1 kΩ → HC-05 RX, and HC-05 RX → 2 kΩ → GND). The divider drops 5 V to ~3.3 V to protect the module.", true, ["HC-05", "1k & 2k resistors", "Breadboard"], "We use pins 2/3 (SoftwareSerial) so uploading code over USB still works."),
      ]},
      { name: "Program", steps: [
        s("rc8", "Install Arduino IDE and upload the code", "Install Arduino IDE, select Board 'Arduino Uno' and the right Port. Paste this sketch and click Upload:\n\n#include <SoftwareSerial.h>\nSoftwareSerial bt(2,3);\nint ENA=5,IN1=7,IN2=8,IN3=9,IN4=10,ENB=6,spd=200;\nvoid setup(){bt.begin(9600);for(int p=5;p<=10;p++)pinMode(p,OUTPUT);}\nvoid drive(int a,int b,int c,int d){digitalWrite(IN1,a);digitalWrite(IN2,b);digitalWrite(IN3,c);digitalWrite(IN4,d);analogWrite(ENA,spd);analogWrite(ENB,spd);}\nvoid loop(){if(bt.available()){char c=bt.read();\n if(c=='F')drive(1,0,1,0);else if(c=='B')drive(0,1,0,1);\n else if(c=='L')drive(0,1,1,0);else if(c=='R')drive(1,0,0,1);\n else if(c=='S')drive(0,0,0,0);\n else if(c>='0'&&c<='9')spd=map(c-'0',0,9,90,255);\n else if(c=='q')spd=255;}}", true, ["Arduino IDE", "USB cable"], "Unplug the HC-05 TX/RX if upload fails with hardware serial wiring."),
        s("rc9", "Pair your phone", "Turn on the battery switch. HC-05 LED blinks fast. On your phone, pair with 'HC-05' (PIN 1234 or 0000). Open the RC car app and connect — the LED blinks slowly when connected.", false, ["Phone", "App"], "The app sends F/B/L/R/S and 0–9 for speed — matching the code."),
      ]},
      { name: "Test & Upgrade", steps: [
        s("rc10", "Drive test and fix directions", "Press forward. If the car turns or goes backward, swap the motor wire pair on the wrong side at the L298N terminals.", false, [], "Test on the floor, not the table."),
        s("rc11", "Upgrades", "Add an HC-SR04 ultrasonic sensor for automatic obstacle stopping, LEDs for headlights, or a buzzer horn. Each uses free Arduino pins.", false, ["HC-SR04", "LEDs"], "Change one thing at a time and re-test."),
      ]},
    ],
    risks: [
      { risk: "Motors don't move", mitigation: "Check common ground, ENA/ENB jumpers removed and battery charged (>7 V)." },
      { risk: "Bluetooth module damaged", mitigation: "Use the 1k/2k voltage divider on RX." },
      { risk: "Arduino resets when motors start", mitigation: "Use fresh batteries; add a 470 µF capacitor across battery terminals." },
    ],
    videos: [
      { title: "Arduino Bluetooth RC Car Tutorial", url: yt("arduino bluetooth rc car l298n hc-05 tutorial") },
      { title: "L298N Motor Driver Explained", url: yt("l298n motor driver arduino explained") },
      { title: "HC-05 Bluetooth with Arduino", url: yt("hc-05 bluetooth arduino voltage divider") },
    ],
  }),

  // ───────────────────────────── WATER PUMP ─────────────────────────────
  finish({
    slug: "water-pump", title: "Build a Hand-Operated PVC Water Pump", emoji: "💧", difficulty: "Beginner", estimatedTime: "Half a day (3–4 hrs)", cost: "$30–$50",
    summary: "A piston-style hand pump made from PVC pipe and two check valves. Lifts water from a barrel, pond, rain tank or shallow well (up to ~7 m) to fill buckets or irrigate a garden — no electricity needed. Every part is available at a hardware store.",
    materials: [
      m("1-1/4\" PVC pipe (outer cylinder)", "1.5 m (5 ft)", "length = depth to water + 50 cm", "$8"),
      m("3/4\" PVC pipe (inner piston / outlet)", "1.8 m (6 ft)", "30 cm longer than the outer pipe", "$5"),
      m("1-1/4\" brass or PVC foot valve / check valve (with screen)", "1", "bottom of outer pipe", "$12"),
      m("3/4\" brass or PVC spring check valve", "1", "bottom of inner piston", "$8"),
      m("1-1/4\" PVC male threaded adapter", "1", "to connect foot valve", "$1"),
      m("3/4\" PVC male threaded adapter", "1", "to connect piston check valve", "$1"),
      m("1-1/4\" × 3/4\" PVC reducing bushing (top guide)", "1", "", "$2"),
      m("3/4\" PVC 90° elbow + 30 cm piece (spout)", "1 + 1", "", "$2"),
      m("3/4\" PVC tee (handle)", "1", "+ 2 × 15 cm pieces of 3/4\" pipe for handles", "$1"),
      m("Rubber O-rings ~1-1/4\" ID (or 1\" wide strip of bicycle inner tube)", "3–4", "piston seal", "$3"),
      m("PVC primer + cement", "1 each", "", "$8"),
      m("PTFE (Teflon) thread tape", "1 roll", "", "$1"),
      m("Garden hose adapter (optional, for outlet)", "1", "", "$3"),
    ],
    tools: ["Hacksaw or PVC cutter", "Sandpaper 80 grit", "Measuring tape & marker", "Drill (optional for mounting)", "Bucket for testing"],
    safety: ["Don't drink untreated water from ponds or shallow wells — boil or filter it first.", "PVC cement fumes: use outdoors.", "Cover open wells securely so children and animals can't fall in."],
    phases: [
      { name: "Prepare Parts", steps: [
        s("wp1", "Measure and cut the pipes", "Measure from where the pump will stand down to 30 cm below the lowest water level — cut the 1-1/4\" outer pipe to that length + 50 cm. Cut the 3/4\" inner pipe 30 cm longer than the outer pipe.", false, ["PVC pipes", "Hacksaw"], "Deburr inside and outside of every cut so the piston slides smoothly."),
        s("wp2", "Understand how it works", "The outer pipe has a one-way foot valve at the bottom. The inner pipe (piston) has another one-way valve at its bottom. Pulling up lifts water in the inner pipe and sucks new water in through the foot valve; pushing down forces that water up through the piston valve. Each stroke pushes water out of the top spout.", false, [], "Check the arrows on both valves: both must point UP (water flows up)."),
      ]},
      { name: "Build the Pump", steps: [
        s("wp3", "Attach the foot valve to the outer pipe", "Cement the 1-1/4\" male adapter onto the bottom of the outer pipe. Wrap PTFE tape on the threads and screw on the foot valve, arrow pointing up into the pipe.", false, ["Foot valve", "Adapter", "PTFE tape", "Cement"], "The screen on the foot valve keeps debris out — keep it."),
        s("wp4", "Build the piston", "Cement the 3/4\" male adapter on the bottom of the inner pipe, tape threads and screw on the 3/4\" check valve, arrow pointing up. Just above the valve, roll 3–4 O-rings onto the pipe (or wrap a tight band of inner tube) until it fits snugly but slides in the outer pipe.", true, ["3/4\" check valve", "O-rings"], "Too tight = hard to pump; too loose = water leaks back. Adjust by adding/removing O-rings or tape under them."),
        s("wp5", "Insert piston and add top guide", "Slide the piston into the outer pipe. Slide the reducing bushing over the inner pipe and dry-fit it in the top of the outer pipe (do NOT cement — so you can service the piston later). It keeps the piston centered.", false, ["Reducing bushing"], "A dab of silicone grease on the O-rings makes pumping smooth."),
        s("wp6", "Add the handle and spout", "Cement the 3/4\" tee on top of the inner pipe with the two handle pieces. Cement the 90° elbow + spout to the side outlet — or design: water exits from the tee top through the elbow (cement elbow in the tee's top branch with handles on the sides).", false, ["Tee", "Elbow", "Handles"], "Add a hose adapter on the spout for garden irrigation."),
      ]},
      { name: "Install & Test", steps: [
        s("wp7", "Prime and test in a bucket", "Stand the pump in a bucket of water. Pump the handle up and down in full strokes. After 5–15 strokes water will rise and flow out the spout.", false, ["Bucket of water"], "If it won't prime, pour a cup of water down the inner pipe to wet the seals."),
        s("wp8", "Install at the water source", "Lower the pump into the barrel/well so the foot valve sits 20–30 cm above the bottom (avoids sludge). Fix the outer pipe to a post or well cover with pipe straps.", false, ["Pipe straps", "Post"], "For wells, a concrete or wooden well cover keeps contamination out."),
        s("wp9", "Maintain", "Every few months pull out the piston, clean valves and replace worn O-rings. Drain the pump before freezing weather.", false, ["Spare O-rings"], "Keep a spare check valve — it's the part that wears most."),
      ]},
    ],
    risks: [
      { risk: "Won't lift water", mitigation: "Check valve arrows point up and the piston seal is snug; prime with water." },
      { risk: "Contaminated drinking water", mitigation: "Filter and boil, or use only for irrigation." },
      { risk: "Pipe cracks in frost", mitigation: "Drain or remove before freezing temperatures." },
    ],
    videos: [
      { title: "DIY PVC Hand Water Pump", url: yt("diy pvc hand water pump check valve") },
      { title: "How a Piston Pump Works", url: yt("how does a piston hand pump work") },
      { title: "Shallow Well Hand Pump Build", url: yt("shallow well pvc pump build") },
    ],
  }),

  // ───────────────────────────── CHARCOAL ─────────────────────────────
  finish({
    slug: "charcoal", title: "Make Lump Charcoal (Small Retort Method)", emoji: "🔥", difficulty: "Beginner", estimatedTime: "1 afternoon (3–5 hrs) + cooling overnight", cost: "$10–$30",
    summary: "Turn dry hardwood into clean lump charcoal using a sealed metal can heated in a fire (a 'retort'). Without oxygen the wood doesn't burn — it releases its gases and water and leaves almost pure carbon. Use it for grilling, blacksmithing, art charcoal or as biochar for gardens. Adult supervision for students.",
    materials: [
      m("Clean metal can with tight lid: 1-gallon unused paint can (small batch) or a steel drum with lid (large batch)", "1", "never use cans that held chemicals", "$5–15"),
      m("Dry hardwood (oak, maple, hickory, fruit woods), split to ~2–4 cm thick, cut to fit the can", "enough to fill the can", "moisture < 20% — seasoned 6+ months", "Free–$10"),
      m("Firewood / scrap wood for the outer fire", "1 wheelbarrow", "", "Free"),
      m("Nail (3–4 mm) + hammer", "1", "to punch a vent hole", "—"),
      m("Fire-safe location: fire pit, brick ring or metal fire bowl", "1", "", "—"),
      m("Bucket of water or garden hose", "1", "", "—"),
      m("Metal fire tongs / poker", "1", "", "$10"),
      m("Heavy leather/welding gloves", "1 pair", "", "$10"),
      m("Metal container with lid for storing finished charcoal", "1", "", "$5"),
    ],
    tools: ["Saw or hatchet (to size wood)", "Hammer", "Safety glasses", "Long-sleeve cotton clothing (no synthetics)"],
    safety: ["Do this ONLY outdoors, far from buildings and dry grass. Check local burn bans.", "Smoke contains carbon monoxide and flammable gases — never do this indoors or in a garage.", "The can stays dangerously hot for hours; let it cool completely before opening (opening hot lets oxygen in and the charcoal ignites).", "Students must be supervised by an adult; keep water ready."],
    phases: [
      { name: "Prepare", steps: [
        s("ch1", "Choose and dry your wood", "Use seasoned hardwood with no paint, glue or treatment. Split it into pieces about the thickness of two fingers so they char evenly. Remove bark if you want cleaner charcoal.", false, ["Hardwood", "Saw/hatchet"], "Wet wood takes much longer and produces weak charcoal."),
        s("ch2", "Prepare the retort can", "Punch ONE small hole (3–4 mm) in the center of the lid with the nail. This lets gases escape but stops air entering. Burn out any coating by heating the empty can in a fire first if needed.", false, ["Paint can", "Nail", "Hammer"], "Too big a hole = air gets in and wood turns to ash."),
        s("ch3", "Pack the can", "Pack the wood pieces tightly upright in the can — fill it fully with as little air space as possible. Hammer the lid on tightly all around.", false, ["Wood", "Can"], "Fully-packed cans yield more and more even charcoal."),
      ]},
      { name: "Cook", steps: [
        s("ch4", "Build the outer fire", "Build a good wood fire in the pit. Once you have a bed of hot coals, place the can in the middle (on its side or upright) and pile more firewood around and over it.", false, ["Firewood", "Fire pit"], "Even heating all around is the goal."),
        s("ch5", "Watch the gas jet", "After 15–30 minutes, smoke/steam starts coming from the hole, then it catches fire as a small jet of flame — these are wood gases burning (pyrolysis). Keep feeding the outer fire.", true, ["Tongs"], "The jet of flame is the best sign it's working!"),
        s("ch6", "Know when it's done", "When the flame jet from the hole dies out and no more smoke comes out (usually 1–3 hours depending on can size), the conversion is complete.", true, [], "Large drums can take 4–8 hours."),
      ]},
      { name: "Cool & Store", steps: [
        s("ch7", "Seal and cool completely", "Using tongs and gloves, pull the can from the fire. Plug the hole with a nail or a dab of mud/clay so no oxygen gets in. Let it cool completely — ideally overnight.", false, ["Gloves", "Tongs", "Mud/clay"], "Don't splash water on the can — rapid cooling can warp it and doesn't cool the inside fast."),
        s("ch8", "Open and inspect", "When fully cold to the touch, open the lid. Good charcoal is black throughout, light, rings when tapped (a 'clink' sound), and snaps cleanly. Brown pieces are under-done — re-cook them next batch.", false, [], "Weight drops to about 20–30% of the original wood."),
        s("ch9", "Store or use", "Store in a lidded metal container in a dry place. For biochar, crush to pea size, soak in compost tea or diluted urine for 1–2 weeks to 'charge' it, then mix 5–10% into garden soil.", false, ["Metal container"], "Uncharged biochar can temporarily rob nutrients from soil."),
      ]},
    ],
    risks: [
      { risk: "Charcoal ignites on opening", mitigation: "Seal vent and cool completely before opening." },
      { risk: "Wildfire / burns", mitigation: "Fire pit only, clear 3 m area, water ready, gloves, supervision." },
      { risk: "Toxic smoke", mitigation: "Untreated wood only, outdoors, stand upwind." },
    ],
    videos: [
      { title: "How to Make Charcoal in a Can", url: yt("how to make charcoal paint can retort") },
      { title: "Making Biochar at Home", url: yt("make biochar at home small scale") },
      { title: "Barrel Retort Charcoal Kiln", url: yt("barrel retort charcoal kiln diy") },
    ],
  }),

  // ───────────────────────────── FUEL BRIQUETTES ─────────────────────────────
  finish({
    slug: "fuel-briquettes", title: "Make Fuel Briquettes from Paper & Sawdust", emoji: "🧱", difficulty: "Beginner", estimatedTime: "1 day to make + 1–2 weeks drying", cost: "$15–$40",
    summary: "Turn waste paper, cardboard, sawdust, dry leaves or charcoal dust into dense fuel bricks for stoves, fire pits and campfires. You'll build a simple lever press from wood and a perforated can mold. A practical, eco-friendly fuel project used worldwide.",
    materials: [
      m("Waste paper / newspaper / cardboard (no glossy magazines)", "1 large bag (≈ 5 kg)", "binder material", "Free"),
      m("Sawdust, wood shavings, dry leaves, rice husks or charcoal dust", "1–2 buckets", "filler that adds heat", "Free"),
      m("Large buckets / plastic drums with lids (soaking)", "2", "", "$10"),
      m("Water", "≈ 20 L", "", "—"),
      m("Metal can (≈ 10 cm diameter, e.g. large food can) or 4\" PVC pipe 15 cm long", "2–4", "molds; drill 20+ holes 5 mm in sides & bottom", "Free–$5"),
      m("Wooden disc / plunger slightly smaller than the mold (cut from 2×6 offcut)", "1 per mold", "with a 3/4\" dowel or broom handle in the center = optional center hole", "$3"),
      m("2×4 lumber 8 ft (press lever & frame)", "2", "", "$10"),
      m("3/8\" bolt 4\" + nuts + washers (lever pivot)", "1 set", "", "$2"),
      m("Wood screws 3\"", "20", "", "$4"),
      m("Wire mesh or old window screen (drying rack)", "1 m²", "", "$5"),
    ],
    tools: ["Saw", "Drill + 5 mm and 3/8\" bits", "Tape measure", "Gloves (wet paper is messy)", "Optional: drill paddle mixer"],
    safety: ["Burn briquettes only in well-ventilated stoves, fire pits or outdoors.", "Don't use glossy/coated paper or treated wood sawdust — they release toxic fumes.", "Briquettes must be fully dry before burning or storing in bulk (damp piles can mold)."],
    phases: [
      { name: "Make the Pulp", steps: [
        s("fb1", "Shred and soak paper", "Tear or shred paper and cardboard into small pieces (≈ 2–5 cm). Put them in a bucket, cover with water, and soak 2–3 days (or overnight in hot water) until soft.", false, ["Paper", "Bucket", "Water"], "The softer the pulp, the better the briquettes stick together."),
        s("fb2", "Mash into pulp", "Squeeze and mash the soaked paper with your hands, a stick, or a paddle mixer on a drill until it looks like porridge.", false, ["Paddle mixer (optional)"], "Pulp alone burns OK — fillers make it burn hotter and longer."),
        s("fb3", "Mix in filler", "Mix 1 part paper pulp with 1–2 parts sawdust/leaves/charcoal dust by volume. Add water until it holds together when squeezed but isn't soupy.", false, ["Sawdust / leaves / char dust"], "Charcoal dust + paper = the highest heat briquettes."),
      ]},
      { name: "Build the Press", steps: [
        s("fb4", "Make perforated molds", "Drill 20–30 holes (5 mm) around the sides and bottom of each can or PVC tube so water can escape during pressing. Cut wooden plungers that slide easily inside.", false, ["Cans / PVC", "Drill"], "PVC tubes with a removable end cap make ejecting easier."),
        s("fb5", "Build the lever press", "Screw a 2×4 base (60 cm) and an upright post (60 cm) in an L-shape, braced with a diagonal. Bolt a 1.2 m 2×4 lever to the top of the post with the 3/8\" bolt so it pivots. The mold sits on the base under the lever, ~20 cm from the pivot (gives ~6× force).", true, ["2×4", "Bolt", "Screws"], "Longer lever = more pressure = denser briquettes."),
      ]},
      { name: "Press & Dry", steps: [
        s("fb6", "Fill and press", "Fill the mold with the wet mixture, place the plunger on top and press down hard with the lever. Water will squirt out the holes. Add more mix and press again until the mold is full and firm.", false, ["Press", "Mold"], "Press over a tray or outdoors — lots of water comes out."),
        s("fb7", "Eject the briquette", "Push the briquette out (remove the end cap or turn the can over and tap). Optional: press around a dowel in the center to create a hole — briquettes with a hole burn better.", false, [], "Handle gently — they're fragile until dry."),
        s("fb8", "Dry thoroughly", "Place briquettes on a wire mesh in the sun with airflow under them. Turn daily. Dry 1–2 weeks until they're light and hard all the way through.", false, ["Wire mesh rack"], "Cover at night or when it rains."),
        s("fb9", "Test burn and store", "Light one in a fire pit or stove using kindling. Note burn time and smoke. Store the rest in a dry place in sacks or bins.", false, ["Fire pit / stove"], "A good briquette burns 30–60 minutes with low smoke."),
      ]},
    ],
    risks: [
      { risk: "Briquettes crumble", mitigation: "More paper pulp binder, more pressing force." },
      { risk: "Smoky burning", mitigation: "Dry fully, avoid glossy paper, add charcoal dust." },
      { risk: "Mold during drying", mitigation: "Sun + airflow, turn daily, thinner briquettes." },
    ],
    videos: [
      { title: "How to Make Paper Fuel Briquettes", url: yt("how to make paper briquettes press diy") },
      { title: "DIY Lever Briquette Press", url: yt("diy wooden lever briquette press") },
      { title: "Charcoal Dust Briquettes", url: yt("make charcoal dust briquettes at home") },
    ],
  }),

  // ───────────────────────────── SOLAR CHARGER ─────────────────────────────
  finish({
    slug: "solar-charger", title: "Build a Solar USB Phone Charger / Power Bank", emoji: "☀️", difficulty: "Beginner", estimatedTime: "1 afternoon (3–4 hrs)", cost: "$25–$45",
    summary: "A portable solar charger: a 6 V solar panel charges a lithium battery through a protected charging module, and a 5 V USB boost module charges your phone any time — even at night.",
    materials: [
      m("6 V solar panel, 3–6 W", "1", "", "$10–15"),
      m("TP4056 lithium charger module WITH protection (USB-C or micro-USB)", "1", "the 6-pin version with DW01 protection", "$2"),
      m("18650 Li-ion cell 3.7 V, 2,500–3,500 mAh (protected)", "1–2", "connect in parallel only", "$6 each"),
      m("18650 battery holder", "1", "", "$1"),
      m("5 V USB boost converter module (MT3608 or 'USB 5V 1A/2A step-up')", "1", "", "$2"),
      m("1N5819 Schottky diode", "1", "stops battery draining into panel at night", "$0.30"),
      m("Mini rocker or slide switch", "1", "", "$1"),
      m("22 AWG stranded wire, red & black", "1 m each", "", "$3"),
      m("Project box (plastic) ~ 10×6×3 cm", "1", "", "$4"),
      m("Hot glue sticks, double-sided tape, heat shrink", "1 each", "", "$4"),
    ],
    tools: ["Soldering iron 30–60 W + solder", "Wire strippers", "Multimeter", "Hot glue gun", "Drill or craft knife (box openings)"],
    safety: ["Never connect Li-ion cells in series or reverse — check polarity before soldering.", "Don't solder directly to cells; use a holder.", "Don't leave the charger in a hot car — lithium cells degrade over 60 °C."],
    phases: [
      { name: "Test Parts", steps: [
        s("sc1", "Test the panel", "In sunlight, measure the panel's open-circuit voltage with the multimeter (should be ~6–7 V).", false, ["Multimeter", "Panel"], "Partial shade on one cell can cut output by half."),
        s("sc2", "Charge the battery once via USB", "Insert the cell into the holder, connect holder +/– to TP4056 B+/B–, and plug in USB. Red LED = charging, blue/green = full. Measure 4.2 V when full.", false, ["TP4056", "Cell", "Holder"], "Confirms the module works before final assembly."),
      ]},
      { name: "Wire & Assemble", steps: [
        s("sc3", "Panel to charger with diode", "Solder panel + → diode anode; diode cathode (striped end) → TP4056 IN+. Panel – → TP4056 IN–.", true, ["Diode", "Wire"], "The stripe on the diode points toward the TP4056."),
        s("sc4", "Battery to charger", "Holder + → B+, holder – → B– on the TP4056.", false, [], "Double-check polarity with the multimeter before inserting the cell."),
        s("sc5", "Output through switch to boost module", "TP4056 OUT+ → switch → boost IN+; OUT– → boost IN–. Switch on and measure ~5.0–5.2 V at the USB port.", true, ["Switch", "Boost module"], "Adjustable boost modules: turn the trimmer to exactly 5.1 V before plugging in a phone."),
        s("sc6", "Mount in the box", "Cut openings for USB output, TP4056 USB input (backup charging), LEDs and switch. Hot-glue modules in place; panel on the lid with wires through a small hole.", false, ["Project box", "Hot glue"], "Leave the LEDs visible so you can see charge status."),
      ]},
      { name: "Test", steps: [
        s("sc7", "Sun charge test", "Leave it in direct sun for a few hours; check the red charge LED is on. Then charge a phone from the USB port.", false, ["Phone + cable"], "A 5 W panel adds roughly 1,000 mAh to the battery per 3–4 sunny hours."),
      ]},
    ],
    risks: [{ risk: "Battery short/fire", mitigation: "Protected TP4056, protected cell, check polarity." }, { risk: "Phone won't charge", mitigation: "Adjust boost to 5.1 V; use a 2 A boost module for larger phones." }],
    videos: [
      { title: "DIY Solar Power Bank TP4056", url: yt("diy solar power bank tp4056 18650") },
      { title: "TP4056 Module Explained", url: yt("tp4056 module explained protection") },
    ],
  }),

  // ───────────────────────────── COMPOST BIN ─────────────────────────────
  finish({
    slug: "compost-bin", title: "Build a Pallet Compost Bin", emoji: "♻️", difficulty: "Beginner", estimatedTime: "2–3 hours", cost: "$0–$25",
    summary: "A sturdy 1 m³ compost bin made from 4 free wooden pallets, plus how to make finished compost in 2–3 months.",
    materials: [
      m("Wooden pallets stamped 'HT' (heat-treated) — NOT 'MB' (chemically treated)", "4", "", "Free"),
      m("Galvanized wire, zip ties (heavy) or metal brackets", "1 roll / 12", "", "$10"),
      m("3\" exterior screws (if using brackets)", "24", "", "$5"),
      m("Hinges (optional, front gate)", "2", "", "$6"),
      m("Brown material (dry leaves, cardboard, straw) & green material (kitchen scraps, grass clippings)", "ongoing", "about 3:1 brown to green by volume", "Free"),
    ],
    tools: ["Drill/driver", "Pliers / wire cutters", "Gloves", "Garden fork", "Compost thermometer (optional)"],
    safety: ["Only use pallets with the HT stamp.", "Wear gloves — pallets have splinters and nails.", "Don't compost meat, dairy, oils or pet waste in a home bin."],
    phases: [
      { name: "Build", steps: [
        s("cb1", "Choose a spot", "A level, shady, well-drained spot on bare soil (so worms can get in), close to the kitchen and a hose.", false, [], "Partial shade keeps it from drying out."),
        s("cb2", "Stand up the back and sides", "Stand 3 pallets on edge to form a U. Tie corners together at top, middle and bottom with wire or zip ties (or screw on brackets).", false, ["3 pallets", "Wire / brackets"], "Drive a stake inside each corner for extra stability."),
        s("cb3", "Add the front", "Attach the 4th pallet as the front with hinges or wire on one side so it opens like a gate for turning.", false, ["4th pallet", "Hinges"], "Optional: line with chicken wire to keep compost in."),
      ]},
      { name: "Compost", steps: [
        s("cb4", "Layer browns and greens", "Start with 10 cm of twigs for airflow, then alternate 15 cm of browns and 5 cm of greens. Sprinkle each layer with water until damp like a wrung-out sponge.", false, ["Browns", "Greens", "Hose"], "Chop materials small — they break down much faster."),
        s("cb5", "Turn every 1–2 weeks", "Use a garden fork to mix the pile, moving outside material to the center. The center should feel warm (40–65 °C).", false, ["Garden fork"], "Smells bad = too wet/green → add browns. Not heating = add greens and water."),
        s("cb6", "Harvest finished compost", "After 2–3 months, compost is dark, crumbly and smells earthy. Sift and use in garden beds and pots.", false, ["Sieve"], "Return unfinished chunks to the new pile."),
      ]},
    ],
    risks: [{ risk: "Smelly pile / pests", mitigation: "Balance browns, cover food scraps, no meat or dairy." }, { risk: "Chemical pallets", mitigation: "Only HT-stamped pallets." }],
    videos: [
      { title: "Pallet Compost Bin in 30 Minutes", url: yt("pallet compost bin build") },
      { title: "Composting for Beginners", url: yt("composting for beginners browns greens") },
    ],
  }),

  // ───────────────────────────── BIRDHOUSE (detailed) ─────────────────────────────
  finish({
    slug: "birdhouse", title: "Build a Wooden Birdhouse", emoji: "🐦", difficulty: "Beginner", estimatedTime: "1 day (4–6 hrs)", cost: "$15–$30",
    summary: "A classic cedar birdhouse for wrens, chickadees or bluebirds, cut from a single 1×6 board. Includes an exact cut list, hole sizes by species and a pivoting side for yearly cleaning.",
    materials: [
      m("1×6 cedar board (actual 3/4\" × 5-1/2\"), 6 ft", "1", "untreated — never pressure-treated", "$12–18"),
      m("1-1/4\" galvanized or stainless exterior deck screws", "20", "", "$5"),
      m("Exterior wood glue (Titebond III)", "1 small bottle", "", "$5"),
      m("Galvanized nails 1-1/2\" (pivot pins for the cleaning door)", "2", "", "$1"),
      m("Small hook-and-eye or screw (door latch)", "1", "", "$1"),
      m("120-grit sandpaper", "2 sheets", "", "$2"),
      m("Water-based exterior stain/sealer (light color, outside only)", "small can", "optional", "$8"),
      m("Mounting: 1/2\" conduit pole or 2 × 2-1/2\" screws for a post", "1", "", "$5"),
    ],
    tools: ["Hand saw or circular/miter saw", "Drill + 3/32\" pilot bit + 1/4\" bit", "Spade bit or hole saw: 1-1/8\" (wren), 1-1/4\" (chickadee) or 1-1/2\" (bluebird)", "Tape measure + speed square + pencil", "Clamps (2)", "Screwdriver bit", "Safety glasses"],
    safety: ["Clamp the board when cutting and drilling — never hold small parts by hand near the blade.", "Wear safety glasses for all cutting and drilling.", "Students should use hand saws or be supervised with power saws."],
    phases: [
      { name: "Mark the Cut List", steps: [
        s("b1", "Choose the bird and hole size", "Entrance hole: 1-1/8\" for house wrens, 1-1/4\" for chickadees, 1-1/2\" for bluebirds. Hole center 6\" above the floor. No perch (it helps predators).", false, ["Local bird guide"], "Check which birds nest locally in spring."),
        s("b2", "Mark all 6 parts on the board", "Mark these lengths on the 1×6 using the speed square: FRONT 9\", BACK 12\", SIDE A 8\" (front edge) × 10\" (back edge) — cut at a slope, SIDE B same, FLOOR 4\" (trimmed to 4\" × 4\"), ROOF A 7\", ROOF B 7-3/4\". Label each part.", true, ["Tape", "Speed square", "Pencil"], "Lay out the two side pieces head-to-toe to save wood."),
      ]},
      { name: "Cut & Drill", steps: [
        s("b3", "Cut the parts", "Clamp the board and cut each piece on the waste side of your line. Cut the floor to 4\" × 4\" by ripping 1-1/2\" off a 5-1/2\" piece. Sand all rough edges.", true, ["Saw", "Clamps", "Sandpaper"], "Cut the sloped side pieces with one diagonal cut from 8\" to 10\"."),
        s("b4", "Drill the entrance hole", "On the FRONT, mark center 6\" up from the bottom edge and centered side-to-side. Clamp on scrap wood and drill with the spade bit/hole saw — drill halfway, flip and finish from the other side to prevent splintering.", true, ["Spade bit / hole saw", "Scrap wood"], "Scratch horizontal grooves inside below the hole so fledglings can climb out."),
        s("b5", "Drill ventilation and drainage", "Drill two 1/4\" holes near the top of each side, and four 1/4\" holes in the floor corners. Cut 1/4\" off each floor corner for extra drainage.", false, ["1/4\" bit"], ""),
      ]},
      { name: "Assemble", steps: [
        s("b6", "Attach sides to the back", "Center the back (12\") so 1\" extends below and above the box for mounting. Pre-drill 3/32\" pilot holes, glue, and screw each side to the back with 3 screws.", false, ["Screws", "Glue", "Pilot bit"], "Pilot holes prevent cedar from splitting."),
        s("b7", "Fit the floor recessed", "Fit the floor between the sides, 1/4\" up from the bottom edge. Glue and screw from the sides and back.", false, ["Floor", "Screws"], "Recessing the floor keeps rainwater out."),
        s("b8", "Attach the front", "Glue and screw the front to the fixed side and the floor. On the cleaning side, DON'T glue — instead drive one nail through the front and one through the back into that side, both 1\" below the top, to make a pivot. Add a hook-and-eye at the bottom.", true, ["Nails", "Hook-and-eye"], "This pivoting side lets you clean out old nests each autumn."),
        s("b9", "Attach the roof", "Butt the longer roof piece over the shorter one at the peak (or for a single slope, use one 7-3/4\" piece overhanging the front 2\"). Glue the peak seam and screw roof to the sides.", false, ["Roof pieces", "Glue", "Screws"], "The front overhang keeps rain and predators' paws out."),
      ]},
      { name: "Finish & Mount", steps: [
        s("b10", "Seal the outside (optional)", "Sand the edges and apply a light-colored water-based stain to the outside only. Never paint inside or around the hole.", false, ["Sealer"], "Light colors keep the box cooler in summer."),
        s("b11", "Mount 5–10 ft high", "Screw through the extended back into a post or tree, or mount on a metal pole with a predator baffle. Face the hole away from prevailing winds, ideally east. Put it up by late winter.", false, ["Screws", "Post / pole"], "Clean out old nesting material each autumn."),
      ]},
    ],
    risks: [
      { risk: "Wood splits", mitigation: "Pre-drill all screw holes, 3/4\" from edges." },
      { risk: "Cuts or injury", mitigation: "Clamp workpieces, safety glasses, adult supervision." },
      { risk: "Predators", mitigation: "No perch, roof overhang, pole with a baffle." },
    ],
    videos: [
      { title: "Birdhouse from One Cedar Board", url: yt("birdhouse from one 1x6 cedar board") },
      { title: "Bluebird House Plans", url: yt("bluebird house plans build") },
      { title: "Drilling Clean Holes with a Hole Saw", url: yt("hole saw clean hole tips") },
    ],
  }),
];
