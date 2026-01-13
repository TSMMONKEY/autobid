import { supabase } from './client'
import { Car, ApiVehicle, transformDbCar, transformVehicleToDb } from '@/data/cars'

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
      .from('cars')
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

    return data.map(transformDbCar)
  } catch (error) {
    console.error('Error fetching cars:', error)
    throw error
  }
}

// Fetch a single car by ID
export const fetchCarById = async (id: string): Promise<Car | null> => {
  try {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return transformDbCar(data)
  } catch (error) {
    console.error(`Error fetching car ${id}:`, error)
    return null
  }
}

// Create a new car from API vehicle data
export const createCarFromApiVehicle = async (
  vehicle: ApiVehicle,
  index: number
): Promise<Car | null> => {
  try {
    const carData = transformVehicleToDb(vehicle, index)
    
    const { data, error } = await supabase
      .from('cars')
      .insert(carData)
      .select()
      .single()

    if (error) throw error
    return transformDbCar(data)
  } catch (error) {
    console.error('Error creating car:', error)
    return null
  }
}

// Place a bid on a car
export const placeBid = async (
  carId: string,
  amount: number,
  userId: string
): Promise<{ car: Car | null; success: boolean; error?: string }> => {
  try {
    // Start a transaction
    const { data: carData, error: carError } = await supabase.rpc('place_bid', {
      car_id: carId,
      user_id: userId,
      bid_amount: amount,
    })

    if (carError) throw carError
    
    return {
      car: carData ? transformDbCar(carData) : null,
      success: true,
    }
  } catch (error: any) {
    console.error('Error placing bid:', error)
    return {
      car: null,
      success: false,
      error: error.message || 'Failed to place bid',
    }
  }
}

// Update car details
export const updateCar = async (
  id: string,
  updates: Partial<Omit<Car, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Car | null> => {
  try {
    const { data, error } = await supabase
      .from('cars')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return transformDbCar(data)
  } catch (error) {
    console.error(`Error updating car ${id}:`, error)
    return null
  }
}

// Delete a car
export const deleteCar = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('cars').delete().eq('id', id)
    if (error) throw error
    return true
  } catch (error) {
    console.error(`Error deleting car ${id}:`, error)
    return false
  }
}

// Get bids for a car
export const getCarBids = async (carId: string) => {
  try {
    const { data, error } = await supabase
      .from('bids')
      .select('*, profiles(full_name, avatar_url)')
      .eq('car_id', carId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  } catch (error) {
    console.error(`Error fetching bids for car ${carId}:`, error)
    return []
  }
}
