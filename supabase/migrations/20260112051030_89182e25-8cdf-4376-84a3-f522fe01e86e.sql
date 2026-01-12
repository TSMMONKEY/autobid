-- Allow authenticated users to insert vehicles
CREATE POLICY "Authenticated users can insert vehicles" 
ON public.vehicles FOR INSERT 
WITH CHECK (true);

-- Allow authenticated users to update vehicles (for bid updates via trigger)
CREATE POLICY "Allow bid updates on vehicles" 
ON public.vehicles FOR UPDATE 
USING (true);
