// src/data/cars.ts

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

// -------------------
// Helpers
// -------------------
const getEndTime = (hoursFromNow: number) => {
  const date = new Date();
  date.setHours(date.getHours() + hoursFromNow);
  return date;
};

export const transformVehicle = (vehicle: ApiVehicle, index: number): Car => {
  const hasKey = vehicle.has_key === 1;
  const engineStarts = vehicle.engine_starts === 1;

  let condition: Car["condition"] = "good";
  if (vehicle.primary_damage?.toLowerCase().includes("total")) condition = "salvage";
  else if (vehicle.primary_damage && vehicle.primary_damage.toLowerCase() !== "none") condition = "crashed";
  else if (!engineStarts) condition = "fair";
  else if (hasKey && engineStarts && parseInt(vehicle.odometer || "0") < 100000) condition = "excellent";

  const images = vehicle.images?.filter(img => img && img.trim() !== "") || ["https://via.placeholder.com/600"];
  const mileage = parseInt(vehicle.odometer?.replace(/\D/g, "") || "0");
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
    description: vehicle.notes || `${year} ${vehicle.make} ${vehicle.model || ""} for auction.`,
    bidCount: Math.floor(Math.random() * 50) + 1,
    isLive: index < 8,
    isFeatured: Math.random() > 0.85,
    condition,
    hasKey,
    engineStarts,
    primaryDamage: vehicle.primary_damage,
  };
};

// -------------------
// API Fetch
// -------------------
const API_URL = import.meta.env.VITE_CARS_API_URL;

export const fetchCars = async (): Promise<Car[]> => {
  if (!API_URL) return [];

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: ApiVehicle[] = await res.json();
    return data.map(transformVehicle);
  } catch (err) {
    console.error("Failed to fetch cars from API", err);
    return [];
  }
};

// -------------------
// Filters
// -------------------
export const getLiveCars = (cars: Car[]) => cars.filter(c => c.isLive);
export const getFeaturedCars = (cars: Car[]) => cars.filter(c => c.isFeatured);
export const getCarById = (cars: Car[], id: string) => cars.find(c => c.id === id);
export const getCrashedCars = (cars: Car[]) => cars.filter(c => c.condition === "crashed" || c.condition === "salvage");
export const getGoodCars = (cars: Car[]) => cars.filter(c => c.condition === "excellent" || c.condition === "good");

// export interface Car {
  //   id: string;
  //   make: string;
  //   model: string;
  //   year: number;
  //   currentBid: number;
  //   endTime: Date;
  //   image: string;
  //   images: string[]; // Multiple images for carousel
  //   mileage: number;
  //   location: string;
  //   transmission: string;
  //   engine: string;
  //   exterior: string;
  //   interior: string;
  //   vin: string;
  //   description: string;
  //   bidCount: number;
  //   isLive: boolean;
  //   isFeatured: boolean;
  //   condition: "excellent" | "good" | "fair" | "crashed" | "salvage";
  // }

  // const getEndTime = (hoursFromNow: number) => {
  //   const date = new Date();
  //   date.setHours(date.getHours() + hoursFromNow);
  //   return date;
  // };

  // const carImages = {
  //   crashed: [
  //     "https://images.unsplash.com/photo-1591768793355-74d04bb6608f?w=600",
  //     "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600",
  //     "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=600",
  //   ],
  //   normal: [
  //     "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600",
  //     "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600",
  //     "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600",
  //     "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600",
  //     "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600",
  //     "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600",
  //     "https://images.unsplash.com/photo-1542362567-b07e54358753?w=600",
  //     "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600",
  //     "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600",
  //     "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600",
  //     "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600",
  //     "https://images.unsplash.com/photo-1571607388263-1044f9ea01dd?w=600",
  //     "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=600",
  //     "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=600",
  //     "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600",
  //   ],
  // };

  // const locations = [
  //   "Sandton, JHB",
  //   "Soweto, JHB",
  //   "Randburg, JHB",
  //   "Midrand, JHB",
  //   "Roodepoort, JHB",
  //   "Centurion, PTA",
  //   "Pretoria CBD",
  //   "Boksburg, EKU",
  //   "Benoni, EKU",
  //   "Alberton, JHB",
  //   "Kempton Park",
  //   "Germiston, EKU",
  //   "Vereeniging",
  //   "Krugersdorp",
  //   "Springs, EKU",
  // ];

  // const exteriorColors = ["White", "Silver", "Black", "Grey", "Blue", "Red", "Brown", "Beige", "Green"];
  // const interiorColors = ["Black Cloth", "Grey Cloth", "Beige Cloth", "Black Leather", "Grey Leather"];
  // const transmissions = ["Manual", "Automatic", "CVT", "Semi-Auto"];

  // const carModels = [
  //   // Toyota
  //   { make: "Toyota", model: "Corolla Quest", engines: ["1.6L Petrol", "1.8L Petrol"] },
  //   { make: "Toyota", model: "Hilux", engines: ["2.4L Diesel", "2.8L Diesel", "2.7L Petrol"] },
  //   { make: "Toyota", model: "Fortuner", engines: ["2.4L Diesel", "2.8L Diesel"] },
  //   { make: "Toyota", model: "Quantum", engines: ["2.5L Diesel", "2.7L Petrol"] },
  //   { make: "Toyota", model: "Yaris", engines: ["1.0L Petrol", "1.5L Petrol"] },
  //   { make: "Toyota", model: "RAV4", engines: ["2.0L Petrol", "2.5L Hybrid"] },
  //   { make: "Toyota", model: "Etios", engines: ["1.5L Petrol"] },
  //   { make: "Toyota", model: "Avanza", engines: ["1.3L Petrol", "1.5L Petrol"] },
  //   // Volkswagen
  //   { make: "Volkswagen", model: "Polo", engines: ["1.0L TSI", "1.4L Petrol", "1.6L Petrol"] },
  //   { make: "Volkswagen", model: "Polo Vivo", engines: ["1.4L Petrol", "1.6L Petrol"] },
  //   { make: "Volkswagen", model: "Golf 7", engines: ["1.4L TSI", "2.0L TSI", "2.0L TDI"] },
  //   { make: "Volkswagen", model: "Tiguan", engines: ["1.4L TSI", "2.0L TSI", "2.0L TDI"] },
  //   { make: "Volkswagen", model: "Amarok", engines: ["2.0L TDI", "3.0L V6 TDI"] },
  //   // Ford
  //   { make: "Ford", model: "Ranger", engines: ["2.2L TDCi", "3.2L TDCi", "2.0L Bi-Turbo"] },
  //   { make: "Ford", model: "EcoSport", engines: ["1.0L EcoBoost", "1.5L Petrol"] },
  //   { make: "Ford", model: "Figo", engines: ["1.4L Petrol", "1.5L TDCi"] },
  //   { make: "Ford", model: "Fiesta", engines: ["1.0L EcoBoost", "1.4L Petrol"] },
  //   // Nissan
  //   { make: "Nissan", model: "NP200", engines: ["1.6L Petrol"] },
  //   { make: "Nissan", model: "NP300 Hardbody", engines: ["2.0L Petrol", "2.4L Petrol", "2.5L Diesel"] },
  //   { make: "Nissan", model: "Navara", engines: ["2.3L dCi", "2.5L dCi"] },
  //   { make: "Nissan", model: "Almera", engines: ["1.5L Petrol"] },
  //   { make: "Nissan", model: "Micra", engines: ["1.2L Petrol", "0.9L Turbo"] },
  //   { make: "Nissan", model: "X-Trail", engines: ["2.0L Petrol", "2.5L Petrol"] },
  //   // Hyundai
  //   { make: "Hyundai", model: "i20", engines: ["1.2L Petrol", "1.4L Petrol"] },
  //   { make: "Hyundai", model: "Grand i10", engines: ["1.0L Petrol", "1.2L Petrol"] },
  //   { make: "Hyundai", model: "Tucson", engines: ["2.0L Petrol", "2.0L CRDi"] },
  //   { make: "Hyundai", model: "Creta", engines: ["1.5L Petrol", "1.5L CRDi"] },
  //   { make: "Hyundai", model: "Accent", engines: ["1.6L Petrol"] },
  //   { make: "Hyundai", model: "H100", engines: ["2.6L Diesel"] },
  //   // Kia
  //   { make: "Kia", model: "Picanto", engines: ["1.0L Petrol", "1.2L Petrol"] },
  //   { make: "Kia", model: "Rio", engines: ["1.2L Petrol", "1.4L Petrol"] },
  //   { make: "Kia", model: "Seltos", engines: ["1.5L Petrol", "1.5L CRDi"] },
  //   { make: "Kia", model: "Sportage", engines: ["2.0L Petrol", "2.0L CRDi"] },
  //   // Mazda
  //   { make: "Mazda", model: "Mazda3", engines: ["1.5L Petrol", "2.0L Petrol"] },
  //   { make: "Mazda", model: "CX-5", engines: ["2.0L Petrol", "2.5L Petrol", "2.2L Diesel"] },
  //   { make: "Mazda", model: "CX-3", engines: ["2.0L Petrol"] },
  //   // Honda
  //   { make: "Honda", model: "Fit", engines: ["1.5L Petrol"] },
  //   { make: "Honda", model: "Ballade", engines: ["1.5L Petrol"] },
  //   { make: "Honda", model: "BR-V", engines: ["1.5L Petrol"] },
  //   { make: "Honda", model: "HR-V", engines: ["1.5L Petrol", "1.8L Petrol"] },
  //   // Renault
  //   { make: "Renault", model: "Kwid", engines: ["1.0L Petrol"] },
  //   { make: "Renault", model: "Sandero", engines: ["0.9L Turbo", "1.6L Petrol"] },
  //   { make: "Renault", model: "Duster", engines: ["1.5L dCi", "1.6L Petrol"] },
  //   { make: "Renault", model: "Clio", engines: ["0.9L Turbo", "1.2L Petrol"] },
  //   // Suzuki
  //   { make: "Suzuki", model: "Swift", engines: ["1.2L Petrol"] },
  //   { make: "Suzuki", model: "Jimny", engines: ["1.5L Petrol"] },
  //   { make: "Suzuki", model: "Vitara Brezza", engines: ["1.5L Petrol"] },
  //   { make: "Suzuki", model: "Baleno", engines: ["1.4L Petrol"] },
  //   // Isuzu
  //   { make: "Isuzu", model: "D-Max", engines: ["1.9L ddi", "3.0L ddi"] },
  //   { make: "Isuzu", model: "KB Series", engines: ["2.5L Diesel", "3.0L Diesel"] },
  //   // Chevrolet
  //   { make: "Chevrolet", model: "Spark", engines: ["1.0L Petrol", "1.2L Petrol"] },
  //   { make: "Chevrolet", model: "Aveo", engines: ["1.4L Petrol", "1.6L Petrol"] },
  //   { make: "Chevrolet", model: "Utility", engines: ["1.4L Petrol", "1.8L Petrol"] },
  //   // Opel
  //   { make: "Opel", model: "Corsa", engines: ["1.0L Turbo", "1.4L Petrol"] },
  //   { make: "Opel", model: "Astra", engines: ["1.4L Turbo", "1.6L Petrol"] },
  //   // Haval
  //   { make: "Haval", model: "H2", engines: ["1.5L Turbo"] },
  //   { make: "Haval", model: "Jolion", engines: ["1.5L Turbo"] },
  //   // BAIC
  //   { make: "BAIC", model: "D20", engines: ["1.3L Petrol", "1.5L Petrol"] },
  //   // Chery
  //   { make: "Chery", model: "Tiggo 4 Pro", engines: ["1.5L Turbo"] },
  //   // Mahindra
  //   { make: "Mahindra", model: "Pik Up", engines: ["2.2L mHawk Diesel"] },
  //   { make: "Mahindra", model: "Scorpio", engines: ["2.2L mHawk Diesel"] },
  // ];

  // const conditions: Array<{ condition: Car["condition"]; weight: number }> = [
  //   { condition: "excellent", weight: 15 },
  //   { condition: "good", weight: 35 },
  //   { condition: "fair", weight: 25 },
  //   { condition: "crashed", weight: 15 },
  //   { condition: "salvage", weight: 10 },
  // ];

  // const getRandomCondition = (): Car["condition"] => {
  //   const totalWeight = conditions.reduce((sum, c) => sum + c.weight, 0);
  //   let random = Math.random() * totalWeight;
  //   for (const c of conditions) {
  //     random -= c.weight;
  //     if (random <= 0) return c.condition;
  //   }
  //   return "good";
  // };

  // const getConditionDescription = (condition: Car["condition"]): string => {
  //   switch (condition) {
  //     case "excellent":
  //       return "Excellent condition, well maintained with full service history.";
  //     case "good":
  //       return "Good running condition, minor wear and tear.";
  //     case "fair":
  //       return "Fair condition, some mechanical issues, sold as-is.";
  //     case "crashed":
  //       return "Accident damaged, repairable. Good for parts or rebuild.";
  //     case "salvage":
  //       return "Salvage title, extensive damage. Ideal for parts.";
  //   }
  // };

  // const generateVIN = (): string => {
  //   const chars = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789";
  //   let vin = "";
  //   for (let i = 0; i < 17; i++) {
  //     vin += chars[Math.floor(Math.random() * chars.length)];
  //   }
  //   return vin;
  // };

  // const generateCars = (count: number): Car[] => {
  //   const generatedCars: Car[] = [];
    
  //   for (let i = 0; i < count; i++) {
  //     const carModel = carModels[Math.floor(Math.random() * carModels.length)];
  //     const condition = getRandomCondition();
  //     const isCrashed = condition === "crashed" || condition === "salvage";
  //     const year = 2010 + Math.floor(Math.random() * 15); // 2010-2024
  //     const baseMileage = (2024 - year) * 15000 + Math.floor(Math.random() * 30000);
      
  //     // Price based on condition and age
  //     let basePrice = 50000 + Math.floor(Math.random() * 200000);
  //     if (condition === "crashed") basePrice *= 0.4;
  //     if (condition === "salvage") basePrice *= 0.25;
  //     if (condition === "fair") basePrice *= 0.7;
  //     if (condition === "excellent") basePrice *= 1.2;
  //     basePrice = Math.round(basePrice / 1000) * 1000;

  //     const isLive = i < 8 && Math.random() > 0.5;
  //     const isFeatured = Math.random() > 0.85;

  //     const imageIndex = isCrashed 
  //       ? Math.floor(Math.random() * carImages.crashed.length)
  //       : Math.floor(Math.random() * carImages.normal.length);

  //     // Generate 3-5 random images for carousel
  //     const numImages = 3 + Math.floor(Math.random() * 3);
  //     const imagePool = isCrashed ? carImages.crashed : carImages.normal;
  //     const carImageSet: string[] = [];
  //     const usedIndices = new Set<number>();
      
  //     // Add primary image first
  //     carImageSet.push(imagePool[imageIndex]);
  //     usedIndices.add(imageIndex);
      
  //     // Add additional random images
  //     while (carImageSet.length < numImages && carImageSet.length < imagePool.length) {
  //       const randIdx = Math.floor(Math.random() * imagePool.length);
  //       if (!usedIndices.has(randIdx)) {
  //         carImageSet.push(imagePool[randIdx]);
  //         usedIndices.add(randIdx);
  //       }
  //     }

  //     generatedCars.push({
  //       id: (i + 1).toString(),
  //       make: carModel.make,
  //       model: carModel.model,
  //       year,
  //       currentBid: basePrice,
  //       endTime: getEndTime(Math.floor(Math.random() * 240) + 1),
  //       image: isCrashed ? carImages.crashed[imageIndex] : carImages.normal[imageIndex],
  //       images: carImageSet,
  //       mileage: baseMileage,
  //       location: locations[Math.floor(Math.random() * locations.length)],
  //       transmission: transmissions[Math.floor(Math.random() * transmissions.length)],
  //       engine: carModel.engines[Math.floor(Math.random() * carModel.engines.length)],
  //       exterior: exteriorColors[Math.floor(Math.random() * exteriorColors.length)],
  //       interior: interiorColors[Math.floor(Math.random() * interiorColors.length)],
  //       vin: generateVIN(),
  //       description: `${year} ${carModel.make} ${carModel.model}. ${getConditionDescription(condition)} Located in ${locations[Math.floor(Math.random() * locations.length)]}.`,
  //       bidCount: Math.floor(Math.random() * 50) + 1,
  //       isLive,
  //       isFeatured,
  //       condition,
  //     });
  //   }

  //   return generatedCars;
  // };

  // // Generate 320 cars (16 pages x 20 cars per page)
  // export const cars: Car[] = generateCars(320);

  // export const getLiveCars = () => cars.filter(car => car.isLive);
  // export const getFeaturedCars = () => cars.filter(car => car.isFeatured);
  // export const getCarById = (id: string) => cars.find(car => car.id === id);
  // export const getCrashedCars = () => cars.filter(car => car.condition === "crashed" || car.condition === "salvage");
// export const getGoodCars = () => cars.filter(car => car.condition === "excellent" || car.condition === "good");
