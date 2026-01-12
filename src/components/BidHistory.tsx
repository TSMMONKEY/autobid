import { format } from "date-fns";
import { useBids, Bid } from "@/hooks/useBids";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Clock } from "lucide-react";

interface BidHistoryProps {
  vehicleId: string;
}

const BidHistory = ({ vehicleId }: BidHistoryProps) => {
  const { bids, loading } = useBids(vehicleId);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No bids yet. Be the first to bid!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-2">
        {bids.map((bid, index) => (
          <div
            key={bid.id}
            className={`flex items-center justify-between p-3 rounded-lg ${
              index === 0
                ? "bg-primary/10 border border-primary/30"
                : "bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  R{bid.amount.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {format(new Date(bid.created_at), "MMM d, h:mm a")}
                </div>
              </div>
            </div>
            {index === 0 && (
              <span className="text-xs font-medium text-primary bg-primary/20 px-2 py-1 rounded">
                Highest
              </span>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default BidHistory;
