import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import type { Edit, Workspace } from "./console/workspace";

export const demoAccount = { email: "demo@example.com", password: "traffic-demo" };
const cookieName = "next-common.demo-session";
const lifetimeSeconds = 60 * 60 * 8;

// Only the public sample uses these sessions; restarting the process signs users out.
type Session = { expires: number; workspace: Workspace };
const server = globalThis as typeof globalThis & { nextCommonSessions?: Map<string, number | Session> };
const sessions = (server.nextCommonSessions ??= new Map());

async function currentSession() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return;
  const stored = sessions.get(token);
  if (!stored) return;
  const session = typeof stored === "number" ? { expires: stored, workspace: {} } : stored;
  if (session.expires <= Date.now()) {
    sessions.delete(token);
    return;
  }
  if (typeof stored === "number") sessions.set(token, session);
  return session;
}

export async function hasDemoSession() {
  return Boolean(await currentSession());
}

export async function demoWorkspace() {
  return (await currentSession())?.workspace;
}

export async function saveWorkspaceEdit(edit: Edit) {
  const session = await currentSession();
  if (!session) return false;
  session.workspace[edit.key] = edit.value;
  return true;
}

export async function startDemoSession() {
  const jar = await cookies();
  const now = Date.now();
  // All sessions have the same lifetime, so expired entries come first.
  const entries = sessions.entries();
  let oldest = entries.next();
  while (!oldest.done) {
    const stored = oldest.value[1];
    if ((typeof stored === "number" ? stored : stored.expires) > now) break;
    sessions.delete(oldest.value[0]);
    oldest = entries.next();
  }
  const token = randomUUID();
  sessions.set(token, { expires: now + lifetimeSeconds * 1000, workspace: {} });
  jar.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: lifetimeSeconds,
  });
}

export async function endDemoSession() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token) sessions.delete(token);
  jar.delete(cookieName);
}
