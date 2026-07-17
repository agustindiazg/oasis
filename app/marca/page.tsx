import type { Metadata } from "next";
import { Icon } from "@/components/icons";
import { Logo } from "@/components/marketing/logo";
import { WaveField } from "@/components/marketing/wave-field";
import { ColorGrid } from "@/components/marca/color-grid";
import { LogoKit } from "@/components/marca/logo-kit";
import { TypePlayground } from "@/components/marca/type-playground";
import { Specimens } from "@/components/marca/specimens";
import { CopyChip } from "@/components/marca/copy-chip";

export const metadata: Metadata = {
  title: "Marca — Oasis",
  description: "El sistema visual de Oasis: símbolo, color, tipografía y componentes. Descargá los assets y usá los tokens.",
};

const sections = [["#principios", "Principios"], ["#simbolo", "Símbolo"], ["#color", "Color"], ["#tipografia", "Tipografía"], ["#componentes", "Componentes"], ["#descargas", "Descargas"]] as const;

const principles = [
  ["01", "Claridad sobre decoración.", "Cada elemento existe para que entiendas tu mes de un vistazo. Si no ayuda a eso, no está."],
  ["02", "Tinta sobre papel.", "Oasis se lee como algo impreso: superficies cálidas, tipografía con carácter, bordes finos. Calma, no ruido."],
  ["03", "El verde se gana.", "El ácido no es decoración. Aparece cuando algo salió bien: un pago confirmado, una acción principal."],
  ["04", "El estado es el mensaje.", "Tres acentos, tres semánticas: ácido pagado, naranja por vencer, violeta en seguimiento. El color trabaja."],
  ["05", "En voseo, sin jerga.", "Hablamos claro, directo y rioplatense. La plata es la plata, y las preguntas incómodas se responden primero."],
] as const;

const boilerplate = "Oasis ordena los cobros recurrentes de profesionales y equipos chicos sobre Mercado Pago: planes, links de pago y el estado real de cada cobro, sin planillas. Oasis no recibe ni retiene fondos — los pagos se acreditan directo en la cuenta de Mercado Pago de cada negocio.";

export default function Marca() {
  const focusClasses = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid focus-visible:ring-offset-2 focus-visible:ring-offset-ink";

  return <main className="min-h-screen bg-ink text-paper [overflow-x:clip]">
    <nav className="mx-auto flex max-w-[1240px] items-center justify-between border-b hairline px-5 py-5 sm:px-8 lg:px-10">
      <Logo href="/" />
      <div className="mono hidden gap-6 text-[10px] uppercase tracking-[.14em] text-[#85877f] lg:flex">{sections.map(([href, label]) => <a key={href} href={href} className={`transition hover:text-paper ${focusClasses}`}>{label}</a>)}</div>
      <a href="/#espera" className={`rounded-full bg-paper px-4 py-2.5 text-[12px] font-bold text-ink transition hover:bg-acid ${focusClasses}`}>Sumate a la lista</a>
    </nav>

    {/* Manifesto: tinta sobre papel, literalmente. */}
    <header className="border-b hairline bg-paper text-ink">
      <div className="relative mx-auto grid max-w-[1240px] gap-10 overflow-hidden px-5 py-20 sm:px-8 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:px-10 lg:py-28">
        <div className="relative z-10">
          <p className="mono text-[10px] uppercase tracking-[.18em] text-black/45">/ La marca</p>
          <h1 className="display mt-7 max-w-[640px] text-[clamp(3rem,7vw,5.8rem)] font-semibold">Cobrar bien también es diseño.</h1>
          <p className="mt-8 max-w-[460px] text-[16px] leading-7 text-black/60">Oasis existe para sacarle ansiedad al mes de quien cobra por su tiempo. La marca hace lo mismo que el producto: ordena, aclara y se queda en calma. Esta página documenta cómo — y te deja llevarte todo.</p>
        </div>
        <div className="relative z-10 mx-auto grid place-items-center">
          <span className="logo-mark grid h-40 w-40 place-items-center rounded-full bg-acid sm:h-52 sm:w-52"><span className="h-11 w-11 rounded-full bg-ink sm:h-14 sm:w-14" /></span>
        </div>
        <WaveField rows={9} className="pointer-events-none absolute -bottom-24 -right-24 w-[640px] opacity-[.22]" />
      </div>
    </header>

    <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">
      {/* Principios */}
      <section id="principios" className="scroll-mt-8 border-b hairline py-20 lg:py-28">
        <SectionHead label="/ 01 · Principios" title={<>Cinco decisiones,<br /><span className="text-[#666861]">tomadas de antemano.</span></>} />
        <div className="mt-14 divide-y hairline border-t hairline">
          {principles.map(([number, title, body]) => <div key={number} className="grid gap-3 py-7 sm:grid-cols-[80px_.8fr_1.2fr] sm:items-baseline">
            <p className="mono text-[10px] text-[#6f716b]">{number}</p>
            <h3 className="text-xl font-semibold tracking-[-.04em]">{title}</h3>
            <p className="max-w-[520px] text-[14px] leading-6 text-[#888a83]">{body}</p>
          </div>)}
        </div>
      </section>

      {/* Símbolo */}
      <section id="simbolo" className="scroll-mt-8 border-b hairline py-20 lg:py-28">
        <SectionHead label="/ 02 · Símbolo" title={<>Un punto<br /><span className="text-[#666861]">en su oasis.</span></>} />
        <p className="mt-7 max-w-[520px] text-[15px] leading-7 text-[#a9aaa3]">El círculo es el mes que se repite; el punto sos vos, en el centro y en calma. Funciona en ácido sobre tinta, tinta sobre papel y papel sobre tinta — y nada más. Tocá para copiar o descargar.</p>
        <div className="mt-10"><LogoKit /></div>
        <div className="mt-10 grid gap-3 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border hairline p-6 sm:p-8">
            <p className="mono text-[9px] uppercase tracking-[.15em] text-[#85877f]">Aire mínimo</p>
            <div className="mx-auto my-8 grid w-fit place-items-center rounded-2xl border border-dashed border-paper/25 p-8">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-acid"><span className="h-[18px] w-[18px] rounded-full bg-ink" /></span>
            </div>
            <p className="text-[12px] leading-5 text-[#888a83]">Dejale al símbolo un margen de al menos la mitad de su diámetro. Hacelo grande o hacelo chico, pero dejalo respirar.</p>
          </div>
          <div className="rounded-2xl border hairline p-6 sm:p-8">
            <p className="mono text-[9px] uppercase tracking-[.15em] text-[#85877f]">El nombre</p>
            <p className="mt-6 text-[15px] leading-7 text-[#a9aaa3]"><span className="font-bold text-paper">Oasis</span>, con mayúscula inicial en texto. En el logotipo, siempre <span className="font-extrabold tracking-[-.04em] text-paper">oasis</span> en minúscula.</p>
            <div className="mono mt-6 flex flex-wrap gap-2 text-[10px]">
              {["OASIS", "oasis-app", "Oasys", "0asis"].map((wrong) => <span key={wrong} className="rounded-full border border-[#e9a2ad]/30 px-3 py-1.5 text-[#e9a2ad] line-through">{wrong}</span>)}
            </div>
            <p className="mt-6 text-[12px] leading-5 text-[#888a83]">No lo estires, no lo rotes, no le pongas degradado, no lo saques de sus tres combinaciones de color.</p>
          </div>
        </div>
      </section>

      {/* Color */}
      <section id="color" className="scroll-mt-8 border-b hairline py-20 lg:py-28">
        <SectionHead label="/ 03 · Color" title={<>Cinco colores.<br /><span className="text-[#666861]">Tres con trabajo.</span></>} />
        <p className="mt-7 max-w-[520px] text-[15px] leading-7 text-[#a9aaa3]">Tinta y Papel construyen todo. Ácido, Violeta y Naranja son semánticos: dicen cómo viene tu mes. Hacé clic en cualquier valor para copiarlo.</p>
        <div className="mt-10"><ColorGrid /></div>
      </section>

      {/* Tipografía */}
      <section id="tipografia" className="scroll-mt-8 border-b hairline py-20 lg:py-28">
        <SectionHead label="/ 04 · Tipografía" title={<>Manrope habla.<br /><span className="text-[#666861]">DM Mono anota.</span></>} />
        <p className="mt-7 max-w-[520px] text-[15px] leading-7 text-[#a9aaa3]">Manrope lleva la voz: titulares apretados (tracking −.075em), cuerpo cómodo. DM Mono etiqueta: estados, montos, metadatos, siempre en mayúsculas chicas. Probálas.</p>
        <div className="mt-10"><TypePlayground /></div>
      </section>

      {/* Componentes */}
      <section id="componentes" className="scroll-mt-8 border-b hairline py-20 lg:py-28">
        <SectionHead label="/ 05 · Componentes" title={<>La marca,<br /><span className="text-[#666861]">en producción.</span></>} />
        <p className="mt-7 max-w-[520px] text-[15px] leading-7 text-[#a9aaa3]">Estos no son mockups: son los componentes del producto real, con sus tonos exactos. La marca y el producto son la misma cosa.</p>
        <div className="mt-10"><Specimens /></div>
      </section>

      {/* Descargas */}
      <section id="descargas" className="scroll-mt-8 py-20 lg:py-28">
        <SectionHead label="/ 06 · Descargas y prensa" title={<>Llevate<br /><span className="text-[#666861]">lo que necesites.</span></>} />
        <div className="mt-10 grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl border hairline p-6 sm:p-8">
            <p className="mono text-[9px] uppercase tracking-[.15em] text-[#85877f]">Boilerplate · para notas y prensa</p>
            <p className="mt-5 text-[14px] leading-7 text-[#a9aaa3]">{boilerplate}</p>
            <div className="mt-6"><CopyChip value={boilerplate} label="Copiar texto" className="border-paper/15 text-[#b6b7b0] hover:border-paper/40 hover:text-paper" /></div>
          </div>
          <div className="flex flex-col justify-between gap-6 rounded-2xl border hairline p-6 sm:p-8">
            <div>
              <p className="mono text-[9px] uppercase tracking-[.15em] text-[#85877f]">Assets y tokens</p>
              <p className="mt-5 text-[14px] leading-7 text-[#a9aaa3]">El símbolo en SVG está arriba, en sus tres variantes. Los tokens también viven en <a href="/marca.md" className={`mono text-[12px] text-acid underline decoration-acid/40 underline-offset-4 hover:decoration-acid ${focusClasses}`}>/marca.md</a>, en texto plano — para humanos y para agentes.</p>
            </div>
            <p className="text-[12px] leading-5 text-[#888a83]">¿Necesitás algo más? Escribinos a <a href="mailto:soporte@oasis.app" className="font-semibold text-paper">soporte@oasis.app</a>.</p>
          </div>
        </div>
      </section>
    </div>

    {/* Colofón */}
    <footer className="border-t hairline">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-5 py-10 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <Logo href="/" />
          <a href="/" className={`text-[12px] font-semibold text-[#b6b7b0] transition hover:text-paper ${focusClasses}`}><Icon name="arrow" className="mr-2 inline h-3.5 w-3.5 rotate-180" />Volver al inicio</a>
        </div>
        <p className="mono max-w-[640px] text-[9px] uppercase leading-5 tracking-[.14em] text-[#555850]">Colofón — esta página está construida con los mismos tokens que documenta. Manrope y DM Mono. Última actualización: julio 2026. © 2026 Oasis.</p>
      </div>
    </footer>
  </main>;
}

function SectionHead({ label, title }: { label: string; title: React.ReactNode }) {
  return <div>
    <p className="mono text-[10px] uppercase tracking-[.18em] text-acid">{label}</p>
    <h2 className="display mt-7 max-w-[680px] text-4xl font-semibold sm:text-6xl">{title}</h2>
  </div>;
}
