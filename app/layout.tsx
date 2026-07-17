import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oasis — Cobros que se ordenan solos",
  description: "Oasis ordena tus servicios recurrentes, refleja tus pagos de Mercado Pago y te avisa qué necesita atención.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body><ClerkProvider>{children}</ClerkProvider></body>
    </html>
  );
}
