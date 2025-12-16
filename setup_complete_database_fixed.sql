-- Complete Database Setup for Epic Esports Platform - FIXED VERSION
-- Execute this SQL in your Supabase Dashboard > SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to start fresh (be careful in production!)
DROP TABLE IF EXISTS public.registrations CASCADE;
DROP TABLE IF EXISTS public.tournaments CASCADE;
DROP TABLE IF EXISTS public.player_profiles CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;

-- 1. Create tournaments table
CREATE TABLE public.tournaments (
    id uuid not null default uuid_generate_v4(),
    name text not null,
    description text,
    game text not null,
    format text,
    entry_fee integer default 0,
    prize_pool integer default 0,
    max_participants integer,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    registration_deadline timestamp with time zone,
    status text default 'upcoming'::text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    constraint tournaments_pkey primary key (id),
    constraint tournaments_status_check check (
        status = any (array[
            'upcoming'::text,
            'ongoing'::text,
            'completed'::text,
            'cancelled'::text
        ])
    )
);

-- 2. Create registrations table
CREATE TABLE public.registrations (
    id uuid not null default uuid_generate_v4(),
    tournament_id uuid not null,
    user_id text not null,
    player_name text not null,
    email text not null,
    team_name text,
    status text default 'pending'::text,
    payment_status text default 'pending'::text,
    payment_id text,
    razorpay_order_id text,
    razorpay_payment_id text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    constraint registrations_pkey primary key (id),
    constraint registrations_tournament_id_fkey foreign key (tournament_id) references tournaments(id) on delete cascade,
    constraint registrations_status_check check (
        status = any (array[
            'pending'::text,
            'confirmed'::text,
            'cancelled'::text
        ])
    ),
    constraint registrations_payment_status_check check (
        payment_status = any (array[
            'pending'::text,
            'paid'::text,
            'failed'::text,
            'free'::text
        ])
    )
);

-- 3. Create player_profiles table
CREATE TABLE public.player_profiles (
    id uuid not null default uuid_generate_v4(),
    user_id uuid null,
    username text not null,
    display_name text null,
    bio text null,
    main_game text null,
    country text null,
    state text null,
    city text null,
    location text null,
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
);

-- 4. Create events table
CREATE TABLE public.events (
    id uuid not null default uuid_generate_v4(),
    title text not null,
    description text,
    image_url text,
    category text,
    event_date timestamp with time zone,
    location text,
    entry_fee integer default 0,
    max_participants integer,
    status text default 'upcoming'::text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    constraint events_pkey primary key (id),
    constraint events_status_check check (
        status = any (array[
            'upcoming'::text,
            'ongoing'::text,
            'completed'::text,
            'cancelled'::text
        ])
    )
);

-- Enable RLS on all tables
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development (you can make these more restrictive later)
-- Tournaments policies
CREATE POLICY "Allow all operations on tournaments"
    ON public.tournaments
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Registrations policies
CREATE POLICY "Allow all operations on registrations"
    ON public.registrations
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Player profiles policies
CREATE POLICY "Allow all operations on player_profiles"
    ON public.player_profiles
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Events policies
CREATE POLICY "Allow all operations on events"
    ON public.events
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.tournaments TO authenticated;
GRANT ALL ON public.registrations TO authenticated;
GRANT ALL ON public.player_profiles TO authenticated;
GRANT ALL ON public.events TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create indexes for better performance
CREATE INDEX idx_tournaments_game ON public.tournaments(game);
CREATE INDEX idx_tournaments_status ON public.tournaments(status);
CREATE INDEX idx_tournaments_start_date ON public.tournaments(start_date);

CREATE INDEX idx_registrations_tournament_id ON public.registrations(tournament_id);
CREATE INDEX idx_registrations_user_id ON public.registrations(user_id);
CREATE INDEX idx_registrations_status ON public.registrations(status);

CREATE INDEX idx_player_profiles_user_id ON public.player_profiles(user_id);
CREATE INDEX idx_player_profiles_username ON public.player_profiles(username);
CREATE INDEX idx_player_profiles_main_game ON public.player_profiles(main_game);

CREATE INDEX idx_events_event_date ON public.events(event_date);
CREATE INDEX idx_events_status ON public.events(status);

-- Insert some sample data for testing
INSERT INTO public.tournaments (name, description, game, entry_fee, max_participants, start_date, end_date, registration_deadline)
VALUES 
    ('Valorant Champions Cup', 'Epic Valorant tournament with amazing prizes!', 'Valorant', 100, 64, now() + interval '7 days', now() + interval '10 days', now() + interval '5 days'),
    ('CS:GO Pro League', 'Professional CS:GO competition', 'CS:GO', 150, 32, now() + interval '14 days', now() + interval '17 days', now() + interval '12 days'),
    ('Free Fire Battle Royale', 'Free to play tournament for everyone', 'Free Fire', 0, 100, now() + interval '3 days', now() + interval '5 days', now() + interval '2 days');

-- Insert sample events
INSERT INTO public.events (title, description, category, event_date, location, entry_fee, max_participants)
VALUES 
    ('Weekly Gaming Meetup', 'Join us for a casual gaming session with fellow gamers', 'Community', now() + interval '2 days', 'Community Center', 0, 50),
    ('Esports Workshop', 'Learn from professional players and coaches', 'Educational', now() + interval '5 days', 'Gaming Arena', 50, 30);

SELECT 'Database setup completed successfully! All tables, policies, and sample data have been created.' AS result;
