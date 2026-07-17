import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#191b1a] px-5 text-[#f1f0e9]">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="mono text-[10px] uppercase tracking-[.16em] text-[#d7f85b]">Oasis</p>
        <h1 className="mt-5 text-3xl font-bold tracking-[-.06em]">No encontramos esa página</h1>
        <p className="mt-3 text-[13px] leading-6 text-white/55">Puede que el enlace haya vencido o que la página ya no exista.</p>
        <Link href="/" className="mt-7 inline-flex rounded-full bg-[#f1f0e9] px-5 py-3 text-[12px] font-bold text-[#191b1a]">Volver al inicio</Link>
      </section>
    </main>
  );
}
