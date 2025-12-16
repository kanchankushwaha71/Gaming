# Fix 500 Error - Database Setup Required

## Current Issue
You're getting a 500 error when trying to update your profile because the `player_profiles` table doesn't exist in your Supabase database.

## Quick Fix Steps

### Step 1: Access Your Supabase Dashboard
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Open your project: `cfgxshnrcogvosjukytk`

### Step 2: Open SQL Editor
1. Click on "SQL Editor" in the left sidebar
2. Click "New query" to create a new SQL script

### Step 3: Execute the Setup Script
Copy and paste the following SQL script and click "Run":

```sql
-- Player Profile Table Setup for Epic Esports
-- Execute this SQL in your Supabase Dashboard > SQL Editor

-- Drop the table if it exists, including any dependent objects like views
DROP TABLE IF EXISTS public.player_profiles CASCADE;

-- Create the player profiles table with proper structure
CREATE TABLE public.player_profiles (
  id uuid not null default extensions.uuid_generate_v4(),
  user_id uuid null, -- Kept as UUID but NULL allowed for development
  username text not null,
  display_name text null,
  bio text null,
  main_game text null,
  country text null,
  state text null,
  city text null,
  location text null, -- Combined location field for backward compatibility
  birth_date date null,
  avatar_url text null,
  banner_url text null,
  social_links jsonb null default '[]'::jsonb,
  experience_level text null,
  achievements jsonb null default '[]'::jsonb,
  total_tournaments integer null default 0,
  tournaments_won integer null default 0,
  total_matches integer null default 0,
  matches_won integer null default 0,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint player_profiles_pkey primary key (id),
  constraint player_profiles_username_key unique (username),
  constraint player_profiles_experience_level_check check (
    experience_level is null or (
      experience_level = any (
        array[
          'beginner'::text,
          'intermediate'::text,
          'advanced'::text,
          'professional'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

-- Enable RLS on the table
ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_player_profiles_user_id ON public.player_profiles USING btree (user_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_player_profiles_username ON public.player_profiles USING btree (username) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_player_profiles_main_game ON public.player_profiles USING btree (main_game) TABLESPACE pg_default;

-- Allow all operations for development
CREATE POLICY "Allow all operations for development"
   ON public.player_profiles
   FOR ALL
   USING (true)
   WITH CHECK (true);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.player_profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Insert test data
INSERT INTO public.player_profiles (
    username, 
    display_name, 
    main_game, 
    bio,
    country,
    experience_level,
    avatar_url,
    social_links
) VALUES (
    'test_player',
    'Test Player',
    'Valorant',
    'This is a test player profile for development',
    'United States',
    'intermediate',
    'https://i.pravatar.cc/300',
    '[{"platform": "twitch", "url": "https://twitch.tv/test_player"}, {"platform": "twitter", "url": "https://twitter.com/test_player"}]'::jsonb
);
```

### Step 4: Verify Setup
1. After running the script, you should see "Success. No rows returned" or similar
2. Go to your website and visit: `http://localhost:3000/setup`
3. Click "Check Status" to verify the table was created

### Step 5: Test the Fix
1. Go back to your account page: `http://localhost:3000/account`
2. Try updating your profile - the 500 error should be resolved

## Alternative Setup Page
You can also use the built-in setup page:
- Visit: `http://localhost:3000/setup`
- Follow the instructions on that page
- Copy the SQL script and run it in Supabase

## What This Fixes
- ✅ Resolves the 500 error when updating profiles
- ✅ Creates the necessary database table structure
- ✅ Sets up proper permissions and security policies
- ✅ Adds test data for development

## If You Still Get Errors
If you continue to see errors after setting up the table:

1. **Check your Supabase credentials** in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **Restart your development server**:
   ```bash
   npm run dev
   ```

3. **Check the browser console and server logs** for any additional error details

## Need Help?
If you're still having issues, please share:
1. The exact error message from the browser console
2. Any server-side error logs
3. Confirmation that the SQL script ran successfully in Supabase 