-- Create reservations table
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plant_id UUID NOT NULL,
  requester_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(plant_id, requester_id, status) -- Prevent duplicate pending reservations
);

-- Enable Row Level Security
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Create policies for reservations
CREATE POLICY "Users can create reservation requests" 
ON public.reservations 
FOR INSERT 
WITH CHECK (auth.uid() = requester_id AND requester_id != seller_id);

CREATE POLICY "Users can view their reservation requests" 
ON public.reservations 
FOR SELECT 
USING (auth.uid() = requester_id OR auth.uid() = seller_id);

CREATE POLICY "Sellers can update reservation status" 
ON public.reservations 
FOR UPDATE 
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_reservations_updated_at
BEFORE UPDATE ON public.reservations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle reservation acceptance
CREATE OR REPLACE FUNCTION public.handle_reservation_acceptance()
RETURNS TRIGGER AS $$
BEGIN
  -- If reservation is accepted, update plant status to reserved
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    UPDATE plants 
    SET status = 'reserved', updated_at = now()
    WHERE id = NEW.plant_id;
    
    -- Decline all other pending reservations for this plant
    UPDATE reservations 
    SET status = 'declined', updated_at = now()
    WHERE plant_id = NEW.plant_id 
      AND id != NEW.id 
      AND status = 'pending';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for reservation acceptance
CREATE TRIGGER on_reservation_status_change
  AFTER UPDATE ON public.reservations
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.handle_reservation_acceptance();