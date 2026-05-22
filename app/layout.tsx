import type { Metadata } from "next";
import { Inter, Prompt } from "next/font/google";

import { AppNavbar } from "@/app/components/AppNavbar";
import { getProfileBySession } from "@/lib/data/profile";
import { getSessionId } from "@/lib/session";

import "./globals.css";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Cal Vision",
  description: "วิเคราะห์โภชนาการจากรูปอาหารด้วย Dify",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionId = await getSessionId();
  const profile = sessionId ? await getProfileBySession(sessionId) : null;

  return (
    <html
      lang="th"
      className={`${prompt.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <AppNavbar profile={profile} />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
