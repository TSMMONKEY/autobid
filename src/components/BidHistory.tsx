import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Gavel, User } from "lucide-react";
import { format } from "date-fns";

interface BidWithUser {
  id: string;
  amount: number;
  created_at: string;
  user_id: string;
  profile: {
    full_name: string | null;
    email: string | null;
  } | null;
}

interface BidHistoryProps {
  vehicleId: string;
}

const BidHistory = ({ vehicleId }: BidHistoryProps) => {
  const [bids, setBids] = useState<BidWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBids = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("bids")
        .select(`
          id,
          amount,
          created_at,
          user_id
        `)
        .eq("vehicle_id", vehicleId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Fetch profiles for these bids
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map((b) => b.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, email")
          .in("user_id", userIds);

        const profileMap = new Map(
          profiles?.map((p) => [p.user_id, p]) || []
        );

        const bidsWithProfiles = data.map((bid) => ({
          ...bid,
          profile: profileMap.get(bid.user_id) || null,
        }));

        setBids(bidsWithProfiles);
      } else {
        setBids([]);
      }
    } catch (err) {
      console.error("Error fetching bids:", err);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  // Real-time subscription for new bids
  useEffect(() => {
    const channel = supabase
      .channel(`bid-history-${vehicleId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bids",
          filter: `vehicle_id=eq.${vehicleId}`,
        },
        async (payload) => {
          console.log("New bid received:", payload);
          const newBid = payload.new as any;

          // Fetch the profile for the new bidder
          const { data: profile } = await supabase
            .from("profiles")
            .select("user_id, full_name, email")
            .eq("user_id", newBid.user_id)
            .single();

          const bidWithProfile: BidWithUser = {
            id: newBid.id,
            amount: newBid.amount,
            created_at: newBid.created_at,
            user_id: newBid.user_id,
            profile: profile || null,
          };

          setBids((prev) => [bidWithProfile, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vehicleId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getDisplayName = (bid: BidWithUser) => {
    if (bid.profile?.full_name) {
      // Show first name and first letter of last name for privacy
      const parts = bid.profile.full_name.split(" ");
      if (parts.length > 1) {
        return `${parts[0]} ${parts[parts.length - 1][0]}.`;
      }
      return parts[0];
    }
    if (bid.profile?.email) {
      // Show masked email
      const [localPart] = bid.profile.email.split("@");
      return `${localPart.slice(0, 3)}***`;
    }
    return "Anonymous";
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Gavel className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No bids yet. Be the first to bid!</p>
      </div>
    );
  }

  const highestBid = Math.max(...bids.map((b) => b.amount));

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-2">
        {bids.map((bid, index) => (
          <div
            key={bid.id}
            className={`flex items-center justify-between p-3 rounded-lg transition-all ${
              bid.amount === highestBid
                ? "bg-primary/20 border border-primary/30"
                : "bg-secondary/30 hover:bg-secondary/50"
            } ${index === 0 ? "animate-pulse-once" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  bid.amount === highestBid
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">
                  {getDisplayName(bid)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(bid.created_at), "HH:mm:ss")}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`font-bold ${
                  bid.amount === highestBid
                    ? "text-primary text-lg"
                    : "text-foreground"
                }`}
              >
                {formatPrice(bid.amount)}
              </p>
              {bid.amount === highestBid && (
                <span className="text-xs text-primary font-medium">
                  Highest Bid
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default BidHistory;
