"use client";

import { useActionState, useState } from "react";
import { updateBillingPeriodAmount, type AmountUpdateState } from "@/lib/actions/payments";
import { formatMoney } from "@/lib/money";

const initialState: AmountUpdateState = { ok: false };

export function AmountEditor({ periodId, amount, currency, canEdit }: { periodId: string; amount: number; currency: string; canEdit: boolean }) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateBillingPeriodAmount, initialState);
  const displayedAmount = state.amount ?? amount;

  return <>
    <div className="flex items-center justify-between gap-4">
      <p className="mono text-[9px] uppercase tracking-[.16em] text-white/45">Monto del cobro</p>
      {canEdit ? <button type="button" onClick={() => setEditing((open) => !open)} className="cursor-pointer text-[11px] font-semibold text-white/65 underline decoration-white/25 underline-offset-4 transition hover:text-white">Actualizar importe</button> : null}
    </div>
    <p className={`mt-5 text-5xl font-bold tracking-[-.07em] ${editing ? "hidden" : ""}`}>{formatMoney(displayedAmount, currency)}</p>
    {canEdit && editing ? <form action={formAction} className="mt-7 border-t border-white/10 pt-5">
      <input type="hidden" name="periodId" value={periodId} />
      <label className="block text-[10px] font-semibold text-white/55" htmlFor="amount">Nuevo importe</label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input id="amount" name="amount" inputMode="decimal" required defaultValue={String(displayedAmount / 100)} className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-[13px] text-white outline-none placeholder:text-white/30 focus:border-[#d7f85b]" />
        <button disabled={pending} className="rounded-xl bg-[#d7f85b] px-4 py-2.5 text-[11px] font-bold text-[#191b1a] transition hover:brightness-95 disabled:cursor-wait disabled:opacity-60">{pending ? "Guardando…" : "Guardar monto"}</button>
      </div>
      <p className="mt-2 text-[10px] leading-4 text-white/40">Al cambiarlo, se invalida el link de pago anterior.</p>
      {state.message ? <p aria-live="polite" className={`mt-3 text-[11px] font-bold ${state.ok ? "text-[#d7f85b]" : "text-[#ffb77e]"}`}>{state.message}{state.ok ? " ✓" : ""}</p> : null}
    </form> : null}
  </>;
}
