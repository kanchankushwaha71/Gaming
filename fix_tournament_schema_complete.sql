-- Complete Tournament Schema Fix for Epic Esports Platform
-- Execute this SQL in your Supabase Dashboard > SQL Editor

-- First, let's check what columns currently exist
DO $$ 
DECLARE
    col RECORD;
BEGIN
    RAISE NOTICE 'Current tournaments table columns:';
    FOR col IN 
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'Column: %, Type: %, Nullable: %, Default: %', 
            col.column_name, col.data_type, col.is_nullable, col.column_default;
    END LOOP;
END $$;

-- Add all missing columns to tournaments table
-- Banner and image columns
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS banner_image TEXT DEFAULT '/images/tournaments-bg.jpg';
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS game_image TEXT DEFAULT '/images/tournaments-bg.jpg';

-- Organizer columns (these are what your code expects)
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS organizer_name TEXT DEFAULT 'EpicEsports';
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS organizer_verified BOOLEAN DEFAULT false;
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS organizer_contact TEXT DEFAULT 'contact@epicesports.com';

-- Team and registration columns
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS current_teams INTEGER DEFAULT 0;
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS team_size INTEGER DEFAULT 1;
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS max_teams INTEGER DEFAULT 16;

-- Tournament details
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS rules TEXT DEFAULT 'Standard tournament rules apply';
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS location TEXT DEFAULT 'Online';

-- Handle existing columns that might conflict
DO $$ 
BEGIN
    -- Check if both entry_fee and registration_fee exist
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND column_name = 'entry_fee'
        AND table_schema = 'public'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND column_name = 'registration_fee'
        AND table_schema = 'public'
    ) THEN
        -- Both exist, drop entry_fee since registration_fee is what we want
        ALTER TABLE public.tournaments DROP COLUMN entry_fee;
        RAISE NOTICE 'Dropped duplicate entry_fee column (registration_fee already exists)';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND column_name = 'entry_fee'
        AND table_schema = 'public'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND column_name = 'registration_fee'
        AND table_schema = 'public'
    ) THEN
        -- Only entry_fee exists, rename it
        ALTER TABLE public.tournaments RENAME COLUMN entry_fee TO registration_fee;
        RAISE NOTICE 'Renamed entry_fee to registration_fee';
    END IF;
    
    -- Check if both max_participants and max_teams exist
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND column_name = 'max_participants'
        AND table_schema = 'public'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND column_name = 'max_teams'
        AND table_schema = 'public'
    ) THEN
        -- Both exist, drop max_participants since max_teams is what we want
        ALTER TABLE public.tournaments DROP COLUMN max_participants;
        RAISE NOTICE 'Dropped duplicate max_participants column (max_teams already exists)';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND column_name = 'max_participants'
        AND table_schema = 'public'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND column_name = 'max_teams'
        AND table_schema = 'public'
    ) THEN
        -- Only max_participants exists, rename it
        ALTER TABLE public.tournaments RENAME COLUMN max_participants TO max_teams;
        RAISE NOTICE 'Renamed max_participants to max_teams';
    END IF;
    
    -- Handle prize_pool type conversion if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND column_name = 'prize_pool'
        AND table_schema = 'public'
    ) THEN
        -- Check if it's integer and convert to text if needed
        IF (
            SELECT data_type = 'integer' 
            FROM information_schema.columns 
            WHERE table_name = 'tournaments' 
            AND column_name = 'prize_pool'
            AND table_schema = 'public'
        ) THEN
            ALTER TABLE public.tournaments ALTER COLUMN prize_pool TYPE TEXT;
            RAISE NOTICE 'Converted prize_pool from integer to text';
        END IF;
    END IF;
END $$;

-- Update existing tournaments to have default values for all new columns
UPDATE public.tournaments 
SET 
    banner_image = COALESCE(banner_image, '/images/tournaments-bg.jpg'),
    game_image = COALESCE(game_image, '/images/tournaments-bg.jpg'),
    organizer_name = COALESCE(organizer_name, 'EpicEsports'),
    organizer_verified = COALESCE(organizer_verified, false),
    organizer_contact = COALESCE(organizer_contact, 'contact@epicesports.com'),
    current_teams = COALESCE(current_teams, 0),
    team_size = COALESCE(team_size, 1),
    max_teams = COALESCE(max_teams, 16),
    is_public = COALESCE(is_public, true),
    rules = COALESCE(rules, 'Standard tournament rules apply'),
    location = COALESCE(location, 'Online'),
    format = COALESCE(format, 'single-elimination'),
    registration_fee = COALESCE(registration_fee, 0)
WHERE banner_image IS NULL 
   OR game_image IS NULL 
   OR organizer_name IS NULL 
   OR organizer_verified IS NULL
   OR organizer_contact IS NULL
   OR current_teams IS NULL
   OR team_size IS NULL
   OR max_teams IS NULL
   OR is_public IS NULL
   OR rules IS NULL
   OR location IS NULL
   OR format IS NULL
   OR registration_fee IS NULL;

-- Verify the final schema
DO $$ 
DECLARE
    col RECORD;
BEGIN
    RAISE NOTICE 'Final tournaments table schema:';
    FOR col IN 
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'tournaments' 
        AND table_schema = 'public'
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'Column: %, Type: %, Nullable: %, Default: %', 
            col.column_name, col.data_type, col.is_nullable, col.column_default;
    END LOOP;
END $$;

-- Show success message
SELECT 'Tournament schema fixed successfully! All required columns are now present.' AS result;
