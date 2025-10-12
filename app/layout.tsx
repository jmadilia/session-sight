import type React from "react";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";

import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import "./globals.css";

import { Inter, Roboto_Mono } from "next/font/google";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SessionSight - AI-Powered Mental Health Journaling",
  description:
    "Track your mental health journey with AI-powered insights, sentiment analysis, and personalized recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
        <body className={`font-sans ${inter.variable} ${robotoMono.variable}`}>
          <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange>
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
            </ThemeProvider>
          <Analytics />
        </body>
    </html>
  );
}

