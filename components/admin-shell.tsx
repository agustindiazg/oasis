"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { useClerk, useUser } from "@/lib/auth-client";
import { initials } from "@/lib/ui";
import { useAdminContext } from "@/components/admin-context";

const links = [
  ["/admin", "dashboard", "Resumen"],
  ["/admin/clientes", "users", "Clientes"],
  ["/admin/cobros", "wallet", "Cobros"],
] as const;

const mobileLinks = [
  ...links,
  ["/admin/preferencias", "settings", "Preferencias"],
] as const;

const focusClasses = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9f8bff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f1f0e9]";

export function AdminShell({ children, isSuperAdmin = false }: { children: React.ReactNode; isSuperAdmin?: boolean }) {
  const adminContext = useAdminContext();
  const effectiveSuperAdmin = isSuperAdmin || adminContext.isSuperAdmin;
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [collapsed, setCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [consoleAccess, setConsoleAccess] = useState(effectiveSuperAdmin);
  const [workspaceName, setWorkspaceName] = useState(adminContext.workspaceName);
  const name = user?.fullName ?? user?.firstName ?? "Ana Torres";
  const email = user?.primaryEmailAddress?.emailAddress ?? "Entorno local";
  const isActive = (href: string) => href === "/admin" ? pathname === href : pathname.startsWith(href);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem("oasis_sidebar_collapsed") === "true");
    fetch("/api/auth/context", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((data: { isSuperAdmin?: boolean; organizationName?: string } | null) => {
      if (data?.isSuperAdmin) setConsoleAccess(true);
      if (data?.organizationName) setWorkspaceName(data.organizationName);
    }).catch(() => undefined);
  }, []);

  function toggleSidebar() {
    setCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem("oasis_sidebar_collapsed", String(next));
      return next;
    });
  }

  async function handleLogout() {
    setLogoutError("");
    try {
      await signOut();
      router.push("/");
      router.refresh();
    } catch {
      setLogoutError("No se pudo cerrar la sesión. Intentá nuevamente.");
    }
  }

  return <main className="min-h-screen bg-[#f1f0e9] text-[#191b1a]">
    <aside className={`fixed inset-y-0 left-0 z-40 hidden border-r border-black/10 bg-[#e8e7df] p-5 transition-[width] duration-300 lg:block ${collapsed ? "w-[84px]" : "w-60"}`}>
      <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
        <a href="/" aria-label="Oasis, inicio" className={`flex items-center gap-2 text-[15px] font-extrabold tracking-[-.04em] ${focusClasses}`}><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#191b1a] text-[#d7f85b]"><span className="h-2 w-2 rounded-full bg-[#d7f85b]" /></span>{!collapsed && "oasis"}</a>
        {!collapsed && <button type="button" onClick={toggleSidebar} aria-label="Colapsar sidebar" title="Colapsar sidebar" className={`grid h-7 w-7 place-items-center rounded-lg text-black/45 transition hover:bg-black/5 hover:text-black ${focusClasses}`}><Icon name="chevron" className="h-4 w-4 rotate-180" /></button>}
      </div>
      {collapsed && <button type="button" onClick={toggleSidebar} aria-label="Expandir sidebar" title="Expandir sidebar" className={`absolute right-[-13px] top-5 z-10 grid h-7 w-7 place-items-center rounded-full border border-black/10 bg-[#f1f0e9] text-black/55 shadow-sm transition hover:bg-white hover:text-black ${focusClasses}`}><Icon name="chevron" className="h-4 w-4" /></button>}

      {!collapsed && <p className="mono mt-14 text-[9px] uppercase tracking-[.16em] text-black/40">Workspace</p>}
      <nav aria-label="Workspace" className={`${collapsed ? "mt-14" : "mt-4"} space-y-1 text-[13px]`}>{links.map(([href, icon, label]) => <SidebarLink key={href} href={href} icon={icon} label={label} active={isActive(href)} collapsed={collapsed} />)}</nav>
      {!collapsed && <p className="mono mt-12 text-[9px] uppercase tracking-[.16em] text-black/40">Configuración</p>}
      <nav aria-label="Configuración" className={`${collapsed ? "mt-4" : "mt-4"} space-y-1 text-[13px]`}>
        <SidebarLink href="/admin/preferencias" icon="settings" label="Preferencias" active={isActive("/admin/preferencias")} collapsed={collapsed} />
        {consoleAccess && <SidebarLink href="/console" icon="sparkle" label="Consola interna" active={false} collapsed={collapsed} tone="console" />}
        <SidebarLink href="mailto:soporte@oasis.app" icon="help" label="Ayuda" active={false} collapsed={collapsed} />
      </nav>

      <div className={`absolute bottom-6 border-t border-black/10 pt-5 ${collapsed ? "left-3 right-3" : "left-5 right-5"}`}><div className={`flex items-center gap-3 ${collapsed ? "justify-center" : "justify-between"}`}><div className={`min-w-0 ${collapsed ? "hidden" : "block"}`}><p className="truncate text-[12px] font-bold">{name}</p><p className="mt-1 truncate text-[10px] text-black/45">{email}</p></div><button type="button" onClick={handleLogout} aria-label="Cerrar sesión" title="Cerrar sesión" className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-black/50 transition hover:bg-black/5 hover:text-black ${focusClasses}`}><Icon name="logout" className="h-4 w-4" /></button></div>{logoutError && !collapsed && <p role="alert" className="mt-3 text-[11px] leading-4 text-red-700">{logoutError}</p>}</div>
    </aside>

    <section className={`pb-24 transition-[margin] duration-300 lg:pb-0 ${collapsed ? "lg:ml-[84px]" : "lg:ml-60"}`}>
      <header className="relative flex items-center justify-between border-b border-black/10 px-5 py-5 sm:px-8"><div>{consoleAccess ? <><p className="mono text-[9px] uppercase tracking-[.18em] text-black/40">Contexto activo · store · Oasis · panel de cobros</p><h1 className="mt-1 text-3xl font-extrabold tracking-[-.065em] sm:text-4xl">{workspaceName || "Workspace"}</h1></> : <><p className="mono text-[9px] uppercase tracking-[.16em] text-black/40"><span className="font-semibold text-black/65">{workspaceName || "Workspace"}</span><span className="mx-1.5 text-black/25">·</span>Oasis · panel de cobros</p><h1 className="mt-2 text-2xl font-bold tracking-[-.05em]">Buen día, {name.split(" ")[0]} <span aria-hidden="true" className="text-[#a0a197]">↗</span></h1></>}</div><div className="flex items-center gap-3"><div className="relative"><button type="button" aria-label="Notificaciones" aria-expanded={notificationsOpen} aria-controls="notifications-panel" onClick={() => { setNotificationsOpen((open) => !open); setAccountOpen(false); }} className={`grid h-9 w-9 place-items-center rounded-full border border-black/10 transition hover:bg-black/5 ${focusClasses}`}><Icon name="bell" /></button>{notificationsOpen && <div id="notifications-panel" role="dialog" aria-label="Notificaciones" className="absolute right-0 top-12 z-20 w-72 rounded-2xl border border-black/10 bg-[#f1f0e9] p-4 text-[12px] shadow-xl"><p className="font-bold">No hay novedades</p><p aria-live="polite" className="mt-2 leading-5 text-black/55">Cuando Oasis detecte cobros vencidos, pagos rechazados o problemas de conexión, vas a encontrar el aviso acá.</p><div className="mt-4 flex flex-wrap gap-2"><a href="/admin/cobros" onClick={() => setNotificationsOpen(false)} className={`rounded-full bg-[#191b1a] px-3 py-2 text-[11px] font-bold text-[#f1f0e9] ${focusClasses}`}>Ver cobros</a><button type="button" onClick={() => setNotificationsOpen(false)} className={`rounded-full border border-black/10 px-3 py-2 text-[11px] font-semibold ${focusClasses}`}>Cerrar</button></div></div>}</div><div className="relative"><button type="button" aria-label={`Abrir menú de ${name}`} aria-expanded={accountOpen} aria-controls="account-menu" onClick={() => { setAccountOpen((open) => !open); setNotificationsOpen(false); }} className={`grid h-9 w-9 place-items-center rounded-full bg-[#9f8bff] text-[11px] font-bold transition hover:brightness-95 ${focusClasses}`}>{initials(name)}</button>{accountOpen && <div id="account-menu" className="absolute right-0 top-12 z-20 w-64 rounded-2xl border border-black/10 bg-[#f1f0e9] p-3 shadow-xl"><div className="border-b border-black/10 px-3 pb-3"><p className="truncate text-[13px] font-bold">{name}</p><p className="mt-1 truncate text-[11px] text-black/50">{email}</p></div><nav className="mt-2 grid gap-1 text-[12px]"><a href="/admin" onClick={() => setAccountOpen(false)} className={`rounded-xl px-3 py-2.5 font-semibold hover:bg-black/5 ${focusClasses}`}>Resumen</a><a href="/admin/preferencias" onClick={() => setAccountOpen(false)} className={`rounded-xl px-3 py-2.5 font-semibold hover:bg-black/5 ${focusClasses}`}>Preferencias</a>{consoleAccess && <a href="/console" onClick={() => setAccountOpen(false)} className={`rounded-xl px-3 py-2.5 font-semibold text-[#4b3d7e] hover:bg-[#e1dcfa] ${focusClasses}`}>Consola interna</a>}<button type="button" onClick={handleLogout} className={`rounded-xl px-3 py-2.5 text-left font-semibold text-[#762332] hover:bg-[#ffd5dc] ${focusClasses}`}>Cerrar sesión</button></nav>{logoutError && <p role="alert" className="mt-2 px-3 text-[11px] leading-4 text-red-700">{logoutError}</p>}</div>}</div></div></header>
      {children}
    </section>
    <nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-black/10 bg-[#e8e7df]/95 px-2 pb-[calc(.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(25,27,26,.08)] backdrop-blur lg:hidden">{mobileLinks.map(([href, icon, label]) => <a key={href} href={href} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold transition ${focusClasses} ${isActive(href) ? "bg-[#191b1a] text-[#f1f0e9]" : "text-black/45 hover:bg-black/5"}`}><Icon name={icon} className="h-[18px] w-[18px]" /><span>{label}</span></a>)}</nav>
  </main>;
}

function SidebarLink({ href, icon, label, active, collapsed, tone }: { href: string; icon: string; label: string; active: boolean; collapsed: boolean; tone?: "console" }) {
  return <a href={href} aria-label={collapsed ? label : undefined} title={collapsed ? label : undefined} className={`flex items-center rounded-xl py-2.5 font-medium transition ${collapsed ? "justify-center px-2" : "gap-3 px-3"} ${focusClasses} ${active ? "bg-[#191b1a] font-semibold text-[#f1f0e9]" : tone === "console" ? "text-[#4b3d7e] hover:bg-[#e1dcfa]" : "text-black/55 hover:bg-black/5"}`}><Icon name={icon} /><span className={collapsed ? "sr-only" : ""}>{label}</span></a>;
}
