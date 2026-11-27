import { notFound, redirect } from "next/navigation";
import { managementPage } from "@/lib/console/menu";
import { readFilter } from "@/lib/console/workspace";
import { demoWorkspace } from "@/lib/demo-session";
import { getLocale, getMessages } from "@/lib/i18n";
import { ManagementPanel } from "../../management-panel";
import { updateWorkspace } from "../../actions";

type Props = PageProps<"/manage/[group]/[page]">;

async function resolvePage(params: Props["params"]) {
  const { group, page } = await params;
  return managementPage(`/manage/${group}/${page}`) ?? notFound();
}

export async function generateMetadata({ params }: Props) {
  const page = await resolvePage(params);
  return { title: (await getMessages("common"))[page.key] };
}

export default async function Management({ params, searchParams }: Props) {
  const page = await resolvePage(params);
  const state = await demoWorkspace();
  if (!state) redirect("/login");
  const locale = await getLocale();
  const [query, common, labels] = await Promise.all([searchParams, getMessages("common", locale), getMessages(page.key, locale)]);
  return <ManagementPanel page={page} state={state} filter={readFilter(query.q, query.status)}
    result={typeof query.result === "string" ? query.result : undefined} t={key => labels[key]}
    common={key => common[key as keyof typeof common]} save={updateWorkspace.bind(null, page.path)} />;
}
