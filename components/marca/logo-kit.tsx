"use client";

import { useState } from "react";
import { downloadSvg, logoSvg, logoVariants } from "@/lib/brand";

export function LogoKit() {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(variant: (typeof logoVariants)[number]) {
    await navigator.clipboard.writeText(logoSvg(variant.circle, variant.dot));
    setCopied(variant.file);
    setTimeout(() => setCopied(null), 1100);
  }

  return <div className="grid gap-3 sm:grid-cols-3">
    {logoVariants.map((variant) => <div key={variant.file} className="overflow-hidden rounded-2xl border hairline">
      <div className="grid h-44 place-items-center" style={{ backgroundColor: variant.surface }}>
        <span className="grid h-16 w-16 place-items-center rounded-full" style={{ backgroundColor: variant.circle }}><span className="h-[18px] w-[18px] rounded-full" style={{ backgroundColor: variant.dot }} /></span>
      </div>
      <div className="flex items-center justify-between gap-2 bg-paper/[.03] p-4">
        <p className="text-[11px] font-semibold text-[#b6b7b0]">{variant.name}</p>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => copy(variant)} className="mono rounded-full border border-paper/15 px-3 py-1.5 text-[10px] text-[#b6b7b0] transition hover:border-paper/40 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid">{copied === variant.file ? "✓" : "SVG"}</button>
          <button type="button" onClick={() => downloadSvg(logoSvg(variant.circle, variant.dot), variant.file)} className="mono rounded-full border border-paper/15 px-3 py-1.5 text-[10px] text-[#b6b7b0] transition hover:border-paper/40 hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid">↓</button>
        </div>
      </div>
    </div>)}
  </div>;
}
