"use client";

import { useState } from "react";

export function CopyChip({ value, label, className = "" }: { value: string; label: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1100);
  }

  return <button type="button" onClick={copy} className={`mono rounded-full border px-3 py-1.5 text-[10px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current ${className}`} aria-live="polite">{copied ? "Copiado ✓" : label}</button>;
}
