import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Car } from "@/services/carsApi";

interface CarRow {
  id: string;
  make: string;
  model: string;
  year: number;
  current_bid: number;
  end_time: string;
  image: string;
  images: string[];
  mileage: number;
  location?: string | null;
  transmission: string;
  engine: string;
  exterior: string;
  interior: string;
  vin: string;
  description: string;
  bid_count: number;
  is_live: boolean;
  is_featured: boolean;
  condition: string;
  has_key?: boolean;
  engine_starts?: boolean;
  primary_damage?: string;
  created_at?: string;
  updated_at?: string;
  lot_number?: number | null;
  asking_bid?: number | null;
  auction_event_id?: string | null;
  auction_phase?: string | null;
  [key: string]: any;
}

export interface ExtendedCar extends Car {
  lotNumber?: number | null;
  askingBid?: number | null;
  auctionEventId?: string | null;
  auctionPhase?: string | null;
  auctionEvent?: {
    id: string;
    title: string;
    auction_date: string;
    status: string;
  } | null;
}

const transformCarRow = (row: CarRow, auctionEvent?: any): ExtendedCar => ({
  id: row.id,
  make: row.make,
  model: row.model,
  year: row.year,
  currentBid: row.current_bid,
  endTime: new Date(row.end_time),
  image: row.image,
  images: row.images || [row.image],
  mileage: row.mileage,
  location: row.location || 'Location not specified',
  transmission: row.transmission,
  engine: row.engine,
  exterior: row.exterior,
  interior: row.interior,
  vin: row.vin,
  description: row.description || `${row.year} ${row.make} ${row.model}`,
  bidCount: row.bid_count,
  isLive: row.is_live,
  isFeatured: row.is_featured,
  condition: (row.condition as Car['condition']) || 'good',
  hasKey: row.has_key ?? true,
  engineStarts: row.engine_starts ?? true,
  primaryDamage: row.primary_damage ?? 'None',
  lotNumber: row.lot_number,
  askingBid: row.asking_bid,
  auctionEventId: row.auction_event_id,
  auctionPhase: row.auction_phase,
  auctionEvent: auctionEvent || null,
  ...(row.created_at && { createdAt: new Date(row.created_at) }),
  ...(row.updated_at && { updatedAt: new Date(row.updated_at) }),
});

export const useRealtimeVehicle = (vehicleId?: string) => {
  const [vehicle, setVehicle] = useState<ExtendedCar | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicle = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch vehicle with auction event data
      const { data, error: fetchError } = await supabase
        .from("vehicles")
        .select("*, auction_events(*)")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error('Error fetching vehicle:', fetchError);
        throw fetchError;
      }

      if (!data) {
        console.log('Vehicle not found with ID:', id);
        throw new Error("Vehicle not found");
      }

      console.log('Fetched vehicle data:', data);
      const auctionEvent = data.auction_events;
      setVehicle(transformCarRow(data as unknown as CarRow, auctionEvent));
    } catch (err) {
      console.error("Error in fetchVehicle:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load vehicle data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!vehicleId) {
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchVehicle(vehicleId);

    // Set up real-time subscription
    const subscription = supabase
      .channel(`vehicle:${vehicleId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "vehicles",
          filter: `id=eq.${vehicleId}`,
        },
        (payload) => {
          console.log('Received real-time update:', payload);
          // Re-fetch to get updated auction event data
          fetchVehicle(vehicleId);
        }
      )
      .subscribe(
        (status) => {
          console.log('Subscription status:', status);
          if (status === 'CHANNEL_ERROR') {
            console.error('Error with real-time subscription');
          }
        }
      );

    return () => {
      console.log('Unsubscribing from real-time updates');
      subscription.unsubscribe();
    };
  }, [vehicleId, fetchVehicle]);

  return {
    car: vehicle,
    loading,
    error,
    refetch: () => vehicleId ? fetchVehicle(vehicleId) : Promise.resolve(),
  };
};
