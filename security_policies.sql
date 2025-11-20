-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public read access" ON public.parkingSpots;
DROP POLICY IF EXISTS "Admins can manage parking Spots" ON public.parkingSpots;
DROP POLICY IF EXISTS "Public read access" ON public.bicycleservice;
DROP POLICY IF EXISTS "Admins can manage bicycle services" ON public.bicycleservice;
DROP POLICY IF EXISTS "Public read access" ON public.repairstation;
DROP POLICY IF EXISTS "Admins can manage repair stations" ON public.repairstation;

-- Create a security definer function to check if user is admin
-- This avoids infinite recursion by bypassing RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parkingSpots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bicycleservice ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repairstation ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
-- Allow users to view their own profile OR if they are admin
CREATE POLICY "Users can view own profile or admins view all" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Parking Spots Policies
-- Allow public read access
CREATE POLICY "Public read access" ON public.parkingSpots
  FOR SELECT USING (true);

-- Allow admins to insert/update/delete
CREATE POLICY "Admins can manage parking Spots" ON public.parkingSpots
  FOR ALL USING (public.is_admin());

-- Bicycle Service Policies
-- Allow public read access
CREATE POLICY "Public read access" ON public.bicycleservice
  FOR SELECT USING (true);

-- Allow admins to manage
CREATE POLICY "Admins can manage bicycle services" ON public.bicycleservice
  FOR ALL USING (public.is_admin());

-- Repair Station Policies
-- Allow public read access
CREATE POLICY "Public read access" ON public.repairstation
  FOR SELECT USING (true);

-- Allow admins to manage
CREATE POLICY "Admins can manage repair stations" ON public.repairstation
  FOR ALL USING (public.is_admin());
