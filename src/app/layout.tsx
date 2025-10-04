import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClientProviders } from "./providers";
import { MobileNavbar } from "@/src/shared/components/MobileNavbar";
import { MobileWrapper } from "@/src/shared/components/MobileWrapper";
import { DynamicLayoutWrapper } from "@/src/shared/components/DynamicLayoutWrapper";
import { Toaster } from "@/src/shared/components/ui/toaster";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 0.9,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === "production"
      ? "https://expertocerca.com"
      : "http://localhost:3000"
  ),
  title: "Experto Cerca",
  description:
    "Encuentra electricistas, plomeros, carpinteros y más profesionales calificados cerca de ti. Conecta con expertos verificados para tus proyectos del hogar.",
  authors: [{ name: "ExpertoCerca" }],
  keywords: [
    "oficios",
    "electricista",
    "plomero",
    "carpintero",
    "servicios",
    "profesionales",
    "hogar",
    "reparaciones",
  ],
  openGraph: {
    title: "ExpertoCerca - Conecta con Profesionales de Oficios",
    description:
      "La plataforma líder para conectar con profesionales de oficios verificados. Encuentra el experto que necesitas para tus proyectos.",
    type: "website",
    images: ["/opengraph-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    site: "@expertocerca",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <head>
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta
          name='apple-mobile-web-app-status-bar-style'
          content='black-translucent'
        />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='theme-color' content='#3B82F6' />
      </head>
      <body className={inter.className}>
        <ClientProviders>
          <MobileWrapper>
            <DynamicLayoutWrapper>{children}</DynamicLayoutWrapper>
            <MobileNavbar />
          </MobileWrapper>
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}
