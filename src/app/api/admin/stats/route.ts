import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    // Check if supabaseAdmin is available
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database configuration error' }, { status: 500 });
    }

    // Check admin authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get real statistics from database
    const [
      { count: totalUsers },
      { count: totalTournaments },
      { count: totalRegistrations },
      { count: activeTournaments }
    ] = await Promise.all([
      supabaseAdmin.from('player_profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('tournaments').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('registrations').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('tournaments').select('*', { count: 'exact', head: true }).eq('status', 'upcoming')
    ]);

    // Get recent activities (registrations)
    const { data: recentRegistrations } = await supabaseAdmin
      .from('registrations')
      .select(`
        id,
        player_name,
        team_name,
        created_at,
        tournaments!inner(name)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    const recentActivities = recentRegistrations?.map(reg => ({
      id: reg.id,
      action: 'registered for tournament',
      user: reg.player_name || 'Unknown Player',
      tournament: (reg.tournaments as any)?.name || 'Unknown Tournament',
      time: new Date(reg.created_at).toLocaleDateString()
    })) || [];

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        activeTournaments: activeTournaments || 0,
        totalTournaments: totalTournaments || 0,
        totalRegistrations: totalRegistrations || 0
      },
      recentActivities
    });

  } catch (error) {
    console.error('Admin stats API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

