"use client";

import { useState } from "react";
import { Search, Home, Users, Shield, HelpCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthState } from "@/src/features/auth";
import { Button } from "@/src/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/shared/components/ui/avatar";
import { LoginModal } from "@/src/shared/components/LoginModal";
import { Footer } from "@/src/shared/components/Footer";

type TabType = "general" | "buscar" | "ofrecer" | "seguridad";

interface HelpTopic {
  title: string;
  content: string;
}

interface HelpSection {
  icon: React.ReactNode;
  title: string;
  topics: HelpTopic[];
}

export default function AyudaPage() {
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuthState();

  const helpSections: Record<TabType, HelpSection> = {
    general: {
      icon: <Home className="w-6 h-6" />,
      title: "Información General",
      topics: [
        {
          title: "¿Qué es ExpertoCerca?",
          content: "ExpertoCerca es una plataforma digital que conecta a personas que ofrecen servicios con quienes los necesitan, de forma rápida, directa y sin intermediarios. Desde trabajos en el hogar (pintura, gas, electricidad, limpieza) hasta servicios profesionales, técnicos o creativos, todo se encuentra en un solo lugar. Nuestro objetivo es acercar a las personas: vos elegís con quién trabajar, cuándo y cómo. ExpertoCerca no cobra comisiones, no gestiona los pagos ni interviene en los acuerdos entre las partes."
        },
        {
          title: "Cómo funciona ExpertoCerca",
          content: "1. Buscá el servicio que necesitás en el buscador o en las categorías disponibles.\n2. Elegí al experto que más confianza te genere: verás su perfil, zona y contacto.\n3. Contactalo directamente por WhatsApp para coordinar precio, horario y condiciones."
        },
        {
          title: "Qué hace (y qué no hace) ExpertoCerca",
          content: "ExpertoCerca facilita el contacto, pero no forma parte del acuerdo ni garantiza los resultados del servicio.\n\n• No prestamos los servicios ofrecidos.\n• No participamos en la negociación, contratación ni ejecución de los trabajos.\n• No gestionamos pagos ni cobros entre usuarios.\n• No verificamos la experiencia profesional ni los resultados del servicio.\n\nToda interacción, contratación o acuerdo se realiza de manera directa entre los usuarios (quien busca y quien ofrece). El uso de la app implica aceptar que cada usuario es responsable de sus acciones, decisiones y resultados."
        }
      ]
    },
    buscar: {
      icon: <Search className="w-6 h-6" />,
      title: "Para quienes buscan servicios",
      topics: [
        {
          title: "¿Cómo busco un servicio?",
          content: "Podés buscar servicios de dos formas:\n\n1. Usando el buscador principal en la página de inicio\n2. Navegando por las categorías disponibles\n\nUna vez que encuentres lo que buscás, verás una lista de expertos con sus perfiles, zonas de trabajo y formas de contacto."
        },
        {
          title: "¿No encontrás lo que buscás?",
          content: "Si no encontraste el servicio que necesitás, podés publicar un pedido explicando qué tipo de trabajo necesitás. Los expertos que estén registrados en esa categoría podrán ver tu pedido y comunicarse con vos directamente."
        },
        {
          title: "¿Cómo contacto a un experto?",
          content: "Una vez que elegiste al experto que más confianza te genera, podés contactarlo directamente por WhatsApp. Ahí podrán coordinar precio, horario y todas las condiciones del servicio."
        }
      ]
    },
    ofrecer: {
      icon: <Users className="w-6 h-6" />,
      title: "Para quienes ofrecen servicios",
      topics: [
        {
          title: "¿Cómo me registro como experto?",
          content: "Para ofrecer tus servicios en ExpertoCerca:\n\n1. Creá tu perfil con tu nombre, descripción, categoría y zona de trabajo\n2. Agregá información relevante sobre tu experiencia y servicios\n3. Mantené tu perfil actualizado y respondé las consultas que recibas\n\nRecordá que no cobramos comisiones ni intermediamos en tus trabajos."
        },
        {
          title: "¿Cómo me contactan los clientes?",
          content: "Los clientes te contactarán directamente por WhatsApp. Es importante que:\n\n• Mantengas tu número de WhatsApp actualizado\n• Respondas las consultas de forma rápida y profesional\n• Seas claro con tus precios y disponibilidad\n• Cumplas con los acuerdos que generes"
        },
        {
          title: "¿Cómo recibo los pagos?",
          content: "ExpertoCerca no gestiona pagos. Vos acordás directamente con el cliente la forma de pago que prefieran (efectivo, transferencia, etc.). La plataforma solo facilita el contacto inicial."
        }
      ]
    },
    seguridad: {
      icon: <Shield className="w-6 h-6" />,
      title: "Seguridad y Responsabilidad",
      topics: [
        {
          title: "⚠️ Limitación de responsabilidad",
          content: "ExpertoCerca no asume responsabilidad por:\n\n• Daños, pérdidas o incumplimientos que surjan entre usuarios\n• Pagos, fraudes o disputas económicas entre partes\n• Información falsa o inexacta publicada por los usuarios\n• Resultados, calidad o cumplimiento de los servicios acordados fuera de la app\n\nAl usar ExpertoCerca, el usuario acepta que la plataforma actúa únicamente como medio de conexión y no como intermediario, empleador, contratista o garante."
        },
        {
          title: "🧩 Buenas prácticas",
          content: "Para una mejor experiencia en la plataforma:\n\n• Mantené tu perfil actualizado y claro\n• Respondé con respeto y compromiso\n• Cumplí los acuerdos que generes con otros usuarios\n• Reportá cualquier irregularidad o usuario sospechoso\n• Contribuí a una comunidad segura, transparente y colaborativa"
        },
        {
          title: "¿Cómo reporto un problema?",
          content: "Si encontrás algún usuario sospechoso o tenés algún problema, podés reportarlo desde la opción 'Ayuda' dentro de la app o escribirnos directamente a soporte@expertocerca.com"
        }
      ]
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "general", label: "General", icon: <Home className="w-4 h-4" /> },
    { id: "buscar", label: "Buscar servicios", icon: <Search className="w-4 h-4" /> },
    { id: "ofrecer", label: "Ofrecer servicios", icon: <Users className="w-4 h-4" /> },
    { id: "seguridad", label: "Seguridad", icon: <Shield className="w-4 h-4" /> }
  ];

  const currentSection = helpSections[activeTab];

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
                  {/* Botón "Convertite en experto" */}
                  <Button
                    onClick={() => setIsLoginModalOpen(true)}
                    variant="ghost"
                    className="hidden sm:flex text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full px-4 py-2 h-10 transition-all duration-200"
                  >
                    Convertite en experto
                  </Button>

                  {/* Botón "Iniciar sesión" */}
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
        <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
          <div className="text-center mb-8">
            <HelpCircle className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-blue-600" />
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Centro de Ayuda
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Encontrá respuestas a tus preguntas sobre ExpertoCerca
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 md:px-6 py-3 text-sm md:text-base font-medium whitespace-nowrap
                  rounded-full transition-colors
                  ${activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                  }
                `}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            {currentSection.icon}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {currentSection.title}
            </h2>
          </div>
        </div>

        {/* Topics */}
        <div className="space-y-8">
          {currentSection.topics.map((topic, index) => (
            <div key={index} className="bg-white">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                {topic.title}
              </h3>
              <div className="text-gray-700 whitespace-pre-line leading-relaxed text-base">
                {topic.content}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 bg-white">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
            📩 ¿Necesitás más ayuda?
          </h3>
          <p className="text-gray-700 mb-4 text-base leading-relaxed">
            Si no encontraste la respuesta que buscabas, nuestro equipo está para ayudarte.
          </p>
          <div className="space-y-2">
            <p className="text-gray-900 text-base">
              📧 Email: <a href="mailto:soporte@expertocerca.com" className="text-blue-600 hover:underline font-medium">soporte@expertocerca.com</a>
            </p>
            <p className="text-gray-700 text-base">
              📱 O desde la opción "Ayuda" dentro de la app
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-12 bg-white">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
            🧠 En resumen
          </h3>
          <ul className="space-y-3 text-gray-700 text-base">
            <li className="flex items-start gap-3">
              <span className="text-blue-600 mt-1">•</span>
              <span>Buscá o publicá lo que necesitás</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 mt-1">•</span>
              <span>Contactá directamente por WhatsApp</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 mt-1">•</span>
              <span>Acordá los detalles y condiciones con la otra parte</span>
            </li>
          </ul>
          <p className="mt-6 text-gray-900 font-medium text-base">
            Recordá: ExpertoCerca conecta personas, vos decidís con quién trabajar.
          </p>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
