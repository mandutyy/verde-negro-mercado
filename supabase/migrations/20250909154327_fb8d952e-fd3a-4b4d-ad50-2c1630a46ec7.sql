-- Create plants table for storing plant listings
CREATE TABLE public.plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2),
  exchange_for TEXT,
  location TEXT NOT NULL,
  sale_type TEXT NOT NULL, -- 'sell', 'exchange', 'gift', 'sell-exchange', etc.
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT DEFAULT 'active', -- 'active', 'sold', 'exchanged', 'hidden'
  views_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;

-- Create policies for plants
CREATE POLICY "Anyone can view active plants" 
ON public.plants 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Users can create their own plants" 
ON public.plants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plants" 
ON public.plants 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plants" 
ON public.plants 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create orders table for tracking purchases/exchanges
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  order_type TEXT NOT NULL, -- 'purchase', 'exchange', 'gift'
  amount DECIMAL(10,2), -- price paid (null for exchanges/gifts)
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  message TEXT, -- optional message from buyer
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for orders
CREATE POLICY "Users can view their own orders (buyer)" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = buyer_id);

CREATE POLICY "Users can view their own orders (seller)" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = seller_id);

CREATE POLICY "Users can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() = buyer_id AND buyer_id != seller_id);

CREATE POLICY "Sellers can update order status" 
ON public.orders 
FOR UPDATE 
USING (auth.uid() = seller_id);

-- Create trigger for automatic timestamp updates on plants
CREATE TRIGGER update_plants_updated_at
BEFORE UPDATE ON public.plants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on orders
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();