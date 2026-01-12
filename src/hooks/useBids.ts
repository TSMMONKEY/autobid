import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface Bid {
  id: string;
  vehicle_id: string;
  user_id: string;
  amount: number;
  created_at: string;
}

export const useBids = (vehicleId?: string) => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(false);
  const [placingBid, setPlacingBid] = useState(false);
  const { toast } = useToast();

  const fetchBids = useCallback(async () => {
    if (!vehicleId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("bids")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBids(data || []);
    } catch (err) {
      console.error("Error fetching bids:", err);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  // Set up realtime subscription
  useEffect(() => {
    if (!vehicleId) return;

    const channel = supabase
      .channel(`bids-${vehicleId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bids",
          filter: `vehicle_id=eq.${vehicleId}`,
        },
        (payload) => {
          console.log("New bid received:", payload);
          setBids((prev) => [payload.new as Bid, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vehicleId]);

  const placeBid = async (amount: number, userId: string) => {
    if (!vehicleId) return { success: false, error: "No vehicle ID" };
    
    setPlacingBid(true);
    try {
      const { error } = await supabase.from("bids").insert({
        vehicle_id: vehicleId,
        user_id: userId,
        amount: amount,
      });

      if (error) throw error;

      toast({
        title: "Bid Placed!",
        description: `Your bid of R${amount.toLocaleString()} has been placed.`,
      });

      return { success: true };
    } catch (err: any) {
      console.error("Error placing bid:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to place bid",
        variant: "destructive",
      });
      return { success: false, error: err.message };
    } finally {
      setPlacingBid(false);
    }
  };

  return {
    bids,
    loading,
    placingBid,
    placeBid,
    refetch: fetchBids,
    highestBid: bids.length > 0 ? Math.max(...bids.map((b) => b.amount)) : 0,
  };
};
