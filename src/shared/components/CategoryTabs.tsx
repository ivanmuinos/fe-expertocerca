"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/src/shared/lib/utils";
import { Users, FileText } from "lucide-react";

type Category = "expertos" | "ofertas";

interface CategoryTabsProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
}

export function CategoryTabs({ selectedCategory, onCategoryChange }: CategoryTabsProps) {
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const [isScrolled, setIsScrolled] = useState(false);
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
  }, [selectedCategory, isScrolled]);

  useEffect(() => {
    const handleScroll = () => {
      // Hide icons after scrolling past 150px
      setIsScrolled(window.scrollY > 150);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={cn(
      "w-full bg-white border-b border-gray-200 transition-all duration-200",
      "sticky top-[119px] z-40 md:hidden"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={containerRef} className={cn(
          "relative flex gap-6 md:gap-8 justify-center md:justify-start transition-all duration-200",
          isScrolled ? "py-2" : "py-0"
        )}>
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                ref={(el) => { buttonRefs.current[category.id] = el; }}
                onClick={() => onCategoryChange(category.id)}
                className={cn(
                  "transition-all duration-200",
                  // When scrolled: horizontal layout with no icons (mobile)
                  // When not scrolled: vertical layout with icons (mobile)
                  // Desktop: always horizontal with icons
                  isScrolled
                    ? "flex flex-row items-center gap-0 py-2 px-3 md:gap-3 md:py-4 md:px-2"
                    : "flex flex-col items-center gap-2 py-3 px-2 md:flex-row md:gap-3 md:py-4",
                  isSelected
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {/* Icon - hide on mobile when scrolled, always show on desktop */}
                {!isScrolled && (
                  <div className={cn(
                    "flex items-center justify-center rounded-lg transition-all duration-200",
                    "w-12 h-12 md:w-10 md:h-10",
                    isSelected ? "bg-gray-100" : "bg-transparent"
                  )}>
                    <Icon className="h-6 w-6 md:h-5 md:w-5" />
                  </div>
                )}

                {/* Always show icon on desktop */}
                {isScrolled && (
                  <div className={cn(
                    "hidden md:flex items-center justify-center rounded-lg transition-all duration-200",
                    "md:w-10 md:h-10",
                    isSelected ? "bg-gray-100" : "bg-transparent"
                  )}>
                    <Icon className="md:h-5 md:w-5" />
                  </div>
                )}

                <span className={cn(
                  "font-medium whitespace-nowrap transition-all duration-200",
                  "text-sm md:text-base"
                )}>
                  {category.label}
                </span>
              </button>
            );
          })}

          {/* Animated underline */}
          <div
            className="absolute bottom-0 h-0.5 bg-gray-900 transition-all duration-300 ease-out"
            style={{
              left: `${underlineStyle.left}px`,
              width: `${underlineStyle.width}px`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
