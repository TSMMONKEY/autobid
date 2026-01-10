import { useQuery } from "@tanstack/react-query";
import { fetchCars, Car } from "@/services/carsApi";
// Fallback to static data if API fails
import { cars as staticCars } from "@/data/cars";

// Filter functions that work with both interfaces
const getLiveCars = (cars: Car[]) => cars.filter(car => car.isLive);
const getFeaturedCars = (cars: Car[]) => cars.filter(car => car.isFeatured);
const getCarById = (cars: Car[], id: string) => cars.find(car => car.id === id);
const getCrashedCars = (cars: Car[]) => cars.filter(car => car.condition === "crashed" || car.condition === "salvage");
const getGoodCars = (cars: Car[]) => cars.filter(car => car.condition === "excellent" || car.condition === "good");

export const useCars = () => {
  const query = useQuery({
    queryKey: ["cars"],
    queryFn: fetchCars,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Use static data as fallback if API returns empty or errors
  const cars: Car[] = query.data && query.data.length > 0 ? query.data : (staticCars as Car[]);

  return {
    cars,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    // Helper functions
    liveCars: getLiveCars(cars),
    featuredCars: getFeaturedCars(cars),
    crashedCars: getCrashedCars(cars),
    goodCars: getGoodCars(cars),
    getCarById: (id: string) => getCarById(cars, id),
  };
};

export type { Car };
