import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  // Placeholder route to prevent build errors
  return NextResponse.json({ 
    message: 'Payments API temporarily disabled for build compatibility',
    payments: []
  });
}

export async function POST(_request: NextRequest) {
  return NextResponse.json({ 
    success: false, 
    message: 'Payments API temporarily disabled' 
  }, { status: 501 });
}