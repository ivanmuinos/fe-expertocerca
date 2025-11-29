import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select";
import {
  Building,
  TreePine,
  Waves,
  Mountain,
  Compass,
  Search,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/src/shared/components/ui/button";

interface ZoneSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  isOtherSelectorOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  disableMobileDrawer?: boolean;
}

// Iconos y descripciones por zona - usando nombres exactos de la BD
const zoneData: Record<string, { icon: any; description: string }> = {
  all: { icon: Compass, description: "Descubrí servicios en todas las zonas" },
  "Ciudad Autónoma de Buenos Aires": {
    icon: Building,
    description: "Ciudad Autónoma de Buenos Aires (CABA)",
  },
  "GBA Norte": {
    icon: TreePine,
    description: "San Isidro, Vicente López, Tigre y alrededores",
  },
  "GBA Sur": {
    icon: Waves,
    description: "Quilmes, Avellaneda, Berazategui y zona sur",
  },
  "GBA Oeste": { icon: Mountain, description: "Morón, La Matanza, zona oeste" },
  "La Plata y alrededores": { icon: Building, description: "La Plata y zona de influencia" },
  "Córdoba": { icon: Building, description: "Córdoba Capital" },
  "Rosario": { icon: Building, description: "Rosario, Santa Fe" },
  "Mendoza": { icon: Mountain, description: "Mendoza Capital" },
};

export function ZoneSelector({
  value,
  onValueChange,
  isOtherSelectorOpen,
  onOpenChange,
  disableMobileDrawer = false,
}: ZoneSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);

    // Block body scroll on mobile when drawer opens
    if (isMobile) {
      if (open) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }
  };

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    handleOpenChange(false);
  };

  const getDisplayValue = () => {
    if (value === "all") return "Todas las zonas";
    return value || "Explorar destinos";
  };

  return (
    <div className='w-full flex flex-col justify-center'>
      {/* Título */}
      <div className='text-left mb-2'>
        <h3 className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>Lugar</h3>
      </div>

      {/* Selector */}
      <div className='relative w-full'>
        {/* Mobile: Button that opens drawer */}
        <div className='md:hidden'>
          <button
            onClick={() => handleOpenChange(true)}
            className='flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <div className="flex items-center gap-2 truncate">
              <Search className='h-4 w-4 text-muted-foreground flex-shrink-0' />
              <span className={!value ? "text-muted-foreground" : ""}>{getDisplayValue()}</span>
            </div>
          </button>
        </div>

        {/* Desktop: Original Select */}
        <div className='hidden md:block'>
          <Select
            value={value}
            onValueChange={onValueChange}
          >
            <SelectTrigger className='flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>svg]:hidden'>
              <SelectValue
                placeholder={
                  <div className='flex items-center gap-2'>
                    <Search className='h-4 w-4 text-muted-foreground' />
                    <span className="text-muted-foreground">Explorar destinos</span>
                  </div>
                }
              >
                {value && (
                  <div className='flex items-center gap-2'>
                    <Search className='h-4 w-4 text-muted-foreground' />
                    <span>{getDisplayValue()}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent
              className='max-h-80 overflow-y-auto rounded-md border border-border shadow-md bg-background p-1 z-50 w-full'
              align='start'
              side='bottom'
              sideOffset={4}
            >
              <div className='space-y-1'>
                {Object.entries(zoneData).map(([zoneKey, zoneInfo]) => {
                  const displayName =
                    zoneKey === "all" ? "Todas las zonas" : zoneKey;
                  const IconComponent = zoneInfo.icon;

                  return (
                    <SelectItem
                      key={zoneKey}
                      value={zoneKey}
                      className='cursor-pointer rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
                    >
                      <div className='flex items-center w-full'>
                        <div className='flex-shrink-0 mr-2'>
                          <IconComponent className='h-4 w-4 text-muted-foreground' />
                        </div>
                        <div className='flex-1 text-left'>
                          <div className='font-medium text-foreground'>
                            {displayName}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </div>
            </SelectContent>
          </Select>
        </div>

        {/* Mobile: Bottom Drawer */}
        <AnimatePresence>
          {isOpen && isMobile && !disableMobileDrawer && (
            <>
              {/* Backdrop */}
              <motion.div
                className='fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => handleOpenChange(false)}
              />

              {/* Drawer - Bottom Sheet */}
              <motion.div
                className='fixed inset-x-0 bottom-0 z-[60] bg-background flex flex-col shadow-lg rounded-t-[10px] border-t'
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                style={{ maxHeight: '85vh' }}
              >
                {/* Handle bar for visual cue */}
                <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />

                {/* Header */}
                <div className='flex items-center justify-between px-4 py-2'>
                  <h3 className='text-lg font-semibold'>Seleccionar zona</h3>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleOpenChange(false)}
                    className='h-8 w-8 p-0 rounded-full hover:bg-muted'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>

                {/* Content */}
                <div className='flex-1 overflow-y-auto p-4 pb-8'>
                  <div className='space-y-2'>
                    {Object.entries(zoneData).map(([zoneKey, zoneInfo]) => {
                      const displayName =
                        zoneKey === "all" ? "Todas las zonas" : zoneKey;
                      const IconComponent = zoneInfo.icon;

                      return (
                        <button
                          key={zoneKey}
                          onClick={() => handleSelect(zoneKey)}
                          className='flex items-center w-full p-3 rounded-lg hover:bg-muted active:bg-muted transition-colors border border-transparent hover:border-border'
                        >
                          <div className='flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center mr-3'>
                            <IconComponent className='h-5 w-5 text-foreground' />
                          </div>
                          <div className='flex-1 text-left min-w-0'>
                            <div className='font-medium text-foreground text-sm'>
                              {displayName}
                            </div>
                            <div className='text-xs text-muted-foreground line-clamp-1'>
                              {zoneInfo.description}
                            </div>
                          </div>
                          {value === zoneKey && (
                            <div className='flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center ml-2'>
                              <svg className='w-3 h-3 text-primary-foreground' fill='currentColor' viewBox='0 0 20 20'>
                                <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
                              </svg>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
