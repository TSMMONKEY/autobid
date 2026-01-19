-- Add auction status and winner tracking to vehicles table
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS auction_status text NOT NULL DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS winner_id uuid,
ADD COLUMN IF NOT EXISTS winning_bid numeric,
ADD COLUMN IF NOT EXISTS auction_duration_minutes integer DEFAULT 5;

-- Add constraint for auction_status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'vehicles_auction_status_check'
  ) THEN
    ALTER TABLE public.vehicles
    ADD CONSTRAINT vehicles_auction_status_check 
    CHECK (auction_status IN ('pending', 'live', 'sold', 'unsold'));
  END IF;
END $$;

-- Create auctions queue table for managing auction order
CREATE TABLE IF NOT EXISTS public.auction_queue (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  position integer NOT NULL,
  scheduled_time timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(vehicle_id)
);

-- Enable RLS on auction_queue
ALTER TABLE public.auction_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for auction_queue
CREATE POLICY "Anyone can view auction queue" 
ON public.auction_queue 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage auction queue" 
ON public.auction_queue 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create sales table to track won auctions
CREATE TABLE IF NOT EXISTS public.sales (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL,
  seller_id uuid,
  sale_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending_payment',
  invoice_number text,
  payment_date timestamp with time zone,
  delivery_date timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT sales_status_check CHECK (status IN ('pending_payment', 'paid', 'shipped', 'delivered', 'completed', 'cancelled'))
);

-- Enable RLS on sales
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sales
CREATE POLICY "Users can view their own sales" 
ON public.sales 
FOR SELECT 
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "System can insert sales" 
ON public.sales 
FOR INSERT 
WITH CHECK (true);

-- Create refunds table
CREATE TABLE IF NOT EXISTS public.refunds (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending',
  processed_date timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT refunds_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'processed'))
);

-- Enable RLS on refunds
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

-- RLS Policies for refunds
CREATE POLICY "Users can view their own refunds" 
ON public.refunds 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can request refunds" 
ON public.refunds 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id uuid REFERENCES public.sales(id) ON DELETE SET NULL,
  user_id uuid NOT NULL,
  invoice_number text NOT NULL UNIQUE,
  amount numeric NOT NULL,
  tax_amount numeric DEFAULT 0,
  total_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'unpaid',
  due_date timestamp with time zone,
  paid_date timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT invoices_status_check CHECK (status IN ('unpaid', 'paid', 'overdue', 'cancelled'))
);

-- Enable RLS on invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invoices
CREATE POLICY "Users can view their own invoices" 
ON public.invoices 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create transactions/statement table
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL,
  amount numeric NOT NULL,
  description text,
  reference_id uuid,
  balance_after numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT transactions_type_check CHECK (type IN ('deposit', 'withdrawal', 'bid_hold', 'bid_release', 'purchase', 'refund', 'fee'))
);

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Function to end an auction and determine winner
CREATE OR REPLACE FUNCTION public.end_auction(vehicle_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  winning_bid_record RECORD;
  vehicle_record RECORD;
BEGIN
  -- Get the vehicle
  SELECT * INTO vehicle_record FROM vehicles WHERE id = vehicle_uuid;
  
  IF vehicle_record IS NULL THEN
    RAISE EXCEPTION 'Vehicle not found';
  END IF;

  -- Find the highest bid
  SELECT * INTO winning_bid_record
  FROM bids
  WHERE vehicle_id = vehicle_uuid
  ORDER BY amount DESC
  LIMIT 1;

  IF winning_bid_record IS NULL THEN
    -- No bids - mark as unsold
    UPDATE vehicles
    SET 
      auction_status = 'unsold',
      is_live = false,
      updated_at = now()
    WHERE id = vehicle_uuid;
  ELSE
    -- Has bids - mark as sold
    UPDATE vehicles
    SET 
      auction_status = 'sold',
      is_live = false,
      winner_id = winning_bid_record.user_id,
      winning_bid = winning_bid_record.amount,
      updated_at = now()
    WHERE id = vehicle_uuid;
    
    -- Create sale record
    INSERT INTO sales (vehicle_id, buyer_id, sale_amount, status)
    VALUES (vehicle_uuid, winning_bid_record.user_id, winning_bid_record.amount, 'pending_payment');
  END IF;
END;
$$;

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;