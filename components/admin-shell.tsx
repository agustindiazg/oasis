"use client";

import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";
import { authClient } from "@/lib/auth-client";
import { initials } from "@/lib/ui";

const links = [
  ["/admin", "dashboard", "Resumen"],
  ["/admin/clientes", "users", "Clientes"],
  ["/admin/cobros", "wallet", "Cobros"],
  ["/admin/preferencias", "settings", "Preferencias"],
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const name = session?.user.name ?? "Ana Torres";
  const email = session?.user.email ?? "Entorno local";
  const isActive = (href: string) => href === "/admin" ? pathname === href : pathname.startsWith(href);

  return <main className="min-h-screen bg-[#f1f0e9] text-[#191b1a]">
    <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-black/10 bg-[#e8e7df] p-5 lg:block">
      <a href="/" className="flex items-center gap-2 text-[15px] font-extrabold tracking-[-.04em]"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#191b1a] text-[#d7f85b]"><span className="h-2 w-2 rounded-full bg-[#d7f85b]" /></span>oasis</a>
      <p className="mono mt-14 text-[9px] uppercase tracking-[.16em] text-black/40">Workspace</p>
      <nav className="mt-4 space-y-1 text-[13px]">{links.slice(0, 3).map(([href, icon, label]) => <a key={href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition ${isActive(href) ? "bg-[#191b1a] font-semibold text-[#f1f0e9]" : "text-black/55 hover:bg-black/5"}`} href={href}><Icon name={icon} /> {label}</a>)}</nav>
      <p className="mono mt-12 text-[9px] uppercase tracking-[.16em] text-black/40">Configuración</p>
      <nav className="mt-4 space-y-1 text-[13px]"><a className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition ${isActive("/admin/preferencias") ? "bg-[#191b1a] font-semibold text-[#f1f0e9]" : "text-black/55 hover:bg-black/5"}`} href="/admin/preferencias"><Icon name="settings" /> Preferencias</a><a className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-black/55 hover:bg-black/5" href="mailto:soporte@oasis.app"><Icon name="help" /> Ayuda</a></nav>
      <div className="absolute bottom-6 left-5 right-5 flex items-center justify-between border-t border-black/10 pt-5"><div className="min-w-0"><p className="truncate text-[12px] font-bold">{name}</p><p className="mt-1 truncate text-[10px] text-black/45">{email}</p></div><Icon name="logout" className="h-4 w-4 text-black/40" /></div>
    </aside>
    <section className="pb-24 lg:ml-60 lg:pb-0">
      <header className="flex items-center justify-between border-b border-black/10 px-5 py-5 sm:px-8"><div><p className="mono text-[9px] uppercase tracking-[.16em] text-black/40">Oasis · panel de cobros</p><h1 className="mt-2 text-2xl font-bold tracking-[-.05em]">Buen día, {name.split(" ")[0]} <span className="text-[#a0a197]">↗</span></h1></div><div className="flex items-center gap-3"><button aria-label="Notificaciones" className="grid h-9 w-9 place-items-center rounded-full border border-black/10"><Icon name="bell" /></button><div className="grid h-9 w-9 place-items-center rounded-full bg-[#9f8bff] text-[11px] font-bold">{initials(name)}</div></div></header>
      {children}
    </section>
    <nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-black/10 bg-[#e8e7df]/95 px-2 pb-2 pt-2 shadow-[0_-10px_30px_rgba(25,27,26,.08)] backdrop-blur lg:hidden">{links.map(([href, icon, label]) => <a key={href} href={href} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold transition ${isActive(href) ? "bg-[#191b1a] text-[#f1f0e9]" : "text-black/45 hover:bg-black/5"}`}><Icon name={icon} className="h-[18px] w-[18px]" /><span>{label}</span></a>)}</nav>
  </main>;
}
