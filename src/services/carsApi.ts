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
  hasKey: boolean;
  engineStarts: boolean;
  primaryDamage: string;
  createdAt?: Date;
  updatedAt?: Date;
}

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
  has_key: boolean;
  engine_starts: boolean;
  primary_damage: string;
  created_at?: string;
  updated_at?: string;
}

const transformCarRow = (row: CarRow): Car => ({
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
  hasKey: row.has_key,
  engineStarts: row.engine_starts,
  primaryDamage: row.primary_damage,
  ...(row.created_at && { createdAt: new Date(row.created_at) }),
  ...(row.updated_at && { updatedAt: new Date(row.updated_at) }),
});

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
        console.error('Supabase error:', supabaseError);
        throw new Error(supabaseError.message);
      }

      if (!data || data.length === 0) {
        console.log('No cars found in the database');
        return [];
      }

      console.log('Fetched cars from Supabase:', data);
      return data.map((row: CarRow) => transformCarRow(row));
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
    setLoading(true);
    try {
      const data = await fetchCars();
      setCars(data);
      setError(null);
      console.log('Successfully refetched cars:', data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cars';
      console.error('Error refetching cars:', errorMessage);
      setError(errorMessage);
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
    getCarById: useCallback(async (id: string): Promise<Car | undefined> => {
      try {
        const { data, error } = await supabase
          .from('cars')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching car by ID:', error);
          return undefined;
        }

        return data ? transformCarRow(data) : undefined;
      } catch (error) {
        console.error('Error in getCarById:', error);
        return undefined;
      }
    }, [])
  };
};

// Filter functions for external use
export const getLiveCars = (cars: Car[]) => cars.filter(car => car.isLive);
export const getFeaturedCars = (cars: Car[]) => cars.filter(car => car.isFeatured);
export const getCrashedCars = (cars: Car[]) => cars.filter(car => car.condition === "crashed" || car.condition === "salvage");
export const getGoodCars = (cars: Car[]) => cars.filter(car => car.condition === "excellent" || car.condition === "good");
