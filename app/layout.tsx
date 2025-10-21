import type React from "react";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";

import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

import {
  Plus_Jakarta_Sans,
  JetBrains_Mono,
  Crimson_Pro,
} from "next/font/google";

// Initialize fonts with better weights for hierarchy
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const crimsonPro = Crimson_Pro({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "SessionSight - Therapist Practice Management",
  description:
    "Analytics and insights platform for mental health professionals to improve client engagement and treatment outcomes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`font-sans antialiased ${plusJakartaSans.variable} ${jetBrainsMono.variable} ${crimsonPro.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </ThemeProvider>
        <Analytics />
        <Toaster />
      </body>
    </html>
  );
}
