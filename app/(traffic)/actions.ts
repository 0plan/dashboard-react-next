"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { demoAccount, endDemoSession, startDemoSession } from "@/lib/demo-session";
import { getLocale, languageCookie } from "@/lib/i18n";

export async function login(fields: FormData) {
  const email = fields.get("email");
  if (typeof email !== "string" || email.trim().toLowerCase() !== demoAccount.email ||
      fields.get("password") !== demoAccount.password) {
    redirect("/login?error=credentials");
  }
  await startDemoSession();
  redirect("/dashboard");
}

export async function logout() {
  await endDemoSession();
  redirect("/login");
}

export async function toggleLanguage() {
  (await cookies()).set(languageCookie, await getLocale() === "ko" ? "en" : "ko", {
    path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365,
  });
  const requestHeaders = await headers();
  const referer = requestHeaders.get("referer") ?? "";
  if (URL.canParse(referer)) {
    const previous = new URL(referer);
    const sameOrigin = ["http:", "https:"].includes(previous.protocol) && previous.origin === requestHeaders.get("origin");
    if (sameOrigin && !previous.pathname.startsWith("//")) {
      redirect(previous.pathname + previous.search);
    }
  }
  redirect("/");
}
