"use client";

import { useState } from "react";

export function PaymentLinkActions({ url, message, phone }: { url: string; message: string; phone?: string | null }) {
  const [copied, setCopied] = useState(false);
  const phoneDigits = phone?.replace(/\D/g, "") ?? "";
  const recipient = phoneDigits.length >= 11 ? phoneDigits : "";
  const whatsappUrl = `https://wa.me/${recipient}?text=${encodeURIComponent(message)}`;

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return <div className="flex flex-col gap-2 sm:flex-row">
    <button type="button" onClick={copyLink} className="rounded-full border border-black/20 px-4 py-2.5 text-[11px] font-bold transition hover:bg-black/5">{copied ? "Copiado ✓" : "Copiar link"}</button>
    <a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded-full bg-[#191b1a] px-4 py-2.5 text-center text-[11px] font-bold text-[#f1f0e9] transition hover:bg-[#285c42]">Enviar por WhatsApp ↗</a>
  </div>;
}
