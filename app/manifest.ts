import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Conciply — Autonomous Growth OS",
    short_name: "Conciply",
    description: "A 17-section growth playbook from 22 AI specialists in 60 seconds.",
    start_url: "/",
    display: "standalone",          // hides browser chrome — feels like a native app
    background_color: "#0A0A0B",   // shown during splash screen
    theme_color: "#0A0A0B",        // colours the iOS status bar and Android top bar
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",        // Android adaptive icons — safe zone crop
      },
    ],
  };
}
