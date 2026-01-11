// src/services/carsApi.ts
import { useState, useEffect, useCallback } from "react";
import type { Car } from "@/data/cars";

export const useCars = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

const transformCarData = (data: any): Car => {
  // Handle case where data might be nested in a 'data' property
  const carData = data.data || data;
  
  // Handle different casing in API response (e.g., 'Make' vs 'make')
  const getField = (field: string) => 
    carData[field] || 
    carData[field.charAt(0).toUpperCase() + field.slice(1)]; // Try with first letter capitalized

  return {
    id: String(carData.id || carData.ID || Math.random().toString(36).substr(2, 9)),
    make: getField('make') || 'Unknown',
    model: getField('model') || 'Unknown',
    year: Number(getField('year')) || new Date().getFullYear(),
    currentBid: Number(getField('currentBid')) || 0,
    endTime: carData.endTime ? new Date(carData.endTime) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    image: getField('image') || (Array.isArray(carData.images) ? carData.images[0] : null) || '/placeholder-car.jpg',
    images: Array.isArray(carData.images) 
      ? carData.images 
      : (carData.image ? [carData.image] : ['/placeholder-car.jpg']),
    mileage: Number(getField('mileage')) || 0,
    location: getField('location') || 'Location not specified',
    transmission: getField('transmission') || 'Automatic',
    engine: getField('engine') || 'Engine not specified',
    exterior: getField('exterior') || 'Color not specified',
    interior: getField('interior') || 'Color not specified',
    vin: getField('vin') || 'N/A',
    description: getField('description') || 
      `${getField('year') || ''} ${getField('make') || ''} ${getField('model') || ''} for auction.`,
    bidCount: Number(getField('bidCount')) || 0,
    isLive: carData.isLive !== false,
    isFeatured: carData.isFeatured === true,
    condition: (['excellent', 'good', 'fair', 'crashed', 'salvage'].includes(
      (getField('condition') || 'good').toLowerCase()
    ) ? (getField('condition') || 'good').toLowerCase() : 'good') as 
      'excellent' | 'good' | 'fair' | 'crashed' | 'salvage',
    hasKey: carData.hasKey !== false,
    engineStarts: carData.engineStarts !== false,
    primaryDamage: getField('primaryDamage') || 'None'
  };
};

  const fetchCars = useCallback(async (): Promise<Car[]> => {
    const API_URL = import.meta.env.VITE_CARS_API_URL || 'http://localhost/autobid/api/cars.php';
    
    try {
      console.log("Fetching cars from:", API_URL);
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response data:", data);
      
      // Handle different response formats
      let carsData = [];
      if (Array.isArray(data)) {
        carsData = data;
      } else if (data && typeof data === 'object') {
        carsData = data.data || data.cars || Object.values(data);
      }

      if (!Array.isArray(carsData)) {
        console.error('Invalid data format received from API:', data);
        throw new Error('Invalid data format received from API');
      }

      // Transform and validate each car
      const transformedCars = carsData
        .filter((car: any) => car) // Remove null/undefined
        .map(transformCarData);

      console.log("Transformed cars:", transformedCars);
      return transformedCars;
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

  // Transform API data to match our Car interface
  const transformCars = (apiCars: any[]): Car[] => {
    if (!Array.isArray(apiCars)) {
      console.error('Expected an array of cars, got:', apiCars);
      return [];
    }
    
    return apiCars.map((car) => {
      try {
        // Use the transformCarData function we already have
        return transformCarData(car);
      } catch (error) {
        console.error('Error transforming car:', car, error);
        return null;
      }
    }).filter((car): car is Car => car !== null);
  };
  
  // Transform the cars using our transformCars function
  const transformedCars = transformCars(cars);
  console.log('Transformed cars:', transformedCars);

  return { 
    cars: transformedCars, 
    loading, 
    error, 
    refetch,
    liveCars: transformedCars.filter(car => car.isLive),
    featuredCars: transformedCars.filter(car => car.isFeatured),
    crashedCars: transformedCars.filter(car => car.condition === "crashed" || car.condition === "salvage"),
    goodCars: transformedCars.filter(car => car.condition === "excellent" || car.condition === "good"),
    getCarById: (id: string) => transformedCars.find(car => car.id === id)
  };
};
// API service to fetch car data from PHP backend

export interface ApiVehicle {
  VID: number;
  year: string;
  price: number | null;
  make: string;
  model?: string;
  trim?: string;
  vin?: string;
  odometer: string;
  color?: string;
  cylinders?: string;
  engine_type?: string;
  transmission?: string;
  drivetrain?: string;
  fuel?: string;
  has_key: number;
  engine_starts: number;
  primary_damage?: string;
  title_code?: string;
  notes: string;
  images?: string[];
}

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

// Default placeholder images
const placeholderImages = [
  "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600",
  "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600",
  "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600",
];

const getEndTime = (hoursFromNow: number) => {
  const date = new Date();
  date.setHours(date.getHours() + hoursFromNow);
  return date;
};

// Transform API vehicle to our Car interface
const transformVehicle = (vehicle: ApiVehicle, index: number): Car => {
  const hasKey = vehicle.has_key === 1;
  const engineStarts = vehicle.engine_starts === 1;
  
  // Determine condition based on damage and engine status
  let condition: Car["condition"] = "good";
  if (vehicle.primary_damage && vehicle.primary_damage.toLowerCase().includes("total")) {
    condition = "salvage";
  } else if (vehicle.primary_damage && vehicle.primary_damage.toLowerCase() !== "none") {
    condition = "crashed";
  } else if (!engineStarts) {
    condition = "fair";
  } else if (hasKey && engineStarts) {
    condition = parseInt(vehicle.odometer || "0") < 100000 ? "excellent" : "good";
  }

  const images = vehicle.images && vehicle.images.length > 0 
    ? vehicle.images.filter(img => img && img.trim() !== '')
    : placeholderImages;

  const mileage = parseInt(vehicle.odometer?.replace(/\D/g, '') || "0");
  const year = parseInt(vehicle.year) || new Date().getFullYear();
  const price = vehicle.price || 50000;

  return {
    id: vehicle.VID.toString(),
    make: vehicle.make || "Unknown",
    model: vehicle.model || vehicle.trim || "Model",
    year,
    currentBid: price,
    endTime: getEndTime(Math.floor(Math.random() * 240) + 1),
    image: images[0],
    images,
    mileage,
    location: "Johannesburg, SA",
    transmission: vehicle.transmission || "Automatic",
    engine: vehicle.engine_type || `${vehicle.cylinders || "4"} Cylinder`,
    exterior: vehicle.color || "Unknown",
    interior: "Black",
    vin: vehicle.vin || "N/A",
    description: vehicle.notes || `${year} ${vehicle.make} for auction.`,
    bidCount: Math.floor(Math.random() * 50) + 1,
    isLive: index < 8,
    isFeatured: Math.random() > 0.85,
    condition,
    hasKey,
    engineStarts,
    primaryDamage: vehicle.primary_damage,
  };
};

// API base URL - update this to your PHP server URL
const API_URL = import.meta.env.VITE_CARS_API_URL || "http://localhost/cars.php";

// Fetch all cars from API
export const fetchCars = async (): Promise<Car[]> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: ApiVehicle[] = await response.json();
    return data.map((vehicle, index) => transformVehicle(vehicle, index));
  } catch (error) {
    console.error("Failed to fetch cars from API:", error);
    // Return empty array on error - let components handle fallback
    return [];
  }
};

// Filter functions
export const getLiveCars = (cars: Car[]) => cars.filter(car => car.isLive);
export const getFeaturedCars = (cars: Car[]) => cars.filter(car => car.isFeatured);
export const getCarById = (cars: Car[], id: string) => cars.find(car => car.id === id);
export const getCrashedCars = (cars: Car[]) => cars.filter(car => car.condition === "crashed" || car.condition === "salvage");
export const getGoodCars = (cars: Car[]) => cars.filter(car => car.condition === "excellent" || car.condition === "good");
