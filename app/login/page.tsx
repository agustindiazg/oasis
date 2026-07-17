import { GoogleSignIn } from "@/components/google-sign-in";
import { isClerkAuthConfigured } from "@/lib/auth";

export default function LoginPage() {
  return <main className="grid min-h-screen place-items-center bg-[#050505] px-5 text-[#eae9e2]"><section className="w-full max-w-[420px] rounded-[2rem] border border-white/10 bg-[#111111] p-7 shadow-2xl sm:p-9"><a href="/" className="flex items-center gap-2.5 text-[15px] font-extrabold tracking-[-.04em]"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#d7f85b]"><span className="h-2 w-2 rounded-full bg-[#191b1a]" /></span>oasis</a><p className="mono mt-12 text-[9px] uppercase tracking-[.16em] text-[#d7f85b]">Tu negocio, en calma</p><h1 className="display mt-4 text-5xl font-semibold">Entrá a tu Oasis.</h1><p className="mt-5 text-[13px] leading-6 text-white/50">Administrá clientes, planes y cobros recurrentes desde un solo lugar.</p><GoogleSignIn enabled={isClerkAuthConfigured} />{!isClerkAuthConfigured && <p className="mt-3 text-center text-[11px] leading-5 text-[#ffb77e]">Configurá Clerk para habilitar el acceso.</p>}</section></main>;
}
