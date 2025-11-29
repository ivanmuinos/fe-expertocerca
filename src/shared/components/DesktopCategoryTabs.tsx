"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/src/shared/lib/utils";
import { Users, FileText } from "lucide-react";

type Category = "expertos" | "ofertas";

interface DesktopCategoryTabsProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
}

export function DesktopCategoryTabs({ selectedCategory, onCategoryChange }: DesktopCategoryTabsProps) {
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const categories = [
    {
      id: "expertos" as Category,
      label: "Expertos",
      icon: Users,
    },
    {
      id: "ofertas" as Category,
      label: "Ofertas",
      icon: FileText,
    },
  ];

  useEffect(() => {
    const selectedButton = buttonRefs.current[selectedCategory];
    const container = containerRef.current;
    
    if (selectedButton && container) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = selectedButton.getBoundingClientRect();
      
      setUnderlineStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  }, [selectedCategory]);

  return (
    <div ref={containerRef} className="relative flex gap-8">
      {categories.map((category) => {
        const Icon = category.icon;
        const isSelected = selectedCategory === category.id;
        
        return (
          <button
            key={category.id}
            ref={(el) => { buttonRefs.current[category.id] = el; }}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              "flex items-center gap-3 py-4 px-2 transition-all duration-200",
              isSelected
                ? "text-white"
                : "text-white/70 hover:text-white/90"
            )}
          >
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg transition-all",
              isSelected ? "bg-white/10" : "bg-transparent"
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-base font-medium whitespace-nowrap">
              {category.label}
            </span>
          </button>
        );
      })}
      
      {/* Animated underline */}
      <div
        className="absolute bottom-0 h-0.5 bg-white transition-all duration-300 ease-out"
        style={{
          left: `${underlineStyle.left}px`,
          width: `${underlineStyle.width}px`,
        }}
      />
    </div>
  );
}
