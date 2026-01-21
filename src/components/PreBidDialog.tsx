import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePreBids } from "@/hooks/usePreBids";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Gavel } from "lucide-react";

interface PreBidDialogProps {
  vehicleId: string;
  vehicleName: string;
  askingBid: number;
}

const PreBidDialog = ({ vehicleId, vehicleName, askingBid }: PreBidDialogProps) => {
  const [open, setOpen] = useState(false);
  const [maxBid, setMaxBid] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { preBid, loading, fetchUserPreBid, placePreBid, cancelPreBid } = usePreBids(vehicleId);
  const { user } = useAuth();

  useEffect(() => {
    if (open && user) {
      fetchUserPreBid(user.id);
    }
  }, [open, user, fetchUserPreBid]);

  useEffect(() => {
    if (preBid) {
      setMaxBid(preBid.max_bid.toString());
    }
  }, [preBid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    const amount = parseFloat(maxBid);
    
    if (isNaN(amount) || amount < askingBid) {
      setSubmitting(false);
      return;
    }

    const result = await placePreBid(amount, user.id);
    setSubmitting(false);

    if (result.success) {
      setOpen(false);
    }
  };

  const handleCancel = async () => {
    setSubmitting(true);
    await cancelPreBid();
    setSubmitting(false);
    setMaxBid("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1">
          <Gavel className="w-4 h-4 mr-2" />
          {preBid ? "Update Pre-Bid" : "Pre-Bid"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Place a Pre-Bid</DialogTitle>
          <DialogDescription>
            Set your maximum bid for {vehicleName}. Our system will automatically bid on your behalf up to this amount during the live auction.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="maxBid">Maximum Bid (ZAR)</Label>
              <Input
                id="maxBid"
                type="number"
                value={maxBid}
                onChange={(e) => setMaxBid(e.target.value)}
                placeholder={`Minimum R${askingBid.toLocaleString()}`}
                min={askingBid}
                step="100"
                required
                className="text-lg"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Asking bid: R{askingBid.toLocaleString()}
              </p>
            </div>

            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-medium mb-1">How Pre-Bidding Works:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Your maximum bid is kept confidential</li>
                <li>During the auction, we'll bid incrementally for you</li>
                <li>You'll only pay the minimum amount needed to win</li>
                <li>You'll be notified if you win or are outbid</li>
              </ul>
            </div>

            <div className="flex gap-2">
              {preBid && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={submitting}
                  className="flex-1"
                >
                  Cancel Pre-Bid
                </Button>
              )}
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : preBid ? (
                  "Update Pre-Bid"
                ) : (
                  "Place Pre-Bid"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PreBidDialog;
