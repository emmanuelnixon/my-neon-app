"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASIC_KINDS, PRO_KINDS, type Shape, type ShapeKind } from "@/lib/data";
import { searchModels } from "@/lib/library";
import { useStore } from "./store";

const CDN = "https://cdn.jsdelivr.net/npm/three@0.128.0";
function loadScript(src: string) {
  return new Promise<void>((res, rej) => {
    const ex = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
    if (ex) { if (ex.dataset.loaded) return res(); ex.addEventListener("load", () => res()); ex.addEventListener("error", () => rej()); return; }
    const s = document.createElement("script"); s.src = src;
    s.onload = () => { s.dataset.loaded = "1"; res(); }; s.onerror = () => rej(new Error("load failed")); document.head.appendChild(s);
  });
}

const ICONS: Record<string, string> = { box: "⬛", cylinder: "🛢️", sphere: "⚪", cone: "🔺", torus: "🍩", pyramid: "🔼", hemisphere: "◓", tube: "🧻", wedge: "📐", capsule: "💊", ring: "⭕", octahedron: "🔷", icosahedron: "💎", dodecahedron: "⚽", plane: "▭", knot: "➰" };

type Item = { id: number; kind: ShapeKind; label: string; mesh: any; url?: string };
type Result = { id: string; name: string; category: string; source: "offline" | "online"; url?: string; credit?: string; pro: boolean; shapes?: Shape[]; parts?: number };
type Props = { initial?: Shape[]; storageKey?: string; title?: string; height?: number; defaultQuery?: string };

export default function Visualizer({ initial = [], storageKey, title = "sketch", height = 460, defaultQuery = "" }: Props) {
  const { tier, online } = useStore(); const nav = useNavigate();
  const isPro = tier !== "free";
  const mount = useRef<HTMLDivElement>(null);
  const three = useRef<any>({});
  const itemsRef = useRef<Item[]>([]);
  const [items, setItemsS] = useState<Item[]>([]);
  const [sel, setSel] = useState<number | null>(null);
  const [status, setStatus] = useState("Loading 3D engine…");
  const [autoRotate, setAutoRotate] = useState(false);
  const [panel, setPanel] = useState<"edit" | "library">("edit");
  const [q, setQ] = useState(defaultQuery); const [src, setSrc] = useState<"all" | "offline" | "online">("all");
  const [results, setResults] = useState<Result[]>([]); const [searching, setSearching] = useState(false); const [note, setNote] = useState("");
  const [, force] = useState(0);
  const setItems = (v: Item[]) => { itemsRef.current = v; setItemsS(v); };

  const serialize = (): Shape[] => itemsRef.current.map((i) => {
    const m = i.mesh;
    return { kind: i.kind, label: i.label, url: i.url, color: m.material ? "#" + m.material.color.getHexString() : "#ffffff", metal: m.material?.metalness, rough: m.material?.roughness,
      pos: [m.position.x, m.position.y, m.position.z], scale: [m.scale.x, m.scale.y, m.scale.z], rot: [m.rotation.x, m.rotation.y, m.rotation.z] };
  });
  const persist = () => { if (storageKey) try { localStorage.setItem(storageKey, JSON.stringify(serialize())); } catch {} };

  const geometry = (kind: ShapeKind) => {
    const T = three.current.THREE;
    switch (kind) {
      case "box": return new T.BoxGeometry(1, 1, 1);
      case "cylinder": return new T.CylinderGeometry(0.5, 0.5, 1, 40);
      case "cone": return new T.ConeGeometry(0.5, 1, 40);
      case "torus": return new T.TorusGeometry(0.4, 0.1, 20, 64);
      case "pyramid": return new T.ConeGeometry(0.5, 1, 4);
      case "hemisphere": return new T.SphereGeometry(0.5, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2);
      case "tube": return new T.CylinderGeometry(0.5, 0.5, 1, 40, 1, true);
      case "wedge": { const sh = new T.Shape(); sh.moveTo(-0.5, -0.5); sh.lineTo(0.5, -0.5); sh.lineTo(0, 0.5); sh.closePath(); const g = new T.ExtrudeGeometry(sh, { depth: 1, bevelEnabled: false }); g.translate(0, 0, -0.5); return g; }
      case "capsule": { const pts = []; for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + (i / 12) * (Math.PI / 2); pts.push(new T.Vector2(Math.cos(a) * 0.5, Math.sin(a) * 0.5 - 0.25)); } for (let i = 0; i <= 12; i++) { const a = (i / 12) * (Math.PI / 2); pts.push(new T.Vector2(Math.cos(a) * 0.5, Math.sin(a) * 0.5 + 0.25)); } const g = new T.LatheGeometry(pts, 40); g.scale(1, 1 / 1.5, 1); return g; }
      case "ring": return new T.RingGeometry(0.3, 0.5, 64);
      case "octahedron": return new T.OctahedronGeometry(0.5);
      case "icosahedron": return new T.IcosahedronGeometry(0.5);
      case "dodecahedron": return new T.DodecahedronGeometry(0.5);
      case "plane": return new T.PlaneGeometry(1, 1);
      case "knot": return new T.TorusKnotGeometry(0.32, 0.11, 160, 20);
      default: return new T.SphereGeometry(0.5, 40, 20);
    }
  };

  const makeMesh = (s: Shape) => {
    const { THREE, scene } = three.current;
    let obj: any;
    if (s.kind === "gltf" && s.url) {
      obj = new THREE.Group();
      const url = s.url;
      const loader = new THREE.GLTFLoader();
      loader.load(url, (g: any) => {
        const inner = g.scene; const box = new THREE.Box3().setFromObject(inner); const size = box.getSize(new THREE.Vector3()); const center = box.getCenter(new THREE.Vector3());
        const k = 3 / Math.max(size.x, size.y, size.z || 1); inner.scale.setScalar(k);
        inner.position.set(-center.x * k, -box.min.y * k, -center.z * k);
        inner.traverse((o: any) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        obj.add(inner); setNote("");
      }, undefined, () => setNote("Couldn't download that online model — check your connection."));
    } else {
      const doubleSided = ["tube", "ring", "plane", "hemisphere"].includes(s.kind);
      obj = new THREE.Mesh(geometry(s.kind), new THREE.MeshStandardMaterial({ color: s.color, roughness: s.rough ?? 0.6, metalness: s.metal ?? 0, side: doubleSided ? THREE.DoubleSide : THREE.FrontSide }));
      obj.castShadow = true; obj.receiveShadow = true;
    }
    obj.position.set(...s.pos); obj.scale.set(...s.scale); if (s.rot) obj.rotation.set(...s.rot);
    scene.add(obj); return obj;
  };
  const disposeObj = (o: any) => { three.current.scene.remove(o); o.traverse((c: any) => { c.geometry?.dispose?.(); c.material?.dispose?.(); }); };
  const loadShapes = (shapes: Shape[], append = false) => {
    if (!append) itemsRef.current.forEach((i) => disposeObj(i.mesh));
    const added = shapes.map((s, n) => ({ id: Date.now() + n + Math.random(), kind: s.kind, label: s.label ?? s.kind, url: s.url, mesh: makeMesh(s) }));
    setItems(append ? [...itemsRef.current, ...added] : added); setSel(null);
  };

  useEffect(() => {
    let disposed = false; let raf = 0;
    (async () => {
      try {
        await loadScript(`${CDN}/build/three.min.js`);
        await Promise.all([loadScript(`${CDN}/examples/js/controls/OrbitControls.js`), loadScript(`${CDN}/examples/js/loaders/GLTFLoader.js`)]);
      } catch { setStatus("Couldn't load the 3D engine (offline?). Plans, steps and mentor still work offline — reconnect to view 3D."); return; }
      if (disposed || !mount.current) return;
      const THREE = (window as any).THREE; const el = mount.current;
      const scene = new THREE.Scene(); scene.background = new THREE.Color(0x15151c); scene.fog = new THREE.Fog(0x15151c, 25, 60);
      const camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 200); camera.position.set(7, 6, 9);
      const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(el.clientWidth, el.clientHeight);
      renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
      el.appendChild(renderer.domElement);
      const controls = new THREE.OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.target.set(0, 1.5, 0); controls.autoRotateSpeed = 1.5;
      scene.add(new THREE.HemisphereLight(0xdfe6ff, 0x2a2233, 0.7));
      const dl = new THREE.DirectionalLight(0xffffff, 1.1); dl.position.set(6, 12, 8); dl.castShadow = true; dl.shadow.mapSize.set(2048, 2048);
      Object.assign(dl.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 0.5, far: 50 }); dl.shadow.bias = -0.0005; scene.add(dl);
      const rim = new THREE.DirectionalLight(0xa78bfa, 0.35); rim.position.set(-8, 5, -6); scene.add(rim);
      const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: 0.35 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
      scene.add(new THREE.GridHelper(20, 20, 0x8b5cf6, 0x2a2a35));
      const outline = new THREE.BoxHelper(undefined, 0x6ee7b7); outline.visible = false; scene.add(outline);
      const ray = new THREE.Raycaster(); const v2 = new THREE.Vector2(); let down = { x: 0, y: 0 };
      const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY }; };
      const onUp = (e: PointerEvent) => {
        if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 4) return;
        const r = renderer.domElement.getBoundingClientRect(); v2.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        ray.setFromCamera(v2, camera); const hit = ray.intersectObjects(itemsRef.current.map((i) => i.mesh), true)[0];
        if (!hit) return setSel(null);
        let o = hit.object; while (o && !itemsRef.current.some((i) => i.mesh === o)) o = o.parent;
        const it = itemsRef.current.find((i) => i.mesh === o); setSel(it ? it.id : null); if (it) setPanel("edit");
      };
      renderer.domElement.addEventListener("pointerdown", onDown); renderer.domElement.addEventListener("pointerup", onUp);
      const onResize = () => { camera.aspect = el.clientWidth / el.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(el.clientWidth, el.clientHeight); };
      window.addEventListener("resize", onResize);
      const loop = () => { controls.update(); if (outline.visible) outline.update(); renderer.render(scene, camera); raf = requestAnimationFrame(loop); }; loop();
      three.current = { THREE, scene, renderer, controls, camera, outline, onResize, onDown, onUp };
      let saved: Shape[] | null = null;
      if (storageKey) try { saved = JSON.parse(localStorage.getItem(storageKey) ?? "null"); } catch {}
      loadShapes(saved && saved.length ? saved : initial);
      setStatus("");
    })();
    return () => {
      disposed = true; cancelAnimationFrame(raf);
      const t = three.current; if (!t.renderer) return;
      window.removeEventListener("resize", t.onResize); t.renderer.domElement.removeEventListener("pointerdown", t.onDown); t.renderer.domElement.removeEventListener("pointerup", t.onUp);
      t.controls.dispose(); t.scene.traverse((o: any) => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
      t.renderer.dispose(); t.renderer.domElement.remove(); three.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = three.current; if (!t.outline) return;
    const cur = items.find((i) => i.id === sel);
    if (cur) { t.outline.setFromObject(cur.mesh); t.outline.visible = true; } else t.outline.visible = false;
  }, [sel, items]);
  useEffect(() => { if (three.current.controls) three.current.controls.autoRotate = autoRotate; }, [autoRotate, status]);

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault(); setSearching(true);
    try {
      if (!online) throw new Error("offline");
      const r = await fetch(`/api/models?q=${encodeURIComponent(q)}&source=${src}`); const j = await r.json(); setResults(j.results);
    } catch {
      setResults(searchModels(q, "offline").map((m) => ({ id: m.id, name: m.name, category: m.category, source: "offline" as const, pro: !!m.pro, shapes: m.source === "offline" ? m.shapes : [], parts: m.source === "offline" ? m.shapes.length : 0 })));
      setNote("You're offline — showing the built-in offline library.");
    } finally { setSearching(false); }
  };
  useEffect(() => { if (panel === "library" && results.length === 0) search(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panel]);

  const applyResult = (r: Result, replace: boolean) => {
    if (!three.current.THREE) return;
    if (r.pro && !isPro) { nav("/pricing"); return; }
    if (r.source === "online") {
      if (!online) { setNote("Online models need an internet connection."); return; }
      const shape: Shape = { kind: "gltf", url: r.url, label: r.name, color: "#ffffff", pos: replace ? [0, 0, 0] : [3, 0, 0], scale: [1, 1, 1] };
      setNote("Downloading model…"); loadShapes([shape], !replace);
    } else loadShapes(r.shapes ?? [], !replace);
    setPanel("edit"); setTimeout(persist, 50);
  };
  const add = (kind: ShapeKind) => {
    if (!three.current.THREE) return;
    if ((PRO_KINDS as readonly string[]).includes(kind) && !isPro) { nav("/pricing"); return; }
    const colors = ["#a78bfa", "#6ee7b7", "#f9a8d4", "#fcd34d"];
    const mesh = makeMesh({ kind, color: colors[items.length % 4], pos: [(Math.random() - 0.5) * 3, 0.6, (Math.random() - 0.5) * 3], scale: [1, 1, 1] });
    const id = Date.now(); setItems([...items, { id, kind, label: `New ${kind}`, mesh }]); setSel(id); setTimeout(persist, 0);
  };
  const cur = items.find((i) => i.id === sel);
  const upd = (fn: (m: any) => void) => { if (cur) { fn(cur.mesh); force((n) => n + 1); persist(); } };
  const remove = () => { if (!cur) return; disposeObj(cur.mesh); setItems(items.filter((x) => x.id !== cur.id)); setSel(null); persist(); };
  const duplicate = () => {
    if (!cur) return; const m = cur.mesh;
    const mesh = makeMesh({ kind: cur.kind, url: cur.url, color: m.material ? "#" + m.material.color.getHexString() : "#fff", metal: m.material?.metalness, rough: m.material?.roughness, pos: [m.position.x + 0.5, m.position.y, m.position.z + 0.5], scale: [m.scale.x, m.scale.y, m.scale.z], rot: [m.rotation.x, m.rotation.y, m.rotation.z] });
    const id = Date.now(); setItems([...items, { id, kind: cur.kind, label: cur.label + " copy", url: cur.url, mesh }]); setSel(id); persist();
  };
  const reset = () => { loadShapes(initial); if (storageKey) localStorage.removeItem(storageKey); };
  const download = () => {
    const t = three.current; if (!t.renderer) return; t.outline.visible = false; t.renderer.render(t.scene, t.camera);
    const src = t.renderer.domElement as HTMLCanvasElement; const c = document.createElement("canvas"); c.width = src.width; c.height = src.height;
    const ctx = c.getContext("2d")!; ctx.drawImage(src, 0, 0);
    if (!isPro) { ctx.font = `bold ${Math.round(c.width / 28)}px sans-serif`; ctx.fillStyle = "rgba(255,255,255,.35)"; ctx.textAlign = "right"; ctx.fillText("Made with MakerPath Free", c.width - 20, c.height - 20); }
    const a = document.createElement("a"); a.href = c.toDataURL("image/png"); a.download = `${title.replace(/\W+/g, "-").toLowerCase()}-3d.png`; a.click();
    if (cur) t.outline.visible = true;
  };
  const hex = cur?.mesh.material ? "#" + cur.mesh.material.color.getHexString() : "#a78bfa";
  const slider = (label: string, val: number, min: number, max: number, step: number, set: (v: number) => void) => (
    <label className="block text-xs text-zinc-400">{label}: {val.toFixed(2)}
      <input aria-label={label} type="range" min={min} max={max} step={step} value={val} onChange={(e) => set(+e.target.value)} className="w-full accent-violet-400" />
    </label>
  );

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-4">
      <div className="relative glass rounded-2xl overflow-hidden" style={{ height }} aria-label="3D model viewer. Drag to rotate, scroll to zoom, click a part to edit.">
        <div ref={mount} className="absolute inset-0" />
        {status && <div className="absolute inset-0 grid place-items-center text-zinc-400 p-6 text-center">{status}</div>}
        <div className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded-full bg-black/40 text-zinc-300">{online ? "🟢 Online" : "⚪ Offline mode"} · {tier.toUpperCase()}</div>
        <div className="absolute top-2 right-2 flex gap-2">
          <button onClick={() => setAutoRotate(!autoRotate)} className="btn-ghost text-xs px-2 py-1" aria-pressed={autoRotate}>{autoRotate ? "⏸ Stop" : "🔄 Spin"}</button>
          <button onClick={download} className="btn-ghost text-xs px-2 py-1" title={isPro ? "Download PNG" : "Free plan PNGs include a watermark"}>⬇ PNG</button>
        </div>
        {note && <div className="absolute bottom-8 left-3 right-3 text-xs text-amber-200 bg-black/50 rounded-lg px-2 py-1">{note}</div>}
        <div className="absolute bottom-2 left-3 text-xs text-zinc-500 pointer-events-none">Drag: rotate · Scroll: zoom · Right-drag: pan · Click a part to edit</div>
      </div>

      <div className="glass rounded-2xl p-4 space-y-3 overflow-y-auto" style={{ maxHeight: height }}>
        <div role="tablist" className="grid grid-cols-2 gap-1 bg-black/20 rounded-xl p-1">
          {(["edit", "library"] as const).map((p) => <button key={p} role="tab" aria-selected={panel === p} onClick={() => setPanel(p)} className={`text-xs py-1.5 rounded-lg ${panel === p ? "bg-violet-500/30 text-violet-100" : "text-zinc-400"}`}>{p === "edit" ? "✏️ Edit" : "🔍 Search models"}</button>)}
        </div>

        {panel === "library" ? (
          <div className="space-y-3">
            <form onSubmit={search} className="flex gap-2">
              <input aria-label="Search models" className="input text-sm" placeholder="chair, car, lamp, robot…" value={q} onChange={(e) => setQ(e.target.value)} />
              <button className="btn-primary px-3 text-sm">{searching ? "…" : "Go"}</button>
            </form>
            <div className="flex gap-1 text-[11px]">
              {(["all", "offline", "online"] as const).map((s) => <button key={s} onClick={() => setSrc(s)} className={`px-2 py-1 rounded-full border ${src === s ? "border-emerald-400 text-emerald-300" : "border-white/10 text-zinc-400"}`}>{s === "all" ? "All" : s === "offline" ? "📦 Offline" : "🌐 Online"}</button>)}
            </div>
            {!isPro && <button onClick={() => nav("/pricing")} className="w-full text-left text-[11px] rounded-xl p-2 bg-violet-500/10 border border-violet-400/30 text-violet-200">🔒 Online photoreal models & Pro shapes need <b>Pro</b>. See pricing →</button>}
            <ul className="space-y-2">
              {results.length === 0 && !searching && <li className="text-xs text-zinc-500">No matches. Try “chair”, “vehicle”, “garden”, “electronics”.</li>}
              {results.map((r) => {
                const locked = r.pro && !isPro;
                return (
                  <li key={r.id} className="rounded-xl border border-white/5 p-2.5 bg-white/[0.02]">
                    <div className="flex justify-between gap-2 text-sm"><span className="font-medium">{r.name}</span><span className="text-[10px] shrink-0">{r.source === "online" ? "🌐" : "📦"}{locked && " 🔒"}</span></div>
                    <div className="text-[11px] text-zinc-500">{r.category} · {r.source === "online" ? "Detailed glTF model" : `${r.parts} parts · works offline`}</div>
                    <div className="flex gap-1.5 mt-2">
                      <button onClick={() => applyResult(r, true)} className="btn-primary text-[11px] px-2 py-1">{locked ? "Unlock" : "Use"}</button>
                      {!locked && <button onClick={() => applyResult(r, false)} className="btn-ghost text-[11px] px-2 py-1">+ Add to scene</button>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <>
            <div>
              <div className="text-[11px] text-zinc-500 mb-1">Basic shapes</div>
              <div className="grid grid-cols-4 gap-1.5">
                {BASIC_KINDS.map((k) => <button key={k} onClick={() => add(k)} className="btn-ghost text-[10px] py-1.5 capitalize" aria-label={`Add ${k}`}>{ICONS[k]}<br />{k}</button>)}
              </div>
              <div className="text-[11px] text-zinc-500 mt-2 mb-1">Pro shapes {!isPro && "🔒"}</div>
              <div className="grid grid-cols-4 gap-1.5">
                {PRO_KINDS.map((k) => <button key={k} onClick={() => add(k)} className={`btn-ghost text-[10px] py-1.5 capitalize truncate ${!isPro ? "opacity-50" : ""}`} aria-label={`Add ${k}${!isPro ? " (Pro)" : ""}`}>{ICONS[k]}<br />{k.slice(0, 7)}</button>)}
              </div>
            </div>
            {items.length > 0 && (
              <select aria-label="Select part" className="input text-sm" value={sel ?? ""} onChange={(e) => setSel(e.target.value ? +e.target.value : null)}>
                <option value="">— Select a part ({items.length}) —</option>
                {items.map((i, n) => <option key={i.id} value={i.id}>{n + 1}. {i.label}</option>)}
              </select>
            )}
            {cur ? (
              <div className="space-y-2 pop">
                <input aria-label="Part name" className="input text-sm" value={cur.label} onChange={(e) => { cur.label = e.target.value; setItems([...items]); persist(); }} />
                {cur.mesh.material ? (
                  <>
                    <label className="flex items-center gap-2 text-xs text-zinc-400">Color <input aria-label="Color" type="color" value={hex} onChange={(e) => upd((m) => m.material.color.set(e.target.value))} /></label>
                    {slider("Metalness", cur.mesh.material.metalness, 0, 1, 0.05, (v) => upd((m) => (m.material.metalness = v)))}
                    {slider("Roughness", cur.mesh.material.roughness, 0, 1, 0.05, (v) => upd((m) => (m.material.roughness = v)))}
                  </>
                ) : <p className="text-[11px] text-zinc-500">Downloaded model — textures are preserved. You can still move, rotate and scale it.</p>}
                {slider("Width", cur.mesh.scale.x, 0.02, 8, 0.02, (v) => upd((m) => (m.scale.x = v)))}
                {slider("Height", cur.mesh.scale.y, 0.02, 8, 0.02, (v) => upd((m) => (m.scale.y = v)))}
                {slider("Depth", cur.mesh.scale.z, 0.02, 8, 0.02, (v) => upd((m) => (m.scale.z = v)))}
                {slider("Rotate X", cur.mesh.rotation.x, -3.14, 3.14, 0.01, (v) => upd((m) => (m.rotation.x = v)))}
                {slider("Rotate Y", cur.mesh.rotation.y, -3.14, 3.14, 0.01, (v) => upd((m) => (m.rotation.y = v)))}
                {slider("Rotate Z", cur.mesh.rotation.z, -3.14, 3.14, 0.01, (v) => upd((m) => (m.rotation.z = v)))}
                {slider("Position X", cur.mesh.position.x, -10, 10, 0.05, (v) => upd((m) => (m.position.x = v)))}
                {slider("Position Y", cur.mesh.position.y, -2, 12, 0.05, (v) => upd((m) => (m.position.y = v)))}
                {slider("Position Z", cur.mesh.position.z, -10, 10, 0.05, (v) => upd((m) => (m.position.z = v)))}
                <div className="grid grid-cols-2 gap-2"><button onClick={duplicate} className="btn-ghost py-1.5 text-sm">Duplicate</button><button onClick={remove} className="btn-ghost py-1.5 text-sm text-rose-300">Delete</button></div>
              </div>
            ) : <p className="text-sm text-zinc-400">Click any part to edit it, add shapes above, or use <b>Search models</b> to load a ready-made model.</p>}
            {initial.length > 0 && <button onClick={reset} className="btn-ghost w-full py-1.5 text-sm">↺ Reset to generated model</button>}
          </>
        )}
      </div>
    </div>
  );
}
