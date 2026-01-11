// src/services/carsApi.ts
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  currentBid: number;
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
  condition: "excellent" | "good" | "fair" | "crashed" | "salvage";
  hasKey?: boolean;
  engineStarts?: boolean;
  primaryDamage?: string;
}

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
    engine: row.engine || 'N/A',
    exterior: row.exterior || 'N/A',
    interior: row.interior || 'Standard',
    vin: row.vin || 'N/A',
    description: row.description || `${row.year} ${row.make} ${row.model}`,
    bidCount: row.bid_count,
    isLive: row.is_live,
    isFeatured: row.is_featured,
    condition: (row.condition as Car['condition']) || 'fair',
  };
};

export const useCars = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCars = useCallback(async (): Promise<Car[]> => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      if (!data) {
        return [];
      }

      return data.map((row: VehicleRow) => transformVehicleRow(row));
    } catch (err) {
      console.error("Error in fetchCars:", err);
      throw err;
    }
  }, []);

  useEffect(() => {
    const loadCars = async () => {
      try {
        setLoading(true);
        const data = await fetchCars();
        setCars(data);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load cars:", err);
        setError(err.message || "Failed to load cars. Please try again later.");
        setCars([]);
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, [fetchCars]);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCars();
      setCars(data);
      setError(null);
      return data;
    } catch (err: any) {
      setError(err.message || "Failed to refetch cars");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCars]);

  return { 
    cars, 
    loading, 
    error, 
    refetch,
    liveCars: cars.filter(car => car.isLive),
    featuredCars: cars.filter(car => car.isFeatured),
    crashedCars: cars.filter(car => car.condition === "crashed" || car.condition === "salvage"),
    goodCars: cars.filter(car => car.condition === "excellent" || car.condition === "good"),
    getCarById: (id: string) => cars.find(car => car.id === id)
  };
};

// Filter functions for external use
export const getLiveCars = (cars: Car[]) => cars.filter(car => car.isLive);
export const getFeaturedCars = (cars: Car[]) => cars.filter(car => car.isFeatured);
export const getCarById = (cars: Car[], id: string) => cars.find(car => car.id === id);
export const getCrashedCars = (cars: Car[]) => cars.filter(car => car.condition === "crashed" || car.condition === "salvage");
export const getGoodCars = (cars: Car[]) => cars.filter(car => car.condition === "excellent" || car.condition === "good");
