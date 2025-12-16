import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { registrationId, tournamentId, subject, message, toEmail } = body || {};

    if (!registrationId && !tournamentId) {
      return NextResponse.json({ error: 'registrationId or tournamentId is required' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 500 });
    }

    // Resolve recipient email: prefer explicit toEmail, else from registration -> player_profiles/user email
    let recipientEmail = toEmail as string | undefined;
    let resolvedTournamentId: string | undefined = tournamentId;

    if (!recipientEmail || !resolvedTournamentId) {
      const { data: reg } = await supabaseAdmin
        .from('registrations')
        .select('id, user_id, player_id, tournament_id')
        .eq('id', registrationId)
        .single();

      if (reg) {
        resolvedTournamentId = resolvedTournamentId || reg.tournament_id;

        // Try player_profiles first
        const { data: profile } = await supabaseAdmin
          .from('player_profiles')
          .select('email')
          .eq('user_id', reg.user_id || reg.player_id)
          .single();

        recipientEmail = recipientEmail || profile?.email;

        if (!recipientEmail) {
          // Fallback: auth users table via view
          const { data: authUser } = await supabaseAdmin
            .from('user_auth')
            .select('email')
            .eq('id', reg.user_id || reg.player_id)
            .single();
          recipientEmail = authUser?.email || undefined;
        }
      }
    }

    if (!recipientEmail) {
      return NextResponse.json({ error: 'Could not resolve recipient email' }, { status: 400 });
    }

    const emailSubject = subject || 'Tournament Room Credentials';
    const emailBody = message || 'Your credentials will be shared shortly.';

    const emailResult = await sendEmail({
      to: recipientEmail,
      subject: emailSubject,
      html: `<p>${emailBody.replace(/\n/g, '<br/>')}</p>`
    } as any);
    
    const { success, error: sendError } = emailResult;
    const messageId = (emailResult as any).id;

    // Log notification (best-effort)
    try {
      await supabaseAdmin
        .from('player_notifications')
        .insert({
          player_email: recipientEmail,
          subject: emailSubject,
          message: emailBody,
          tournament_id: resolvedTournamentId || null,
          status: success ? 'sent' : 'failed',
          message_id: messageId || null,
        });
    } catch (e) {
      console.warn('Failed to log notification', e);
    }

    if (!success) {
      return NextResponse.json({ error: sendError || 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, to: recipientEmail, messageId });
  } catch (err: any) {
    console.error('send-credentials error:', err);
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}



