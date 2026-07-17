const tones = {
  pagado: "border-[#bfd866] bg-[#e1f39a] text-[#33420d]",
  vence: "border-[#e9b77f] bg-[#ffe1bf] text-[#754214]",
  seguimiento: "border-[#c4b8ed] bg-[#e1dcfa] text-[#4b3d7e]",
  pendiente: "border-black/15 bg-black/5 text-black/55",
} as const;

const clients = [
  { name: "María Duarte", plan: "Yoga · mensual", amount: "$22.000", pill: "Pagado", tone: tones.pagado },
  { name: "Estudio Norte", plan: "Consultoría · mensual", amount: "$45.000", pill: "Vence mañana", tone: tones.vence },
  { name: "Martín López", plan: "Inglés · semanal", amount: "$18.000", pill: "Seguimiento", tone: tones.seguimiento },
  { name: "Laura Gómez", plan: "Funcional · mensual", amount: "$22.000", pill: "Pagado", tone: tones.pagado },
  { name: "Agustina Vega", plan: "Pilates · mensual", amount: "$19.500", pill: "Pagado", tone: tones.pagado },
] as const;

/* The real client list, re-rendered as a living specimen: one row resolves on a loop. */
export function ClientTable() {
  return <div className="panel-paper grain grain-dark w-full max-w-[460px] rounded-[1.5rem] p-5 sm:p-6">
    <div className="flex items-center justify-between"><p className="text-[13px] font-bold tracking-[-.03em]">Clientes · agosto</p><p className="mono text-[9px] uppercase tracking-[.14em] text-black/40">14 activos</p></div>
    <div className="mt-3 divide-y divide-black/10">
      {clients.map((client) => <div key={client.name} className="grid grid-cols-[minmax(0,1fr)_78px_106px] items-center gap-3 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#191b1a] text-[9px] font-bold text-[#f1f0e9]">{client.name.split(" ").map((part) => part[0]).join("")}</span>
          <div className="min-w-0"><p className="truncate text-[12px] font-semibold">{client.name}</p><p className="truncate text-[10px] text-black/45">{client.plan}</p></div>
        </div>
        <span className="text-right text-[12px] font-semibold tabular-nums">{client.amount}</span>
        <span className={`inline-flex justify-self-end rounded-full border px-2 py-0.5 text-[9px] font-bold leading-none ${client.tone}`}>{client.pill}</span>
      </div>)}
      <div className="grid grid-cols-[minmax(0,1fr)_78px_106px] items-center gap-3 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#191b1a] text-[9px] font-bold text-[#f1f0e9]">FR</span>
          <div className="min-w-0"><p className="truncate text-[12px] font-semibold">Franco Ruiz</p><p className="truncate text-[10px] text-black/45">Funcional · mensual</p></div>
        </div>
        <span className="text-right text-[12px] font-semibold tabular-nums">$18.000</span>
        <span className="swap justify-self-end">
          <span className={`swap-out inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold leading-none ${tones.pendiente}`}>Pendiente</span>
          <span className={`swap-in inline-flex justify-self-end rounded-full border px-2 py-0.5 text-[9px] font-bold leading-none ${tones.pagado}`}>Pagado</span>
        </span>
      </div>
    </div>
  </div>;
}
