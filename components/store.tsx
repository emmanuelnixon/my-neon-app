"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Plan } from "@/lib/data";

export type ChatMsg = { role: "user" | "mentor"; text: string };
type Session = { email: string } | null;
export type Tier = "free" | "pro" | "studio";

function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
}
function save(key: string, v: unknown) { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }
const today = () => new Date().toISOString().slice(0, 10);

type Ctx = {
  session: Session; signIn: (e: string) => void; signOut: () => void;
  plan: Plan | null; setPlan: (p: Plan) => void;
  projects: Plan[];
  progress: Record<string, string[]>; toggleStep: (slug: string, id: string) => void;
  lessonsDone: string[]; completeLesson: (id: string) => void;
  activity: string[];
  getChat: (slug: string) => ChatMsg[]; setChat: (slug: string, m: ChatMsg[]) => void;
  mentorPrompt: string; setMentorPrompt: (s: string) => void;
  tier: Tier; setTier: (t: Tier) => void; online: boolean;
};
const C = createContext<Ctx | null>(null);
export const useStore = () => useContext(C)!;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session>(null);
  const [plan, setPlanS] = useState<Plan | null>(null);
  const [projects, setProjects] = useState<Plan[]>([]);
  const [progress, setProgress] = useState<Record<string, string[]>>({});
  const [lessonsDone, setLessons] = useState<string[]>([]);
  const [activity, setActivity] = useState<string[]>([]);
  const [chats, setChats] = useState<Record<string, ChatMsg[]>>({});
  const [mentorPrompt, setMentorPrompt] = useState("");
  const [tier, setTierS] = useState<Tier>("free");
  const [online, setOnline] = useState(true);
  useEffect(() => {
    setTierS(load("fm_tier", "free")); setOnline(navigator.onLine);
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  useEffect(() => {
    setSession(load("fm_session", null)); setPlanS(load("fm_plan", null)); setProjects(load("fm_projects", []));
    setProgress(load("fm_progress", {})); setLessons(load("fm_lessons", [])); setActivity(load("fm_activity", []));
    setChats(load("fm_chats", {})); setReady(true);
  }, []);
  useEffect(() => { if (!ready) return; save("fm_session", session); save("fm_plan", plan); save("fm_projects", projects); save("fm_progress", progress); save("fm_lessons", lessonsDone); save("fm_activity", activity); save("fm_chats", chats); }, [ready, session, plan, projects, progress, lessonsDone, activity, chats]);

  const mark = useCallback(() => setActivity((a) => (a.includes(today()) ? a : [...a, today()])), []);
  const value: Ctx = {
    session, signIn: (email) => { setSession({ email }); mark(); }, signOut: () => setSession(null),
    plan, setPlan: (p) => { setPlanS(p); setProjects((ps) => [p, ...ps.filter((x) => x.slug !== p.slug)]); },
    projects, progress,
    toggleStep: (slug, id) => { mark(); setProgress((pr) => { const cur = pr[slug] ?? []; return { ...pr, [slug]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] }; }); },
    lessonsDone, completeLesson: (id) => { mark(); setLessons((l) => (l.includes(id) ? l : [...l, id])); },
    activity, getChat: (slug) => chats[slug] ?? [], setChat: (slug, m) => setChats((c) => ({ ...c, [slug]: m })),
    mentorPrompt, setMentorPrompt,
    tier, setTier: (t) => { setTierS(t); save("fm_tier", t); }, online,
  };
  if (!ready) return <div className="min-h-screen grid place-items-center text-violet-300">Loading MakerPath…</div>;
  return <C.Provider value={value}>{children}</C.Provider>;
}

export function streak(activity: string[]) {
  const set = new Set(activity); let n = 0; const d = new Date();
  if (!set.has(d.toISOString().slice(0, 10))) d.setDate(d.getDate() - 1);
  while (set.has(d.toISOString().slice(0, 10))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
