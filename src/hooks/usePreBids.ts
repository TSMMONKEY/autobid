import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface PreBid {
  id: string;
  vehicle_id: string;
  user_id: string;
  max_bid: number;
  created_at: string;
  updated_at: string;
}

export const usePreBids = (vehicleId?: string) => {
  const [preBid, setPreBid] = useState<PreBid | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchUserPreBid = useCallback(async (userId: string) => {
    if (!vehicleId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("pre_bids")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      setPreBid(data);
    } catch (err) {
      console.error("Error fetching pre-bid:", err);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  const placePreBid = async (maxBid: number, userId: string) => {
    if (!vehicleId) return { success: false, error: "No vehicle ID" };

    try {
      const { data, error } = await supabase
        .from("pre_bids")
        .upsert({
          vehicle_id: vehicleId,
          user_id: userId,
          max_bid: maxBid,
        }, {
          onConflict: "vehicle_id,user_id"
        })
        .select()
        .single();

      if (error) throw error;

      setPreBid(data);
      toast({
        title: "Pre-Bid Placed!",
        description: `Your maximum bid of R${maxBid.toLocaleString()} has been registered.`,
      });

      return { success: true };
    } catch (err: any) {
      console.error("Error placing pre-bid:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to place pre-bid",
        variant: "destructive",
      });
      return { success: false, error: err.message };
    }
  };

  const cancelPreBid = async () => {
    if (!preBid) return;

    try {
      const { error } = await supabase
        .from("pre_bids")
        .delete()
        .eq("id", preBid.id);

      if (error) throw error;

      setPreBid(null);
      toast({
        title: "Pre-Bid Cancelled",
        description: "Your pre-bid has been removed.",
      });
    } catch (err: any) {
      console.error("Error cancelling pre-bid:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to cancel pre-bid",
        variant: "destructive",
      });
    }
  };

  return {
    preBid,
    loading,
    fetchUserPreBid,
    placePreBid,
    cancelPreBid,
  };
};
