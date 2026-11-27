import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { demoAccount, hasDemoSession } from "@/lib/demo-session";
import { getMessages } from "@/lib/i18n";
import { login } from "../actions";

export async function generateMetadata() {
  return { title: (await getMessages("login")).title };
}

export default async function Login({ searchParams }: PageProps<"/login">) {
  if (await hasDemoSession()) redirect("/dashboard");
  const t = await getMessages("login");
  const invalid = (await searchParams).error === "credentials";
  return (
    <section className="traffic-login" aria-labelledby="login-title">
      <h1 id="login-title">{t.title}</h1>
      <p className="traffic-description">{t.intro}</p>
      <form action={login}>
        <div className="traffic-field">
          <Label htmlFor="email">{t.email}</Label>
          <Input id="email" name="email" type="email" autoComplete="username" className="shadow-none" required
            defaultValue={demoAccount.email} aria-invalid={invalid} aria-describedby={invalid ? "login-error" : undefined} />
        </div>
        <div className="traffic-field">
          <Label htmlFor="password">{t.password}</Label>
          <Input id="password" name="password" type="password" autoComplete="current-password" className="shadow-none" required
            defaultValue={demoAccount.password} aria-invalid={invalid} aria-describedby={invalid ? "login-error" : undefined} />
        </div>
        {invalid && <p id="login-error" role="alert">{t.invalid}</p>}
        <Button type="submit" className="traffic-submit shadow-none">{t.title}</Button>
      </form>
      <aside className="traffic-demo">
        <h2>{t.account}</h2>
        <dl>
          <div><dt>{t.email}</dt><dd>{demoAccount.email}</dd></div>
          <div><dt>{t.password}</dt><dd>{demoAccount.password}</dd></div>
        </dl>
      </aside>
    </section>
  );
}
