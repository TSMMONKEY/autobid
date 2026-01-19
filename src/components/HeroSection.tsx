import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Car, Search } from "lucide-react";
import { useCars } from "@/hooks/useCars";

const HeroSection = () => {
  const { cars } = useCars();
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-secondary/50 to-background">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1920"
          alt="Car auction"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/60" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-8 animate-fade-in">
            <Car className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">
              {cars.length}+ Cars & 60+ Taxis Available in Joburg
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Buy Cars at <span className="text-primary">Auction</span> in Johannesburg
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Find affordable Toyota, VW, Ford, Nissan and more. Running vehicles, crashed cars, 
            and minibus taxis available. Bid from Sandton, Soweto, Randburg and beyond.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Link to="/auctions">
              <Button variant="green" size="lg" className="group">
                <Search className="w-5 h-5" />
                Browse All Cars
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/taxis">
              <Button variant="green-outline" size="lg" className="group">
                <Car className="w-5 h-5" />
                View Taxis
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-14 pt-8 border-t border-border animate-fade-in" style={{ animationDelay: "0.4s" }}>
            {[
              { value: `${cars.length}+`, label: "Cars Available" },
              { value: "60+", label: "Taxis For Sale" },
              { value: "JHB", label: "Based" },
            ].map((stat, index) => (
              <div key={index}>
                <p className="font-display text-2xl md:text-3xl font-bold text-primary">
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