import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    // Test basic API functionality
    const healthData: any = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      server: 'running'
    };

    // Test Supabase connection
    try {
      const { data, error } = await supabase
        .from('player_profiles')
        .select('id')
        .limit(1);
      
      healthData.database = error ? 'error' : 'connected';
      healthData.databaseError = error?.message || null;
    } catch (dbError: any) {
      healthData.database = 'error';
      healthData.databaseError = dbError?.message || 'Unknown database error';
    }

    return NextResponse.json(healthData);
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 'error',
        message: error?.message || 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 