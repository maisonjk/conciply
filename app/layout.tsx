import type { Metadata } from "next";
import { Archivo, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400","700"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Conciply — Growth Playbook",
  description: "Solo founders, content creators, and builders: get a 17-section growth playbook from 22 AI specialists in 60 seconds. No login required.",
  openGraph: {
    title: "Conciply — Growth Playbook",
    description: "Solo founders, content creators, and builders: get a 17-section growth playbook from 22 AI specialists in 60 seconds. No login required.",
    url: "https://www.conciply.com",
    siteName: "Conciply",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Conciply — Growth Playbook",
    description: "Solo founders, content creators, and builders: get a 17-section growth playbook from 22 AI specialists in 60 seconds. No login required.",
  },
  metadataBase: new URL("https://www.conciply.com"),

  // ── PWA / home screen icon metadata ─────────────────────────────────────
  // Next.js auto-injects <link rel="manifest"> from app/manifest.ts.
  // These cover browsers and platforms that need explicit <link> tags.
  icons: {
    icon: [
      { url: "/icon-16.png",  sizes: "16x16",  type: "image/png" },
      { url: "/icon-32.png",  sizes: "32x32",  type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    // iOS "Add to Home Screen" — Safari ignores the manifest and uses this
    apple: [{ url: "/icon-180.png", sizes: "180x180", type: "image/png" }],
  },
  // Colours the iOS status bar and Android address bar to match the app bg
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Conciply",
    "theme-color": "#0A0A0B",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${grotesk.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
