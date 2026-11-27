import type { Metadata } from "next";
import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { getLocale, getMessages } from "@/lib/i18n";
import { TrafficShell } from "./(traffic)/shell";

export async function generateMetadata(): Promise<Metadata> {
  const { appName } = await getMessages("common");
  return { title: { default: appName, template: `%s | ${appName}` } };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={await getLocale()} suppressHydrationWarning={true}>
      <body className="bg-background font-sans">
        <ThemeProvider attribute={"class"} defaultTheme={"system"}>
          <Toaster />
          <TrafficShell>{children}</TrafficShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
