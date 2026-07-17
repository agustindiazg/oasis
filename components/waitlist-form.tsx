"use client";

import { useActionState } from "react";
import { joinWaitlist, type WaitlistState } from "@/lib/actions/waitlist";
import { Icon } from "@/components/icons";

const initialState: WaitlistState = { success: false, message: "" };

export function WaitlistForm() {
  const [state, formAction, pending] = useActionState(joinWaitlist, initialState);

  if (state.success) {
    return <p role="status" className="mt-8 rounded-full border border-ink/20 bg-ink/10 px-5 py-3 text-[13px] font-semibold">{state.message}</p>;
  }

  return <form action={formAction} className="mt-8 flex max-w-[480px] flex-col gap-2 sm:flex-row">
    <label htmlFor="waitlist-email" className="sr-only">Tu email</label>
    <input id="waitlist-email" name="email" autoComplete="email" required spellCheck={false} placeholder="tu@email.com…" type="email" className="min-h-12 flex-1 rounded-full border border-ink/20 bg-transparent px-5 text-[13px] outline-none placeholder:text-ink/45 focus:border-ink focus-visible:ring-2 focus-visible:ring-ink" />
    <button type="submit" disabled={pending} className="min-h-12 rounded-full bg-ink px-6 text-[13px] font-bold text-paper transition hover:bg-[#272a28] disabled:cursor-wait disabled:opacity-60">{pending ? "Guardando…" : <>Quiero estar adentro <Icon name="arrow" className="ml-1 inline h-3.5 w-3.5" /></>}</button>
    {state.message && <p role="alert" className="text-[11px] font-semibold text-[#762332] sm:absolute sm:mt-14">{state.message}</p>}
  </form>;
}
