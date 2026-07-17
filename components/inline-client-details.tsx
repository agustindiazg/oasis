"use client";

import { useState } from "react";
import { updateClientDetails } from "@/lib/actions/clients";

type Props = {
  clientId: string;
  initialDate: string;
  initialFormattedDate: string;
  initialNotes: string;
};

export function InlineClientDetails({ clientId, initialDate, initialFormattedDate, initialNotes }: Props) {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(initialDate);
  const [formattedDate, setFormattedDate] = useState(initialFormattedDate);
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);

  async function save(formData: FormData) {
    setSaving(true);
    await updateClientDetails(formData);
    const nextDate = String(formData.get("startedAt"));
    const nextNotes = String(formData.get("notes") ?? "");
    setDate(nextDate);
    setFormattedDate(new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${nextDate}T12:00:00Z`)));
    setNotes(nextNotes);
    setEditing(false);
    setSaving(false);
  }

  if (editing) return <form action={save} className="mt-4 grid gap-4 lg:grid-cols-[.42fr_1.58fr]">
    <input type="hidden" name="clientId" value={clientId} />
    <section className="rounded-2xl border border-black/15 bg-[#e8e7df] p-5"><label className="mono text-[9px] uppercase tracking-[.15em] text-black/40">Fecha de alta<input name="startedAt" type="date" required value={date} onChange={(event) => setDate(event.target.value)} className="mt-4 w-full rounded-xl border border-black/10 bg-[#f1f0e9] px-3 py-3 font-sans text-[13px] font-semibold outline-none focus:border-black/40" /></label><p className="mt-3 text-[11px] text-black/40">Inicio de la relación con el cliente</p></section>
    <section className="rounded-2xl border border-black/15 bg-[#e8e7df] p-5"><label className="mono text-[9px] uppercase tracking-[.15em] text-black/40">Descripción / notas<textarea name="notes" maxLength={2000} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Contexto útil sobre el cliente, acuerdos o preferencias" className="mt-4 min-h-28 w-full resize-y rounded-xl border border-black/10 bg-[#f1f0e9] px-4 py-3 font-sans text-[13px] leading-6 outline-none placeholder:text-black/30 focus:border-black/40" /></label><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setEditing(false)} className="rounded-full border border-black/10 px-4 py-2 text-[10px] font-bold">Cancelar</button><button disabled={saving} className="rounded-full bg-[#191b1a] px-4 py-2 text-[10px] font-bold text-white disabled:opacity-50">{saving ? "Guardando…" : "Guardar"}</button></div></section>
  </form>;

  return <div className="mt-4 grid gap-4 lg:grid-cols-[.42fr_1.58fr]">
    <section className="rounded-2xl border border-black/10 bg-[#e8e7df] p-5"><p className="mono text-[9px] uppercase tracking-[.15em] text-black/40">Fecha de alta</p><p className="mt-4 text-lg font-bold tracking-[-.04em]">{formattedDate}</p><p className="mt-2 text-[11px] text-black/40">Inicio de la relación con el cliente</p></section>
    <section className="rounded-2xl border border-black/10 bg-[#e8e7df] p-5"><div className="flex items-start justify-between gap-4"><div><p className="mono text-[9px] uppercase tracking-[.15em] text-black/40">Descripción / notas</p><p className={`mt-4 whitespace-pre-wrap text-[13px] leading-6 ${notes ? "text-black/65" : "italic text-black/35"}`}>{notes || "Todavía no agregaste información sobre este cliente."}</p></div><button type="button" onClick={() => setEditing(true)} className="shrink-0 rounded-full border border-black/10 px-3 py-2 text-[10px] font-bold hover:bg-black/5">Editar</button></div></section>
  </div>;
}
