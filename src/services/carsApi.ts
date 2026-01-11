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