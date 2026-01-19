import { Link } from "react-router-dom";
import { Clock, ChevronRight } from "lucide-react";
import type { AuctionVehicle } from "@/hooks/useRealtimeAuctions";

interface AuctionQueueProps {
  vehicles: AuctionVehicle[];
}

const AuctionQueue = ({ vehicles }: AuctionQueueProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-8 bg-card rounded-lg border border-border">
        <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">No vehicles in queue</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {vehicles.map((vehicle, index) => (
        <Link
          key={vehicle.id}
          to={`/car/${vehicle.id}`}
          className="flex items-center gap-4 p-4 bg-card hover:bg-card/80 rounded-lg border border-border transition-all hover:border-primary/50 group"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm">
            {index + 1}
          </div>
          
          <div className="w-16 h-12 rounded-md overflow-hidden flex-shrink-0">
            <img
              src={vehicle.image}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h4>
            <p className="text-sm text-muted-foreground">
              Starting: {formatPrice(vehicle.current_bid)} •{" "}
              {vehicle.auction_duration_minutes || 5} min auction
            </p>
          </div>
          
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </Link>
      ))}
    </div>
  );
};

export default AuctionQueue;
