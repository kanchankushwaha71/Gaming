import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // TODO: Implement tournament hosting logic
    // 1. Validate tournament data
    // 2. Save to database
    // 3. Return tournament ID
    
    return NextResponse.json({ 
      success: true, 
      message: 'Tournament hosting request received',
      data 
    });
  } catch (error) {
    console.error('Host tournament error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST to host a tournament' }, { status: 405 });
}
