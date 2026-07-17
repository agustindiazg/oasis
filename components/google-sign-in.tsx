"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function GoogleSignIn({ enabled }: { enabled: boolean }) {
  const [pending, setPending] = useState(false);
  async function signIn() {
    setPending(true);
    await authClient.signIn.social({ provider: "google", callbackURL: "/admin", errorCallbackURL: "/login?error=google" });
    setPending(false);
  }
  return <button disabled={!enabled || pending} onClick={signIn} className="mt-7 w-full rounded-full bg-[#d7f85b] px-5 py-3.5 text-[13px] font-bold text-[#191b1a] disabled:cursor-not-allowed disabled:opacity-40">{pending ? "Conectando…" : "Continuar con Google"}</button>;
}
