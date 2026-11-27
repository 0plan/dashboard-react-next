import { cookies } from "next/headers";
import type { PageKey } from "./console/menu";

export const languageCookie = "next-common.language";

type Locale = "ko" | "en";

export async function getLocale(): Promise<Locale> {
  return (await cookies()).get(languageCookie)?.value === "en" ? "en" : "ko";
}

type Messages = {
  common: typeof import("@/locales/ko/common.json");
  login: typeof import("@/locales/ko/login.json");
  dashboard: typeof import("@/locales/ko/dashboard.json");
  "not-found": typeof import("@/locales/ko/not-found.json");
} & Record<PageKey, Record<string, string>>;

export async function getMessages<Page extends keyof Messages>(
  page: Page,
  locale?: Locale,
): Promise<Messages[Page]> {
  const language = locale ?? await getLocale();
  const resource = await import(`../locales/${language}/${page}.json`);
  return resource.default;
}
