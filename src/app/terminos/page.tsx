"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/src/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/shared/components/ui/avatar";
import { LoginModal } from "@/src/shared/components/LoginModal";
import { useAuthState } from "@/src/features/auth";
import { useState } from "react";
import { FileText } from "lucide-react";
import { Footer } from "@/src/shared/components/Footer";

export default function TerminosPage() {
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
            <FileText className="w-12 h-12 md:w-16 md:h-16 mb-4 text-blue-600" />
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Términos y Condiciones de Uso
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
          <Section title="1. ACEPTACIÓN DE LOS TÉRMINOS">
            <p>
              Bienvenido a Experto Cerca. Al acceder y utilizar esta plataforma, usted acepta estar sujeto a los presentes Términos y Condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
            </p>
            <p>
              Experto Cerca es una plataforma digital que conecta a profesionales de diversos oficios (plomería, electricidad, carpintería, enseñanza de instrumentos musicales, entre otros) con usuarios que requieren dichos servicios.
            </p>
          </Section>

          <Section title="2. NATURALEZA DE LA PLATAFORMA">
            <p className="font-semibold">
              2.1. Experto Cerca actúa exclusivamente como INTERMEDIARIO entre usuarios que buscan servicios y profesionales que los ofrecen.
            </p>
            <p className="font-semibold">
              2.2. NO SOMOS proveedores de los servicios publicados en la plataforma.
            </p>
            <p className="font-semibold">2.3. NO verificamos, certificamos ni garantizamos:</p>
            <ul>
              <li>La identidad de los usuarios</li>
              <li>Las habilidades, experiencia o capacitación de los profesionales</li>
              <li>La calidad de los servicios prestados</li>
              <li>La veracidad de la información publicada en los perfiles</li>
              <li>Los precios o presupuestos acordados entre las partes</li>
            </ul>
            <p>
              2.4. La relación contractual por la prestación de servicios se establece directamente entre el profesional y el cliente, sin participación de Experto Cerca.
            </p>
          </Section>

          <Section title="3. USO GRATUITO DE LA PLATAFORMA">
            <p className="font-semibold">3.1. Actualmente, Experto Cerca es 100% GRATUITO. No cobramos comisiones por:</p>
            <ul>
              <li>Publicar servicios</li>
              <li>Publicar solicitudes de trabajo</li>
              <li>Contactar profesionales</li>
              <li>Ninguna otra funcionalidad de la plataforma</li>
            </ul>
            <p>
              3.2. Nos reservamos el derecho de implementar tarifas, comisiones o planes premium en el futuro, notificando a los usuarios con anticipación razonable.
            </p>
            <p>
              3.3. Podemos ofrecer servicios de publicidad externa con nuestra marca en el futuro.
            </p>
          </Section>

          <Section title="4. REGISTRO Y CUENTA DE USUARIO">
            <p className="font-semibold">4.1. Para utilizar Experto Cerca debe:</p>
            <ul>
              <li>Ser mayor de 18 años</li>
              <li>Proporcionar información veraz y actualizada</li>
              <li>Mantener la confidencialidad de su cuenta y contraseña</li>
              <li>Notificar inmediatamente cualquier uso no autorizado</li>
            </ul>
            <p className="font-semibold">4.2. Nos reservamos el derecho de suspender o eliminar cuentas que:</p>
            <ul>
              <li>Violen estos Términos y Condiciones</li>
              <li>Proporcionen información falsa</li>
              <li>Realicen actividades fraudulentas o ilegales</li>
            </ul>
          </Section>

          <Section title="5. PUBLICACIONES Y CONTENIDO">
            <p className="font-semibold">5.1. PUBLICACIONES DE PROFESIONALES:</p>
            <p>Los profesionales pueden publicar sus servicios, incluyendo:</p>
            <ul>
              <li>Descripción del servicio</li>
              <li>Imágenes de trabajos realizados</li>
              <li>Zona de cobertura</li>
              <li>Información de contacto</li>
            </ul>
            <p className="font-semibold">5.2. PUBLICACIONES DE CLIENTES:</p>
            <p>Los usuarios pueden publicar solicitudes de servicios describiendo su necesidad.</p>
            <p className="font-semibold">5.3. MODERACIÓN DE CONTENIDO:</p>
            <ul>
              <li>Utilizamos sistemas automáticos de detección de contenido inapropiado</li>
              <li>Detectamos y bloqueamos imágenes con contenido sexual, drogas, armas y otros contenidos prohibidos</li>
              <li>Nos reservamos el derecho de eliminar cualquier publicación que viole estos términos</li>
              <li>La moderación automática no garantiza la detección del 100% del contenido inapropiado</li>
            </ul>
            <p className="font-semibold">5.4. CONTENIDO PROHIBIDO:</p>
            <p>Queda estrictamente prohibido publicar:</p>
            <ul>
              <li>Contenido sexual, pornográfico o de desnudez</li>
              <li>Imágenes de drogas, armas o actividades ilegales</li>
              <li>Contenido violento, discriminatorio u ofensivo</li>
              <li>Información falsa o engañosa</li>
              <li>Contenido que infrinja derechos de terceros</li>
              <li>Spam o publicidad no autorizada</li>
            </ul>
          </Section>

          <Section title="6. LIMITACIÓN DE RESPONSABILIDAD">
            <p className="font-bold text-lg">IMPORTANTE: EXPERTO CERCA NO SE HACE RESPONSABLE POR:</p>
            
            <p className="font-semibold">6.1. CALIDAD Y PRESTACIÓN DEL SERVICIO:</p>
            <ul>
              <li>La calidad, profesionalismo o resultado del trabajo realizado</li>
              <li>Daños materiales causados durante la prestación del servicio</li>
              <li>Trabajos incompletos, defectuosos o mal realizados</li>
              <li>Incumplimiento de plazos acordados entre las partes</li>
            </ul>

            <p className="font-semibold">6.2. ACUERDOS ECONÓMICOS:</p>
            <ul>
              <li>Los precios, presupuestos o formas de pago acordados</li>
              <li>Disputas por cobros o pagos entre usuarios y profesionales</li>
              <li>Estafas o fraudes relacionados con transacciones económicas</li>
            </ul>

            <p className="font-semibold">6.3. SEGURIDAD Y ACCIDENTES:</p>
            <ul>
              <li>Accidentes, lesiones o daños ocurridos durante la prestación del servicio</li>
              <li>Robos, hurtos o pérdidas de bienes</li>
              <li>Problemas de seguridad en el domicilio del cliente</li>
            </ul>

            <p className="font-semibold">6.4. VERACIDAD DE LA INFORMACIÓN:</p>
            <ul>
              <li>La autenticidad de los perfiles, credenciales o experiencia declarada</li>
              <li>Identidades falsas o suplantación</li>
              <li>Información engañosa en las publicaciones</li>
            </ul>

            <p className="font-semibold">6.5. COMUNICACIONES Y CONTACTO:</p>
            <ul>
              <li>Lo que sucede después de que el usuario se contacte con un profesional</li>
              <li>Negociaciones, acuerdos o conflictos entre las partes</li>
              <li>Comunicaciones privadas entre usuarios</li>
            </ul>

            <p className="font-semibold">6.6. CONTENIDO GENERADO POR USUARIOS:</p>
            <ul>
              <li>Opiniones, comentarios o reseñas publicadas por usuarios</li>
              <li>Exactitud de las descripciones de servicios</li>
              <li>Imágenes o material subido por los usuarios</li>
            </ul>
          </Section>

          <Section title="7. OBLIGACIONES DE LOS USUARIOS">
            <p className="font-semibold">7.1. TODOS LOS USUARIOS deben:</p>
            <ul>
              <li>Proporcionar información veraz y actualizada</li>
              <li>Utilizar la plataforma de manera legal y ética</li>
              <li>Respetar los derechos de otros usuarios</li>
              <li>No utilizar la plataforma para actividades ilegales</li>
              <li>Reportar contenido inapropiado o perfiles sospechosos</li>
            </ul>

            <p className="font-semibold">7.2. LOS PROFESIONALES deben:</p>
            <ul>
              <li>Contar con las habilitaciones legales necesarias para ejercer su oficio (cuando corresponda)</li>
              <li>Cumplir con las normativas locales aplicables a su actividad</li>
              <li>Proporcionar servicios de manera profesional y responsable</li>
              <li>Ser honestos respecto a sus capacidades y experiencia</li>
            </ul>

            <p className="font-semibold">7.3. LOS CLIENTES deben:</p>
            <ul>
              <li>Proporcionar información clara sobre el servicio requerido</li>
              <li>Acordar precios y condiciones directamente con el profesional</li>
              <li>Respetar los acuerdos establecidos</li>
            </ul>
          </Section>

          <Section title="8. PROPIEDAD INTELECTUAL">
            <p>
              8.1. El contenido de la plataforma Experto Cerca (diseño, código, marca, logotipos) es propiedad exclusiva de Experto Cerca.
            </p>
            <p>
              8.2. Los usuarios conservan los derechos sobre el contenido que publican (imágenes, textos, etc.).
            </p>
            <p>
              8.3. Al publicar contenido, los usuarios otorgan a Experto Cerca una licencia no exclusiva para mostrar dicho contenido en la plataforma.
            </p>
          </Section>

          <Section title="9. PRIVACIDAD Y PROTECCIÓN DE DATOS">
            <p>
              9.1. El tratamiento de datos personales se rige por nuestra Política de Privacidad y la Ley N° 25.326 de Protección de Datos Personales de Argentina.
            </p>
            <p className="font-semibold">9.2. Recopilamos y utilizamos datos personales únicamente para:</p>
            <ul>
              <li>Facilitar el funcionamiento de la plataforma</li>
              <li>Mejorar nuestros servicios</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
            <p>
              9.3. NO compartimos datos personales con terceros sin consentimiento, excepto cuando sea requerido por ley.
            </p>
            <p>
              9.4. Los usuarios son responsables de la información que comparten directamente con otros usuarios.
            </p>
          </Section>

          <Section title="10. NOTIFICACIONES Y SISTEMA DE ALERTAS">
            <p>
              10.1. Los profesionales registrados pueden recibir notificaciones cuando se publiquen solicitudes de servicios relacionados con su oficio.
            </p>
            <p>
              10.2. Los usuarios pueden configurar sus preferencias de notificaciones.
            </p>
            <p>
              10.3. No garantizamos la entrega del 100% de las notificaciones debido a factores técnicos o de conectividad.
            </p>
          </Section>

          <Section title="11. SUSPENSIÓN Y TERMINACIÓN">
            <p className="font-semibold">11.1. Podemos suspender o eliminar cuentas sin previo aviso si:</p>
            <ul>
              <li>Se violan estos Términos y Condiciones</li>
              <li>Se detecta actividad fraudulenta o ilegal</li>
              <li>Se reciben múltiples reportes de conducta inapropiada</li>
              <li>Se publica contenido prohibido repetidamente</li>
            </ul>
            <p>
              11.2. Los usuarios pueden eliminar su cuenta en cualquier momento.
            </p>
            <p>
              11.3. La eliminación de la cuenta no afecta obligaciones o responsabilidades previas.
            </p>
          </Section>

          <Section title="12. MODIFICACIONES A LOS TÉRMINOS">
            <p>
              12.1. Experto Cerca se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento.
            </p>
            <p>
              12.2. Los cambios significativos serán notificados a los usuarios con al menos 15 días de anticipación.
            </p>
            <p>
              12.3. El uso continuado de la plataforma después de las modificaciones constituye aceptación de los nuevos términos.
            </p>
          </Section>

          <Section title="13. RESOLUCIÓN DE CONFLICTOS">
            <p>
              13.1. Cualquier disputa relacionada con estos términos se resolverá mediante negociación de buena fe.
            </p>
            <p>
              13.2. Si la negociación no prospera, las partes se someten a la jurisdicción de los Tribunales Ordinarios de la República Argentina.
            </p>
            <p>
              13.3. Experto Cerca NO media ni arbitra disputas entre usuarios y profesionales.
            </p>
          </Section>

          <Section title="14. LEY APLICABLE Y JURISDICCIÓN">
            <p>
              14.1. Estos Términos y Condiciones se rigen por las leyes de la República Argentina.
            </p>
            <p>
              14.2. Para cualquier controversia legal, las partes se someten a la jurisdicción de los tribunales competentes de Argentina.
            </p>
          </Section>

          <Section title="15. EXENCIÓN DE GARANTÍAS">
            <p className="font-semibold">
              LA PLATAFORMA SE PROPORCIONA &quot;TAL CUAL&quot; Y &quot;SEGÚN DISPONIBILIDAD&quot;.
            </p>
            <p className="font-semibold">NO GARANTIZAMOS:</p>
            <ul>
              <li>El funcionamiento ininterrumpido de la plataforma</li>
              <li>La ausencia de errores técnicos</li>
              <li>La disponibilidad permanente del servicio</li>
              <li>Resultados específicos del uso de la plataforma</li>
            </ul>
          </Section>

          <Section title="16. INDEMNIZACIÓN">
            <p>
              El usuario acepta indemnizar y mantener indemne a Experto Cerca, sus directores, empleados y representantes de cualquier reclamo, daño, pérdida o gasto (incluyendo honorarios legales) que surja de:
            </p>
            <ul>
              <li>Su uso de la plataforma</li>
              <li>Violación de estos Términos y Condiciones</li>
              <li>Violación de derechos de terceros</li>
              <li>Su conducta en relación con otros usuarios</li>
            </ul>
          </Section>

          <Section title="17. CONTACTO">
            <p>
              Para consultas, reportes o soporte relacionado con estos Términos y Condiciones, puede contactarnos a través de:
            </p>
            <p className="font-medium">
              📧 Email: <a href="mailto:soporte@expertocerca.com" className="text-blue-600 hover:underline">soporte@expertocerca.com</a>
            </p>
          </Section>

          <Section title="18. DISPOSICIONES GENERALES">
            <p>
              18.1. Si alguna disposición de estos términos es declarada inválida, las demás disposiciones mantendrán su validez.
            </p>
            <p>
              18.2. La falta de ejercicio de algún derecho no constituye renuncia al mismo.
            </p>
            <p>
              18.3. Estos Términos y Condiciones constituyen el acuerdo completo entre el usuario y Experto Cerca.
            </p>
          </Section>

          {/* Final Declaration */}
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
