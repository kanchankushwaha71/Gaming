import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Cleanup endpoint to remove pending registrations that are older than 1 hour
 * This prevents the database from filling up with abandoned registrations
 */
export async function POST(req: NextRequest) {
  try {
    console.log('Starting cleanup of pending registrations...');
    
    // Calculate timestamp for 1 hour ago
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    // Find pending registrations older than 1 hour
    const { data: pendingRegistrations, error: findError } = await supabase
      .from('tournament_registrations')
      .select('id, tournament_id, team_name, created_at')
      .eq('status', 'pending_payment')
      .lt('created_at', oneHourAgo.toISOString());

    if (findError) {
      console.error('Error finding pending registrations:', findError);
      return NextResponse.json(
        { error: 'Failed to find pending registrations' },
        { status: 500 }
      );
    }

    if (!pendingRegistrations || pendingRegistrations.length === 0) {
      console.log('No pending registrations found to cleanup');
      return NextResponse.json({
        success: true,
        message: 'No pending registrations to cleanup',
        removedCount: 0
      });
    }

    console.log(`Found ${pendingRegistrations.length} pending registrations to cleanup:`, 
      pendingRegistrations.map(reg => ({ 
        id: reg.id, 
        team: reg.team_name, 
        created: reg.created_at 
      }))
    );

    // Remove the pending registrations
    const { data: deletedRegistrations, error: deleteError } = await supabase
      .from('tournament_registrations')
      .delete()
      .eq('status', 'pending_payment')
      .lt('created_at', oneHourAgo.toISOString())
      .select();

    if (deleteError) {
      console.error('Error deleting pending registrations:', deleteError);
      return NextResponse.json(
        { error: 'Failed to cleanup pending registrations' },
        { status: 500 }
      );
    }

    const removedCount = deletedRegistrations?.length || 0;
    console.log(`Successfully removed ${removedCount} pending registrations`);

    return NextResponse.json({
      success: true,
      message: `Cleanup completed. Removed ${removedCount} pending registrations`,
      removedCount,
      removedRegistrations: deletedRegistrations?.map(reg => ({
        id: reg.id,
        teamName: reg.team_name,
        tournamentId: reg.tournament_id,
        createdAt: reg.created_at
      }))
    });

  } catch (error) {
    console.error('Error in cleanup-pending API:', error);
    return NextResponse.json(
      { error: 'Internal server error during cleanup' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Just show pending registrations without deleting
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const { data: pendingRegistrations, error } = await supabase
      .from('tournament_registrations')
      .select('id, tournament_id, team_name, created_at, status, payment_status')
      .eq('status', 'pending_payment')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch pending registrations' }, { status: 500 });
    }

    const old = pendingRegistrations?.filter(reg => 
      new Date(reg.created_at) < oneHourAgo
    ) || [];
    
    const recent = pendingRegistrations?.filter(reg => 
      new Date(reg.created_at) >= oneHourAgo
    ) || [];

    return NextResponse.json({
      success: true,
      summary: {
        totalPending: pendingRegistrations?.length || 0,
        oldPending: old.length,
        recentPending: recent.length
      },
      oldPendingRegistrations: old,
      recentPendingRegistrations: recent
    });

  } catch (error) {
    console.error('Error fetching pending registrations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 