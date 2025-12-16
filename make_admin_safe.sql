-- Safe way to make user admin (avoids type casting issues)
-- Execute this SQL in your Supabase Dashboard > SQL Editor

-- Add role column if it doesn't exist
ALTER TABLE public.player_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';
ALTER TABLE public.user_auth ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';

-- Step 1: Update user_auth table (this always works)
UPDATE public.user_auth 
SET role = 'admin' 
WHERE email = 'shubhamkush012@gmail.com';

-- Step 2: Find your user ID by displaying the data
SELECT 'Your user details:' as info, email, user_id, role 
FROM public.user_auth 
WHERE email = 'shubhamkush012@gmail.com';

-- Step 3: Check player_profiles structure
SELECT 'Player profiles sample:' as info, id, user_id, username, display_name, role 
FROM public.player_profiles 
LIMIT 3;

-- Step 4: Simple update based on your known username/display_name
UPDATE public.player_profiles 
SET role = 'admin' 
WHERE username IN ('admins', 'admin') 
   OR display_name IN ('admin', 'Admin');

-- Step 5: Alternative - update ALL profiles where user matches your email
-- This uses a safer approach with INNER JOIN
UPDATE public.player_profiles 
SET role = 'admin' 
FROM public.user_auth 
WHERE public.user_auth.email = 'shubhamkush012@gmail.com'
  AND public.player_profiles.user_id::text = public.user_auth.user_id;

-- Step 6: Verify results
SELECT 'Admin users found:' as info;
SELECT pp.id, pp.username, pp.display_name, pp.role, ua.email
FROM public.player_profiles pp
LEFT JOIN public.user_auth ua ON pp.user_id::text = ua.user_id
WHERE pp.role = 'admin' OR ua.email = 'shubhamkush012@gmail.com';

SELECT 'Setup completed! If no admin users found above, copy your user_id from step 2 and run:' as final_step;
SELECT 'UPDATE public.player_profiles SET role = ''admin'' WHERE id = ''paste-your-id-here'';' as manual_command;

