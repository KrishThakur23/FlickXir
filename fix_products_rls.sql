-- Fix Products Table RLS Policies
-- This script fixes the Row Level Security policies that are preventing admin operations

-- First, let's check the current RLS policies on the products table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'products';

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Only admins can modify products" ON products;

-- Create a new, more permissive policy for admin operations
CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Alternative: If you want to temporarily disable RLS for testing (NOT recommended for production)
-- ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Verify the new policy
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'products';

-- Make sure your profile has admin privileges
UPDATE profiles 
SET is_admin = true 
WHERE email = 'bhalackdhebil@gmail.com'; -- Replace with your actual email

-- Test the policy by checking if you can see products
-- This should work now
SELECT COUNT(*) FROM products;
