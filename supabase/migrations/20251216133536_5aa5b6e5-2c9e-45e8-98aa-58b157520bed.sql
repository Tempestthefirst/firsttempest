-- Add pin_salt column to profiles table for unique per-user salts
ALTER TABLE public.profiles ADD COLUMN pin_salt text;