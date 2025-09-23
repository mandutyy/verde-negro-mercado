-- Add foreign key constraint between favorites and plants tables
ALTER TABLE public.favorites 
ADD CONSTRAINT favorites_plant_id_fkey 
FOREIGN KEY (plant_id) REFERENCES public.plants(id) ON DELETE CASCADE;