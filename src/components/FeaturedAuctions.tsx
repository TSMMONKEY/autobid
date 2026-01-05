import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import CarCard from "./CarCard";
import { getFeaturedCars } from "@/data/cars";

const FeaturedAuctions = () => {
  const featuredCars = getFeaturedCars().slice(0, 6);

  return (
    <section className="py-24 bg-gradient-dark">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Featured Listings
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mt-2">
              Premium <span className="text-gradient-gold">Auctions</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl">
              Hand-picked selection of the most exceptional vehicles currently up for auction.
            </p>
          </div>
          <Link to="/auctions">
            <Button variant="gold-outline" className="group">
              View All Auctions
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCars.map((car, index) => (
            <div
              key={car.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CarCard car={car} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedAuctions;
