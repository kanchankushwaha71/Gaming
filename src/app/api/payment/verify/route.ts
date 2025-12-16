import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature, verifyPayment } from '@/lib/razorpay';
import { updatePaymentInfo } from '@/lib/supabase-registrations';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { supabase, supabaseAdmin } from '@/lib/supabase';

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().optional(), // Make optional for test mode
  razorpay_payment_id: z.string().min(1, 'Payment ID is required'),
  razorpay_signature: z.string().optional(), // Make optional for test mode
  registrationId: z.string().optional(), // Make optional
  testMode: z.boolean().optional(), // Allow test mode flag
});

export async function POST(req: NextRequest) {
  try {
    // Check if supabaseAdmin is available
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database configuration error' }, { status: 500 });
    }
    console.log('=== Payment Verification Request ===');
    
    // Check authentication
    const session = await getServerSession();
    console.log('Session check:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email
    });
    
    if (!session?.user) {
      console.log('Authentication failed: No session or user found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    // If coming from Razorpay Payment Page without payment_id, synthesize one in test mode
    if (body && body.testMode && !body.razorpay_payment_id) {
      body.razorpay_payment_id = `pp_${Date.now()}`;
    }
    console.log('Payment verification request body:', body);
    
    const result = verifyPaymentSchema.safeParse(body);
    
    if (!result.success) {
      console.log('Validation failed:', result.error.format());
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: result.error.format()
        },
        { status: 400 }
      );
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      registrationId,
      testMode,
    } = result.data;
    
    // Log request details after variables are declared
    console.log('Request details:', {
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      hasSignature: !!razorpay_signature,
      testMode,
      registrationId,
      userSession: {
        userId: session.user?.id,
        userEmail: session.user?.email,
        userName: session.user?.name
      }
    });

    // If no registration ID provided, try to find it by looking for recent registrations for this user
    let finalRegistrationId = registrationId;
    
    if (!finalRegistrationId) {
      console.log('No registration ID provided, searching latest pending by user...');

      if (!supabaseAdmin) {
        return NextResponse.json(
          { error: 'Database configuration error' },
          { status: 500 }
        );
      }

      // Prefer user_id match, fallback to email
      const userIdentifier = session.user?.id ? { column: 'user_id', value: session.user.id } : { column: 'email', value: session.user?.email };

      if (!userIdentifier.value) {
        return NextResponse.json(
          { error: 'Cannot identify user for verification' },
          { status: 400 }
        );
      }

      // First try to find by user_id, then by email
      let recentRegistration = null;
      let searchError = null;
      
      if (session.user?.id) {
        const { data, error } = await supabaseAdmin
          .from('registrations')
          .select('id, user_id, email, created_at')
          .eq('user_id', session.user.id)
          .eq('payment_status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (!error && data) {
          recentRegistration = data;
          console.log('Found registration by user_id:', data.id);
        } else {
          searchError = error;
        }
      }
      
      // If not found by user_id, try by email
      if (!recentRegistration && session.user?.email) {
        const { data, error } = await supabaseAdmin
          .from('registrations')
          .select('id, user_id, email, created_at')
          .eq('email', session.user.email)
          .eq('payment_status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (!error && data) {
          recentRegistration = data;
          console.log('Found registration by email:', data.id);
        } else if (!searchError) {
          searchError = error;
        }
      }
      
      // Log the search results for debugging
      console.log('Registration search results:', {
        userId: session.user?.id,
        userEmail: session.user?.email,
        foundRegistration: !!recentRegistration,
        registrationId: recentRegistration?.id,
        searchError: searchError?.message
      });

      if (!searchError && recentRegistration?.id) {
        finalRegistrationId = recentRegistration.id;
        console.log('Found registration ID:', finalRegistrationId);
      }
    }

    // Verify payment signature (skip for test mode)
    let isSignatureValid = true;
    
    if (!testMode && razorpay_order_id && razorpay_signature) {
      isSignatureValid = verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!isSignatureValid) {
        return NextResponse.json(
          { error: 'Invalid payment signature' },
          { status: 400 }
        );
      }
    } else if (testMode) {
      console.log('Skipping signature verification for test mode payment');
    }

    // Verify payment with Razorpay API (skip for test mode)
    let payment = null;
    
    if (!testMode) {
    const paymentResult = await verifyPayment(razorpay_payment_id);
    
    if (!paymentResult.success || !paymentResult.payment) {
      return NextResponse.json(
        { error: 'Payment verification failed', details: paymentResult.error },
        { status: 400 }
      );
    }

      payment = paymentResult.payment;
    
    // Check if payment is captured/successful
    if (payment.status !== 'captured') {
      return NextResponse.json(
        { error: 'Payment not completed', status: payment.status },
        { status: 400 }
      );
      }
    } else {
      console.log('Skipping Razorpay API verification for test mode payment');
    }

    // Update registration with payment information using direct admin client (more reliable)
    try {
      if (finalRegistrationId) {
        console.log('Updating payment info for registration:', finalRegistrationId);
        
        // Use direct Supabase admin client instead of the wrapper function to avoid timeouts
        const { data: paymentUpdateData, error: paymentUpdateError } = await supabaseAdmin
          .from('registrations')
          .update({
            payment_status: 'paid',
            transaction_id: razorpay_payment_id,
            razorpay_payment_id: razorpay_payment_id
          })
          .eq('id', finalRegistrationId)
          .select()
          .single();

        if (paymentUpdateError) {
          console.error('Error updating payment info directly:', paymentUpdateError);
        } else {
          console.log('Payment info updated successfully:', paymentUpdateData);
        }
      }
    } catch (updateError) {
      console.error('Error updating registration payment info:', updateError);
      // Payment is verified but database update failed
      // This should be handled carefully - maybe add to a queue for retry
    }

    if (!finalRegistrationId) {
      console.error('No registration found for payment verification. User details:', {
        userId: session.user?.id,
        userEmail: session.user?.email,
        paymentId: razorpay_payment_id
      });
      
      // Try to find any registration with this payment ID as a fallback
      const { data: anyRegistration } = await supabaseAdmin
        .from('registrations')
        .select('*')
        .eq('transaction_id', razorpay_payment_id)
        .maybeSingle();
        
      if (anyRegistration) {
        console.log('Found registration with this transaction ID already:', anyRegistration.id);
        return NextResponse.json({
          success: true,
          message: 'Payment already processed successfully',
          registration: anyRegistration
        });
      }
      
      // Try to find any recent pending registration for this user as another fallback
      if (session.user?.email) {
        // First try immediate lookup
        let recentPendingReg = null;
        const { data: immediateReg } = await supabaseAdmin
          .from('registrations')
          .select('*')
          .eq('email', session.user.email)
          .eq('payment_status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (immediateReg) {
          recentPendingReg = immediateReg;
        } else {
          // If not found immediately, wait a bit and try again (handles timing issues)
          console.log('Registration not found immediately, waiting 2 seconds and retrying...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const { data: retryReg } = await supabaseAdmin
            .from('registrations')
            .select('*')
            .eq('email', session.user.email)
            .eq('payment_status', 'pending')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
            
          if (retryReg) {
            recentPendingReg = retryReg;
            console.log('Found registration on retry:', retryReg.id);
          }
        }
          
        if (recentPendingReg) {
          console.log('Found recent pending registration for user:', recentPendingReg.id);
          // Update this registration with payment info
          const { data: updatedReg, error: updateError } = await supabaseAdmin
            .from('registrations')
            .update({
              payment_status: 'paid',
              transaction_id: razorpay_payment_id,
              razorpay_payment_id: razorpay_payment_id,
              status: 'confirmed'
            })
            .eq('id', recentPendingReg.id)
            .select()
            .single();
            
          if (!updateError && updatedReg) {
            return NextResponse.json({
              success: true,
              message: 'Payment verified and registration confirmed',
              registration: updatedReg
            });
          }
        }
      }
      
              // Last resort: create a registration record for this payment
        console.log('No registration found, creating emergency registration record...');
        try {
          const emergencyRegistration = {
            tournament_id: null, // We don't know which tournament this was for
            user_id: session.user?.id || session.user?.email,
            player_name: session.user?.name || 'Player',
            email: session.user?.email || '',
            team_name: 'Emergency Registration',
            status: 'confirmed',
            payment_status: 'paid',
            transaction_id: razorpay_payment_id,
            razorpay_payment_id: razorpay_payment_id,
            notes: 'Registration created during payment verification - tournament ID unknown'
          };
          
          const { data: newReg, error: createError } = await supabaseAdmin
            .from('registrations')
            .insert([emergencyRegistration])
            .select()
            .single();
            
          if (!createError && newReg) {
            console.log('Emergency registration created:', newReg.id);
            return NextResponse.json({
              success: true,
              message: 'Payment verified and emergency registration created',
              registration: newReg,
              warning: 'Tournament ID not found - please contact support to link this payment to the correct tournament'
            });
          } else {
            console.error('Failed to create emergency registration:', createError);
          }
        } catch (emergencyError) {
          console.error('Error creating emergency registration:', emergencyError);
        }
        
        return NextResponse.json(
          { 
            error: 'Could not find or create registration for this payment',
            details: 'Please ensure you have completed the registration process before making payment, or contact support',
            userInfo: {
              userId: session.user?.id,
              userEmail: session.user?.email
            },
            paymentId: razorpay_payment_id
          },
          { status: 400 }
        );
    }

    // Update registration status to confirmed using admin client with transaction safety
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      );
    }
    
    // Use atomic update to prevent race conditions
    let updatedRegistration, updateError;
    try {
      // First, check if registration is already confirmed to prevent double processing
      const { data: existingReg, error: checkError } = await supabaseAdmin
        .from('registrations')
        .select('status, payment_status')
        .eq('id', finalRegistrationId)
        .single();
      
      if (checkError) {
        throw new Error(`Failed to check registration status: ${checkError.message}`);
      }
      
      if (existingReg?.status === 'confirmed' && existingReg?.payment_status === 'paid') {
        console.log('Registration already confirmed, returning existing data');
        return NextResponse.json({
          success: true,
          message: 'Payment already verified',
          registration: { id: finalRegistrationId, ...existingReg }
        });
      }
      
      // Atomic update with condition to prevent race conditions
      const updatePromise = supabaseAdmin
        .from('registrations')
        .update({
          status: 'confirmed',
          payment_status: 'paid',
          transaction_id: razorpay_payment_id,
          razorpay_payment_id: razorpay_payment_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', finalRegistrationId)
        .neq('status', 'confirmed') // Only update if not already confirmed
        .select()
        .single();
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Registration update timeout')), 10000) // 10 second timeout
      );
      
      const result = await Promise.race([updatePromise, timeoutPromise]) as any;
      updatedRegistration = result.data;
      updateError = result.error;
      
    } catch (error: any) {
      if (error.message === 'Registration update timeout') {
        console.error('Registration update timed out');
        updateError = { message: 'Database timeout during registration update' };
      } else {
        updateError = error;
      }
    }

    if (updateError) {
      console.error('Error updating registration:', updateError);
      
      // If registration not found, it might have been deleted or never existed
      if (updateError.code === 'PGRST116') {
        console.error('Registration not found - it may have been deleted or never existed');
        
        // Try to find any registration with this payment ID
        const { data: anyRegistration } = await supabaseAdmin
          .from('registrations')
          .select('*')
          .eq('transaction_id', razorpay_payment_id)
          .maybeSingle();
          
        if (anyRegistration) {
          console.log('Found registration with this transaction ID already:', anyRegistration.id);
          return NextResponse.json({
            success: true,
            message: 'Payment already processed successfully',
            registration: anyRegistration
          });
        }
        
        return NextResponse.json(
          { error: 'Registration not found - payment successful but registration may have been removed' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to confirm registration', details: updateError },
        { status: 500 }
      );
    }

    // Tournament team count will be auto-corrected by the tournament details API
    // which counts actual registrations and updates current_teams accordingly
    console.log('Payment confirmed - tournament team count will be updated automatically on next view');

    console.log('Payment verified and registration confirmed:', finalRegistrationId);

    // Recalculate and update tournament current_teams immediately
    try {
      const { data: regRow } = await supabaseAdmin
        .from('registrations')
        .select('tournament_id')
        .eq('id', finalRegistrationId)
        .single();

      if (regRow?.tournament_id) {
        const { count } = await supabaseAdmin
          .from('registrations')
          .select('id', { count: 'exact', head: true })
          .eq('tournament_id', regRow.tournament_id)
          .eq('payment_status', 'paid');

        if (typeof count === 'number') {
          await supabaseAdmin
            .from('tournaments')
            .update({ current_teams: count })
            .eq('id', regRow.tournament_id);
        }
      }
    } catch (teamErr) {
      console.error('Failed to update tournament team count:', teamErr);
    }

    return NextResponse.json({
      success: true,
      message: testMode ? 'Test payment verified and registration confirmed' : 'Payment verified and registration confirmed',
      registration: updatedRegistration,
      testMode: testMode || false
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
} 