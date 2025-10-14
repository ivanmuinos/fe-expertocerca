"use client";

import Image from "next/image";
import { useNavigate } from "@/src/shared/lib/navigation";

export function HomeMiniNavbar() {
  const navigate = useNavigate();

  return (
    <div className='md:hidden sticky top-0 z-50 bg-primary px-4 py-3 flex items-center justify-center'>
      <Image
        src='/logo-bco-experto-cerca.svg'
        alt='Experto Cerca'
        width={120}
        height={40}
        className='h-6 w-auto cursor-pointer'
        onClick={() => navigate("/")}
        priority
      />
    </div>
  );
}
