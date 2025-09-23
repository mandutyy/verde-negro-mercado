-- Crear tabla de reseñas/valoraciones de usuarios
CREATE TABLE public.user_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID NOT NULL,
  reviewed_user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Evitar reseñas duplicadas del mismo reviewer al mismo usuario
  UNIQUE(reviewer_id, reviewed_user_id)
);

-- Habilitar RLS
ALTER TABLE public.user_reviews ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Cualquiera puede ver las reseñas (para calcular valoraciones)
CREATE POLICY "Anyone can view user reviews" 
ON public.user_reviews 
FOR SELECT 
USING (true);

-- Los usuarios pueden crear reseñas (pero no de sí mismos)
CREATE POLICY "Users can create reviews of others" 
ON public.user_reviews 
FOR INSERT 
WITH CHECK (
  auth.uid() = reviewer_id AND 
  auth.uid() != reviewed_user_id
);

-- Los usuarios pueden actualizar sus propias reseñas
CREATE POLICY "Users can update their own reviews" 
ON public.user_reviews 
FOR UPDATE 
USING (auth.uid() = reviewer_id);

-- Los usuarios pueden eliminar sus propias reseñas
CREATE POLICY "Users can delete their own reviews" 
ON public.user_reviews 
FOR DELETE 
USING (auth.uid() = reviewer_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_user_reviews_updated_at
BEFORE UPDATE ON public.user_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();