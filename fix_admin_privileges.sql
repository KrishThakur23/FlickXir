-- Fix Admin Privileges for Products Table
-- This script grants admin privileges to your profile so you can add/delete products

-- First, let's see what email you're currently signed in with
-- Check your current profile
SELECT 
    id,
    email,
    first_name,
    is_admin,
    created_at
FROM profiles 
WHERE email = 'bhalackdhebil@gmail.com'; -- Replace with your actual email

-- Grant admin privileges to your profile
UPDATE profiles 
SET is_admin = true 
WHERE email = 'bhalackdhebil@gmail.com'; -- Replace with your actual email

-- Verify the update
SELECT 
    id,
    email,
    first_name,
    is_admin,
    created_at
FROM profiles 
WHERE email = 'bhalackdhebil@gmail.com'; -- Replace with your actual email

-- Alternative: If you want to grant admin to any profile by email, you can run:
-- UPDATE profiles SET is_admin = true WHERE email = 'your-email@example.com';

-- Note: After running this, you should be able to add/delete products from the Admin Dashboard
-- The RLS policy "Only admins can modify products" will now allow your operations
