"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import { WaitlistForm } from "@/components/waitlist-form";
import { Logo } from "@/components/marketing/logo";
import { WaveField, ScopeRings } from "@/components/marketing/wave-field";
import { HeroDashboard } from "@/components/marketing/hero-dashboard";
import { PaymentLinkCard } from "@/components/marketing/payment-link-card";
import { ChaosCollage } from "@/components/marketing/chaos-collage";
import { ClientTable } from "@/components/marketing/client-table";
import { VidaCobro } from "@/components/marketing/vida-cobro";
import { MoneyFlow } from "@/components/marketing/money-flow";
import { AuthControls } from "@/components/marketing/auth-controls";

const navLinks = [["#producto", "Producto"], ["#seguridad", "Seguridad"], ["#preguntas", "Preguntas"]] as const;

const audiences = [
  ["Entrenadores", "12 alumnos × $18.000/mes", "0 mensajes de cobranza", "#d7f85b"],
  ["Profesores", "8 clases · vencen el 5", "cada período nace solo", "#9f8bff"],
  ["Estudios", "40 cuotas por mes", "una vista, tres estados", "#ffb77e"],
  ["Consultoras", "3 retainers × $450.000", "seguimiento sin planillas", "#9f8bff"],
  ["Freelancers", "5 clientes fijos", "sabés quién está al día", "#ffb77e"],
  ["Agencias", "fee mensual + extras", "un link por cobro, no por caos", "#d7f85b"],
] as const;

const perks = [
  ["Prioridad de acceso", "Las tandas se asignan por orden de lista. Entrás antes."],
  ["Precio de fundador", "El precio con el que entrás se queda con vos, para siempre."],
  ["Línea directa", "Hablás con quienes construyen Oasis. Tu caso define el producto."],
] as const;

const faqs = [
  ["¿Oasis guarda mi plata?", "No. Nunca. Conectás tu propia cuenta de Mercado Pago y los pagos se acreditan ahí, directo. Oasis solo lee estados y vencimientos para ordenarte el mes."],
  ["¿Necesito una cuenta de Mercado Pago?", "Sí — Oasis trabaja sobre tu cuenta. Si ya cobrás con Mercado Pago, no cambiás nada de cómo cobrás."],
  ["¿Cuánto va a costar?", "Lo anunciamos antes de abrir cada tanda. Quienes están en la lista de espera acceden a precio de fundador."],
  ["¿Tengo que cambiar cómo cobro?", "No necesariamente. Organizás tus planes y generás links de pago desde tu espacio, mientras seguís cobrando en Mercado Pago."],
  ["¿Cuándo abre?", "Estamos abriendo de a tandas durante 2026, por orden de lista. Sumate y te avisamos cuando te toque."],
] as const;

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const focusClasses = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid focus-visible:ring-offset-2 focus-visible:ring-offset-ink";
  const closeMenu = () => setMenuOpen(false);

  return (
    <main id="top" className="min-h-screen bg-ink [overflow-x:clip]">
      <a href="#contenido" className="sr-only z-50 rounded-full bg-acid px-4 py-2 text-xs font-bold text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Saltar al contenido</a>

      <nav className="relative mx-auto flex max-w-[1240px] items-center justify-between border-b hairline px-5 py-5 sm:px-8 lg:px-10">
        <div className="relative z-30"><Logo /></div>
        <div className="hidden items-center gap-8 text-[12px] text-[#b6b7b0] md:flex">{navLinks.map(([href, label]) => <a key={href} href={href} className={`transition hover:text-paper ${focusClasses}`}>{label}</a>)}</div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block"><AuthControls /></div>
          <a href="#espera" onClick={closeMenu} className={`rounded-full bg-paper px-4 py-2.5 text-[12px] font-bold text-ink transition hover:bg-acid ${focusClasses}`}>Sumate a la lista <Icon name="arrow" className="ml-1 inline h-3.5 w-3.5" /></a>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} className={`relative z-30 ml-1 grid h-9 w-9 place-items-center rounded-full border hairline transition hover:bg-paper/10 md:hidden ${focusClasses}`} aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={menuOpen} aria-controls="mobile-menu"><Icon name="menu" /></button>
        </div>
        {menuOpen && <div id="mobile-menu" className="absolute inset-x-5 top-[76px] z-20 rounded-2xl border hairline bg-[#111111] p-3 shadow-2xl md:hidden"><div className="flex flex-col gap-1 text-[13px]">{navLinks.map(([href, label]) => <a key={href} href={href} onClick={closeMenu} className={`rounded-xl px-4 py-3 text-[#b6b7b0] transition hover:bg-paper/10 hover:text-paper ${focusClasses}`}>{label}</a>)}<div className="mt-2 border-t hairline px-1 pt-2"><AuthControls /></div></div></div>}
      </nav>

      {/* 00 — Hero: one claim, the real product in the first viewport. */}
      <section id="contenido" className="relative mx-auto grid max-w-[1240px] gap-14 px-5 pb-24 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:gap-10 lg:px-10 lg:pb-32 lg:pt-24">
        <WaveField className="pointer-events-none absolute -right-40 -top-10 -z-0 hidden w-[820px] opacity-60 lg:block" />
        <div className="reveal relative z-10">
          <div className="mono mb-7 flex items-center gap-3 text-[10px] uppercase tracking-[.18em] text-acid"><span className="h-1.5 w-1.5 rounded-full bg-acid shadow-[0_0_14px_#d7f85b]" />Acceso anticipado · Cobros recurrentes sobre Mercado Pago</div>
          <h1 className="display max-w-[680px] text-[clamp(3.6rem,9vw,8rem)] font-semibold">Perseguir pagos,<br /><span className="text-acid">nunca más.</span></h1>
          <p className="mt-8 max-w-[470px] text-[16px] leading-7 text-[#a9aaa3]">Oasis ordena tus servicios recurrentes: cada período nace solo, cada pago se refleja al instante y ves quién está al día sin preguntar. Para entrenadores, profes, estudios y consultoras que cobran por mes.</p>
          <WaitlistForm tone="dark" idPrefix="hero-" />
          <p className="mono mt-5 max-w-[420px] text-[10px] leading-5 text-[#6f716b]">Oasis no toca tu plata — cobrás directo en tu cuenta de Mercado Pago.</p>
        </div>
        <div className="reveal relative z-10 mx-auto w-full max-w-[560px]" style={{ animationDelay: ".12s" }}>
          <HeroDashboard />
        </div>
      </section>

      {/* El problema, contado como interfaz. */}
      <section className="mx-auto grid max-w-[1240px] gap-12 border-t hairline px-5 py-24 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:px-10 lg:py-32">
        <div>
          <p className="mono text-[10px] uppercase tracking-[.18em] text-ember">/ El mes sin Oasis</p>
          <h2 className="display mt-7 text-5xl font-semibold sm:text-6xl">Todos los meses,<br /><span className="text-[#666861]">la misma caza.</span></h2>
          <p className="mt-7 max-w-[420px] text-[15px] leading-7 text-[#a9aaa3]">Transferencias que revisás una por una. Una planilla que alguien se olvidó de actualizar. Y ese mensaje que da un poco de vergüenza mandar de nuevo.</p>
        </div>
        <ChaosCollage />
      </section>

      {/* 01-03 — El producto, en capítulos numerados. Cada afirmación con su interfaz real. */}
      <section id="producto" className="scroll-mt-8 mx-auto max-w-[1240px] border-t hairline px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
        <div className="mb-20">
          <p className="mono text-[10px] uppercase tracking-[.18em] text-acid">/ El producto</p>
          <h2 className="display mt-7 max-w-[680px] text-5xl font-semibold sm:text-7xl">Menos perseguir.<br /><span className="text-[#666861]">Más trabajar.</span></h2>
        </div>

        <div className="grid gap-12 border-t hairline pt-16 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div>
            <p className="mono text-[10px] uppercase tracking-[.18em] text-acid">01 <span className="ml-2 text-[#444740]">/ 03</span></p>
            <h3 className="display mt-6 text-4xl font-semibold sm:text-5xl">Armá el plan una vez.</h3>
            <p className="mt-6 max-w-[420px] text-[15px] leading-7 text-[#a9aaa3]">Nombre, monto, frecuencia. Oasis genera cada período por vos: sin copiar y pegar, sin depender de la memoria.</p>
          </div>
          <div className="panel-paper grain grain-dark mx-auto w-full max-w-[420px] rounded-[1.5rem] p-6">
            <div className="flex items-center justify-between"><p className="mono text-[9px] uppercase tracking-[.15em] text-black/40">Plan activo</p><span className="inline-flex rounded-full border border-[#bfd866] bg-[#e1f39a] px-2 py-0.5 text-[9px] font-bold leading-none text-[#33420d]">12 clientes</span></div>
            <p className="mt-4 text-[17px] font-bold tracking-[-.04em]">Entrenamiento funcional</p>
            <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-semibold">
              <span className="rounded-full bg-[#191b1a] px-3.5 py-2 text-[#f1f0e9]">Mensual · día 5</span>
              <span className="rounded-full border border-black/15 px-3.5 py-2 text-black/50">Semanal</span>
              <span className="rounded-full border border-black/15 px-3.5 py-2 text-black/50">Cada 15 días</span>
            </div>
            <div className="mt-6 flex items-end justify-between border-t border-black/10 pt-5"><p className="text-[28px] font-bold tabular-nums tracking-[-.06em]">$18.000<span className="text-[13px] font-semibold text-black/40"> /mes</span></p><p className="text-[11px] font-bold">Generar link →</p></div>
          </div>
        </div>

        <div className="mt-24 grid gap-12 border-t hairline pt-16 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div className="lg:order-2">
            <p className="mono text-[10px] uppercase tracking-[.18em] text-ember">02 <span className="ml-2 text-[#444740]">/ 03</span></p>
            <h3 className="display mt-6 text-4xl font-semibold sm:text-5xl">Mandá el link.</h3>
            <p className="mt-6 max-w-[420px] text-[15px] leading-7 text-[#a9aaa3]">Cada cobro tiene su link de Mercado Pago, listo para WhatsApp. Tu cliente paga en dos toques y el estado se actualiza solo.</p>
          </div>
          <div className="lg:order-1"><PaymentLinkCard /></div>
        </div>

        <div className="mt-24 grid gap-12 border-t hairline pt-16 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div>
            <p className="mono text-[10px] uppercase tracking-[.18em] text-violet">03 <span className="ml-2 text-[#444740]">/ 03</span></p>
            <h3 className="display mt-6 text-4xl font-semibold sm:text-5xl">Mirá quién pagó, sin preguntar.</h3>
            <p className="mt-6 max-w-[420px] text-[15px] leading-7 text-[#a9aaa3]">Estados claros para todo el mes: <span className="text-paper">Pagado</span>, <span className="text-paper">Vence mañana</span>, <span className="text-paper">Seguimiento</span>. Qué está al día y qué necesita atención, con solo mirar.</p>
          </div>
          <div className="mx-auto"><ClientTable /></div>
        </div>
      </section>

      {/* La vida de un cobro — set piece con scroll. */}
      <section className="border-t hairline bg-[#080808]">
        <div className="mx-auto max-w-[1240px] px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
          <div className="mb-8 lg:mb-0">
            <p className="mono text-[10px] uppercase tracking-[.18em] text-acid">/ La vida de un cobro</p>
            <h2 className="display mt-7 max-w-[600px] text-5xl font-semibold sm:text-6xl">Un cobro, contado<br /><span className="text-[#666861]">de principio a fin.</span></h2>
          </div>
          <VidaCobro />
        </div>
      </section>

      {/* Seguridad / confianza. */}
      <section id="seguridad" className="scroll-mt-8 border-y hairline bg-[#0c0c0c]">
        <div className="mx-auto max-w-[1240px] px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:gap-16">
            <div>
              <p className="mono text-[10px] uppercase tracking-[.18em] text-violet">/ Tu plata</p>
              <h2 className="display mt-7 text-5xl font-semibold sm:text-6xl">Tu plata nunca<br />pasa por <span className="text-violet">Oasis.</span></h2>
              <p className="mt-7 max-w-[440px] text-[15px] leading-7 text-[#a9aaa3]">Tus clientes pagan por Mercado Pago y la plata se acredita en tu cuenta, como siempre. Oasis mira el flujo desde afuera: lee estados y vencimientos, y te los ordena.</p>
              <ul className="mt-8 space-y-3 text-[13px] text-[#b6b7b0]">
                <li className="flex items-start gap-3"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-acid/15 text-acid"><Icon name="check" className="h-3 w-3" /></span>Cobrás directo en tu cuenta de Mercado Pago.</li>
                <li className="flex items-start gap-3"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-acid/15 text-acid"><Icon name="check" className="h-3 w-3" /></span>Oasis solo lee estados y vencimientos. No puede mover fondos.</li>
                <li className="flex items-start gap-3"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-acid/15 text-acid"><Icon name="check" className="h-3 w-3" /></span>Desvinculás tu cuenta cuando quieras, sin vueltas.</li>
              </ul>
            </div>
            <MoneyFlow />
          </div>
        </div>
      </section>

      {/* Para quién: escenarios con números, no adjetivos. */}
      <section className="mx-auto max-w-[1240px] px-5 py-24 sm:px-8 lg:px-10 lg:py-32">
        <div className="mb-14">
          <p className="mono text-[10px] uppercase tracking-[.18em] text-ember">/ Para quién</p>
          <h2 className="display mt-7 max-w-[680px] text-5xl font-semibold sm:text-6xl">Si cobrás por mes,<br /><span className="text-[#666861]">es para vos.</span></h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {audiences.map(([who, stat, note, color]) => <div key={who} className="group rounded-2xl border hairline p-6 transition hover:bg-paper/[.03]">
            <div className="flex items-center justify-between"><p className="mono text-[10px] uppercase tracking-[.15em] text-[#85877f]">{who}</p><span className="h-2 w-2 rounded-full transition-transform duration-500 group-hover:scale-[1.8]" style={{ backgroundColor: color }} /></div>
            <p className="mt-10 text-[17px] font-bold tabular-nums tracking-[-.03em]">{stat}</p>
            <p className="mono mt-2 text-[10px] uppercase tracking-[.12em] text-[#6f716b]">{note}</p>
          </div>)}
        </div>
      </section>

      {/* Acceso anticipado, honesto. */}
      <section className="mx-auto max-w-[1240px] px-5 pb-24 sm:px-8 lg:px-10 lg:pb-32">
        <div className="gradient-frame relative overflow-hidden rounded-[2rem] p-8 sm:p-12" style={{ "--panel": "#0a0a0a" } as React.CSSProperties}>
          <ScopeRings className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 opacity-70" />
          <div className="relative">
            <p className="mono text-[10px] uppercase tracking-[.18em] text-acid">/ Acceso anticipado</p>
            <h2 className="display mt-6 max-w-[560px] text-4xl font-semibold sm:text-5xl">Estamos abriendo<br />de a tandas.</h2>
            <p className="mono mt-4 text-[10px] uppercase tracking-[.15em] text-[#85877f]">Tanda actual · primeras 100 cuentas · por orden de lista</p>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {perks.map(([title, body]) => <div key={title} className="rounded-2xl border hairline p-5"><p className="text-[13px] font-bold">{title}</p><p className="mt-2 text-[12px] leading-5 text-[#888a83]">{body}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      {/* Preguntas, empezando por las que dan miedo. */}
      <section id="preguntas" className="scroll-mt-8 mx-auto max-w-[1240px] px-5 pb-24 sm:px-8 lg:px-10 lg:pb-32">
        <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr]">
          <div>
            <p className="mono text-[10px] uppercase tracking-[.18em] text-acid">/ Preguntas honestas</p>
            <h2 className="display mt-7 text-5xl font-semibold sm:text-6xl">Lo importante,<br /><span className="text-[#666861]">sin vueltas.</span></h2>
          </div>
          <div className="divide-y hairline border-y">
            {faqs.map(([question, answer]) => <details key={question} className="group py-6"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-[15px] font-semibold"><span>{question}</span><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border hairline text-acid transition group-open:rotate-45">+</span></summary><p className="max-w-[580px] pt-4 text-[14px] leading-7 text-[#888a83]">{answer}</p></details>)}
          </div>
        </div>
      </section>

      {/* CTA final. */}
      <section id="espera" className="scroll-mt-8 mx-auto max-w-[1240px] px-5 pb-28 sm:px-8 lg:px-10 lg:pb-36">
        <div className="relative overflow-hidden rounded-[2rem] border border-acid/30 bg-acid p-7 text-ink sm:p-12 lg:p-16">
          <div className="absolute -right-16 -top-28 h-80 w-80 rounded-full border border-ink/20 opacity-50" />
          <div className="absolute -right-2 -top-16 h-64 w-64 rounded-full border border-ink/20 opacity-50" />
          <div className="relative max-w-[680px]">
            <p className="mono text-[10px] uppercase tracking-[.18em] opacity-60">/ Sumate</p>
            <h2 className="display mt-7 text-5xl font-semibold sm:text-7xl">Cobrar bien<br />se siente bien.</h2>
            <p className="mt-6 max-w-[420px] text-[15px] leading-6 text-ink/70">Conocé Oasis antes que nadie y ayudanos a construir la forma más simple de llevar tus cobros recurrentes.</p>
            <WaitlistForm />
            <p className="mono mt-5 text-[10px] uppercase tracking-[.13em] text-ink/50">Solo tu email · Sin tarjeta · Oasis no toca tu plata</p>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1240px] flex-col gap-6 border-t hairline px-5 py-8 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <div className="flex items-center gap-5 text-[11px] text-[#777970]"><a href="#producto" className={focusClasses}>Producto</a><a href="/marca" className={`${focusClasses} transition hover:text-paper`}>Marca</a><a href="mailto:soporte@oasis.app" className={focusClasses}>Contacto</a><span>© 2026 Oasis</span></div>
        </div>
        <p className="mono text-[9px] uppercase tracking-[.14em] text-[#555850]">Oasis no recibe ni retiene fondos — los cobros se procesan en tu cuenta de Mercado Pago.</p>
      </footer>
    </main>
  );
}
