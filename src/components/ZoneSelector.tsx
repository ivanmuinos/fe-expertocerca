import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, TreePine, Waves, Mountain, Compass, Search } from "lucide-react";
import { useState } from "react";

interface ZoneSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  isOtherSelectorOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

// Iconos y descripciones por zona
const zoneData: Record<string, { icon: any; description: string }> = {
  all: { icon: Compass, description: "Descubrí servicios en todas las zonas" },
  CABA: { icon: Building, description: "Ciudad Autónoma de Buenos Aires" },
  "GBA Norte": { icon: TreePine, description: "San Isidro, Vicente López, Tigre y alrededores" },
  "GBA Sur": { icon: Waves, description: "Quilmes, Avellaneda, Berazategui y zona sur" },
  "GBA Oeste": { icon: Mountain, description: "Morón, La Matanza, zona oeste" },
};

export function ZoneSelector({ value, onValueChange, isOtherSelectorOpen, onOpenChange }: ZoneSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  const getDisplayValue = () => {
    if (value === "all") return "Todas las zonas";
    return value || "Explorar destinos";
  };

  return (
    <div
      className="w-full flex flex-col justify-center px-2 md:px-3 py-1"
    >
      {/* Título */}
      <div className="text-left mb-0">
        <h3 className="text-xs font-medium text-foreground">Lugar</h3>
      </div>

      {/* Selector */}
      <div className="relative mt-2 w-full">
        <Select value={value} onValueChange={onValueChange} open={isOpen} onOpenChange={handleOpenChange}>
          <SelectTrigger className="h-11 border border-gray-600 bg-transparent text-sm focus-visible:ring-0 text-left [&>svg]:hidden py-3 px-4 rounded-xl">
            <SelectValue placeholder={
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span>Explorar destinos</span>
              </div>
            }>
              {value && (
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span>{getDisplayValue()}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent
            className="max-h-80 overflow-y-auto rounded-xl border border-border/20 shadow-xl bg-background p-2 z-50 w-full data-[state=open]:animate-enter data-[state-closed]:animate-exit"
            align="center"
            side="bottom"
            sideOffset={8}
            position="popper"
          >
            <div className="space-y-1">
              {Object.entries(zoneData).map(([zoneKey, zoneInfo]) => {
                const displayName = zoneKey === "all" ? "Todas las zonas" : zoneKey;
                const IconComponent = zoneInfo.icon;

                return (
                  <SelectItem
                    key={zoneKey}
                    value={zoneKey}
                    className="p-0 pl-0 pr-0 border-0 focus:bg-transparent data-[highlighted]:bg-muted/50"
                  >
                    <div className="flex items-center w-full p-3 rounded-lg hover:bg-muted/50 cursor-pointer">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mr-3">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-foreground text-sm">{displayName}</div>
                        <div className="text-xs text-muted-foreground">{zoneInfo.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </div>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
