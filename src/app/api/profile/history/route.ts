import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabase, supabaseAdmin } from '@/lib/supabase';

/**
 * GET player tournament history
 * Returns the tournament history of the current authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    // Get the user from the session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    let userId = session.user.id;
    const originalUserId = userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 400 }
      );
    }
    
    console.log('DEBUG: Profile history - Original user ID from session:', originalUserId);
    console.log('DEBUG: Profile history - User email from session:', session.user.email);
    
    // Validate if the user ID is in UUID format and convert consistently using SAME method as registration
    try {
      // Dynamically import the uuid package
      const { validate: isValidUUID, v5: uuidv5 } = await import('uuid');
      
      // If the user ID is not a valid UUID (likely from a different auth provider like MongoDB)
      // We need to generate a valid UUID for Supabase using the SAME method as registration API
      if (!isValidUUID(userId)) {
        console.log('DEBUG: Profile history - User ID is not in UUID format, generating deterministic UUID...');
        // Generate a deterministic UUID v5 using the user ID as namespace
        // Use the SAME fixed namespace as registration API (DNS namespace)
        const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
        userId = uuidv5(userId, NAMESPACE);
        console.log('DEBUG: Profile history - Generated deterministic UUID:', userId);
      }
    } catch (uuidError) {
      console.error('Error validating/generating UUID:', uuidError);
      // If there's an error with UUID validation, use the original userId
      console.log('DEBUG: Profile history - Using original user ID due to UUID error');
    }
    
    // Get tournament registrations directly from the database
    try {      
      if (!supabaseAdmin) {
        return NextResponse.json({ 
          registrations: [], 
          error: 'Database configuration error' 
        }, { status: 500 });
      }
      
      // First, let's see what registrations exist in the database
      const { data: allRegistrations, error: allError } = await supabaseAdmin
        .from('registrations')
        .select('user_id, tournament_id, status, created_at')
        .limit(10);
      
      if (!allError && allRegistrations) {
        console.log('DEBUG: Profile history - Sample registrations in database:', allRegistrations);
      }
      
              // Try to find player by email first
        let playerIdFromEmail = null;
        if (session.user.email && supabaseAdmin) {
          const { data: playerByEmail } = await supabaseAdmin
            .from('players')
            .select('id')
            .eq('email', session.user.email)
            .maybeSingle();
          
        if (playerByEmail) {
          playerIdFromEmail = playerByEmail.id;
          console.log('DEBUG: Profile history - Found player ID by email:', playerIdFromEmail);
        }
      }
      
      // Create list of player IDs to try
      const playerIdsToTry = [userId, originalUserId];
      if (playerIdFromEmail && !playerIdsToTry.includes(playerIdFromEmail)) {
        playerIdsToTry.push(playerIdFromEmail);
      }
      
      let registrations = null;
      let error = null;
      
              // Try each player ID until we find registrations
        for (const playerId of playerIdsToTry) {
          console.log('DEBUG: Profile history - Trying player ID:', playerId);
          
          if (!supabaseAdmin) {
            console.error('supabaseAdmin is not available');
            break;
          }
          
          const { data: regData, error: regError } = await supabaseAdmin
        .from('registrations')
        .select(`
          id,
          tournament_id,
          team_name,
          player_name,
          status,
          payment_status,
          created_at,
          tournaments!inner (
            name,
            game,
            start_date
          )
        `)
            .eq('user_id', playerId)
            .in('status', ['pending', 'confirmed', 'registered']) // Show all non-cancelled statuses
        .order('created_at', { ascending: false });
      
        console.log(`DEBUG: Profile history - Query result for ${playerId}:`, { 
          registrationsFound: regData?.length || 0, 
          error: regError?.message 
        });
        
        if (!regError && regData && regData.length > 0) {
          registrations = regData;
          console.log(`DEBUG: Profile history - Found ${regData.length} registrations with player ID: ${playerId}`);
          break;
        }
      }
      
      if (registrations && registrations.length > 0) {
        console.log('DEBUG: Profile history - Found registrations:', registrations.map(r => ({
          id: r.id,
          tournamentId: r.tournament_id,
          teamName: r.team_name,
          playerName: r.player_name,
          status: r.status,
          paymentStatus: r.payment_status
        })));
      }
      
      if (error) {
        console.error('Error fetching registrations:', error);
        return NextResponse.json(
          { error: 'Failed to fetch tournament history' },
          { status: 500 }
        );
      }
      
      if (!registrations || registrations.length === 0) {
        console.log('No registrations found for any of the tried player IDs');
        return NextResponse.json({ registrations: [] });
      }
      
      // Transform the registrations to the expected format
      const formattedHistory = registrations.map((reg: any) => ({
        registrationId: reg.id,
        tournamentId: reg.tournament_id,
        tournamentName: reg.tournaments?.name || `Tournament ${reg.tournament_id.substring(0, 8)}`,
        game: reg.tournaments?.game || 'Game',
        startDate: reg.tournaments?.start_date || reg.created_at,
        teamName: reg.team_name || reg.player_name || 'Individual',
        registrationStatus: reg.status || 'pending',
        paymentStatus: reg.payment_status || 'pending',
        registrationDate: reg.created_at
      }));
      
      console.log(`Found ${formattedHistory.length} registrations for user ${userId}:`, formattedHistory);
      return NextResponse.json({ registrations: formattedHistory });
    } catch (dbError) {
      console.error('Database error when fetching tournament history:', dbError);
      return NextResponse.json({ 
        registrations: [], 
        error: 'Error fetching tournament history' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching tournament history:', error);
    return NextResponse.json({ 
      registrations: [], 
      error: 'Error fetching tournament history' 
    }, { status: 500 });
  }
}
