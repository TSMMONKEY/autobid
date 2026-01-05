import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1920"
          alt="Car auction"
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
              320+ Cars Available Now in Johannesburg
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Joburg's Premier <span className="text-gradient-gold">Car Auction</span> Platform
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Find affordable Toyota, VW, Ford, Nissan and more. Running vehicles and salvage deals 
            available. Bid from Sandton, Soweto, Randburg and beyond.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Link to="/auctions">
              <Button variant="gold" size="xl" className="group">
                Browse All Cars
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
          <div className="grid grid-cols-3 gap-8 mt-14 pt-8 border-t border-border/50 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {[
              { value: "320+", label: "Cars Available" },
              { value: "16", label: "Pages of Listings" },
              { value: "JHB", label: "Based" },
            ].map((stat, index) => (
              <div key={index}>
                <p className="font-display text-2xl md:text-3xl font-bold text-gradient-gold">
                  {stat.value}
                </p>
                <p className="text-muted-foreground text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
