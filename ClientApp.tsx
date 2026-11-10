"use client";
import dynamic from "next/dynamic";

const App = dynamic(() => import("./App"), { ssr: false, loading: () => <div className="min-h-screen grid place-items-center text-violet-300">Loading MakerPath…</div> });

export default function ClientApp() {
  return <App />;
}
