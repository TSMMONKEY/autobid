import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AuctionVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  current_bid: number;
  end_time: string;
  image: string;
  images: string[];
  mileage: number;
  location: string;
  transmission: string;
  bid_count: number;
  is_live: boolean;
  is_featured: boolean;
  condition: string;
  auction_status: string;
  auction_duration_minutes: number | null;
  winner_id: string | null;
  winning_bid: number | null;
}

interface QueueItem {
  id: string;
  vehicle_id: string;
  position: number;
  scheduled_time: string | null;
}

export const useRealtimeAuctions = () => {
  const [liveVehicle, setLiveVehicle] = useState<AuctionVehicle | null>(null);
  const [queuedVehicles, setQueuedVehicles] = useState<AuctionVehicle[]>([]);
  const [recentlySold, setRecentlySold] = useState<AuctionVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAuctionData = useCallback(async () => {
    try {
      // Fetch live vehicle
      const { data: liveData, error: liveError } = await supabase
        .from("vehicles")
        .select("*")
        .eq("is_live", true)
        .eq("auction_status", "live")
        .single();

      if (liveError && liveError.code !== "PGRST116") {
        console.error("Error fetching live vehicle:", liveError);
      }
      setLiveVehicle(liveData || null);

      // Fetch queue
      const { data: queueData, error: queueError } = await supabase
        .from("auction_queue")
        .select("*")
        .order("position", { ascending: true });

      if (queueError) {
        console.error("Error fetching queue:", queueError);
      }

      if (queueData && queueData.length > 0) {
        const vehicleIds = queueData.map((q: QueueItem) => q.vehicle_id);
        const { data: queueVehicles, error: vehiclesError } = await supabase
          .from("vehicles")
          .select("*")
          .in("id", vehicleIds)
          .eq("auction_status", "pending");

        if (vehiclesError) {
          console.error("Error fetching queued vehicles:", vehiclesError);
        }

        // Sort by queue position
        const sortedVehicles = (queueVehicles || []).sort((a, b) => {
          const aPos = queueData.find((q: QueueItem) => q.vehicle_id === a.id)?.position || 0;
          const bPos = queueData.find((q: QueueItem) => q.vehicle_id === b.id)?.position || 0;
          return aPos - bPos;
        });

        setQueuedVehicles(sortedVehicles);
      } else {
        setQueuedVehicles([]);
      }

      // Fetch recently sold (last 5)
      const { data: soldData, error: soldError } = await supabase
        .from("vehicles")
        .select("*")
        .eq("auction_status", "sold")
        .order("updated_at", { ascending: false })
        .limit(5);

      if (soldError) {
        console.error("Error fetching sold vehicles:", soldError);
      }
      setRecentlySold(soldData || []);

      setError(null);
    } catch (err) {
      console.error("Error in fetchAuctionData:", err);
      setError("Failed to load auction data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuctionData();

    // Subscribe to vehicles changes
    const vehicleChannel = supabase
      .channel("realtime-vehicles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vehicles" },
        (payload) => {
          console.log("Vehicle change:", payload);
          fetchAuctionData();
        }
      )
      .subscribe();

    // Subscribe to queue changes
    const queueChannel = supabase
      .channel("realtime-queue")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "auction_queue" },
        (payload) => {
          console.log("Queue change:", payload);
          fetchAuctionData();
        }
      )
      .subscribe();

    // Subscribe to bids for live updates
    const bidsChannel = supabase
      .channel("realtime-bids")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bids" },
        (payload) => {
          console.log("New bid:", payload);
          fetchAuctionData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(vehicleChannel);
      supabase.removeChannel(queueChannel);
      supabase.removeChannel(bidsChannel);
    };
  }, [fetchAuctionData]);

  return {
    liveVehicle,
    queuedVehicles,
    recentlySold,
    loading,
    error,
    refetch: fetchAuctionData,
  };
};
