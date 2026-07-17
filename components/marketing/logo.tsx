"use client";

import { useEffect, useRef, useState } from "react";
import { downloadSvg, logoSvg } from "@/lib/brand";

const focusClasses = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid focus-visible:ring-offset-2 focus-visible:ring-offset-ink";

export function Logo({ href = "#top" }: { href?: string }) {
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key !== "Escape") return;
      if (event instanceof MouseEvent && wrapRef.current?.contains(event.target as Node)) return;
      setMenu(null);
    };
    window.addEventListener("click", close);
    window.addEventListener("keydown", close);
    window.addEventListener("scroll", () => setMenu(null), { once: true });
    return () => { window.removeEventListener("click", close); window.removeEventListener("keydown", close); };
  }, [menu]);

  async function copySvg() {
    await navigator.clipboard.writeText(logoSvg("#d7f85b", "#050505"));
    setCopied(true);
    setTimeout(() => { setCopied(false); setMenu(null); }, 900);
  }

  return <div ref={wrapRef} className="relative">
    <a href={href} onContextMenu={(event) => { event.preventDefault(); setMenu({ x: 0, y: 40 }); }} className={`group flex items-center gap-2.5 text-[15px] font-extrabold tracking-[-.04em] ${focusClasses}`}>
      <span className="logo-mark grid h-7 w-7 place-items-center rounded-full bg-acid text-ink"><span className="h-2 w-2 rounded-full bg-ink transition-transform duration-500 group-hover:scale-[1.7]" /></span>oasis
    </a>
    {menu && <div role="menu" aria-label="Opciones de marca" className="absolute z-50 w-52 rounded-2xl border hairline bg-[#111111] p-2 text-[12px] shadow-2xl" style={{ left: menu.x, top: menu.y }}>
      <button type="button" role="menuitem" onClick={copySvg} className={`block w-full rounded-xl px-3 py-2.5 text-left text-[#b6b7b0] transition hover:bg-paper/10 hover:text-paper ${focusClasses}`}>{copied ? "Copiado ✓" : "Copiar logo como SVG"}</button>
      <button type="button" role="menuitem" onClick={() => { downloadSvg(logoSvg("#d7f85b", "#050505"), "oasis-acido"); setMenu(null); }} className={`block w-full rounded-xl px-3 py-2.5 text-left text-[#b6b7b0] transition hover:bg-paper/10 hover:text-paper ${focusClasses}`}>Descargar SVG</button>
      <a role="menuitem" href="/marca" className={`block w-full rounded-xl px-3 py-2.5 text-left text-[#b6b7b0] transition hover:bg-paper/10 hover:text-paper ${focusClasses}`}>Ver la marca →</a>
    </div>}
  </div>;
}
