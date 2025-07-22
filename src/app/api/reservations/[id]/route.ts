import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '../../../../../lib/db';
import { reservations, rooms } from '../../../../../schema';
import { authOptions } from '../../../../../lib/auth';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const reservation = await db
      .select()
      .from(reservations)
      .where(eq(reservations.id, parseInt(id)))
      .limit(1);
    
    if (reservation.length === 0) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    return NextResponse.json(reservation[0]);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      checkInDate, 
      checkOutDate, 
      numberOfGuests,
      status,
      specialRequests,
      notes,
      paidAmount
    } = body;

    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (checkInDate !== undefined) updateData.checkInDate = checkInDate;
    if (checkOutDate !== undefined) updateData.checkOutDate = checkOutDate;
    if (numberOfGuests !== undefined) updateData.numberOfGuests = parseInt(numberOfGuests);
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'checked_in') {
        updateData.checkedInAt = new Date().toISOString();
      } else if (status === 'checked_out') {
        updateData.checkedOutAt = new Date().toISOString();
      }
    }
    if (specialRequests !== undefined) updateData.specialRequests = specialRequests;
    if (notes !== undefined) updateData.notes = notes;
    if (paidAmount !== undefined) updateData.paidAmount = parseFloat(paidAmount);

    // Recalculate total if dates changed
    if (checkInDate && checkOutDate) {
      const { id } = await params;
      const reservation = await db
        .select({ roomId: reservations.roomId })
        .from(reservations)
        .where(eq(reservations.id, parseInt(id)))
        .limit(1);

      if (reservation.length > 0) {
        const room = await db
          .select({ baseRate: rooms.baseRate })
          .from(rooms)
          .where(eq(rooms.id, reservation[0].roomId))
          .limit(1);

        if (room.length > 0) {
          const checkIn = new Date(checkInDate);
          const checkOut = new Date(checkOutDate);
          const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
          updateData.numberOfNights = nights;
          updateData.totalAmount = nights * room[0].baseRate;
        }
      }
    }

    const { id: updateId } = await params;
    const result = await db
      .update(reservations)
      .set(updateData)
      .where(eq(reservations.id, parseInt(updateId)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, reservation: result[0] });
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const result = await db
      .delete(reservations)
      .where(eq(reservations.id, parseInt(id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}