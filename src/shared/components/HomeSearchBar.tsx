"use client";

import { Search } from "lucide-react";
import { Button } from "@/src/shared/components/ui/button";
import { useMobile } from "@/src/shared/components/MobileWrapper";

interface HomeSearchBarProps {
  searchTerm: string;
  onOpen: () => void;
}

export function HomeSearchBar({ searchTerm, onOpen }: HomeSearchBarProps) {
  return (
    <div className='md:hidden px-4 py-3 bg-white'>
      <Button
        variant='ghost'
        onClick={onOpen}
        className='w-full bg-white border border-gray-300 rounded-full px-5 py-3 h-12 flex items-center gap-3 hover:bg-white transition-all focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus:outline-none active:scale-[0.98] active:bg-white'
        style={{
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Search className='h-5 w-5 text-muted-foreground flex-shrink-0' />
        <div className='text-sm truncate'>
          {searchTerm && searchTerm.trim() !== "" ? (
            <span className='font-medium text-foreground'>{searchTerm}</span>
          ) : (
            <span className='font-semibold text-foreground'>
              Empezá tu búsqueda
            </span>
          )}
        </div>
      </Button>
    </div>
  );
}
