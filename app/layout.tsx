import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FitLife — Personal Fitness & Wellness Platform",
  description:
    "Your AI-powered personal fitness and wellness platform. Track workouts, log meals, monitor progress, and get personalized coaching.",
  keywords: ["fitness", "wellness", "workout", "nutrition", "AI coach"],
  openGraph: {
    title: "FitLife — Personal Fitness & Wellness Platform",
    description:
      "Your AI-powered personal fitness and wellness platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
