"use client";

import { SignIn } from "@clerk/nextjs";

export function GoogleSignIn({ enabled }: { enabled: boolean }) {
  if (!enabled) return <button disabled className="mt-7 w-full rounded-full bg-[#d7f85b] px-5 py-3.5 text-[13px] font-bold text-[#191b1a] opacity-40">Continuar con Google</button>;
  return <div className="mt-7"><SignIn routing="hash" forceRedirectUrl="/admin" appearance={{ elements: { rootBox: "w-full", card: "w-full bg-transparent shadow-none p-0", header: "hidden", socialButtonsBlockButton: "rounded-full bg-[#d7f85b] text-[#191b1a] border-0", socialButtonsBlockButtonText: "text-[13px] font-bold", dividerRow: "hidden", formFieldInput: "rounded-xl", footer: "hidden" } }} /></div>;
}
