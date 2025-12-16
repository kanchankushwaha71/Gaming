import { NextResponse } from 'next/server';
import { createTournament } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('Testing tournament creation...');
    
    // Test with minimal data
    const testTournament = {
      name: 'Test Tournament',
      game: 'valorant',
      startDate: '2025-06-01',
      endDate: '2025-06-03',
      registrationDeadline: '2025-05-30',
      description: 'Test tournament',
      rules: 'Test rules',
      prizePool: '₹1000',
      teamSize: 5,
      maxTeams: 16,
      currentTeams: 0,
      location: 'Online',
      format: 'single-elimination',
      registrationFee: 0,
      isPublic: true,
      status: 'upcoming',
      organizer: {
        name: 'Test Organizer',
        verified: false,
        contact: 'test@example.com'
      }
    };
    
    console.log('Creating tournament with data:', testTournament);
    
    const result = await createTournament(testTournament);
    
    return NextResponse.json({
      success: true,
      message: 'Tournament created successfully',
      tournament: result
    });
  } catch (error) {
    console.error('Tournament creation test error:', error);
    return NextResponse.json({ 
      error: 'Tournament creation failed', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 