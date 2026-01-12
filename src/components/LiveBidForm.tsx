import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBids } from "@/hooks/useBids";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Lock } from "lucide-react";

interface LiveBidFormProps {
  vehicleId: string;
  currentBid: number;
  isLive: boolean;
}

const LiveBidForm = ({ vehicleId, currentBid, isLive }: LiveBidFormProps) => {
  const [bidAmount, setBidAmount] = useState("");
  const [bidError, setBidError] = useState("");
  const { placeBid, placingBid } = useBids(vehicleId);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const minimumBid = currentBid + 100;

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setBidError("");

    if (!isAuthenticated || !user) {
      navigate("/auth");
      return;
    }

    if (!bidAmount) {
      setBidError("Please enter a bid amount");
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setBidError("Please enter a valid bid amount");
      return;
    }

    if (amount < minimumBid) {
      setBidError(`Minimum bid is R${minimumBid.toLocaleString()}`);
      return;
    }

    const result = await placeBid(amount, user.id);
    if (result.success) {
      setBidAmount("");
    } else {
      setBidError(result.error || "Failed to place bid");
    }
  };

  if (!isLive) {
    return (
      <div className="text-center py-4 bg-muted rounded-lg">
        <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">This auction has ended</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground text-center">
          Login to place a bid
        </p>
        <Button className="w-full" onClick={() => navigate("/auth")}>
          Login to Bid
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleBid} className="space-y-3">
      <div>
        <label
          htmlFor="bidAmount"
          className="block text-sm font-medium mb-1 text-foreground"
        >
          Your Bid (ZAR)
        </label>
        <Input
          id="bidAmount"
          type="number"
          min={minimumBid}
          step="100"
          value={bidAmount}
          onChange={(e) => {
            setBidAmount(e.target.value);
            setBidError("");
          }}
          placeholder={`Minimum R${minimumBid.toLocaleString()}`}
          disabled={placingBid}
          className="text-lg font-semibold"
        />
      </div>
      {bidError && <p className="text-sm text-destructive">{bidError}</p>}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={placingBid}
      >
        {placingBid ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Placing Bid...
          </>
        ) : (
          `Place Bid`
        )}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Current bid: R{currentBid.toLocaleString()} • Minimum next bid: R
        {minimumBid.toLocaleString()}
      </p>
    </form>
  );
};

export default LiveBidForm;
