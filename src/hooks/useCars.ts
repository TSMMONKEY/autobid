// hooks/useCars.ts
import { useCars as useCarsApi } from "@/services/carsApi";
import type { Car } from "@/data/cars";

export const useCars = () => {
  const { 
    cars, 
    loading: isLoading, 
    error, 
    refetch,
    liveCars,
    featuredCars,
    crashedCars,
    goodCars,
    getCarById
  } = useCarsApi();

  return {
    cars,
    isLoading,
    isError: !!error,
    error,
    refetch,
    liveCars,
    featuredCars,
    crashedCars,
    goodCars,
    getCarById,
  };
};