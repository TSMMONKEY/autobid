import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import CarCard from "./CarCard";
import { cars } from "@/data/cars";

const FeaturedAuctions = () => {
  // Get a mix of crashed and good condition cars
  const featuredCars = cars.slice(0, 10);

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="inline-block bg-primary/10 text-primary font-semibold text-sm uppercase tracking-wider px-4 py-2 rounded-full">
              Latest Listings
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-4">
              Featured <span className="text-primary">Auctions</span>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl">
              Browse our latest vehicles from Johannesburg. Running cars and salvage deals available.
            </p>
          </div>
          <Link to="/auctions">
            <Button variant="green-outline" className="group">
              View All {cars.length} Cars
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Grid - 5 columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {featuredCars.map((car, index) => (
            <div
              key={car.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
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