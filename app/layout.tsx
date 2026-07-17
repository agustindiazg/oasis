import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oasis — Cobros que se ordenan solos",
  description: "Oasis mantiene tus cobros recurrentes al día, automáticamente.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
