"use client";

import { useState, useEffect } from "react";
import { LoginModal } from "@/src/shared/components/LoginModal";

export function GlobalLoginModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpenLoginModal = () => {
      setIsOpen(true);
    };

    window.addEventListener("openLoginModal", handleOpenLoginModal);
    return () => {
      window.removeEventListener("openLoginModal", handleOpenLoginModal);
    };
  }, []);

  return (
    <LoginModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    />
  );
}
