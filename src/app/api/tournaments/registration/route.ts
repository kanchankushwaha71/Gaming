import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * POST to register a user for a tournament
 */
export async function POST(req: NextRequest) {
  try {
    // Check if supabaseAdmin is available
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database configuration error' }, { status: 500 });
    }
    // Get the user from the session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const data = await req.json();
    
    // Validate required fields
    if (!data.tournamentId) {
      return NextResponse.json(
        { error: 'Tournament ID is required' },
        { status: 400 }
      );
    }

    // Verify tournament exists with timeout
    console.log('Checking if tournament exists:', data.tournamentId);
    const tournamentPromise = supabaseAdmin
      .from('tournaments')
      .select('id, name, status')
      .eq('id', data.tournamentId)
      .single();
    
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Tournament check timeout')), 10000) // 10 second timeout
    );
    
    let tournament, tournamentError;
    try {
      const result = await Promise.race([tournamentPromise, timeoutPromise]);
      tournament = (result as any).data;
      tournamentError = (result as any).error;
    } catch (error: any) {
      if (error.message === 'Tournament check timeout') {
        console.log('Tournament check timed out, proceeding with registration...');
        tournament = null;
        tournamentError = null;
      } else {
        tournamentError = error;
      }
    }

    if (tournamentError) {
      console.error('Error checking tournament:', tournamentError);
      console.error('Tournament error details:', JSON.stringify(tournamentError, null, 2));
      
      // If it's just a network error, allow registration to proceed
      if (tournamentError.message?.includes('fetch failed') || tournamentError.message?.includes('timeout')) {
        console.log('Tournament check failed due to network, proceeding anyway...');
      } else {
        return NextResponse.json(
          { error: 'Tournament not found' },
          { status: 404 }
        );
      }
    }

    if (tournament) {
      console.log('Tournament found:', tournament.name);
    } else {
      console.log('Tournament not found, but proceeding with registration...');
    }
    
    // Get the user ID
    const userId = session.user.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 400 }
      );
    }

    // Check if supabaseAdmin is available
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database admin access not available' },
        { status: 500 }
      );
    }

    // Check if user is already registered for this tournament with timeout
    const existingRegistrationPromise = supabaseAdmin
      .from('registrations')
      .select('id, status, payment_status, created_at')
      .eq('tournament_id', data.tournamentId)
      .eq('user_id', userId)
      .maybeSingle();
    
    const checkTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Registration check timeout')), 8000) // 8 second timeout
    );
    
    let existingRegistration, checkError;
    try {
      const result = await Promise.race([existingRegistrationPromise, checkTimeoutPromise]);
      existingRegistration = (result as any).data;
      checkError = (result as any).error;
    } catch (error: any) {
      if (error.message === 'Registration check timeout') {
        console.log('Registration check timed out, proceeding with new registration...');
        existingRegistration = null;
        checkError = null;
      } else {
        checkError = error;
      }
    }

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found (expected)
      console.error('Error checking existing registration:', checkError);
      console.error('Database error details:', JSON.stringify(checkError, null, 2));
      
      // Handle specific error types
      if (checkError.message?.includes('fetch failed') || checkError.message?.includes('timeout')) {
        return NextResponse.json(
          { error: 'Database connection timeout. Please try again.' },
          { status: 503 } // Service Temporarily Unavailable
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to check existing registration' },
        { status: 500 }
      );
    }

    console.log('Registration check results:', {
      userId: userId,
      tournamentId: data.tournamentId,
      existingRegistration: existingRegistration,
      checkError: checkError
    });

    if (existingRegistration) {
      console.log('Found existing registration:', JSON.stringify(existingRegistration, null, 2));
      
      // If the existing registration is in pending status and older than 30 minutes, allow re-registration
      const registrationAge = existingRegistration.created_at ? 
        Date.now() - new Date(existingRegistration.created_at).getTime() : 0;
      const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in milliseconds
      
      if (existingRegistration.status === 'pending' && existingRegistration.payment_status === 'pending' && registrationAge > thirtyMinutes) {
        console.log(`Allowing re-registration: existing registration is ${registrationAge/1000/60} minutes old and still pending`);
        
        // Delete the old pending registration
        const { error: deleteError } = await supabaseAdmin
          .from('registrations')
          .delete()
          .eq('id', existingRegistration.id);
          
        if (deleteError) {
          console.error('Error deleting old registration:', deleteError);
        } else {
          console.log('Successfully deleted old pending registration');
        }
      } else {
        return NextResponse.json(
          { 
            error: 'You are already registered for this tournament',
            details: {
              registrationId: existingRegistration.id,
              status: existingRegistration.status,
              paymentStatus: existingRegistration.payment_status,
              registeredAt: existingRegistration.created_at
            }
          },
          { status: 400 }
        );
      }
    }

    // Variable to store the final player ID to use
    let playerId: string | null = null;

    // First, check if player exists by ID or email
    let { data: existingPlayer, error: playerCheckError } = await supabaseAdmin
      .from('players')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    // If not found by ID, try finding by email
    if (!existingPlayer && session.user.email) {
      const { data: playerByEmail } = await supabaseAdmin
        .from('players')
        .select('id')
        .eq('email', session.user.email)
        .maybeSingle();
      
      if (playerByEmail) {
        console.log('Found existing player by email:', playerByEmail.id);
        existingPlayer = playerByEmail;
      }
    }

    if (playerCheckError && playerCheckError.code !== 'PGRST116') {
      console.error('Error checking player existence:', playerCheckError);
      return NextResponse.json(
        { error: 'Failed to verify player information' },
        { status: 500 }
      );
    }

    // If player doesn't exist, create them
    if (!existingPlayer) {
      console.log('Creating new player record for user:', userId);
      
      const playerData = {
        id: userId, // Use the NextAuth user ID as UUID
        username: session.user.email?.split('@')[0] || `user_${userId.substring(0, 8)}`,
        display_name: session.user.name || 'Player',
        email: session.user.email,
        main_game: 'unknown',
        user_id: userId // Also store in user_id field for auth relationship
      };

      const { data: newPlayer, error: playerCreateError } = await supabaseAdmin
        .from('players')
        .insert([playerData])
        .select()
        .single();

      if (playerCreateError) {
        console.error('Error creating player:', playerCreateError);
        // If UUID issue, try alternative approach without setting ID
        console.log('Trying alternative player creation...');
        
        const altPlayerData = {
          username: session.user.email?.split('@')[0] || `user_${Date.now()}`,
          display_name: session.user.name || 'Player',
          email: session.user.email,
          main_game: 'unknown',
          user_id: userId
        };

        const { data: altPlayer, error: altError } = await supabaseAdmin
          .from('players')
          .insert([altPlayerData])
          .select()
          .single();

        if (altError) {
          console.error('Alternative player creation failed:', altError);
        } else {
          console.log('Created player with auto-generated ID:', altPlayer.id);
          // Update registrationData to use the new player ID (will be declared below)
          playerId = altPlayer.id;
        }
      } else {
        console.log('Created player successfully:', newPlayer.id);
        playerId = newPlayer.id;
      }
    }

    // Use the determined player ID (either existing player, new player, or alternative player)
    const finalPlayerId = playerId || existingPlayer?.id || userId;

    // Create the registration using admin client to bypass RLS
    // Map to the actual database columns
    let registrationData = {
      tournament_id: data.tournamentId,
      user_id: finalPlayerId,
      player_name: data.leaderName || session.user.name || 'Player',
      email: data.leaderEmail || session.user.email || '',
      team_name: data.teamName || null,
      status: 'pending', // Use 'pending' as per database schema
      payment_status: 'pending'
    };

    console.log('Creating registration with data:', JSON.stringify(registrationData, null, 2));
    
    let { data: registration, error: insertError } = await supabaseAdmin
      .from('registrations')
      .insert([registrationData])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating registration:', insertError);
      console.error('Registration data that failed:', JSON.stringify(registrationData, null, 2));
      console.error('Error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
      
      // Handle specific error cases
      if (insertError.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'You are already registered for this tournament' },
          { status: 400 }
        );
      }
      
      // Handle missing required fields
      if (insertError.code === '23502') { // Not null violation
        return NextResponse.json(
          { error: `Missing required field: ${insertError.message}` },
          { status: 400 }
        );
      }
      
      // Handle foreign key violations
      if (insertError.code === '23503') { // Foreign key violation
        console.log('Foreign key constraint error detected');
      }
      
      // If foreign key constraint error, try without player_id
      if (insertError.code === '23503') {
        console.log('Foreign key constraint error, trying alternative registration approach...');
        
        // Try registration without the user_id foreign key
        const alternativeData = {
          tournament_id: data.tournamentId,
          user_id: userId, // Still try with user_id since it's required
          player_name: data.leaderName || session.user.name || 'Player',
          email: data.leaderEmail || session.user.email || '',
          team_name: data.teamName || null,
          status: 'pending',
          payment_status: 'pending'
        };
        
        const { data: altRegistration, error: altError } = await supabaseAdmin
          .from('registrations')
          .insert([alternativeData])
          .select()
          .single();
          
        if (altError) {
          console.error('Alternative registration also failed:', altError);
          return NextResponse.json(
            { error: 'Failed to create registration', details: altError.message },
            { status: 500 }
          );
        }
        
        // Use alternative registration data
        registration = altRegistration;
        console.log('Alternative registration created successfully:', altRegistration.id);
      } else {
        return NextResponse.json(
          { error: 'Failed to create registration', details: insertError.message },
          { status: 500 }
        );
      }
    }

    // Log successful registration creation
    if (registration) {
      console.log('Registration created successfully:', {
        id: registration.id,
        tournamentId: registration.tournament_id,
        userId: registration.user_id,
        email: registration.email,
        status: registration.status,
        paymentStatus: registration.payment_status,
        createdAt: registration.created_at
      });
    }

    // Only increment tournament current_teams count for confirmed registrations
    // For pending registrations (awaiting payment), the count will be incremented in payment verification
    if (registration.status === 'confirmed' || registration.status === 'registered') {
      try {
        console.log('Registration confirmed, incrementing tournament team count...');
        
        // First get current count
        const { data: tournament, error: fetchError } = await supabaseAdmin
          .from('tournaments')
          .select('current_teams')
          .eq('id', data.tournamentId)
          .single();
          
        if (!fetchError && tournament) {
          const newCount = (tournament.current_teams || 0) + 1;
          const { error: updateError } = await supabaseAdmin
            .from('tournaments')
            .update({ current_teams: newCount })
            .eq('id', data.tournamentId);
        
        if (updateError) {
          console.error('Failed to update tournament count:', updateError);
          } else {
            console.log('Successfully updated tournament count to:', newCount);
          }
        } else {
          console.error('Failed to fetch tournament for count update:', fetchError);
        }
      } catch (countError) {
        console.error('Error updating tournament count:', countError);
        // Don't fail the registration if team count update fails
      }
    } else {
      console.log('Registration is pending payment - team count will be incremented after payment confirmation');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Successfully registered for tournament',
      registration: {
        id: registration.id,
        tournamentId: data.tournamentId,
        teamName: data.teamName || 'Individual Entry',
        status: 'registered',
        registeredAt: registration.created_at
      }
    });
  } catch (error: any) {
    console.error('Error registering for tournament:', error);
    
    return NextResponse.json({
      error: 'Failed to register for tournament',
      details: error?.message || 'An unknown error occurred'
    }, { status: 500 });
  }
}

/**
 * GET tournament registrations for the current user
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
    
    const userId = session.user.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found in session' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database admin access not available' },
        { status: 500 }
      );
    }

    // Get user's tournament registrations
    const { data: registrations, error } = await supabaseAdmin
      .from('registrations')
      .select(`
        id,
        tournament_id,
        player_name,
        email,
        team_name,
        status,
        payment_status,
        created_at,
        tournaments (
          id,
          name,
          game,
          game_image,
          start_date,
          end_date,
          status
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching registrations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch registrations' },
        { status: 500 }
      );
    }

    // Transform the data for frontend
    const transformedRegistrations = registrations?.map(reg => ({
      id: reg.id,
      tournamentId: reg.tournament_id,
      tournamentName: (reg.tournaments as any)?.name || 'Unknown Tournament',
      game: (reg.tournaments as any)?.game || 'Unknown Game',
      gameImage: (reg.tournaments as any)?.game_image || '/images/default-game.jpg',
      startDate: (reg.tournaments as any)?.start_date,
      teamName: reg.team_name || reg.player_name || 'Individual',
      registrationStatus: reg.status,
      paymentStatus: reg.payment_status,
      registeredAt: reg.created_at
    })) || [];
    
    return NextResponse.json({ registrations: transformedRegistrations });
  } catch (error: any) {
    console.error('Error fetching registrations:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch registrations',
      details: error?.message || 'An unknown error occurred'
    }, { status: 500 });
  }
}
