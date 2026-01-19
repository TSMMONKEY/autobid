import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface WatchlistItem {
  id: string;
  user_id: string;
  vehicle_id: string;
  created_at: string;
}

export const useWatchlist = (userId?: string) => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchWatchlist = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      setWatchlist(data || []);
    } catch (err) {
      console.error("Error fetching watchlist:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const isInWatchlist = useCallback(
    (vehicleId: string) => {
      return watchlist.some((item) => item.vehicle_id === vehicleId);
    },
    [watchlist]
  );

  const addToWatchlist = async (vehicleId: string) => {
    if (!userId) {
      toast({
        title: "Login Required",
        description: "Please login to add vehicles to your watchlist",
        variant: "destructive",
      });
      return { success: false };
    }

    try {
      const { error } = await supabase.from("watchlist").insert({
        user_id: userId,
        vehicle_id: vehicleId,
      });

      if (error) throw error;

      await fetchWatchlist();
      toast({
        title: "Added to Watchlist",
        description: "Vehicle added to your watchlist",
      });
      return { success: true };
    } catch (err: any) {
      console.error("Error adding to watchlist:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to add to watchlist",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  const removeFromWatchlist = async (vehicleId: string) => {
    if (!userId) return { success: false };

    try {
      const { error } = await supabase
        .from("watchlist")
        .delete()
        .eq("user_id", userId)
        .eq("vehicle_id", vehicleId);

      if (error) throw error;

      await fetchWatchlist();
      toast({
        title: "Removed",
        description: "Vehicle removed from your watchlist",
      });
      return { success: true };
    } catch (err: any) {
      console.error("Error removing from watchlist:", err);
      return { success: false };
    }
  };

  const toggleWatchlist = async (vehicleId: string) => {
    if (isInWatchlist(vehicleId)) {
      return removeFromWatchlist(vehicleId);
    } else {
      return addToWatchlist(vehicleId);
    }
  };

  return {
    watchlist,
    loading,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    refetch: fetchWatchlist,
  };
};
