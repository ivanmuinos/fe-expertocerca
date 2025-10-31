"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/src/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/shared/components/ui/avatar";
import { LoginModal } from "@/src/shared/components/LoginModal";
import { useAuthState } from "@/src/features/auth";
import { useState } from "react";
import { Shield } from "lucide-react";
import { Footer } from "@/src/shared/components/Footer";

export default function PrivacidadPage() {
  const router = useRouter();
  const { user } = useAuthState();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header with Logo */}
      <header className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Image
              src="/logo-color-experto-cerca.svg"
              alt="Experto Cerca"
              width={140}
              height={46}
              className="h-8 md:h-9 w-auto cursor-pointer"
              onClick={() => router.push("/")}
              priority
            />

            {/* Right section - User actions */}
            <div className="flex items-center gap-2">
              {user ? (
                <Button
                  variant="ghost"
                  onClick={() => router.push("/perfil")}
                  className="relative h-10 w-10 rounded-full p-0 hover:bg-gray-100"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.user_metadata?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {user.user_metadata?.full_name?.charAt(0) ||
                        user.email?.charAt(0) ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => setIsLoginModalOpen(true)}
                    variant="ghost"
                    className="hidden sm:flex text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full px-4 py-2 h-10 transition-all duration-200"
                  >
                    Convertite en experto
                  </Button>
                  <Button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="text-sm font-semibold bg-primary hover:bg-primary/90 text-white rounded-full px-6 py-2 h-10 transition-all duration-200"
                  >
                    Iniciar sesión
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Header */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
          <div className="mb-8">
            <Shield className="w-12 h-12 md:w-16 md:h-16 mb-4 text-blue-600" />
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Política de Privacidad
            </h1>
            <p className="text-lg text-gray-600">
              Última actualización: Octubre 2025
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="prose prose-lg max-w-none">
          <Section title="1. INTRODUCCIÓN">
            <p>En Experto Cerca valoramos y respetamos su privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, almacenamos y protegemos su información personal cuando utiliza nuestra plataforma.</p>
            <p>Esta política cumple con la Ley N° 25.326 de Protección de Datos Personales de la República Argentina y sus normas complementarias.</p>
            <p>Al utilizar Experto Cerca, usted acepta las prácticas descritas en esta Política de Privacidad.</p>
          </Section>

          <Section title="2. RESPONSABLE DEL TRATAMIENTO DE DATOS">
            <p className="font-semibold">Responsable: Experto Cerca</p>
            <p>Email de contacto: soporte@expertocerca.com</p>
            <p>De acuerdo con la Ley 25.326, los datos personales recopilados serán incorporados a una base de datos de titularidad de Experto Cerca, debidamente inscripta ante la Agencia de Acceso a la Información Pública (AAIP).</p>
          </Section>

          <Section title="3. INFORMACIÓN QUE RECOPILAMOS">
            <p className="font-semibold">3.1. INFORMACIÓN QUE USTED NOS PROPORCIONA:</p>
            <ul>
              <li>Datos de identificación: nombre, DNI, fecha de nacimiento</li>
              <li>Datos de contacto: email, teléfono, dirección</li>
              <li>Datos de perfil profesional: oficio, descripción, experiencia, zona</li>
              <li>Contenido publicado: servicios, imágenes, comentarios</li>
            </ul>
            <p className="font-semibold">3.2. INFORMACIÓN AUTOMÁTICA:</p>
            <ul>
              <li>Datos técnicos: IP, navegador, sistema operativo, dispositivo</li>
              <li>Datos de uso: páginas visitadas, búsquedas, interacciones</li>
              <li>Datos de ubicación aproximada</li>
            </ul>
          </Section>

          <Section title="4. CÓMO USAMOS SU INFORMACIÓN">
            <p>Utilizamos su información para:</p>
            <ul>
              <li>Operar la plataforma y gestionar su cuenta</li>
              <li>Facilitar la conexión entre usuarios y profesionales</li>
              <li>Enviar notificaciones sobre servicios relevantes</li>
              <li>Mejorar y personalizar el servicio</li>
              <li>Analizar el uso y rendimiento</li>
              <li>Detectar y prevenir fraudes</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
            <p className="font-bold">IMPORTANTE: Nunca vendemos ni alquilamos sus datos personales a terceros.</p>
          </Section>

          <Section title="5. CON QUIÉN COMPARTIMOS SU INFORMACIÓN">
            <p className="font-semibold">5.1. INFORMACIÓN PÚBLICA:</p>
            <p>Al crear un perfil, cierta información será visible para otros usuarios (nombre, oficio, zona, servicios, imágenes). Usted controla qué información hace pública.</p>
            <p className="font-semibold">5.2. COMPARTIMOS CON:</p>
            <ul>
              <li>Otros usuarios cuando publica servicios o se contacta</li>
              <li>Proveedores de servicios tecnológicos (hosting, emails, análisis)</li>
              <li>Autoridades legales cuando sea requerido por ley</li>
            </ul>
            <p className="font-semibold">5.3. NO COMPARTIMOS CON:</p>
            <ul>
              <li>Empresas de marketing sin su consentimiento</li>
              <li>Terceros para sus propios fines comerciales</li>
            </ul>
          </Section>

          <Section title="6. CÓMO PROTEGEMOS SU INFORMACIÓN">
            <p>Implementamos medidas de seguridad técnicas y administrativas:</p>
            <ul>
              <li>Encriptación de datos (HTTPS/SSL)</li>
              <li>Firewalls y sistemas de detección</li>
              <li>Autenticación segura</li>
              <li>Acceso limitado (solo personal autorizado)</li>
              <li>Sistema de detección de contenido inapropiado</li>
              <li>Copias de seguridad periódicas</li>
            </ul>
            <p className="font-semibold">IMPORTANTE: Ningún sistema es 100% seguro. Usted también debe proteger su cuenta usando contraseñas seguras.</p>
          </Section>

          <Section title="7. SUS DERECHOS">
            <p>De acuerdo con la Ley 25.326, usted tiene derecho a:</p>
            <ul>
              <li><strong>Acceso:</strong> Solicitar información sobre qué datos tenemos</li>
              <li><strong>Rectificación:</strong> Corregir datos inexactos</li>
              <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos</li>
              <li><strong>Actualización:</strong> Mantener sus datos actualizados</li>
              <li><strong>Oposición:</strong> Oponerse a ciertos usos de sus datos</li>
            </ul>
            <p>Para ejercer estos derechos, contáctenos a: soporte@expertocerca.com</p>
            <p>Responderemos en un plazo máximo de 10 días hábiles.</p>
          </Section>

          <Section title="8. COOKIES">
            <p>Usamos cookies para mantener su sesión, recordar preferencias y analizar el uso.</p>
            <p className="font-semibold">Tipos:</p>
            <ul>
              <li>Esenciales: necesarias para el funcionamiento</li>
              <li>Analíticas: para entender cómo usa la plataforma</li>
              <li>Funcionalidad: para recordar preferencias</li>
            </ul>
            <p>Puede configurar su navegador para rechazar cookies.</p>
          </Section>

          <Section title="9. MENORES DE EDAD">
            <p className="font-bold">Experto Cerca NO está dirigido a menores de 18 años.</p>
            <p>No recopilamos intencionalmente datos de menores. Si descubrimos que un menor se ha registrado, eliminaremos su cuenta inmediatamente.</p>
          </Section>

          <Section title="10. CAMBIOS EN ESTA POLÍTICA">
            <p>Nos reservamos el derecho de modificar esta Política en cualquier momento. Los cambios significativos serán notificados por email o aviso en la plataforma con al menos 15 días de anticipación.</p>
          </Section>

          <Section title="11. RECLAMOS Y CONSULTAS">
            <p className="font-semibold">Contacto para privacidad:</p>
            <p>Email: soporte@expertocerca.com</p>
            <p className="font-semibold">Agencia de Acceso a la Información Pública (AAIP):</p>
            <p>Si no está conforme, puede presentar un reclamo ante:</p>
            <ul>
              <li>Av. Pte. Gral. Julio A. Roca 710, Piso 3° (C1067ABC) CABA</li>
              <li>Tel: 0800-222-DATO (3286)</li>
              <li>Email: datospersonales@aaip.gob.ar</li>
            </ul>
          </Section>

          <Section title="12. CONSENTIMIENTO">
            <p>Al utilizar Experto Cerca, usted:</p>
            <ul>
              <li>✓ Confirma haber leído y entendido esta Política</li>
              <li>✓ Consiente el tratamiento de sus datos según lo descrito</li>
              <li>✓ Entiende que puede revocar su consentimiento eliminando su cuenta</li>
              <li>✓ Acepta que cierta información será pública según su configuración</li>
            </ul>
          </Section>
          <div className="mt-12 p-6 bg-blue-50 rounded-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">DECLARACIÓN FINAL</h2>
            <p className="text-gray-900 mb-3">
              AL UTILIZAR EXPERTO CERCA, USTED RECONOCE HABER LEÍDO, ENTENDIDO Y ACEPTADO ESTOS TÉRMINOS Y CONDICIONES EN SU TOTALIDAD.
            </p>
            <p className="text-gray-900 mb-3">
              ENTIENDE Y ACEPTA QUE EXPERTO CERCA ES ÚNICAMENTE UNA PLATAFORMA DE CONEXIÓN Y QUE NO TIENE RESPONSABILIDAD ALGUNA SOBRE LA CALIDAD DE LOS SERVICIOS, PRESUPUESTOS, SEGURIDAD, O CUALQUIER ASPECTO DE LA RELACIÓN ENTRE PROFESIONALES Y CLIENTES.
            </p>
            <p className="text-gray-900 font-semibold">
              USTED ASUME TOTAL RESPONSABILIDAD POR LAS DECISIONES QUE TOME AL CONTRATAR PROFESIONALES A TRAVÉS DE LA PLATAFORMA.
            </p>
          </div>

          <div className="mt-8 text-center text-gray-600">
            <p className="font-medium">Experto Cerca</p>
            <p>Argentina</p>
            <p>Octubre 2025</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="mb-10">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-3 text-gray-700 text-base leading-relaxed">
        {children}
      </div>
    </section>
  );
}
