import type { Metadata } from "next";
import { Archivo, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import AgeGate from "@/components/AgeGate";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400","700"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Conciply — Autonomous Growth OS",
  description: "Every great idea deserves a growth playbook. Conciply deploys 20 AI specialists to analyze any business or idea and generate a complete growth strategy in seconds.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${grotesk.variable} ${mono.variable}`}>
      <body>
        <AgeGate />
        {children}
      </body>
    </html>
  );
}
