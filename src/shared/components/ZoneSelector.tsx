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
    <div className='w-full flex flex-col justify-center px-2 md:px-3 py-1'>
      {/* Título */}
      <div className='text-left mb-0'>
        <h3 className='text-xs font-medium text-foreground'>Lugar</h3>
      </div>

      {/* Selector */}
      <div className='relative mt-2 w-full'>
        {/* Mobile: Button that opens drawer */}
        <div className='md:hidden'>
          <button
            onClick={() => handleOpenChange(true)}
            className='h-11 w-full border border-gray-600 bg-transparent text-sm focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none active:border-gray-600 text-left py-3 px-4 rounded-xl flex items-center gap-2'
          >
            <Search className='h-4 w-4 text-muted-foreground' />
            <span>{getDisplayValue()}</span>
          </button>
        </div>

        {/* Desktop: Original Select */}
        <div className='hidden md:block'>
          <Select
            value={value}
            onValueChange={onValueChange}
            open={isOpen}
            onOpenChange={handleOpenChange}
          >
            <SelectTrigger className='h-11 border border-gray-600 bg-transparent text-sm focus-visible:ring-0 text-left [&>svg]:hidden py-3 px-4 rounded-xl'>
              <SelectValue
                placeholder={
                  <div className='flex items-center gap-2'>
                    <Search className='h-4 w-4 text-muted-foreground' />
                    <span>Explorar destinos</span>
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
              className='max-h-80 overflow-y-auto rounded-xl border border-border/20 shadow-xl bg-background p-2 z-50 w-full data-[state=open]:animate-enter data-[state=closed]:animate-exit'
              align='center'
              side='bottom'
              sideOffset={8}
              position='popper'
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
                      className='p-0 pl-0 pr-0 border-0 focus:bg-transparent data-[highlighted]:bg-muted/50'
                    >
                      <div className='flex items-center w-full p-3 rounded-lg hover:bg-muted/50 cursor-pointer'>
                        <div className='flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mr-3'>
                          <IconComponent className='h-5 w-5 text-primary' />
                        </div>
                        <div className='flex-1 text-left'>
                          <div className='font-medium text-foreground text-sm'>
                            {displayName}
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            {zoneInfo.description}
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
                className='fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => handleOpenChange(false)}
              />

              {/* Drawer */}
              <motion.div
                className='fixed inset-y-0 right-0 z-[60] bg-white w-[85vw] max-w-md flex flex-col shadow-2xl'
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
              >
                {/* Header */}
                <div className='flex items-center justify-between px-4 py-4 border-b border-gray-200'>
                  <h3 className='text-lg font-semibold'>Seleccionar zona</h3>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleOpenChange(false)}
                    className='h-8 w-8 p-0 rounded-full hover:bg-gray-100'
                  >
                    <X className='h-5 w-5' />
                  </Button>
                </div>

                {/* Content */}
                <div className='flex-1 overflow-y-auto p-4'>
                  <div className='space-y-2'>
                    {Object.entries(zoneData).map(([zoneKey, zoneInfo]) => {
                      const displayName =
                        zoneKey === "all" ? "Todas las zonas" : zoneKey;
                      const IconComponent = zoneInfo.icon;

                      return (
                        <button
                          key={zoneKey}
                          onClick={() => handleSelect(zoneKey)}
                          className='flex items-center w-full p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors'
                        >
                          <div className='flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mr-3'>
                            <IconComponent className='h-6 w-6 text-primary' />
                          </div>
                          <div className='flex-1 text-left min-w-0'>
                            <div className='font-medium text-foreground text-base'>
                              {displayName}
                            </div>
                            <div className='text-sm text-muted-foreground line-clamp-1'>
                              {zoneInfo.description}
                            </div>
                          </div>
                          {value === zoneKey && (
                            <div className='flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center ml-2'>
                              <svg className='w-3 h-3 text-white' fill='currentColor' viewBox='0 0 20 20'>
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
