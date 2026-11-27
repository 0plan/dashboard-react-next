import { Globe, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { hasDemoSession } from "@/lib/demo-session";
import { getMessages } from "@/lib/i18n";
import { logout, toggleLanguage } from "./actions";
import { ThemeButton } from "./theme-button";
import { ConsoleLayout } from "./console-layout";
import "./traffic.css";

export async function TrafficShell({ children }: { children: React.ReactNode }) {
  const [t, signedIn] = await Promise.all([getMessages("common"), hasDemoSession()]);
  return (
    <div className="traffic-shell">
      <header className="traffic-header">
        <nav className="traffic-width traffic-bar">
          <Link className="traffic-brand" href="/">
            <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
              <rect width="32" height="32" rx="6" fill="#404040" />
              <path d="m7 22 7-9 4 3 7-9" fill="none" stroke="#fafafa" strokeWidth="3" strokeLinejoin="round" />
            </svg>
            <span>{t.appName}</span>
          </Link>
          <div className="traffic-actions">
            <ThemeButton label={t.theme} />
            <form action={toggleLanguage}>
              <Button variant="ghost" size="icon" aria-label={t.language} title={t.language}><Globe /></Button>
            </form>
            {signedIn && (
              <form action={logout}>
                <Button variant="ghost" aria-label={t.signOut} title={t.signOut}><LogOut /><span>{t.signOut}</span></Button>
              </form>
            )}
          </div>
        </nav>
      </header>
      <main className="traffic-width traffic-main">
        {signedIn ? <ConsoleLayout labels={t}>{children}</ConsoleLayout> : children}
      </main>
      <footer className="traffic-width traffic-footer">
        <span>{t.appName}</span>
        <div>
          <a href="https://github.com/0plan/dashboard-react-next" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </footer>
    </div>
  );
}
