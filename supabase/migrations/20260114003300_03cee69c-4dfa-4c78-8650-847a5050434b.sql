-- Add vehicle_type column to vehicles table to distinguish between cars and taxis
ALTER TABLE public.vehicles ADD COLUMN vehicle_type text NOT NULL DEFAULT 'car';

-- Add a check constraint to ensure only valid values
ALTER TABLE public.vehicles ADD CONSTRAINT vehicles_vehicle_type_check CHECK (vehicle_type IN ('car', 'taxi'));