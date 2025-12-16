/**
 * This file provides a modified Supabase client that bypasses row-level security.
 * USE ONLY FOR DEVELOPMENT when you're experiencing RLS issues.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Standard client with limited permissions
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

// Admin client with full permissions - use on server side only
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Create a function to bypass RLS for development user profiles
export async function getUserProfileNoRLS(userId: string) {
  if (!supabaseAdmin) {
    console.error('Admin client not available');
    return null;
  }
  
  try {
    // Try user_profiles first
    let { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code === '42P01') { // relation does not exist
      // If user_profiles doesn't exist, try player_profiles
      const result = await supabaseAdmin
        .from('player_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      data = result.data;
      error = result.error;
    }
    
    if (error && error.message.includes('does not exist')) {
      // Try to insert a stub profile
      console.log('Profile does not exist, creating a stub');
      
      try {
        const username = `user_${Math.floor(Math.random() * 10000)}`;
        
        const { data: newProfile, error: insertError } = await supabaseAdmin
          .from('user_profiles')
          .insert({
            user_id: userId,
            username,
            display_name: 'New User',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (insertError) {
          console.error('Failed to create profile:', insertError);
        } else {
          return newProfile;
        }
      } catch (e) {
        console.error('Error creating stub profile:', e);
      }
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserProfileNoRLS:', error);
    return null;
  }
}

// Create a function to register for tournaments bypassing RLS
export async function registerForTournamentNoRLS(
  playerId: string, 
  tournamentId: string, 
  teamData: any = {}, 
  userId: string = ''
) {
  if (!supabaseAdmin) {
    console.error('Admin client not available');
    return { success: false, error: 'Admin client not available' };
  }
  
  try {
    // If userId is not provided, use playerId as a fallback
    const userIdToUse = userId || playerId;
    
    const registrationData = {
      player_id: playerId,
      tournament_id: tournamentId,
      user_id: userIdToUse,
      team_data: teamData,
      team_name: teamData.teamName || 'Team',
      status: 'registered',
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabaseAdmin
      .from('registrations')
      .insert([registrationData])
      .select();
    
    if (error) {
      console.error('Error registering for tournament:', error);
      return { success: false, error };
    }
    
    // Update current_teams count in the tournament
    await supabaseAdmin.rpc('increment_tournament_teams', { tournament_id: tournamentId });
    
    return { 
      success: true, 
      registration: data[0]
    };
  } catch (error) {
    console.error('Failed to register for tournament:', error);
    return { success: false, error };
  }
} 
 
 