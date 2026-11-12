import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MakerPath — Build guides, 3D models & AI mentor",
    short_name: "MakerPath",
    description: "AI co-pilot: build plans, mentor chat, 3D sketchpad, and learning hub.",
    start_url: "/",
    display: "standalone",
    background_color: "#111116",
    theme_color: "#8b5cf6",
    icons: [
      { src: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
