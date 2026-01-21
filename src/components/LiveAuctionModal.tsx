import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useBids } from "@/hooks/useBids";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Gavel, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  current_bid: number;
  asking_bid: number;
  image: string;
  lot_number: number | null;
  auction_phase: string;
  bid_count: number;
}

interface LiveAuctionModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

const LiveAuctionModal = ({ vehicle, onClose }: LiveAuctionModalProps) => {
  const [bidAmount, setBidAmount] = useState("");
  const [currentPhase, setCurrentPhase] = useState(vehicle.auction_phase);
  const [currentBid, setCurrentBid] = useState(vehicle.current_bid);
  const [bidCount, setBidCount] = useState(vehicle.bid_count);
  const [showBidPrompt, setShowBidPrompt] = useState(false);
  const [promptCountdown, setPromptCountdown] = useState(0);
  const { placeBid, placingBid } = useBids(vehicle.id);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const askingBid = vehicle.asking_bid || 0;
  const minimumBid = Math.max(currentBid + 100, askingBid);

  // Subscribe to vehicle changes
  useEffect(() => {
    const channel = supabase
      .channel(`live-vehicle-${vehicle.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "vehicles",
          filter: `id=eq.${vehicle.id}`,
        },
        (payload: any) => {
          const updated = payload.new;
          setCurrentPhase(updated.auction_phase);
          setCurrentBid(updated.current_bid);
          setBidCount(updated.bid_count);

          // Show bid prompt when phase changes
          if (["going_once", "going_twice", "final_call"].includes(updated.auction_phase)) {
            setShowBidPrompt(true);
            setPromptCountdown(updated.auction_phase === "final_call" ? 5 : 10);
          }

          // Handle sold/unsold
          if (updated.auction_phase === "sold" || updated.auction_phase === "unsold") {
            toast({
              title: updated.auction_phase === "sold" ? "🎉 Vehicle Sold!" : "Auction Ended",
              description: updated.auction_phase === "sold" 
                ? `Winning bid: R${updated.current_bid.toLocaleString()}`
                : "No bids met the asking price",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vehicle.id, toast]);

  // Countdown timer for bid prompt
  useEffect(() => {
    if (promptCountdown > 0) {
      const timer = setTimeout(() => setPromptCountdown(promptCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (promptCountdown === 0 && showBidPrompt) {
      setShowBidPrompt(false);
    }
  }, [promptCountdown, showBidPrompt]);

  const handleBid = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Login Required",
        description: "Please login to place a bid",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(bidAmount) || minimumBid;
    
    if (amount < minimumBid) {
      toast({
        title: "Invalid Bid",
        description: `Minimum bid is R${minimumBid.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    const result = await placeBid(amount, user.id);
    if (result.success) {
      setBidAmount("");
      setShowBidPrompt(false);
    }
  };

  const getPhaseDisplay = () => {
    switch (currentPhase) {
      case "bidding":
        return { label: "Bidding Open", color: "bg-primary" };
      case "going_once":
        return { label: "Going Once!", color: "bg-amber-500 animate-pulse" };
      case "going_twice":
        return { label: "Going Twice!", color: "bg-orange-500 animate-pulse" };
      case "final_call":
        return { label: "FINAL CALL!", color: "bg-destructive animate-pulse" };
      case "sold":
        return { label: "SOLD!", color: "bg-primary" };
      case "unsold":
        return { label: "Unsold", color: "bg-muted" };
      default:
        return { label: currentPhase, color: "bg-muted" };
    }
  };

  const phase = getPhaseDisplay();
  const isBiddingActive = ["bidding", "going_once", "going_twice", "final_call"].includes(currentPhase);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Badge variant="secondary">Lot #{vehicle.lot_number}</Badge>
            {vehicle.year} {vehicle.make} {vehicle.model}
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <img
              src={vehicle.image}
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <Badge className={`${phase.color} text-lg px-4 py-2`}>
                {phase.label}
              </Badge>
            </div>

            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Current Bid</p>
              <p className="text-3xl font-bold text-primary">
                R{currentBid.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">{bidCount} bids</p>
            </div>

            {askingBid > currentBid && (
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Asking bid: R{askingBid.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bid Prompt Overlay */}
      {showBidPrompt && isBiddingActive && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-in fade-in">
            <div className="bg-background p-8 rounded-xl text-center max-w-md mx-4">
              <Gavel className="w-16 h-16 mx-auto mb-4 text-primary animate-bounce" />
              <h2 className="text-2xl font-bold mb-2">{phase.label}</h2>
              <p className="text-muted-foreground mb-4">
                Place your bid now or miss out!
              </p>
              <p className="text-4xl font-bold text-primary mb-4">
                R{currentBid.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Time remaining: {promptCountdown}s
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowBidPrompt(false)}
                  className="flex-1"
                >
                  Pass
                </Button>
                <Button
                  onClick={handleBid}
                  disabled={placingBid}
                  className="flex-1"
                >
                  {placingBid ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    `Bid R${minimumBid.toLocaleString()}`
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Bidding Controls */}
        {isBiddingActive && (
          <div className="border-t pt-4">
            <div className="flex gap-2">
              <Input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={`Min R${minimumBid.toLocaleString()}`}
                min={minimumBid}
                step="100"
                className="flex-1"
              />
              <Button onClick={handleBid} disabled={placingBid} size="lg">
                {placingBid ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Gavel className="w-4 h-4 mr-2" />
                    Place Bid
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Minimum next bid: R{minimumBid.toLocaleString()}
            </p>
          </div>
        )}

        {/* Sold/Unsold State */}
        {currentPhase === "sold" && (
          <div className="border-t pt-4 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto text-primary mb-2" />
            <p className="text-lg font-semibold">Auction Complete</p>
            <p className="text-muted-foreground">
              Sold for R{currentBid.toLocaleString()}
            </p>
          </div>
        )}

        {currentPhase === "unsold" && (
          <div className="border-t pt-4 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-lg font-semibold">No Sale</p>
            <p className="text-muted-foreground">
              Reserve price was not met
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LiveAuctionModal;
