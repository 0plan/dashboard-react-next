"use client";

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";

import { TooltipProvider } from "@/components/ui/tooltip";

export function ThemeProvider({ children, scriptProps, ...props }: ThemeProviderProps) {
  // Only the initial HTML needs the pre-paint script; next-themes handles later changes in React.
  const bootstrap = typeof window === "undefined" ? scriptProps : { ...scriptProps, type: "text/plain" };
  return (
    <NextThemesProvider {...props} scriptProps={bootstrap}>
      <TooltipProvider>{children}</TooltipProvider>
    </NextThemesProvider>
  );
}
