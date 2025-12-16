import { supabase, supabaseAdmin } from './supabase';
import crypto from 'crypto';

const registrationsTable = 'registrations';

/**
 * Transform object keys from camelCase to snake_case
 */
const toSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

/**
 * Transform object keys from snake_case to camelCase
 */
const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Convert object keys from camelCase to snake_case
 */
const convertToSnakeCase = (obj: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  Object.keys(obj).forEach(key => {
    const snakeKey = toSnakeCase(key);
    const value = obj[key];
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[snakeKey] = convertToSnakeCase(value);
    } else {
      result[snakeKey] = value;
    }
  });
  return result;
};

/**
 * Convert object keys from snake_case to camelCase
 */
const convertToCamelCase = (obj: Record<string, any>): Record<string, any> => {
  const result: Record<string, any> = {};
  Object.keys(obj).forEach(key => {
    const camelKey = toCamelCase(key);
    const value = obj[key];
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      result[camelKey] = convertToCamelCase(value);
    } else {
      result[camelKey] = value;
    }
  });
  return result;
};

/**
 * Get all registrations for a tournament, optionally filtered by user ID
 */
export async function getRegistrations(tournamentId: string, userId?: string) {
  try {
    let query = supabase
      .from(registrationsTable)
      .select('*')
      .eq('tournament_id', tournamentId);
    
    if (userId) {
      // Try to convert MongoDB ID to UUID format if it matches the pattern
      if (userId.length === 24 && /^[0-9a-f]{24}$/i.test(userId)) {
        const userUUID = `${userId.substr(0, 8)}-${userId.substr(8, 4)}-${userId.substr(12, 4)}-${userId.substr(16, 4)}-${userId.substr(20, 4)}`;
        // Match the converted UUID
        query = query.eq('user_id', userUUID);
      } else {
        // Use userId as-is (might be already in UUID format)
      query = query.eq('user_id', userId);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching registrations:', error);
      throw error;
    }
    
    return data ? data.map(item => convertToCamelCase(item)) : [];
  } catch (error) {
    console.error('Exception when fetching registrations:', error);
    return [];
  }
}

/**
 * Get a registration by ID
 */
export async function getRegistrationById(registrationId: string) {
  try {
    const { data, error } = await supabase
      .from(registrationsTable)
      .select('*')
      .eq('id', registrationId)
      .single();
    
    if (error) {
      console.error('Error fetching registration:', error);
      throw error;
    }
    
    return data ? convertToCamelCase(data) : null;
  } catch (error) {
    console.error('Exception when fetching registration:', error);
    return null;
  }
}

/**
 * Create a new registration
 */
export async function createRegistration(registrationData: any) {
  try {
    // Ensure required fields exist
    if (!registrationData.tournamentId || !registrationData.userId || !registrationData.teamName) {
      throw new Error('Missing required registration fields: tournamentId, userId, or teamName');
    }

    // Process payment status
    const paymentStatus = registrationData.paymentStatus || 'pending';
    // Make sure payment status matches database constraint
    // Based on the actual constraint: ('pending', 'paid', 'failed', 'free')
    const validStatuses = ['pending', 'paid', 'failed', 'free'];
    if (!validStatuses.includes(paymentStatus)) {
      console.log(`Invalid payment status: ${paymentStatus}, defaulting to 'pending'`);
      registrationData.paymentStatus = 'pending'; // Default to 'pending' if invalid value
    }
    
    // Create a deterministic UUID from MongoDB ObjectId to use as Supabase user reference
    // This ensures the same MongoDB ID always maps to the same UUID
    let userUUID;
    try {
      // If userId is already a valid UUID, use it directly
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(registrationData.userId)) {
        userUUID = registrationData.userId;
      } else {
        // Generate deterministic UUID v5 using the SAME method as profile API
        const { v5: uuidv5 } = await import('uuid');
        const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // DNS namespace
        userUUID = uuidv5(registrationData.userId, NAMESPACE);
        console.log(`Generated deterministic UUID for user ${registrationData.userId}: ${userUUID}`);
      }
    } catch (uuidError) {
      console.error('Error generating UUID from user ID:', uuidError);
      // Fallback: still use deterministic approach
      try {
        const { v5: uuidv5 } = await import('uuid');
        const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
        userUUID = uuidv5(registrationData.userId || 'fallback', NAMESPACE);
      } catch (fallbackError) {
        // Last resort: use original userId if all else fails
        userUUID = registrationData.userId;
      }
    }
    
    // Use admin client to bypass RLS permissions
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available. Service role key might be missing.');
    }
    
    // Check if player exists
    let playerId = userUUID;
    
    // First, try to find player by ID
    const { data: playerById, error: playerByIdError } = await supabaseAdmin
      .from('players')
      .select('id, username')
      .eq('id', userUUID)
      .maybeSingle();
    
    // Then, try to find by email if there's captain email available
    const captainEmail = registrationData.captain?.email;
    let playerByEmail = null;
    let playerByEmailError = null;
    
    if (captainEmail) {
      const result = await supabaseAdmin
        .from('players')
        .select('id, username')
        .eq('email', captainEmail)
        .maybeSingle();
        
      playerByEmail = result.data;
      playerByEmailError = result.error;
    }
    
    // If player exists by email, use that ID
    if (playerByEmail) {
      console.log(`Found player with email ${captainEmail}, using ID: ${playerByEmail.id}`);
      playerId = playerByEmail.id;
    }
    // If player exists by ID, use that
    else if (playerById) {
      console.log(`Found player with ID ${userUUID}`);
      playerId = playerById.id;
    }
    // Otherwise create a new player
    else if (!playerById && !playerByIdError) {
      console.log(`Creating new player with ID ${userUUID}`);
      
      // Generate a unique username based on UUID to avoid duplicates
      const uniqueUsername = `user_${userUUID.substring(0, 8)}`;
      const displayName = registrationData.captain?.name || uniqueUsername;
      
      const { error: playerCreateError } = await supabaseAdmin
        .from('players')
        .insert([{
          id: userUUID,
          username: uniqueUsername,
          display_name: displayName,
          email: captainEmail,
          main_game: 'unknown',
          created_at: new Date().toISOString()
        }]);
      
      if (playerCreateError) {
        console.error('Error creating player:', playerCreateError);
        // Don't throw, try to continue with registration
        console.log('Continuing with registration despite player creation error');
      }
    } else if (playerByIdError) {
      console.error('Error checking for player by ID:', playerByIdError);
    }
    
    // Use a simpler approach with direct SQL query
    try {
      console.log("Attempting minimal registration with only required fields...");
      
      // Use only the absolutely required fields
      const minimalData = {
        tournament_id: registrationData.tournamentId,
        player_id: playerId,
        user_id: userUUID,
        team_name: registrationData.teamName
      };
      
      // Try inserting with just the minimal required fields
      const { data, error } = await supabaseAdmin
      .from(registrationsTable)
        .insert(minimalData)
      .select();
    
    if (error) {
        console.error('Error with minimal registration insert:', error);
        
        // If there's a specific error about the status check constraint,
        // try to find the allowed values by querying the constraint
        if (error.code === '23514' && error.message.includes('status_check')) {
          console.log("Attempting to discover allowed status values...");
          
          // Try each of these common status values
          const possibleStatuses = ['pending', 'confirmed', 'cancelled'];
          
          for (const statusValue of possibleStatuses) {
            console.log(`Trying with status: ${statusValue}`);
            
            const testData = {
              ...minimalData,
              status: statusValue
            };
            
            const { error: statusError } = await supabaseAdmin
              .from(registrationsTable)
              .insert(testData)
              .select();
              
            if (!statusError) {
              console.log(`Success with status value: ${statusValue}`);
              return { status: 'success', message: `Registration successful with status: ${statusValue}` };
            }
          }
        }
        
      throw error;
    }
    
      console.log("Registration successful with minimal data:", data);
      
      // Only increment team count for confirmed registrations (status = 'registered' or 'confirmed')  
      if (data[0]?.status === 'registered' || data[0]?.status === 'confirmed') {
        // Try to increment tournament team count
        try {
          const { error: rpcError } = await supabase.rpc(
            'increment_tournament_teams',
            { tournament_id: registrationData.tournamentId }
          );

          if (rpcError) {
            console.error('Failed to increment tournament team count via RPC:', rpcError);
            
            // Fallback: direct update
            console.log('RPC call failed, attempting direct update:', rpcError);
            
            const { data: tournament, error: fetchError } = await supabase
              .from('tournaments')
              .select('current_teams')
              .eq('id', registrationData.tournamentId)
              .single();

            if (!fetchError && tournament) {
              const { error: updateError } = await supabase
                .from('tournaments')
                .update({ current_teams: tournament.current_teams + 1 })
                .eq('id', registrationData.tournamentId);

              if (updateError) {
                console.error('Failed to update tournament team count directly:', updateError);
              } else {
                console.log(`Successfully updated tournament team count directly from ${tournament.current_teams} to ${tournament.current_teams + 1}`);
              }
            }
          }
        } catch (error) {
          console.error('Error incrementing tournament team count:', error);
        }
      } else {
        console.log('Registration is pending payment confirmation - team count not incremented');
      }
    
    return data && data.length > 0 ? convertToCamelCase(data[0]) : null;
    } catch (error) {
      console.error('Exception when creating registration:', error);
      throw error;
    }
  } catch (error) {
    console.error('Exception when creating registration:', error);
    throw error;
  }
}

/**
 * Update a registration
 */
export async function updateRegistration(registrationId: string, updateData: any) {
  try {
    const snakeCaseData = convertToSnakeCase(updateData);
    
    const { data, error } = await supabase
      .from(registrationsTable)
      .update(snakeCaseData)
      .eq('id', registrationId)
      .select();
    
    if (error) {
      console.error('Error updating registration:', error);
      throw error;
    }
    
    return data && data.length > 0 ? convertToCamelCase(data[0]) : null;
  } catch (error) {
    console.error('Exception when updating registration:', error);
    throw error;
  }
}

/**
 * Delete a registration
 */
export async function deleteRegistration(registrationId: string) {
  try {
    const { error } = await supabase
      .from(registrationsTable)
      .delete()
      .eq('id', registrationId);
    
    if (error) {
      console.error('Error deleting registration:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Exception when deleting registration:', error);
    throw error;
  }
}

/**
 * Get team members for a tournament (for displaying registered teams)
 */
export async function getTeamsByTournament(tournamentId: string) {
  try {
    const { data, error } = await supabase
      .from(registrationsTable)
      .select('id, team_name, captain, team_members, status')
      .eq('tournament_id', tournamentId)
      .eq('status', 'approved');
    
    if (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
    
    return data ? data.map(item => convertToCamelCase(item)) : [];
  } catch (error) {
    console.error('Exception when fetching teams:', error);
    return [];
  }
}

/**
 * Update a registration status
 */
export async function updateRegistrationStatus(registrationId: string, status: 'pending' | 'approved' | 'rejected') {
  try {
    const { data, error } = await supabase
      .from(registrationsTable)
      .update({ status })
      .eq('id', registrationId)
      .select();
      
    if (error) throw error;
    
    return data ? convertToCamelCase(data[0]) : null;
  } catch (error) {
    console.error('Error updating registration status:', error);
    throw error;
  }
}

/**
 * Update payment information
 */
export async function updatePaymentInfo(
  registrationId: string, 
  paymentData: { paymentStatus: string, transactionId?: string }
) {
  try {
    const snakeCaseData = convertToSnakeCase(paymentData);
    
    // Use admin client for better reliability and add timeout
    const updatePromise = supabaseAdmin
      .from(registrationsTable)
      .update(snakeCaseData)
      .eq('id', registrationId)
      .select();
    
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Payment info update timeout')), 8000) // 8 second timeout
    );
    
    const result = await Promise.race([updatePromise, timeoutPromise]);
    const { data, error } = result as any;
      
    if (error) throw error;
    
    return data && data.length > 0 ? convertToCamelCase(data[0]) : null;
  } catch (error) {
    console.error('Error updating payment info:', {
      message: error.message,
      details: error.toString(),
      hint: error.hint || '',
      code: error.code || ''
    });
    throw error;
  }
}

/**
 * Get all registrations for a user by MongoDB ID
 * This is specifically designed to convert MongoDB ObjectIDs to UUID format for Supabase
 */
export async function getRegistrationsByMongoId(mongoId: string) {
  try {
    // Convert MongoDB ObjectID to a UUID-like format for Supabase
    let supabaseId;
    
    // If this is a MongoDB ObjectID (24 chars, hex), convert to UUID format
    if (mongoId.length === 24 && /^[0-9a-f]{24}$/i.test(mongoId)) {
      supabaseId = `${mongoId.substring(0, 8)}-${mongoId.substring(8, 12)}-${mongoId.substring(12, 16)}-${mongoId.substring(16, 20)}-${mongoId.substring(20, 24)}`;
      console.log(`Converted MongoDB ID ${mongoId} to UUID format: ${supabaseId}`);
    } else {
      // Not a MongoDB ID format
      supabaseId = mongoId;
    }
    
    // Attempt to query using SQL directly with the formatted ID
    // This bypasses the RLS and allows for a more flexible search
    if (!supabaseAdmin) {
      console.error('Supabase admin client not available');
      return [];
    }
    
    const { data, error } = await supabaseAdmin
      .from('registrations')
      .select(`
        *,
        tournament:tournaments (*)
      `)
      .or(`player_id.eq."${supabaseId}",user_id.eq."${supabaseId}"`);
    
    if (error) {
      console.error('Error fetching registrations by MongoDB ID:', error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} registrations for MongoDB ID ${mongoId} in Supabase`);
    
    return data ? data.map(item => convertToCamelCase(item)) : [];
  } catch (error) {
    console.error('Exception when fetching registrations by MongoDB ID:', error);
    return [];
  }
} 