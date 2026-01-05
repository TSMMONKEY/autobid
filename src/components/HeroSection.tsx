import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1920"
          alt="Luxury car"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm text-primary font-medium">
              Live Auctions Happening Now
            </span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground leading-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Discover <span className="text-gradient-gold">Extraordinary</span> Automobiles
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
            The world's premier online auction platform for luxury, exotic, and collector cars. 
            Bid on exceptional vehicles from the comfort of your home.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Link to="/auctions">
              <Button variant="gold" size="xl" className="group">
                Browse Auctions
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button variant="glass" size="xl" className="group">
                <Play className="w-5 h-5" />
                How It Works
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-border/50 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {[
              { value: "2,500+", label: "Cars Sold" },
              { value: "$850M+", label: "Total Sales" },
              { value: "50K+", label: "Active Bidders" },
            ].map((stat, index) => (
              <div key={index}>
                <p className="font-display text-3xl md:text-4xl font-bold text-gradient-gold">
                  {stat.value}
                </p>
                <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted-foreground/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-primary rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
