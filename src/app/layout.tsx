import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mi Plataforma",
  description: "Mi plataforma web",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
