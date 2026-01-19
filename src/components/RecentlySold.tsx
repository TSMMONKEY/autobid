import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AuctionVehicle } from "@/hooks/useRealtimeAuctions";

interface RecentlySoldProps {
  vehicles: AuctionVehicle[];
}

const RecentlySold = ({ vehicles }: RecentlySoldProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (vehicles.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {vehicles.map((vehicle) => (
        <Link
          key={vehicle.id}
          to={`/car/${vehicle.id}`}
          className="flex items-center gap-4 p-3 bg-green-500/10 hover:bg-green-500/20 rounded-lg border border-green-500/30 transition-all group"
        >
          <div className="w-14 h-10 rounded-md overflow-hidden flex-shrink-0">
            <img
              src={vehicle.image}
              alt={`${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground truncate text-sm">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h4>
            <p className="text-xs text-green-500 font-semibold">
              Sold: {formatPrice(vehicle.winning_bid || vehicle.current_bid)}
            </p>
          </div>
          
          <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Sold
          </Badge>
        </Link>
      ))}
    </div>
  );
};

export default RecentlySold;
