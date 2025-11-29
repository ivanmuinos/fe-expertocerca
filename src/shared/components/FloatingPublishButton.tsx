"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "@/src/shared/lib/navigation";
import { useAuthState } from "@/src/features/auth";
import { usePathname } from "next/navigation";

export function FloatingPublishButton() {
  const navigate = useNavigate();
  const { user } = useAuthState();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  // Show button only on home page and when scrolled down a bit
  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 200px and only on home page
      if (pathname === "/" && window.scrollY > 200) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const handleClick = () => {
    if (!user) {
      window.dispatchEvent(new CustomEvent("openLoginModal"));
    } else {
      navigate("/requests/new");
    }
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={handleClick}
      className="hidden lg:flex fixed bottom-8 right-8 z-50 flex-col items-center gap-2 group"
      style={{
        animation: "fadeInUp 0.3s ease-out",
      }}
    >
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-primary blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />

        {/* Main button */}
        <div className="relative w-16 h-16 rounded-full bg-primary hover:bg-primary-dark text-white flex items-center justify-center transition-all duration-300 shadow-2xl hover:shadow-primary/50 hover:scale-110">
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
      </div>

      <span className="text-xs font-bold text-gray-900 bg-white px-3 py-1 rounded-full shadow-md group-hover:bg-primary group-hover:text-white transition-all">
        Publicar
      </span>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </button>
  );
}
