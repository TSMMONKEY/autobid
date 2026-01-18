import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseAuctionTimerOptions {
  vehicleId: string;
  endTime: Date;
  isLive: boolean;
  onAuctionEnd?: () => void;
}

export const useAuctionTimer = ({
  vehicleId,
  endTime,
  isLive,
  onAuctionEnd,
}: UseAuctionTimerOptions) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasEndedRef = useRef(false);

  const endAuction = useCallback(async () => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;

    try {
      console.log(`Ending auction for vehicle ${vehicleId}`);
      
      const { error } = await supabase.rpc("end_auction", {
        vehicle_uuid: vehicleId,
      });

      if (error) {
        console.error("Error ending auction:", error);
        hasEndedRef.current = false;
        return;
      }

      // Remove from queue
      await supabase
        .from("auction_queue")
        .delete()
        .eq("vehicle_id", vehicleId);

      console.log(`Auction ended for vehicle ${vehicleId}`);
      onAuctionEnd?.();
    } catch (error) {
      console.error("Error in endAuction:", error);
      hasEndedRef.current = false;
    }
  }, [vehicleId, onAuctionEnd]);

  useEffect(() => {
    if (!isLive || !vehicleId) {
      hasEndedRef.current = false;
      return;
    }

    const checkAndEndAuction = () => {
      const now = new Date();
      const timeRemaining = endTime.getTime() - now.getTime();

      if (timeRemaining <= 0) {
        endAuction();
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
    };

    // Check immediately
    checkAndEndAuction();

    // Then check every second
    timerRef.current = setInterval(checkAndEndAuction, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [vehicleId, endTime, isLive, endAuction]);

  return { endAuction };
};
