import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { ClientProviders } from "./providers";
import { MobileNavbar } from "@/src/shared/components/MobileNavbar";
import { MobileWrapper } from "@/src/shared/components/MobileWrapper";
import { DynamicLayoutWrapper } from "@/src/shared/components/DynamicLayoutWrapper";
import { GlobalMobileSearch, Toaster, PromoBanner, GlobalLoginModal } from "@/src/shared/components/DynamicComponents";
import { CookieBanner } from "@/src/shared/components/CookieBanner";
import { GoogleTagManager, GoogleTagManagerNoScript } from "@/src/shared/components/GoogleTagManager";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"], // Reducido: solo los pesos más usados
  display: "swap",
  preload: true,
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  // Enable minimal-ui for Safari to hide address bar on scroll
  interactiveWidget: "resizes-content",
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === "production"
      ? "https://expertocerca.com"
      : "http://localhost:3000"
  ),
  title: {
    default: "Experto Cerca - Encuentra Profesionales de Oficios",
    template: "%s | Experto Cerca",
  },
  description:
    "Encuentra electricistas, plomeros, carpinteros y más profesionales calificados cerca de ti. Conecta con expertos verificados para tus proyectos del hogar.",
  applicationName: "Experto Cerca",
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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Experto Cerca",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "ExpertoCerca - Conecta con Profesionales de Oficios",
    description:
      "La plataforma líder para conectar con profesionales de oficios verificados. Encuentra el experto que necesitas para tus proyectos.",
    type: "website",
    siteName: "Experto Cerca",
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
        {/* Preload critical assets */}
        <link rel='preload' as='image' href='/logo-bco-experto-cerca.svg' type='image/svg+xml' />

        {/* Favicon */}
        <link rel='icon' href='/favicon.ico' />
      </head>
      <body className={poppins.className}>
        <GoogleTagManagerNoScript />
        <GoogleTagManager />
        <ClientProviders>
          <MobileWrapper>
            <DynamicLayoutWrapper>{children}</DynamicLayoutWrapper>
            <MobileNavbar />
            <GlobalMobileSearch />
            <GlobalLoginModal />
          </MobileWrapper>
          <Toaster />
          <PromoBanner />
          <CookieBanner />
        </ClientProviders>
      </body>
    </html>
  );
}
