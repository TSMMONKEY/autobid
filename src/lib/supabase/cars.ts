import { supabase } from '@/integrations/supabase/client'
import type { Car } from '@/data/cars'

interface DbCar {
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
  engine?: string | null;
  exterior?: string | null;
  interior?: string | null;
  vin?: string | null;
  description?: string | null;
  bid_count: number;
  is_live: boolean;
  is_featured: boolean;
  condition?: string | null;
  created_at?: string;
  updated_at?: string;
}

const transformDbCar = (dbCar: DbCar): Car => ({
  id: dbCar.id,
  make: dbCar.make,
  model: dbCar.model,
  year: dbCar.year,
  currentBid: dbCar.current_bid,
  endTime: new Date(dbCar.end_time),
  image: dbCar.image,
  images: dbCar.images || [dbCar.image],
  mileage: dbCar.mileage,
  location: dbCar.location || 'South Africa',
  transmission: dbCar.transmission,
  engine: dbCar.engine || 'Unknown',
  exterior: dbCar.exterior || 'Unknown',
  interior: dbCar.interior || 'Standard',
  vin: dbCar.vin || '',
  description: dbCar.description || `${dbCar.year} ${dbCar.make} ${dbCar.model}`,
  bidCount: dbCar.bid_count,
  isLive: dbCar.is_live,
  isFeatured: dbCar.is_featured,
  condition: (dbCar.condition as Car['condition']) || 'good',
  hasKey: true,
  engineStarts: true,
  primaryDamage: 'None',
  createdAt: dbCar.created_at ? new Date(dbCar.created_at) : undefined,
  updatedAt: dbCar.updated_at ? new Date(dbCar.updated_at) : undefined,
});

// Fetch all cars with optional filters
export const fetchCars = async ({
  isLive,
  isFeatured,
  limit,
  offset = 0,
}: {
  isLive?: boolean
  isFeatured?: boolean
  limit?: number
  offset?: number
} = {}): Promise<Car[]> => {
  try {
    let query = supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false })

    if (isLive !== undefined) {
      query = query.eq('is_live', isLive)
    }

    if (isFeatured !== undefined) {
      query = query.eq('is_featured', isFeatured)
    }

    if (limit) {
      query = query.range(offset, offset + limit - 1)
    }

    const { data, error } = await query

    if (error) throw error

    return (data || []).map((row: any) => transformDbCar(row as DbCar))
  } catch (error) {
    console.error('Error fetching cars:', error)
    throw error
  }
}

// Fetch a single car by ID
export const fetchCarById = async (id: string): Promise<Car | null> => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return transformDbCar(data as DbCar)
  } catch (error) {
    console.error(`Error fetching car ${id}:`, error)
    return null
  }
}

// Get bids for a car
export const getCarBids = async (carId: string) => {
  try {
    const { data, error } = await supabase
      .from('bids')
      .select('*, profiles(full_name, avatar_url)')
      .eq('vehicle_id', carId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error(`Error fetching bids for car ${carId}:`, error)
    return []
  }
}