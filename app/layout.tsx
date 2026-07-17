import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oasis — Cobros que se ordenan solos",
  description: "Oasis ordena tus servicios recurrentes, refleja tus pagos de Mercado Pago y te avisa qué necesita atención.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
