// Run against `next start` or `next dev`: PORT=3000 node scripts/check-traffic.mjs
import assert from "node:assert/strict";

const origin = `http://127.0.0.1:${process.env.PORT || 3000}`;

function get(path, cookie = "") {
  return fetch(origin + path, { redirect: "manual", headers: { cookie } });
}

async function html(path, cookie, status = 200) {
  const response = await get(path, cookie);
  assert.equal(response.status, status, path);
  const markup = (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
  assert.doesNotMatch(markup, /href="\/example(?:\/|[?#"])/, path);
  const appName = markup.includes('<html lang="en"') ? "Web Traffic Dashboard" : "웹 트래픽 대시보드";
  assert.ok(markup.match(/<header\b[\s\S]*?<\/header>/)?.[0].includes(`>${appName}</span>`), `Header: ${path}`);
  const footer = markup.match(/<footer\b[\s\S]*?<\/footer>/)?.[0];
  assert.ok(footer?.includes(`>${appName}</span>`) && footer.includes('href="https://github.com/0plan/dashboard-react-next"'), `Footer: ${path}`);
  assert.ok(markup.includes(` | ${appName}</title>`), `Title: ${path}`);
  return markup;
}

function submit(path, markup, field, values, cookie = "") {
  const form = markup.match(/<form\b[^>]*>[\s\S]*?<\/form>/g)?.find(form => form.includes(field));
  const action = form?.match(/name="(\$ACTION_ID_[^"]+)"/);
  assert.ok(action, `Missing server form: ${field}`);
  const body = new FormData();
  body.set(action[1], "");
  for (const [key, value] of Object.entries(values)) body.set(key, value);
  return fetch(origin + path, { method: "POST", redirect: "manual", headers: { origin, referer: origin + path, cookie }, body });
}

function checkRedirect(response, path) {
  assert.ok([303, 307].includes(response.status), `Expected redirect, got ${response.status}`);
  assert.equal(new URL(response.headers.get("location"), origin).pathname, path);
}

async function checkNotFound(path, sessionCookie = "") {
  const ko = await html(path, sessionCookie, 404);
  assert.match(ko, /<html lang="ko"/);
  assert.match(ko, /페이지를 찾을 수 없습니다<\/h1>/);
  const switched = await submit(path, ko, 'aria-label="언어 변경"', {}, sessionCookie);
  assert.equal(switched.status, 303);
  const destination = new URL(switched.headers.get("location"), origin);
  assert.equal(destination.href, origin + path, "404 language switch must stay on the same URL");
  const preference = switched.headers.getSetCookie().find(value => value.startsWith("next-common.language=en;"));
  assert.ok(preference);
  const en = await html(path, [sessionCookie, preference.split(";")[0]].filter(Boolean).join("; "), 404);
  assert.match(en, /<html lang="en"/);
  assert.match(en, /<title>Page not found \| Web Traffic Dashboard<\/title>/);
  assert.match(en, /Page not found<\/h1>/);
  assert.ok(en.includes("No page is available at this address."));
  assert.match(en, /href="\/"[^>]*>Go to the dashboard<\/a>/);
  assert.equal(en.includes('aria-label="Sign Out"'), Boolean(sessionCookie));
}

checkRedirect(await get("/"), "/login");
checkRedirect(await get("/dashboard"), "/login");
checkRedirect(await get("/manage/site/settings"), "/login");
await checkNotFound("/example");
const login = await html("/login");
assert.match(await html("/login", "next-common.language=en"), /Sign In<\/h1>/);
const email = "demo@example.com";
const password = "traffic-demo";
assert.ok(login.includes(`value="${email}"`) && login.includes(`value="${password}"`));
const invalid = await submit("/login", login, 'name="password"', { email, password: "incorrect" });
checkRedirect(invalid, "/login");
assert.match(await html(invalid.headers.get("location")), /role="alert"/);

const signedIn = await submit("/login", login, 'name="password"', { email, password });
checkRedirect(signedIn, "/dashboard");
const session = signedIn.headers.getSetCookie().find(value => value.startsWith("next-common.demo-session="));
assert.match(session ?? "", /HttpOnly/i);
assert.match(session, /SameSite=lax/i);
const cookie = session.split(";")[0];
checkRedirect(await get("/", cookie), "/dashboard");
checkRedirect(await get("/login", cookie), "/dashboard");
await checkNotFound("/unavailable/nested?period=30", cookie);
for (const [path, title, sample] of [
  ["/manage/members/list", "회원 목록", "jin@example.com"],
  ["/manage/sales/orders?status=pending", "주문 내역", "O-208"],
  ["/manage/sales/summary", "매출 요약", "₩252,000"],
  ["/manage/site/settings", "기본 설정", "desk@example.com"],
]) {
  const markup = await html(path, cookie);
  assert.ok(markup.includes(`${title}</h1>`) && markup.includes(sample), path);
}

for (const [path, values] of [
  ["/dashboard", ["10,489", "1,498", "6,192", "4,297"]],
  ["/dashboard?days=30", ["36,639", "1,221", "21,532", "15,107"]],
]) {
  const report = await html(path, cookie);
  for (const value of [...values, "1,790", "9월 29일"]) assert.ok(report.includes(value), `${path}: ${value}`);
  assert.match(report, /<svg[^>]+aria-labelledby="trend-title"/);
  assert.match(report, /<svg[^>]+aria-labelledby="devices-title"/);
  assert.match(report, /<title>9월 29일: 1,790<\/title>/);
  const rows = report.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1];
  assert.equal(rows?.match(/<tr>/g)?.length, path.includes("30") ? 30 : 7);
  assert.ok(rows?.includes('dateTime="2026-09-30"') && report.includes('href="#daily"'));
  assert.ok(!report.includes("report-value-skeleton"), "SSR sends ready data");
}

const month = "/dashboard?days=30";
const language = await submit(month, await html(month, cookie), 'aria-label="언어 변경"', {}, cookie);
checkRedirect(language, "/dashboard");
assert.equal(new URL(language.headers.get("location"), origin).searchParams.get("days"), "30");
const preference = language.headers.getSetCookie().find(value => value.startsWith("next-common.language=en;"));
assert.ok(preference);
const english = await html(month, `${cookie}; ${preference.split(";")[0]}`);
assert.match(english, /<html lang="en"/);
assert.ok(["Website traffic", "36,639", "Sep 29"].every(text => english.includes(text)));

const signedOut = await submit("/dashboard", await html("/dashboard", cookie), 'aria-label="로그아웃"', {}, cookie);
checkRedirect(signedOut, "/login");
checkRedirect(await get("/dashboard", cookie), "/login");
console.log("SSR login, session, both reports and charts, ko/en 404s, locale switching, and logout passed.");
