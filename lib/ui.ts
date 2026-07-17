import { format } from "date-fns";
import { es } from "date-fns/locale";

export const paymentStatus = {
  APPROVED: { label: "Pagado", tone: "border-[#bfd866] bg-[#e1f39a] text-[#33420d]" },
  PENDING: { label: "Pendiente", tone: "border-[#e9b77f] bg-[#ffe1bf] text-[#754214]" },
  IN_PROCESS: { label: "Procesando", tone: "border-[#c4b8ed] bg-[#e1dcfa] text-[#4b3d7e]" },
  REJECTED: { label: "Rechazado", tone: "border-[#e9a2ad] bg-[#ffd5dc] text-[#762332]" },
  OVERDUE: { label: "Vencido", tone: "border-[#e9a2ad] bg-[#ffd5dc] text-[#762332]" },
  CANCELED: { label: "Cancelado", tone: "border-black/10 bg-black/5 text-black/50" },
  REFUNDED: { label: "Devuelto", tone: "border-[#c4b8ed] bg-[#e1dcfa] text-[#4b3d7e]" },
  CHARGED_BACK: { label: "Contracargo", tone: "border-[#e9a2ad] bg-[#ffd5dc] text-[#762332]" },
} as const;

export function formatDate(date: Date, long = false) {
  return format(date, long ? "d 'de' MMMM 'de' yyyy" : "dd MMM yyyy", { locale: es });
}

export function periodLabel(date: Date) {
  const label = format(date, "MMMM yyyy", { locale: es });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export function frequencyLabel(frequency: string, dueDay?: number | null, intervalDays?: number | null) {
  if (frequency === "WEEKLY") return "Semanal";
  if (frequency === "BIWEEKLY") return "Cada 15 días";
  if (frequency === "CUSTOM") return `Cada ${intervalDays ?? 30} días`;
  return `Mensual${dueDay ? ` · día ${dueDay}` : ""}`;
}
