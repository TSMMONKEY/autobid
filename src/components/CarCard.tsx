import { Link } from "react-router-dom";
import { Clock, MapPin, Gauge } from "lucide-react";
import { Car } from "@/data/cars";
import { Badge } from "@/components/ui/badge";
import CountdownTimer from "./CountdownTimer";

interface CarCardProps {
  car: Car;
}

const CarCard = ({ car }: CarCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat("en-US").format(mileage);
  };

  return (
    <Link to={`/car/${car.id}`} className="group">
      <div className="bg-gradient-card rounded-xl overflow-hidden shadow-card hover-lift border border-border/50">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={car.image}
            alt={`${car.year} ${car.make} ${car.model}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {car.isLive && (
              <Badge className="bg-destructive text-destructive-foreground animate-pulse-gold">
                <span className="w-2 h-2 bg-destructive-foreground rounded-full mr-2" />
                LIVE
              </Badge>
            )}
            {car.isFeatured && (
              <Badge className="bg-primary text-primary-foreground">
                Featured
              </Badge>
            )}
          </div>

          {/* Bid Count */}
          <div className="absolute bottom-4 right-4">
            <span className="text-sm text-foreground/90 bg-background/60 backdrop-blur-sm px-3 py-1 rounded-full">
              {car.bidCount} bids
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title */}
          <h3 className="font-display text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
            {car.year} {car.make} {car.model}
          </h3>

          {/* Details */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Gauge className="w-4 h-4" />
              {formatMileage(car.mileage)} mi
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {car.location}
            </span>
          </div>

          {/* Bid & Timer */}
          <div className="flex items-end justify-between pt-4 border-t border-border">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Bid</p>
              <p className="font-display text-2xl font-bold text-gradient-gold">
                {formatPrice(car.currentBid)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1 justify-end">
                <Clock className="w-4 h-4" />
                Time Left
              </p>
              <CountdownTimer endTime={car.endTime} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CarCard;
