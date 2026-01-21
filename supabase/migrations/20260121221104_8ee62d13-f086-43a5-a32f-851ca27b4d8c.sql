-- Create auction_events table
CREATE TABLE public.auction_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  auction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  vehicle_types TEXT[] NOT NULL DEFAULT '{car,taxi}'::text[],
  status TEXT NOT NULL DEFAULT 'upcoming', -- upcoming, live, completed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.auction_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for auction_events
CREATE POLICY "Anyone can view auction events" 
ON public.auction_events 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage auction events" 
ON public.auction_events 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add auction event columns to vehicles
ALTER TABLE public.vehicles 
ADD COLUMN auction_event_id UUID REFERENCES public.auction_events(id),
ADD COLUMN lot_number INTEGER,
ADD COLUMN asking_bid NUMERIC DEFAULT 0,
ADD COLUMN auction_phase TEXT DEFAULT 'pending'; -- pending, pre_bidding, bidding, going_once, going_twice, final_call, sold, unsold

-- Create pre_bids table for pre-auction bids
CREATE TABLE public.pre_bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  max_bid NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(vehicle_id, user_id)
);

-- Enable RLS for pre_bids
ALTER TABLE public.pre_bids ENABLE ROW LEVEL SECURITY;

-- RLS policies for pre_bids
CREATE POLICY "Users can view their own pre_bids" 
ON public.pre_bids 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create pre_bids" 
ON public.pre_bids 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pre_bids" 
ON public.pre_bids 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pre_bids" 
ON public.pre_bids 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_vehicles_auction_event ON public.vehicles(auction_event_id);
CREATE INDEX idx_vehicles_lot_number ON public.vehicles(lot_number);
CREATE INDEX idx_pre_bids_vehicle ON public.pre_bids(vehicle_id);

-- Update timestamp trigger for auction_events
CREATE TRIGGER update_auction_events_updated_at
BEFORE UPDATE ON public.auction_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update timestamp trigger for pre_bids
CREATE TRIGGER update_pre_bids_updated_at
BEFORE UPDATE ON public.pre_bids
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for auction_events
ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pre_bids;