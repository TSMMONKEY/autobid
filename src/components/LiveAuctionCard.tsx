import { Link } from "react-router-dom";
import { Clock, Users, Gavel, Radio, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CountdownTimer from "./CountdownTimer";
import LiveBidForm from "./LiveBidForm";
import BidHistory from "./BidHistory";
import { useAuctionTimer } from "@/hooks/useAuctionTimer";
import type { AuctionVehicle } from "@/hooks/useRealtimeAuctions";

interface LiveAuctionCardProps {
  vehicle: AuctionVehicle;
  onAuctionEnd?: () => void;
}

const LiveAuctionCard = ({ vehicle, onAuctionEnd }: LiveAuctionCardProps) => {
  const endTime = new Date(vehicle.end_time);

  useAuctionTimer({
    vehicleId: vehicle.id,
    endTime,
    isLive: vehicle.is_live,
    onAuctionEnd,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-gradient-card rounded-2xl overflow-hidden border-2 border-destructive/50 shadow-2xl">
      {/* Live Header */}
      <div className="bg-destructive/20 border-b border-destructive/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radio className="w-6 h-6 text-destructive animate-pulse" />
            <span className="text-lg font-bold text-destructive uppercase tracking-wider">
              Live Auction
            </span>
          </div>
          <Badge className="bg-destructive text-destructive-foreground text-lg px-4 py-1">
            <Clock className="w-4 h-4 mr-2" />
            <CountdownTimer endTime={endTime} />
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 p-6">
        {/* Image */}
        <Link to={`/car/${vehicle.id}`} className="block">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
            <img
              src={vehicle.image}
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          </div>
        </Link>

        {/* Info & Bid */}
        <div className="flex flex-col">
          <Link to={`/car/${vehicle.id}`}>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2 hover:text-primary transition-colors">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h2>
          </Link>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span>{vehicle.location}</span>
            <span>•</span>
            <span>{vehicle.mileage.toLocaleString()} km</span>
            <span>•</span>
            <span className="capitalize">{vehicle.condition}</span>
          </div>

          {/* Bid Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-secondary/50 rounded-lg p-4 text-center">
              <Gavel className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold text-gradient-gold">
                {formatPrice(vehicle.current_bid)}
              </p>
              <p className="text-xs text-muted-foreground">Current Bid</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4 text-center">
              <Users className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold">{vehicle.bid_count}</p>
              <p className="text-xs text-muted-foreground">Total Bids</p>
            </div>
          </div>

          {/* Countdown Large */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-2">Time Remaining</p>
            <CountdownTimer endTime={endTime} variant="large" />
          </div>

          {/* Bid Form */}
          <div className="mt-auto">
            <LiveBidForm
              vehicleId={vehicle.id}
              currentBid={vehicle.current_bid}
              isLive={vehicle.is_live}
            />
          </div>
        </div>

        {/* Bid History Panel */}
        <div className="bg-secondary/30 rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
            <History className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Live Bid Activity</h3>
          </div>
          <BidHistory vehicleId={vehicle.id} />
        </div>
      </div>
    </div>
  );
};

export default LiveAuctionCard;
