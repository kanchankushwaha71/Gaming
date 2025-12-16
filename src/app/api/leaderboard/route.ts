import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboardByGame } from '@/lib/supabase-leaderboard';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const game = searchParams.get('game') || 'valorant';
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    
    console.log(`Fetching leaderboard for game: ${game}, limit: ${limit}, page: ${page}`);
    
    // Get leaderboard data from our specialized function
    const result = await getLeaderboardByGame(game, limit, page);
    
    if (!result || !result.players) {
      console.error('No players data returned from getLeaderboardByGame');
      return NextResponse.json(
        { error: 'No players found' },
        { status: 404 }
      );
    }
    
    // Success! Return the leaderboard data
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in leaderboard API route:', error);
    
    // Return a more detailed error response for debugging
    return NextResponse.json(
      { 
        error: 'Failed to fetch leaderboard data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 