import { addDays, addMonths, getDay, isBefore, lastDayOfMonth, setDate, startOfDay } from "date-fns";
import type { billingPlans } from "@/lib/db/schema";

export type Frequency = typeof billingPlans.$inferSelect["frequency"];

function safeMonthDay(date: Date, day: number) {
  const max = lastDayOfMonth(date).getDate();
  return setDate(date, Math.min(Math.max(day, 1), max));
}

export function advanceDueDate(date: Date, frequency: Frequency, dueDay: number | null, intervalDays: number | null) {
  if (frequency === "WEEKLY") return addDays(date, 7);
  if (frequency === "BIWEEKLY") return addDays(date, 15);
  if (frequency === "CUSTOM") return addDays(date, Math.max(intervalDays ?? 30, 1));
  return safeMonthDay(addMonths(date, 1), dueDay ?? date.getDate());
}

export function computeInitialDueDate(frequency: Frequency, dueDay: number | null, intervalDays: number | null, from = new Date()) {
  const today = startOfDay(from);
  if (frequency === "MONTHLY") {
    const candidate = safeMonthDay(today, dueDay ?? 10);
    return isBefore(candidate, today) ? safeMonthDay(addMonths(today, 1), dueDay ?? 10) : candidate;
  }
  if (frequency === "WEEKLY") {
    const targetWeekday = Math.min(Math.max(dueDay ?? 1, 0), 6);
    const delta = (targetWeekday - getDay(today) + 7) % 7;
    return addDays(today, delta || 7);
  }
  return addDays(today, frequency === "BIWEEKLY" ? 15 : Math.max(intervalDays ?? 30, 1));
}
