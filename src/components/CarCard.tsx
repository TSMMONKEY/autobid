import { Link } from "react-router-dom";
import { Clock, MapPin, Gauge, AlertTriangle } from "lucide-react";
import { Car } from "@/data/cars";
import { Badge } from "@/components/ui/badge";
import CountdownTimer from "./CountdownTimer";

interface CarCardProps {
  car: Car;
}

const CarCard = ({ car }: CarCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat("en-ZA").format(mileage);
  };

  const getConditionColor = (condition: Car["condition"]) => {
    switch (condition) {
      case "excellent":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "good":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "fair":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "crashed":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "salvage":
        return "bg-red-500/20 text-red-400 border-red-500/30";
    }
  };

  const isCrashed = car.condition === "crashed" || car.condition === "salvage";

  return (
    <Link to={`/car/${car.id}`} className="group">
      <div className="bg-gradient-card rounded-lg overflow-hidden shadow-card hover-lift border border-border/50 h-full">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={car.image}
            alt={`${car.year} ${car.make} ${car.model}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {car.isLive && (
              <Badge className="bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5">
                LIVE
              </Badge>
            )}
            {isCrashed && (
              <Badge className="bg-orange-500/90 text-white text-[10px] px-1.5 py-0.5">
                <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                {car.condition.toUpperCase()}
              </Badge>
            )}
          </div>

          {/* Bid Count */}
          <div className="absolute bottom-2 right-2">
            <span className="text-[10px] text-foreground/90 bg-background/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
              {car.bidCount} bids
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Title */}
          <h3 className="font-display text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {car.year} {car.make} {car.model}
          </h3>

          {/* Condition Badge */}
          <div className="mb-2">
            <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full border capitalize ${getConditionColor(car.condition)}`}>
              {car.condition}
            </span>
          </div>

          {/* Details */}
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2">
            <span className="flex items-center gap-0.5">
              <Gauge className="w-3 h-3" />
              {formatMileage(car.mileage)} km
            </span>
            <span className="flex items-center gap-0.5 truncate">
              <MapPin className="w-3 h-3" />
              {car.location.split(",")[0]}
            </span>
          </div>

          {/* Bid & Timer */}
          <div className="flex items-end justify-between pt-2 border-t border-border">
            <div>
              <p className="text-[10px] text-muted-foreground">Current Bid</p>
              <p className="font-display text-sm font-bold text-gradient-gold">
                {formatPrice(car.currentBid)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 justify-end">
                <Clock className="w-3 h-3" />
                Ends
              </p>
              <div className="text-[10px]">
                <CountdownTimer endTime={car.endTime} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CarCard;
