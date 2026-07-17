"use client";

import { useActionState } from "react";
import { joinWaitlist, type WaitlistState } from "@/lib/actions/waitlist";
import { Icon } from "@/components/icons";

const initialState: WaitlistState = { success: false, message: "" };

const tones = {
  acid: {
    success: "border-ink/20 bg-ink/10",
    input: "border-ink/20 bg-transparent placeholder:text-ink/45 focus:border-ink focus-visible:ring-ink",
    button: "bg-ink text-paper hover:bg-[#272a28]",
    error: "text-[#762332]",
  },
  dark: {
    success: "border-acid/40 bg-acid/10 text-paper",
    input: "border-paper/20 bg-paper/[.04] text-paper placeholder:text-paper/35 focus:border-acid focus-visible:ring-acid",
    button: "bg-acid text-ink hover:bg-[#e6ff87]",
    error: "text-[#ff9daa]",
  },
} as const;

export function WaitlistForm({ tone = "acid", idPrefix = "" }: { tone?: keyof typeof tones; idPrefix?: string }) {
  const [state, formAction, pending] = useActionState(joinWaitlist, initialState);
  const styles = tones[tone];
  const inputId = `${idPrefix}waitlist-email`;

  if (state.success) {
    return <p role="status" className={`mt-8 rounded-full border px-5 py-3 text-[13px] font-semibold ${styles.success}`}>{state.message}</p>;
  }

  return <form action={formAction} className="relative mt-8 flex max-w-[480px] flex-col gap-2 sm:flex-row">
    <label htmlFor={inputId} className="sr-only">Tu email</label>
    <input id={inputId} name="email" autoComplete="email" required spellCheck={false} placeholder="tu@email.com…" type="email" aria-invalid={state.message ? true : undefined} aria-describedby={state.message ? `${inputId}-error` : undefined} className={`min-h-12 flex-1 rounded-full border px-5 text-[13px] outline-none focus-visible:ring-2 ${styles.input}`} />
    <button type="submit" disabled={pending} className={`min-h-12 rounded-full px-6 text-[13px] font-bold transition disabled:cursor-wait disabled:opacity-60 ${styles.button}`}>{pending ? "Guardando…" : <>Pedir acceso anticipado <Icon name="arrow" className="ml-1 inline h-3.5 w-3.5" /></>}</button>
    {state.message && <p id={`${inputId}-error`} role="alert" className={`text-[11px] font-semibold sm:absolute sm:mt-14 ${styles.error}`}>{state.message}</p>}
  </form>;
}
