-- Complete Fix for Products Table RLS Issues
-- This script will resolve all RLS-related problems

-- Step 1: Check current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'products';

-- Step 2: Check current policies
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

-- Step 3: Drop ALL existing policies on products table
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Only admins can modify products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;

-- Step 4: Create new, working policies
-- Policy 1: Anyone can view active products
CREATE POLICY "Anyone can view active products" ON products
    FOR SELECT USING (is_active = true);

-- Policy 2: Admins can do everything (INSERT, UPDATE, DELETE)
CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Step 5: Make sure your profile has admin privileges
-- Replace 'your-email@example.com' with your actual email
UPDATE profiles 
SET is_admin = true 
WHERE email = 'bhalackdhebil@gmail.com';

-- Step 6: Verify the update worked
SELECT 
    id,
    email,
    first_name,
    is_admin,
    created_at
FROM profiles 
WHERE email = 'bhalackdhebil@gmail.com';

-- Step 7: Test if you can now see products
SELECT COUNT(*) FROM products;

-- Step 8: If still having issues, temporarily disable RLS (for testing only)
-- ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Step 9: Re-enable RLS after testing (if you disabled it)
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Step 10: Final verification of policies
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
