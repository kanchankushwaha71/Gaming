import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { sendEmail, EmailTemplates } from '@/lib/resend';
import { handleApiError, validateAdmin, validateRequired, createApiError } from '@/lib/error-handler';

export async function POST(req: NextRequest) {
  try {
    console.log('=== Notify Players API Called ===');
    
    // Check if supabaseAdmin is available
    if (!supabaseAdmin) {
      throw createApiError('Database configuration error', 500, 'DB_CONFIG_ERROR');
    }

    // Check admin authentication
    const session = await getServerSession(authOptions);
    validateAdmin(session);

    const { tournamentId, subject, message, sendToAll } = await req.json();

    validateRequired({ subject, message }, ['subject', 'message']);

    let players: { id: string; name: string; email: string }[] = [];

    if (sendToAll) {
      // Get all registered players from player_profiles
      console.log('🔍 Fetching all players from player_profiles...');
      const { data: allPlayers, error } = await supabaseAdmin
        .from('player_profiles')
        .select(`
          id,
          display_name,
          username,
          email
        `)
        .not('email', 'is', null);

      if (error) {
        console.error('❌ Error fetching all players:', error);
        return NextResponse.json({ error: 'Failed to fetch players: ' + error.message }, { status: 500 });
      }

      players = allPlayers?.map(p => ({
        id: p.id,
        name: p.display_name || p.username || 'Player',
        email: p.email
      })) || [];

      console.log(`✅ Found ${players.length} players to notify`);

    } else if (tournamentId) {
      // Get players registered for specific tournament
      console.log(`🔍 Fetching players for tournament ${tournamentId}...`);
      const { data: tournamentPlayers, error } = await supabaseAdmin
        .from('registrations')
        .select(`
          id,
          player_name,
          email,
          team_name
        `)
        .eq('tournament_id', tournamentId)
        .in('status', ['pending', 'confirmed', 'registered']);

      if (error) {
        console.error('❌ Error fetching tournament players:', error);
        return NextResponse.json({ error: 'Failed to fetch tournament players: ' + error.message }, { status: 500 });
      }

      players = tournamentPlayers?.map(p => ({
        id: p.id,
        name: p.player_name || p.team_name || 'Player',
        email: p.email
      })) || [];

      console.log(`✅ Found ${players.length} tournament players to notify`);
    }

    if (players.length === 0) {
      return NextResponse.json({ error: 'No players found to notify' }, { status: 400 });
    }

    // Store notifications in database for now (you can implement actual email later)
    const notifications = players.map(player => ({
      player_id: player.id,
      player_email: player.email,
      player_name: player.name,
      subject,
      message,
      tournament_id: tournamentId || null,
      sent_at: new Date().toISOString(),
      sent_by: session.user?.id || 'admin',
      status: 'sent'
    }));

    // Check if player_notifications table exists
    try {
      const { data: tableCheck } = await supabaseAdmin
        .from('player_notifications')
        .select('id')
        .limit(1);
      
      if (!tableCheck) {
        console.log('player_notifications table exists');
      }
    } catch (tableError) {
      console.error('❌ player_notifications table does not exist. Please run the SQL script first.');
      return NextResponse.json({ 
        error: 'Database setup required. Please run the create_notifications_table.sql script in your Supabase dashboard first.',
        details: 'The player_notifications table is missing from your database.'
      }, { status: 500 });
    }

    // Insert notifications
    console.log(`📝 Inserting ${notifications.length} notifications into database...`);
    const { data: insertedNotifications, error: insertError } = await supabaseAdmin
      .from('player_notifications')
      .insert(notifications)
      .select();

    if (insertError) {
      console.error('❌ Error inserting notifications:', insertError);
      return NextResponse.json({ 
        error: 'Failed to save notifications to database',
        details: insertError.message 
      }, { status: 500 });
    }

    console.log(`✅ Successfully saved ${insertedNotifications?.length || 0} notifications to database`);

    // Send actual emails using Resend
    const emailResults = [];
    let successCount = 0;
    let failureCount = 0;

    for (const player of players) {
      try {
        // Get tournament name if applicable
        let tournamentName = '';
        if (tournamentId) {
          const { data: tournament } = await supabaseAdmin
            .from('tournaments')
            .select('name')
            .eq('id', tournamentId)
            .single();
          tournamentName = tournament?.name || 'Tournament';
        }

        // Create email template
        const emailTemplate = EmailTemplates.customNotification(
          player.name,
          subject,
          message,
          tournamentName
        );

        // Send email
        console.log(`📧 Sending email to ${player.email}...`);
        const emailResult = await sendEmail({
          to: [player.email],
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text
        });

        if (emailResult.success) {
          successCount++;
          console.log(`✅ Email sent successfully to ${player.email}`);
          emailResults.push({
            player: player.name,
            email: player.email,
            status: 'sent',
            messageId: (emailResult.data as any)?.id || 'unknown'
          });
        } else {
          failureCount++;
          console.error(`❌ Failed to send email to ${player.email}:`, emailResult.error);
          emailResults.push({
            player: player.name,
            email: player.email,
            status: 'failed',
            error: emailResult.error
          });
        }

      } catch (emailError) {
        failureCount++;
        console.error(`❌ Exception while sending email to ${player.email}:`, emailError);
        emailResults.push({
          player: player.name,
          email: player.email,
          status: 'failed',
          error: emailError instanceof Error ? emailError.message : 'Unknown error'
        });
      }
    }

    console.log(`🎉 Email notification process completed!`);
    console.log(`📊 Summary: ${successCount} successful, ${failureCount} failed out of ${players.length} total`);
    
    return NextResponse.json({
      success: true,
      message: `Emails sent to ${successCount} players. ${failureCount} failed.`,
      playersNotified: successCount,
      emailResults,
      stats: {
        total: players.length,
        successful: successCount,
        failed: failureCount
      },
      notifications: insertedNotifications
    });

  } catch (error) {
    return handleApiError(error);
  }
}
