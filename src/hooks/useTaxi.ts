import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Taxi {
  id: string;
  make: string;
  model: string;
  year: number;
  currentBid: number;
  askingBid: number;
  endTime: Date;
  image: string;
  images: string[];
  mileage: number;
  location: string;
  transmission: string;
  engine: string;
  exterior: string;
  interior: string;
  vin: string;
  description: string;
  bidCount: number;
  isLive: boolean;
  isFeatured: boolean;
  condition: string;
  seatingCapacity: number;
  operatingLicense: boolean;
  auctionEventId: string | null;
  lotNumber: number | null;
}

export const useTaxi = (id: string) => {
  const [taxi, setTaxi] = useState<Taxi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTaxi = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("vehicles")
          .select("*")
          .eq("id", id)
          .eq("vehicle_type", "taxi")
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setTaxi({
            id: data.id,
            make: data.make,
            model: data.model,
            year: data.year,
            currentBid: data.current_bid,
            askingBid: data.asking_bid || 0,
            endTime: new Date(data.end_time),
            image: data.image,
            images: data.images || [data.image],
            mileage: data.mileage,
            location: data.location || "South Africa",
            transmission: data.transmission,
            engine: data.engine || "Unknown",
            exterior: data.exterior || "Unknown",
            interior: data.interior || "Standard",
            vin: data.vin || "",
            description: data.description || `${data.year} ${data.make} ${data.model}`,
            bidCount: data.bid_count,
            isLive: data.is_live,
            isFeatured: data.is_featured,
            condition: data.condition || "fair",
            // Default taxi-specific fields - these could be added to the vehicles table later
            seatingCapacity: 15,
            operatingLicense: true,
            auctionEventId: data.auction_event_id,
            lotNumber: data.lot_number,
          });
        } else {
          setTaxi(null);
        }
        setError(null);
      } catch (err: any) {
        console.error("Error fetching taxi:", err);
        setError(err.message);
        setTaxi(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTaxi();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`taxi-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "vehicles",
          filter: `id=eq.${id}`,
        },
        () => fetchTaxi()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  return { taxi, loading, error };
};
