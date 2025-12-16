'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function SetupPage() {
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [tablestatus, setTableStatus] = useState<'unknown' | 'checking' | 'exists' | 'missing'>('unknown');

  const playerProfilesSQL = `-- Player Profile Table Setup for Epic Esports
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
);`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(playerProfilesSQL);
      setCopiedSQL(true);
      setTimeout(() => setCopiedSQL(false), 2000);
    } catch (err) {
      console.error('Failed to copy SQL:', err);
    }
  };

  const checkTableStatus = async () => {
    setTableStatus('checking');
    try {
      const response = await fetch('/api/setup/player-profiles', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (response.ok && data.tableCreated === false) {
        setTableStatus('exists');
      } else {
        setTableStatus('missing');
      }
    } catch (error) {
      setTableStatus('missing');
    }
  };

  return (
    <div className="bg-dark-950 text-white min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-950 to-black"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 pt-20">
        {/* Header */}
        <div className="bg-hero-gradient py-16 border-b border-neon-blue/20">
          <div className="container mx-auto px-4">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl lg:text-5xl font-gaming font-bold text-gradient mb-4">Database Setup</h1>
              <p className="text-gray-300 text-lg">Set up your Supabase database for Epic Esports</p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Status Check */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-gaming mb-8"
          >
            <h2 className="section-title">Database Status</h2>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Player Profiles Table:</span>
              <div className="flex items-center space-x-4">
                {tablestatus === 'unknown' && (
                  <span className="text-gray-400">Unknown</span>
                )}
                {tablestatus === 'checking' && (
                  <span className="text-yellow-400">Checking...</span>
                )}
                {tablestatus === 'exists' && (
                  <span className="text-green-400">✅ Exists</span>
                )}
                {tablestatus === 'missing' && (
                  <span className="text-red-400">❌ Missing</span>
                )}
                <button
                  onClick={checkTableStatus}
                  disabled={tablestatus === 'checking'}
                  className="btn-gaming-outline"
                >
                  Check Status
                </button>
              </div>
            </div>
          </motion.div>

          {/* Setup Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card-gaming mb-8"
          >
            <h2 className="section-title">Setup Instructions</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-neon-blue rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <div>
                  <h3 className="font-semibold text-neon-blue">Open Supabase Dashboard</h3>
                  <p className="text-gray-300">Go to <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-neon-blue hover:underline">app.supabase.com</a> and open your project.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-neon-blue rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <div>
                  <h3 className="font-semibold text-neon-blue">Navigate to SQL Editor</h3>
                  <p className="text-gray-300">Click on "SQL Editor" in the left sidebar.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-neon-blue rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <div>
                  <h3 className="font-semibold text-neon-blue">Copy and Execute SQL</h3>
                  <p className="text-gray-300">Copy the SQL script below and paste it into a new query, then click "Run".</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-neon-blue rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <div>
                  <h3 className="font-semibold text-neon-blue">Verify Setup</h3>
                  <p className="text-gray-300">Come back to this page and click "Check Status" to verify the table was created.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* SQL Script */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card-gaming"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">SQL Script</h2>
              <button
                onClick={copyToClipboard}
                className={`btn-gaming-outline ${copiedSQL ? 'border-green-400 text-green-400' : ''}`}
              >
                {copiedSQL ? '✅ Copied!' : '📋 Copy SQL'}
              </button>
            </div>
            
            <div className="relative">
              <pre className="bg-dark-900 border border-neon-blue/20 rounded-xl p-4 overflow-x-auto text-sm">
                <code className="text-gray-300">{playerProfilesSQL}</code>
              </pre>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 