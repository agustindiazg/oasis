"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { waitlistLeads } from "@/lib/db/schema";

const emailSchema = z.object({ email: z.string().trim().toLowerCase().email("Ingresá un email válido.") });

export type WaitlistState = { success: boolean; message: string };

export async function joinWaitlist(_previousState: WaitlistState, formData: FormData): Promise<WaitlistState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { success: false, message: parsed.error.issues[0]?.message ?? "Revisá tu email." };

  try {
    await db.insert(waitlistLeads).values({ id: crypto.randomUUID(), email: parsed.data.email, source: "landing" }).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });
    return { success: true, message: "Listo. Te avisamos cuando Oasis abra sus puertas." };
  } catch (error) {
    console.error("No se pudo registrar el acceso anticipado.", error);
    return { success: false, message: "No pudimos guardar tu email. Intentá nuevamente en un momento." };
  }
}
