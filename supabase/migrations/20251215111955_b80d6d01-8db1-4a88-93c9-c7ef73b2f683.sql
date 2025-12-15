-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  pin_hash TEXT,
  identity_photo_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create storage bucket for identity photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('identity-photos', 'identity-photos', false);

-- Storage policies for identity photos
CREATE POLICY "Users can upload own identity photo"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'identity-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own identity photo"
ON storage.objects
FOR SELECT
USING (bucket_id = 'identity-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own identity photo"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'identity-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();