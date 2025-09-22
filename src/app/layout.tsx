import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClientProviders } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === "production"
      ? "https://expertocerca.com"
      : "http://localhost:3000"
  ),
  title: "ExpertoCerca - Conecta con Profesionales de Oficios",
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
      <body className={inter.className}>
        <ClientProviders>
          <div className='md:pb-0'>
            {children}
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
