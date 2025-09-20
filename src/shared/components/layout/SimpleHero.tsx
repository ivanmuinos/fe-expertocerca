"use client";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Search, MapPin, Wrench, Users, Star, TrendingUp } from "lucide-react";
import { useNavigate } from "@/src/shared/lib/navigation";
import { useState } from "react";
import { Card, CardContent } from "@/src/shared/components/ui/card";
import heroImage from "@/assets/hero-trades.jpg";
import Image from 'next/image';

export function SimpleHero() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    navigate(`/buscar?q=${encodeURIComponent(searchTerm)}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const stats = [
    { icon: Users, value: "1,000+", label: "Profesionales" },
    { icon: Star, value: "4.8/5", label: "Calificación" },
    { icon: TrendingUp, value: "95%", label: "Satisfacción" },
  ];

  const categories = [
    "Electricista", "Plomero", "Carpintero", "Pintor", 
    "Albañil", "Jardinero", "Mecánico", "Técnico AC"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative flex-1 flex items-center justify-center bg-gradient-hero text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage.src}
            alt="Profesionales trabajando"
            fill
            className="w-full h-full object-cover opacity-20"
            priority={true}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary-dark/90" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            {/* Main Title */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Encuentra tu
                <span className="block text-accent-light">Experto Cerca</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
                Conecta con profesionales calificados en tu área. 
                Desde electricistas hasta carpinteros, encuentra el experto que necesitas.
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-2">
                <div className="flex-1 flex items-center gap-2 bg-white rounded-lg px-3 py-2.5 sm:py-2">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  <Input
                    placeholder="¿Qué servicio necesitas?"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="border-0 p-0 text-sm sm:text-base bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground"
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  size="lg"
                  className="bg-accent hover:bg-accent-light text-accent-foreground font-semibold px-6 sm:px-8 py-2.5 sm:py-2 text-sm sm:text-base whitespace-nowrap"
                >
                  Buscar
                </Button>
              </div>
            </div>

            {/* Popular Categories */}
            <div className="space-y-3 sm:space-y-4">
              <p className="text-sm sm:text-base text-white/80 font-medium">Servicios populares:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.slice(0, 6).map((category) => (
                  <Button
                    key={category}
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/buscar?q=${encodeURIComponent(category)}`)}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 text-xs sm:text-sm backdrop-blur-sm"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-md sm:max-w-lg mx-auto pt-4 sm:pt-8">
              {stats.map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center space-y-1 sm:space-y-2">
                  <Icon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto text-accent-light" />
                  <div className="text-lg sm:text-2xl font-bold">{value}</div>
                  <div className="text-xs sm:text-sm text-white/80">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to action for professionals */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/publicar')}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 backdrop-blur-sm text-xs sm:text-sm"
          >
            <Wrench className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            ¿Eres profesional? Únete aquí
          </Button>
        </div>
      </section>
    </div>
  );
}

export default SimpleHero;