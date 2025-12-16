-- Make user admin in the database
-- Execute this SQL in your Supabase Dashboard > SQL Editor

-- First, add the role column to player_profiles if it doesn't exist
ALTER TABLE public.player_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';

-- Method 1: Update by matching user_id with proper casting
UPDATE public.player_profiles 
SET role = 'admin' 
WHERE user_id = (
    SELECT user_id 
    FROM public.user_auth 
    WHERE email = 'shubhamkush012@gmail.com'
);

-- Method 2: Alternative - Update by casting both sides to text for comparison
UPDATE public.player_profiles 
SET role = 'admin' 
WHERE user_id::text = (
    SELECT user_id 
    FROM public.user_auth 
    WHERE email = 'shubhamkush012@gmail.com'
);

-- Method 3: Simple direct update using known email
UPDATE public.player_profiles 
SET role = 'admin' 
WHERE id IN (
    SELECT DISTINCT pp.id 
    FROM public.player_profiles pp
    INNER JOIN public.user_auth ua ON pp.user_id::text = ua.user_id
    WHERE ua.email = 'shubhamkush012@gmail.com'
);

-- Also update in user_auth table
ALTER TABLE public.user_auth ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';
UPDATE public.user_auth 
SET role = 'admin' 
WHERE email = 'shubhamkush012@gmail.com';

-- Verify the update
SELECT 
    pp.id,
    pp.username,
    pp.display_name,
    pp.role as profile_role,
    ua.email,
    ua.role as auth_role
FROM public.player_profiles pp
LEFT JOIN public.user_auth ua ON pp.id = ua.user_id
WHERE ua.email = 'shubhamkush012@gmail.com' OR pp.role = 'admin';

SELECT 'Admin role assigned successfully!' AS result;
