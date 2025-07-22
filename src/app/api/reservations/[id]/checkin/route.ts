import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '../../../../../../lib/db';
import { reservations, rooms } from '../../../../../../schema';
import { authOptions } from '../../../../../../lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const reservationId = parseInt(id);

    // Get reservation details
    const reservation = await db
      .select()
      .from(reservations)
      .where(eq(reservations.id, reservationId))
      .limit(1);

    if (reservation.length === 0) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    const res = reservation[0];

    if (res.status !== 'confirmed') {
      return NextResponse.json({ error: 'Reservation cannot be checked in' }, { status: 400 });
    }

    // Update reservation status to checked_in
    await db
      .update(reservations)
      .set({
        status: 'checked_in',
        checkedInAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .where(eq(reservations.id, reservationId));

    // Update room status to occupied
    await db
      .update(rooms)
      .set({
        status: 'occupied',
        updatedAt: new Date().toISOString()
      })
      .where(eq(rooms.id, res.roomId));

    return NextResponse.json({ success: true, message: 'Guest checked in successfully' });
  } catch (error) {
    console.error('Error checking in guest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}