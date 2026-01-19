// hooks/useCars.ts
import { useCars as useCarsApi } from "@/services/carsApi";
import type { Car } from "@/services/carsApi";

export type { Car };

export const useCars = () => {
  const { 
    cars, 
    loading, 
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
    isLoading: loading,
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