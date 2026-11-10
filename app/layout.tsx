import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "MakerPath — Real step-by-step build guides, 3D models & AI mentor",
  description: "AI co-pilot: build plans, mentor chat, 3D sketchpad, and learning hub.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
