"use client";

import { brandColors } from "@/lib/brand";
import { CopyChip } from "@/components/marca/copy-chip";

export function ColorGrid() {
  return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
    {brandColors.map((color) => <div key={color.name} className="flex flex-col overflow-hidden rounded-2xl border hairline">
      <div className="flex h-32 items-end p-4" style={{ backgroundColor: color.hex, color: color.text }}>
        <p className="text-[15px] font-bold tracking-[-.03em]">{color.name}</p>
      </div>
      <div className="flex flex-1 flex-col bg-paper/[.03] p-4">
        <p className="text-[11px] leading-5 text-[#a9aaa3]">{color.role}</p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
          <CopyChip value={color.hex} label={color.hex} className="border-paper/15 text-[#b6b7b0] hover:border-paper/40 hover:text-paper" />
          <CopyChip value={`var(${color.variable})`} label={color.variable} className="border-paper/15 text-[#b6b7b0] hover:border-paper/40 hover:text-paper" />
        </div>
      </div>
    </div>)}
  </div>;
}
