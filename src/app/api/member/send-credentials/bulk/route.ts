import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tournamentId, subject, message, statusFilter } = body || {};
    if (!tournamentId) {
      return NextResponse.json({ error: 'tournamentId is required' }, { status: 400 });
    }
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 500 });
    }

    // Get registrations for the tournament
    let regQuery = supabaseAdmin
      .from('registrations')
      .select('id, user_id, player_id, payment_status, status')
      .eq('tournament_id', tournamentId);

    const { data: regs, error } = await regQuery;
    if (error) throw error;
    if (!regs || regs.length === 0) {
      return NextResponse.json({ success: true, sent: 0, recipients: [] });
    }

    // Filter by status if provided
    const filtered = (regs as any[]).filter(r => {
      if (!statusFilter) return true;
      // allow 'paid' or 'confirmed' or any array
      if (Array.isArray(statusFilter)) {
        return statusFilter.includes(r.payment_status) || statusFilter.includes(r.status);
      }
      return r.payment_status === statusFilter || r.status === statusFilter;
    });

    // Resolve emails
    const emails = new Set<string>();
    for (const r of filtered) {
      const uid = r.user_id || r.player_id;
      if (!uid) continue;
      // player_profiles
      const { data: profile } = await supabaseAdmin
        .from('player_profiles')
        .select('email')
        .eq('user_id', uid)
        .single();
      if (profile?.email) {
        emails.add(profile.email);
        continue;
      }
      // fallback user_auth view
      const { data: authUser } = await supabaseAdmin
        .from('user_auth')
        .select('email')
        .eq('id', uid)
        .single();
      if (authUser?.email) emails.add(authUser.email);
    }

    const toList = Array.from(emails);
    if (toList.length === 0) {
      return NextResponse.json({ success: true, sent: 0, recipients: [] });
    }

    const emailSubject = subject || 'Tournament Room Credentials';
    const emailBody = message || 'Your credentials will be shared shortly.';

    let sent = 0;
    const failures: Array<{ to: string; error: string }> = [];

    // Send sequentially (small lists) to avoid provider rate limits
    for (const to of toList) {
      const result = await sendEmail({
        to,
        subject: emailSubject,
        html: `<p>${emailBody.replace(/\n/g, '<br/>')}</p>`,
      } as any);
      if (result.success) sent += 1; else failures.push({ to, error: result.error || 'unknown' });

      // best-effort log
      try {
        await supabaseAdmin.from('player_notifications').insert({
          player_email: to,
          subject: emailSubject,
          message: emailBody,
          tournament_id: tournamentId,
          status: result.success ? 'sent' : 'failed',
          message_id: (result as any).id || null,
        });
      } catch {}
    }

    return NextResponse.json({ success: true, sent, total: toList.length, failures });
  } catch (err: any) {
    console.error('bulk send-credentials error:', err);
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}



