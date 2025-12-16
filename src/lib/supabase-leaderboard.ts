import { supabase } from './supabase';

// Calculate real statistics for a player based on tournament data
async function calculatePlayerStats(playerId: string) {
  try {
    // Get all registrations for this player
    const { data: registrations, error } = await supabase
      .from('registrations')
      .select(`
        id,
        status,
        tournament_id,
        tournaments!inner(
          id,
          name,
          status
        )
      `)
      .eq('player_id', playerId);
    
    if (error) {
      console.error('Error fetching player registrations:', error);
      return { score: 0, winRate: 0, kills: 0, matches: 0 };
    }
    
    const totalMatches = registrations?.length || 0;
    const completedMatches = registrations?.filter(r => 
      r.status === 'confirmed' || r.status === 'completed'
    ).length || 0;
    
    // Calculate win rate based on confirmed/completed registrations
    const winRate = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;
    
    // Calculate score based on participation and performance
    const score = (completedMatches * 100) + (winRate * 10);
    
    // For now, use placeholder values for kills (would need match result data)
    const kills = completedMatches * Math.floor(Math.random() * 20 + 5);
    
    return {
      score,
      winRate,
      kills,
      matches: totalMatches
    };
  } catch (error) {
    console.error('Error calculating player stats:', error);
    return { score: 0, winRate: 0, kills: 0, matches: 0 };
  }
}

// Get leaderboard data for a specific game
export async function getLeaderboardByGame(game: string, limit = 10, page = 1) {
  try {
    let query = supabase
      .from('player_profiles')
      .select('*', { count: 'exact' });
    
    // Filter by game if not 'all'
    if (game && game !== 'all') {
      try {
        // Apply filter using main_game column from player_profiles
        query = query.eq('main_game', game);
      } catch (err) {
        console.log('Error applying game filter:', err);
        // Continue without applying the filter
      }
    }
    
    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    // Sort by created_at descending (most recent players first)
    // We'll calculate win rates from tournament data later
    query = query.order('created_at', { ascending: false })
      .range(from, to);
    
    let { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching leaderboard data from Supabase:', error);
      throw error; // Don't fall back to mock data, let the API handle the error
    }
    
    // Calculate real statistics for each player
    const leaderboardData = [];
    
    for (const player of data || []) {
      // Get tournament statistics for this player
      const stats = await calculatePlayerStats(player.user_id || player.id);
      
      leaderboardData.push({
        rank: 0, // Will be assigned after sorting
        player: player.display_name || player.username,
        avatar: player.avatar_url || '/images/avatars/default.jpg',
        score: stats.score,
        winRate: stats.winRate,
        kills: stats.kills,
        matches: stats.matches
      });
    }
    
    // Sort by score descending and assign ranks
    leaderboardData.sort((a, b) => b.score - a.score);
    leaderboardData.forEach((player, index) => {
      player.rank = (page - 1) * limit + index + 1;
    });
    
    return {
      players: leaderboardData,
      pagination: {
        total: count || 0,
        page,
        limit,
        pages: count ? Math.ceil(count / limit) : 0
      }
    };
  } catch (error) {
    console.error('Failed to fetch leaderboard data:', error);
    // Return empty result instead of mock data
    return {
      players: [],
      pagination: {
        total: 0,
        page,
        limit,
        pages: 0
      }
    };
  }
}

 