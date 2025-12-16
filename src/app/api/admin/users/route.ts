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

    // Get real users from database
    const { data: userProfiles, error: profileError } = await supabaseAdmin
      .from('player_profiles')
      .select('id, username, display_name, role, created_at')
      .order('created_at', { ascending: false });

    const { data: userAuth, error: authError } = await supabaseAdmin
      .from('user_auth')
      .select('user_id, email, created_at');

    if (profileError || authError) {
      console.error('Error fetching users:', { profileError, authError });
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Combine profile and auth data
    const users = userProfiles?.map(profile => {
      const authData = userAuth?.find(auth => auth.user_id === profile.id);
      return {
        id: profile.id,
        name: profile.display_name || profile.username || 'Unknown User',
        email: authData?.email || 'No email',
        role: profile.role || 'member',
        joinDate: profile.created_at || authData?.created_at || new Date().toISOString()
      };
    }) || [];

    // Get stats
    const totalUsers = users.length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const memberUsers = users.filter(u => u.role === 'member').length;

    return NextResponse.json({
      users,
      stats: {
        totalUsers,
        adminUsers,
        memberUsers,
        recentUsers: users.slice(0, 5)
      }
    });

  } catch (error) {
    console.error('Admin users API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

