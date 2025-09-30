import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "ocupación hotelera málaga · dataviz",
    template: "%s · ocupación málaga",
  },
  description:
    "visualización de la ocupación hotelera de málaga (datos abiertos). next.js + typescript + recharts, foco en rendimiento (ssg/ssr), core web vitals y a11y.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "málaga dataviz",
    locale: "es_ES",
    title: "ocupación hotelera málaga · dataviz",
    description: "dashboard interactivo con datos abiertos y next.js.",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a href="#main" className="skip-link">
          saltar al contenido
        </a>
        <header role="banner">...</header>
        <main id="main" role="main">
          {children}
        </main>
        <footer role="contentinfo">...</footer>
      </body>
    </html>
  );
}
