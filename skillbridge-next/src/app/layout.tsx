import type { Metadata } from "next";
import ClientLayout from "./ClientLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillBridge – AI Student → Business Matching",
  description: "Connects students with local businesses using AI. Find internships, part-time jobs, and career opportunities tailored to your skills and interests.",
  keywords: ["student jobs", "internships", "AI matching", "career opportunities", "skillbridge"],
  authors: [{ name: "SkillBridge Team" }],
  openGraph: {
    title: "SkillBridge – AI Student → Business Matching",
    description: "Connects students with local businesses using AI.",
    type: "website",
    url: "https://skillbridge.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillBridge – AI Student → Business Matching",
    description: "Connects students with local businesses using AI.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
