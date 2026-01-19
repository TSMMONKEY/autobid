
-- Create user_registration table to track registration completion status
CREATE TABLE public.user_registration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  identification_complete boolean NOT NULL DEFAULT false,
  address_complete boolean NOT NULL DEFAULT false,
  contact_complete boolean NOT NULL DEFAULT false,
  terms_accepted boolean NOT NULL DEFAULT false,
  privacy_accepted boolean NOT NULL DEFAULT false,
  deposit_paid boolean NOT NULL DEFAULT false,
  deposit_amount numeric DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_registration ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own registration"
  ON public.user_registration FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own registration"
  ON public.user_registration FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own registration"
  ON public.user_registration FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to auto-create registration record on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_registration (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created_registration
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_registration();

-- Update updated_at trigger
CREATE TRIGGER update_user_registration_updated_at
  BEFORE UPDATE ON public.user_registration
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
