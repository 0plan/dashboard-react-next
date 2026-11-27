"use server";

import { notFound, redirect } from "next/navigation";
import { refresh } from "next/cache";
import { managementPage } from "@/lib/console/menu";
import { editFromForm, resultURL } from "@/lib/console/workspace";
import { hasDemoSession, saveWorkspaceEdit } from "@/lib/demo-session";

export async function updateWorkspace(path: string, fields: FormData) {
  if (!await hasDemoSession()) redirect("/login");
  const page = managementPage(path);
  if (!page) notFound();
  const edit = editFromForm(page.key, fields);
  if (edit && !await saveWorkspaceEdit(edit)) redirect("/login");
  if (edit) refresh();
  redirect(resultURL(page.path, fields, Boolean(edit)));
}
