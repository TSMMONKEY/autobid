-- Create watchlist table for saved vehicles
CREATE TABLE public.watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, vehicle_id)
);

-- Enable RLS on watchlist
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Watchlist policies
CREATE POLICY "Users can view their own watchlist" 
ON public.watchlist FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their watchlist" 
ON public.watchlist FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their watchlist" 
ON public.watchlist FOR DELETE 
USING (auth.uid() = user_id);

-- Create bids table
CREATE TABLE public.bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on bids
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Bids policies - everyone can view bids
CREATE POLICY "Anyone can view bids" 
ON public.bids FOR SELECT 
USING (true);

-- Only authenticated users can place bids
CREATE POLICY "Authenticated users can place bids" 
ON public.bids FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Function to update vehicle bid info when a new bid is placed
CREATE OR REPLACE FUNCTION public.update_vehicle_bid()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.vehicles
  SET 
    current_bid = NEW.amount,
    bid_count = bid_count + 1,
    updated_at = now()
  WHERE id = NEW.vehicle_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-update vehicle on new bid
CREATE TRIGGER on_bid_placed
AFTER INSERT ON public.bids
FOR EACH ROW
EXECUTE FUNCTION public.update_vehicle_bid();

-- Enable realtime for vehicles and bids
ALTER PUBLICATION supabase_realtime ADD TABLE public.vehicles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;