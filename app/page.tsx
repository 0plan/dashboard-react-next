import { redirect } from "next/navigation";
import { hasDemoSession } from "@/lib/demo-session";

export default async function Home() {
  redirect(await hasDemoSession() ? "/dashboard" : "/login");
}
