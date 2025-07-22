import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '../../../../../../lib/db';
import { reservations, rooms, housekeepingTasks } from '../../../../../../schema';
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

    if (res.status !== 'checked_in') {
      return NextResponse.json({ error: 'Guest is not checked in' }, { status: 400 });
    }

    // Update reservation status to checked_out
    await db
      .update(reservations)
      .set({
        status: 'checked_out',
        checkedOutAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .where(eq(reservations.id, reservationId));

    // Update room status to dirty (needs cleaning)
    await db
      .update(rooms)
      .set({
        status: 'dirty',
        updatedAt: new Date().toISOString()
      })
      .where(eq(rooms.id, res.roomId));

    // Create housekeeping task for room cleaning
    await db.insert(housekeepingTasks).values({
      roomId: res.roomId,
      taskType: 'cleaning',
      priority: 'normal',
      status: 'pending',
      description: `Post-checkout cleaning for room after guest departure`,
      estimatedDuration: 60, // 60 minutes
      createdBy: session.user.name || 'System',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: 'Guest checked out successfully. Cleaning task created.' });
  } catch (error) {
    console.error('Error checking out guest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}