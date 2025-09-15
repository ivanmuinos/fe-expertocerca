import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState } from "react";

interface ServiceSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  popularServices: { name: string; icon: any; description?: string }[];
  isOtherSelectorOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

// Descripciones por servicio (fallback si no vienen en props)
const serviceDescriptions: Record<string, string> = {
  Electricista: "Instalaciones y reparaciones eléctricas",
  Plomero: "Instalaciones y reparaciones de plomería",
  Pintor: "Pintura interior y exterior",
  Carpintero: "Muebles y estructuras de madera",
  Albañil: "Construcción y reformas",
  Gasista: "Instalaciones y reparaciones de gas",
  Cerrajero: "Cerraduras y seguridad",
  Jardinero: "Mantenimiento de jardines",
  Limpieza: "Servicios de limpieza",
  Techista: "Reparación y construcción de techos",
  Herrero: "Trabajos en metal y soldadura",
  Vidriero: "Instalación y reparación de vidrios",
};

export function ServiceSelector({ value, onValueChange, popularServices, isOtherSelectorOpen, onOpenChange }: ServiceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  return (
    <div
      className="w-full flex flex-col justify-center px-2 md:px-3 py-1"
    >
      {/* Título */}
      <div className="text-left mb-0">
        <h3 className="text-xs font-medium text-foreground">Servicio</h3>
      </div>

      {/* Selector */}
      <div className="relative mt-2 w-full">
        <Select value={value} onValueChange={onValueChange} open={isOpen} onOpenChange={handleOpenChange}>
          <SelectTrigger className="h-11 w-full border border-gray-600 bg-transparent text-sm focus-visible:ring-0 text-left justify-start [&>svg]:hidden py-3 px-4 rounded-xl">
            <SelectValue placeholder={
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span>Elegí el servicio que necesitas</span>
              </div>
            }>
              {value && (
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span>{value === "all" ? "Todas las profesiones" : value}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent
            className="max-h-80 overflow-y-auto rounded-xl border border-border/20 shadow-xl bg-background p-2 z-50 w-full data-[state=open]:animate-enter data-[state=closed]:animate-exit"
            align="center"
            side="bottom"
            sideOffset={8}
            position="popper"
          >
            <div className="space-y-1">
              <SelectItem value="all" className="p-0 pl-0 pr-0 border-0 focus:bg-transparent data-[highlighted]:bg-muted/50">
                <div className="flex items-center w-full p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mr-3">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-foreground text-sm">Todas las profesiones</div>
                    <div className="text-xs text-muted-foreground">Ver todos los servicios disponibles</div>
                  </div>
                </div>
              </SelectItem>

              {popularServices
                .filter((service) => service?.name && service.name.trim().length > 0)
                .map((service) => (
                  <SelectItem
                    key={service.name}
                    value={service.name}
                    className="p-0 pl-0 pr-0 border-0 focus:bg-transparent data-[highlighted]:bg-muted/50"
                  >
                    <div className="flex items-center w-full p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mr-3">
                        <service.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-foreground text-sm">{service.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {serviceDescriptions[service.name] || "Servicios profesionales especializados"}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
            </div>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
