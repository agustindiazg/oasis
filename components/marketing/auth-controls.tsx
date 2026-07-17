"use client";

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

const button = "rounded-full px-4 py-2.5 text-[12px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid";

export function AuthControls() {
  return <div className="flex items-center gap-2">
    <SignedOut>
      <SignInButton mode="redirect" forceRedirectUrl="/admin"><button className={`${button} text-[#b6b7b0] hover:text-paper`}>Iniciar sesión</button></SignInButton>
      <SignUpButton mode="redirect" forceRedirectUrl="/admin"><button className={`${button} bg-paper text-ink hover:bg-acid`}>Crear cuenta</button></SignUpButton>
    </SignedOut>
    <SignedIn><UserButton afterSignOutUrl="/" /></SignedIn>
  </div>;
}
