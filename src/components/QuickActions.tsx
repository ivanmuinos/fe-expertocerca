import { Card, CardContent } from "@/components/ui/card";
import { 
  Zap, 
  Wrench, 
  Hammer, 
  PaintBucket,
  ArrowRight
} from "lucide-react";

const quickServices = [
  { icon: Zap, label: "Electricista", urgent: true },
  { icon: Wrench, label: "Plomero", urgent: true },
  { icon: Hammer, label: "Carpintero", urgent: false },
  { icon: PaintBucket, label: "Pintor", urgent: false },
];

const QuickActions = () => {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-background px-4">
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              ¿Qué necesitas?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Encuentra el profesional perfecto para tu proyecto
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4 md:gap-8 mb-16 sm:mb-20 md:mb-24">
            {quickServices.map((service, index) => (
              <Card 
                key={index}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-border hover:border-primary/40 relative hover:scale-105"
              >
                {service.urgent && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 bg-destructive rounded-full animate-pulse flex items-center justify-center">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                  </div>
                )}
                <CardContent className="p-6 sm:p-8 md:p-10 text-center">
                  <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-primary/10 rounded-2xl mb-4 sm:mb-6 mx-auto group-hover:bg-primary/20 transition-colors shadow-sm">
                    <service.icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-primary" />
                  </div>
                  <div className="text-sm sm:text-base md:text-lg font-semibold text-foreground">
                    {service.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-3 text-muted-foreground text-base sm:text-lg hover:text-foreground transition-colors cursor-pointer group">
              <span className="font-medium">Ver todos los servicios</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickActions;