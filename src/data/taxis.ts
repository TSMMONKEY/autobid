export interface Taxi {
  id: string;
  make: string;
  model: string;
  year: number;
  currentBid: number;
  endTime: Date;
  image: string;
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
  seatingCapacity: number;
  operatingLicense: boolean;
}

const getEndTime = (hoursFromNow: number) => {
  const date = new Date();
  date.setHours(date.getHours() + hoursFromNow);
  return date;
};

const taxiImages = [
  "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600",
  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600",
  "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600",
  "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600",
  "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600",
];

const locations = [
  "Johannesburg CBD",
  "Soweto, JHB",
  "Alexandra, JHB",
  "Randburg, JHB",
  "Pretoria CBD",
  "Mamelodi, PTA",
  "Tembisa, EKU",
  "Katlehong, EKU",
  "Vosloorus, EKU",
  "Orange Farm",
];

const exteriorColors = ["White", "White", "White", "Silver", "Grey"]; // Most taxis are white
const interiorColors = ["Black Vinyl", "Grey Vinyl", "Black Cloth", "Grey Cloth"];
const transmissions = ["Manual", "Automatic"];

const taxiModels = [
  { make: "Toyota", model: "Quantum 10-Seater", engines: ["2.5L Diesel", "2.7L Petrol"], capacity: 10 },
  { make: "Toyota", model: "Quantum 14-Seater", engines: ["2.5L Diesel", "2.7L Petrol"], capacity: 14 },
  { make: "Toyota", model: "Quantum 16-Seater", engines: ["2.5L Diesel", "2.7L Petrol"], capacity: 16 },
  { make: "Toyota", model: "Hiace Ses'fikile", engines: ["2.5L Diesel"], capacity: 16 },
  { make: "Toyota", model: "Avanza", engines: ["1.3L Petrol", "1.5L Petrol"], capacity: 7 },
  { make: "Nissan", model: "NV350 Impendulo", engines: ["2.5L Petrol"], capacity: 16 },
  { make: "Nissan", model: "NV200", engines: ["1.6L Petrol"], capacity: 7 },
  { make: "Mercedes-Benz", model: "Sprinter", engines: ["2.1L CDI Diesel"], capacity: 22 },
  { make: "Volkswagen", model: "Crafter", engines: ["2.0L TDI"], capacity: 22 },
  { make: "Hyundai", model: "H100", engines: ["2.6L Diesel"], capacity: 10 },
  { make: "Iveco", model: "Daily", engines: ["3.0L Diesel"], capacity: 20 },
];

const conditions: Array<{ condition: Taxi["condition"]; weight: number }> = [
  { condition: "excellent", weight: 10 },
  { condition: "good", weight: 30 },
  { condition: "fair", weight: 30 },
  { condition: "crashed", weight: 20 },
  { condition: "salvage", weight: 10 },
];

const getRandomCondition = (): Taxi["condition"] => {
  const totalWeight = conditions.reduce((sum, c) => sum + c.weight, 0);
  let random = Math.random() * totalWeight;
  for (const c of conditions) {
    random -= c.weight;
    if (random <= 0) return c.condition;
  }
  return "good";
};

const getConditionDescription = (condition: Taxi["condition"]): string => {
  switch (condition) {
    case "excellent":
      return "Excellent condition, full service history, ready to operate.";
    case "good":
      return "Good running condition, minor cosmetic wear.";
    case "fair":
      return "Fair condition, needs minor repairs before operation.";
    case "crashed":
      return "Accident damaged, repairable. Engine and drivetrain intact.";
    case "salvage":
      return "Salvage title, extensive damage. Good for parts or major rebuild.";
  }
};

const generateVIN = (): string => {
  const chars = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789";
  let vin = "";
  for (let i = 0; i < 17; i++) {
    vin += chars[Math.floor(Math.random() * chars.length)];
  }
  return vin;
};

const generateTaxis = (count: number): Taxi[] => {
  const generatedTaxis: Taxi[] = [];
  
  for (let i = 0; i < count; i++) {
    const taxiModel = taxiModels[Math.floor(Math.random() * taxiModels.length)];
    const condition = getRandomCondition();
    const year = 2012 + Math.floor(Math.random() * 13); // 2012-2024
    const baseMileage = (2024 - year) * 40000 + Math.floor(Math.random() * 50000); // Taxis have high mileage
    
    // Price based on condition and age
    let basePrice = 150000 + Math.floor(Math.random() * 350000);
    if (condition === "crashed") basePrice *= 0.45;
    if (condition === "salvage") basePrice *= 0.3;
    if (condition === "fair") basePrice *= 0.65;
    if (condition === "excellent") basePrice *= 1.15;
    basePrice = Math.round(basePrice / 5000) * 5000;

    const isLive = i < 5 && Math.random() > 0.6;
    const isFeatured = Math.random() > 0.8;
    const hasLicense = condition === "excellent" || condition === "good" ? Math.random() > 0.3 : false;

    const imageIndex = Math.floor(Math.random() * taxiImages.length);
    const locationVal = locations[Math.floor(Math.random() * locations.length)];

    generatedTaxis.push({
      id: `taxi-${i + 1}`,
      make: taxiModel.make,
      model: taxiModel.model,
      year,
      currentBid: basePrice,
      endTime: getEndTime(Math.floor(Math.random() * 168) + 1), // Up to 7 days
      image: taxiImages[imageIndex],
      mileage: baseMileage,
      location: locationVal,
      transmission: transmissions[Math.floor(Math.random() * transmissions.length)],
      engine: taxiModel.engines[Math.floor(Math.random() * taxiModel.engines.length)],
      exterior: exteriorColors[Math.floor(Math.random() * exteriorColors.length)],
      interior: interiorColors[Math.floor(Math.random() * interiorColors.length)],
      vin: generateVIN(),
      description: `${year} ${taxiModel.make} ${taxiModel.model}. ${getConditionDescription(condition)} ${hasLicense ? "Includes valid operating license." : "Operating license NOT included."} Located in ${locationVal}.`,
      bidCount: Math.floor(Math.random() * 30) + 1,
      isLive,
      isFeatured,
      condition,
      seatingCapacity: taxiModel.capacity,
      operatingLicense: hasLicense,
    });
  }

  return generatedTaxis;
};

// Generate 60 taxis
export const taxis: Taxi[] = generateTaxis(60);

export const getLiveTaxis = () => taxis.filter(taxi => taxi.isLive);
export const getFeaturedTaxis = () => taxis.filter(taxi => taxi.isFeatured);
export const getTaxiById = (id: string) => taxis.find(taxi => taxi.id === id);