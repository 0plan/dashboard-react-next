"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { menu, managementPage } from '@/lib/console/menu';

function Icon({ name }: { name: string }) {
  return <svg aria-hidden="true" className="console-icon"><use href={`/console-icons.svg#${name}`} /></svg>;
}

type NavProps = { path: string; labels: Record<string, string> };

function MenuTree({ path, labels }: NavProps) {
  return (
    <nav className="console-tree" aria-label={labels.console}>
      <Link href="/dashboard" className="console-home" aria-current={path === '/dashboard' ? 'page' : undefined}>
        <Icon name="home" />{labels.home}
      </Link>
      {menu.map(group => (
        <details key={`${group.key}-${group.pages.some(page => page.path === path)}`} className="console-group" open>
          <summary><Icon name={group.key} />{labels[group.key]}<i aria-hidden="true" /></summary>
          <ul>{group.pages.map(page => (
            <li key={page.key}><Link href={page.path} aria-current={page.path === path ? 'page' : undefined}>{labels[page.key]}</Link></li>
          ))}</ul>
        </details>
      ))}
    </nav>
  );
}

export function ConsoleLayout({ labels, children }: { labels: NavProps['labels']; children: ReactNode }) {
  const path = usePathname();
  const rail = useRef<HTMLDetailsElement>(null);
  const drawer = useRef<HTMLElement>(null);
  const page = managementPage(path);
  const showConsole = path === '/dashboard' || Boolean(page);
  useEffect(() => {
    try {
      if (rail.current) rail.current.open = localStorage.getItem('console.sidebar') !== 'closed';
    } catch { /* Native disclosure still works without storage. */ }
  }, [showConsole]);
  function setRail(open: boolean) {
    if (rail.current) rail.current.open = open;
    try { localStorage.setItem('console.sidebar', open ? 'open' : 'closed'); } catch { /* Optional preference. */ }
  }
  if (!showConsole) return children;
  const group = menu.find(item => item.pages.some(child => child.key === page?.key));
  return (
    <div className="console-layout">
      <aside className="console-rail">
        <div className="console-sticky">
          <details ref={rail} className="rail-toggle" open>
            <summary onClick={event => { event.preventDefault(); setRail(!rail.current?.open); }}>
              <strong aria-hidden="true">{labels.console}</strong>
              <Icon name="panel" />
              <span className="rail-close-label sr-only">{labels.collapse}</span>
              <span className="rail-open-label sr-only">{labels.expand}</span>
            </summary>
            <MenuTree path={path} labels={labels} />
          </details>
          <nav className="console-shortcuts" aria-label={labels.console}>
            <Link href="/dashboard" aria-label={labels.home} title={labels.home} aria-current={!page ? 'page' : undefined}><Icon name="home" /></Link>
            {menu.map(item => (
              <Link key={item.key} href={item.pages[0].path} title={labels[item.key]} aria-label={labels[item.key]}
                data-selected={group === item} onClick={() => setRail(true)}>
                <Icon name={item.key} />
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <div className="console-body">
        <div className="console-trail">
          <button type="button" className="console-mobile-toggle" popoverTarget="console-drawer" aria-label={labels.openMenu}>
            <Icon name="menu" />
          </button>
          <span>{labels.console}</span><span aria-hidden="true">/</span><strong>{group ? labels[group.key] : labels.home}</strong>
        </div>
        {children}
      </div>
      <aside ref={drawer} id="console-drawer" popover="auto" aria-label={labels.console} className="console-drawer"
        onClick={event => { if ((event.target as Element).closest('a')) drawer.current?.hidePopover(); }}>
        <div className="drawer-title"><strong>{labels.console}</strong>
          <button type="button" popoverTarget="console-drawer" popoverTargetAction="hide" aria-label={labels.closeMenu}><Icon name="close" /></button>
        </div>
        <MenuTree path={path} labels={labels} />
      </aside>
    </div>
  );
}
