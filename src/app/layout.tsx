import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";

import { QueryProvider } from "~/app/_components/providers/QueryProvider";
import { ThemeProvider } from "~/app/_components/providers/ThemeProvider";
import { ApiProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Kanban Lite",
  description: "Simple kanban board demo built with Next.js",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={geist.variable}>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider>
          <QueryProvider>
            <ApiProvider>
              {children}
              <Toaster richColors />
            </ApiProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
