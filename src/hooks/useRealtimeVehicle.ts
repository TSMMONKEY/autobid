import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Car } from "@/services/carsApi";

interface VehicleRow {
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
  engine: string | null;
  exterior: string | null;
  interior: string | null;
  vin: string | null;
  description: string | null;
  bid_count: number;
  is_live: boolean;
  is_featured: boolean;
  condition: string | null;
}

const transformVehicleRow = (row: VehicleRow): Car => {
  return {
    id: row.id,
    make: row.make,
    model: row.model,
    year: row.year,
    currentBid: row.current_bid,
    endTime: new Date(row.end_time),
    image: row.image,
    images: row.images || [row.image],
    mileage: row.mileage,
    location: row.location,
    transmission: row.transmission,
    engine: row.engine || "N/A",
    exterior: row.exterior || "N/A",
    interior: row.interior || "Standard",
    vin: row.vin || "N/A",
    description: row.description || `${row.year} ${row.make} ${row.model}`,
    bidCount: row.bid_count,
    isLive: row.is_live,
    isFeatured: row.is_featured,
    condition: (row.condition as Car["condition"]) || "fair",
  };
};

export const useRealtimeVehicle = (vehicleId?: string) => {
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicle = useCallback(async () => {
    if (!vehicleId) return;

    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", vehicleId)
        .single();

      if (supabaseError) throw supabaseError;
      if (!data) throw new Error("Vehicle not found");

      setCar(transformVehicleRow(data as VehicleRow));
      setError(null);
    } catch (err: any) {
      console.error("Error fetching vehicle:", err);
      setError(err.message || "Failed to load vehicle");
      setCar(null);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchVehicle();
  }, [fetchVehicle]);

  // Set up realtime subscription for vehicle updates
  useEffect(() => {
    if (!vehicleId) return;

    const channel = supabase
      .channel(`vehicle-${vehicleId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "vehicles",
          filter: `id=eq.${vehicleId}`,
        },
        (payload) => {
          console.log("Vehicle updated:", payload);
          setCar(transformVehicleRow(payload.new as VehicleRow));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vehicleId]);

  return {
    car,
    loading,
    error,
    refetch: fetchVehicle,
  };
};
