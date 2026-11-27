import { redirect } from "next/navigation";
import { demoWorkspace } from "@/lib/demo-session";
import { getLocale, getMessages } from "@/lib/i18n";
import { getTrafficReport } from "@/lib/traffic";
import { Report } from "./report";
import { AdminOverview } from "./overview";

export async function generateMetadata() {
  return { title: (await getMessages("common")).home };
}

export default async function Dashboard({ searchParams }: PageProps<"/dashboard">) {
  const state = await demoWorkspace();
  if (!state) redirect("/login");
  const days = (await searchParams).days === "30" ? 30 : 7;
  const locale = await getLocale();
  const [t, common] = await Promise.all([getMessages("dashboard", locale), getMessages("common", locale)]);
  return <>
    <AdminOverview title={common.home} text={key => t[key as keyof typeof t]} state={state} />
    <Report days={days} data={getTrafficReport(days)} locale={locale} t={t} />
  </>;
}
