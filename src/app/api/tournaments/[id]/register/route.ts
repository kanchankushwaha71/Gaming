import { NextRequest, NextResponse } from 'next/server';
import { getTournamentById } from '@/lib/supabase';
import { createRegistration, getRegistrations } from '@/lib/supabase-registrations';
import { validateRegistration } from '@/lib/validation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';

/**
 * @swagger
 * /api/tournaments/{id}/register:
 *   post:
 *     description: Register for a tournament
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamName
 *               - teamMembers
 *               - captain
 *               - contactInfo
 *             properties:
 *               teamName:
 *                 type: string
 *               teamMembers:
 *                 type: array
 *               captain:
 *                 type: object
 *               contactInfo:
 *                 type: object
 *     responses:
 *       201:
 *         description: Registration created successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Tournament not found
 *       409:
 *         description: Already registered or tournament full
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user from NextAuth session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Properly await params before accessing properties
    const { id: tournamentId } = await params;
    const body = await req.json();
    
    // Extract registration details
    const { teamName, teamMembers, captain, contactInfo } = body;
    
    // Use authenticated user ID from NextAuth session
    let userId = session.user.id || session.user.email || '';
    const originalUserId = userId; // Keep original for logging
    
    console.log('DEBUG: Tournament registration - Original user ID from session:', originalUserId);
    console.log('DEBUG: Tournament registration - User email from session:', session.user.email);
    
    // Validate if the user ID is in UUID format and convert consistently
    try {
      // Dynamically import the uuid package
      const { validate: isValidUUID, v5: uuidv5 } = await import('uuid');
      
      // If the user ID is not a valid UUID (likely from a different auth provider like MongoDB)
      // We need to generate a valid UUID for Supabase using the SAME method as profile API
      if (!isValidUUID(userId)) {
        console.log('DEBUG: Tournament registration - User ID is not in UUID format, generating deterministic UUID...');
        // Generate a deterministic UUID v5 using the user ID as namespace
        // Use the SAME fixed namespace as profile API (DNS namespace)
        const NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
        userId = uuidv5(userId, NAMESPACE);
        console.log('DEBUG: Tournament registration - Generated deterministic UUID:', userId);
      }
    } catch (uuidError) {
      console.error('Error validating/generating UUID:', uuidError);
      // If there's an error with UUID validation, use the original userId
      console.log('DEBUG: Tournament registration - Using original user ID due to UUID error');
    }
    
    // Validate required fields
    if (!userId || !teamName || !teamMembers || !captain || !contactInfo) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if tournament exists
    const tournament = await getTournamentById(tournamentId);
    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }
    
    // Check if tournament is open for registration
    if (tournament.status !== 'upcoming') {
      return NextResponse.json(
        { error: 'Tournament is not open for registration' },
        { status: 400 }
      );
    }
    
    // Check if tournament is full
    if (tournament.currentTeams >= tournament.maxTeams) {
      return NextResponse.json(
        { error: 'Tournament is full' },
        { status: 409 }
      );
    }
    
    // Check if user has already registered
    const existingRegistrations = await getRegistrations(tournamentId, userId);
    if (existingRegistrations.length > 0) {
      return NextResponse.json(
        { error: 'You have already registered for this tournament' },
        { status: 409 }
      );
    }
    
    // Create registration data
    const registrationData = {
      tournamentId,
      userId, // This should now be the correct deterministic UUID
      teamName,
      teamMembers,
      captain,
      contactInfo,
      status: 'pending_payment', // Start with pending status for paid tournaments
      paymentStatus: 'pending'
    };
    
    console.log('DEBUG: Tournament registration - Final registration data:', { 
      tournamentId, 
      userId, 
      originalUserId, 
      teamName 
    });
    
    // Validate registration data
    const validationError = validateRegistration(registrationData);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    // For free tournaments, complete registration immediately
    if (!tournament.registrationFee || tournament.registrationFee === 0) {
      registrationData.status = 'registered';
      registrationData.paymentStatus = 'free'; // Use 'free' for free tournaments
    
    const registration = await createRegistration(registrationData);
      
      console.log('DEBUG: Tournament registration - Free registration created successfully:', registration?.id);
      
      return NextResponse.json(
        { message: 'Registration successful', registration },
        { status: 201 }
      );
    }

    // For paid tournaments, create pending registration
    const pendingRegistration = await createRegistration(registrationData);
    
    console.log('DEBUG: Tournament registration - Pending registration created successfully:', pendingRegistration?.id);
    
    return NextResponse.json(
      { 
        message: 'Registration pending payment confirmation', 
        registration: pendingRegistration,
        requiresPayment: true,
        amount: tournament.registrationFee
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error registering for tournament:', error);
    
    // Handle specific error types
    if (error.code === '23514' && error.message.includes('status_check')) {
      return NextResponse.json(
        { 
          error: 'Registration failed due to status constraint.',
          details: 'The database has a constraint on the status field.',
          message: error.message
        },
        { status: 400 } // Bad request
      );
    } else if (error.code === '23505') {
      // Unique constraint violation - duplicate registration
      console.log('Duplicate registration detected:', error.message);
        return NextResponse.json(
          { 
            error: 'You have already registered for this tournament.',
          details: 'Each player can only register once per tournament.',
          code: 'DUPLICATE_REGISTRATION'
          },
          { status: 409 } // Conflict status code
        );
    } else if (error.code === '23502' && error.message.includes('null value in column')) {
      // Handle null constraint errors
      return NextResponse.json(
        { 
          error: 'Missing required field in registration data.',
          details: error.message 
        },
        { status: 400 } // Bad request
      );
    } else if (error.status === 'success') {
      // If it's our special success case from the retry logic
      return NextResponse.json(
        { 
          message: error.message || 'Registration successful after retry.'
        },
        { status: 201 } // Created
      );
    }
    
    // Generic error response
    return NextResponse.json(
      { 
        error: error.message || 'Failed to register for tournament',
        details: error.code ? `Error code: ${error.code}` : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/tournaments/{id}/register:
 *   get:
 *     description: Get all registrations for a tournament
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of registrations
 *       404:
 *         description: Tournament not found
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user from NextAuth session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Properly await params before accessing properties
    const { id: tournamentId } = await params;
    let userId = session.user.id || session.user.email || '';
    
    // Format userId as UUID if it's a MongoDB ObjectId
    if (userId.length === 24 && /^[0-9a-f]{24}$/i.test(userId)) {
      userId = `${userId.substr(0, 8)}-${userId.substr(8, 4)}-${userId.substr(12, 4)}-${userId.substr(16, 4)}-${userId.substr(20, 4)}`;
    }
    
    // Check if tournament exists
    const tournament = await getTournamentById(tournamentId);
    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }
    
    // Get registrations
    const registrations = await getRegistrations(tournamentId, userId);
    
    return NextResponse.json({ registrations });
  } catch (error: any) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
} 