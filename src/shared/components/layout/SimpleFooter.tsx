const SimpleFooter = () => {
  return (
    <footer className="py-12 sm:py-16 md:py-20 bg-background border-t border-border px-4">
      <div className="container mx-auto">
        <div className="text-center space-y-6 sm:space-y-8">
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            oficios<span className="text-primary">.</span>
          </div>
          <div className="text-base sm:text-lg text-muted-foreground font-medium">
            © 2024 Conectando oficios con personas
          </div>
          <div className="text-sm sm:text-base text-muted-foreground/70">
            Hecho con ❤️ en Argentina
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SimpleFooter;