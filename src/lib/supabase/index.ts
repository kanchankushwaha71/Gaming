// Export all supabase-related functions from a central place
// This file helps with module resolution for '@/lib/supabase'

// Export from main supabase file
export * from '../supabase';

// Export auth-specific functions (avoiding duplicates)
export { 
  signUpWithEmail, 
  signInWithEmail, 
  signInWithGoogle, 
  signOut, 
  getSession, 
  getCurrentUser,
  updateUserProfile 
} from '../supabase-auth';

// Export from specific utility files (main supabase.ts has all the core functions we need)
export * from '../supabase-registrations';
export * from '../supabase-leaderboard';

// Export additional specialized functions as needed
export const getEventById = async (eventId: string) => {
  // Re-export from the correct file or implement here
  const { getEventById } = await import('../supabase');
  return getEventById(eventId);
};

export const registerForEvent = async (eventId: string, registrationData: any) => {
  // Re-export from the correct file or implement here
  const { registerForEvent } = await import('../supabase');
  return registerForEvent(eventId, registrationData);
};

export const createEventTicket = async (ticketData: any) => {
  // Re-export from the correct file or implement here
  const { createEventTicket } = await import('../supabase');
  return createEventTicket(ticketData);
}; 