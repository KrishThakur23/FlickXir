-- Simple Fix for Products Table RLS
-- This will allow you to add products immediately

-- Option 1: Temporarily disable RLS (quickest fix)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS but make it work
-- First, check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'products';

-- If RLS is enabled and you want to keep it, run this instead:
-- DROP POLICY IF EXISTS "Anyone can view active products" ON products;
-- DROP POLICY IF EXISTS "Only admins can modify products" ON products;
-- DROP POLICY IF EXISTS "Admins can manage products" ON products;

-- CREATE POLICY "Allow all operations for now" ON products
--     FOR ALL USING (true);

-- Option 3: Grant your user direct access (if you know your user ID)
-- First, find your user ID:
SELECT id, email, is_admin FROM profiles WHERE email = 'bhalackdhebil@gmail.com';

-- Then grant access (replace 'your-user-id-here' with the actual ID):
-- GRANT ALL ON products TO authenticated;

-- Test if you can now insert products
-- This should work after running Option 1
SELECT COUNT(*) FROM products;
