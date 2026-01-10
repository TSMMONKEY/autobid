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
