import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '../../../../lib/db';
import { reservations, rooms, guests } from '../../../../schema';
import { authOptions } from '../../../../lib/auth';
import { eq, and, gte, lte, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    let query = db
      .select({
        id: reservations.id,
        confirmationNumber: reservations.confirmationNumber,
        checkInDate: reservations.checkInDate,
        checkOutDate: reservations.checkOutDate,
        numberOfGuests: reservations.numberOfGuests,
        numberOfNights: reservations.numberOfNights,
        roomRate: reservations.roomRate,
        totalAmount: reservations.totalAmount,
        paidAmount: reservations.paidAmount,
        status: reservations.status,
        specialRequests: reservations.specialRequests,
        notes: reservations.notes,
        source: reservations.source,
        createdAt: reservations.createdAt,
        checkedInAt: reservations.checkedInAt,
        checkedOutAt: reservations.checkedOutAt,
        guest: {
          id: guests.id,
          firstName: guests.firstName,
          lastName: guests.lastName,
          email: guests.email,
          phone: guests.phone
        },
        room: {
          id: rooms.id,
          roomNumber: rooms.roomNumber,
          roomType: rooms.roomType,
          floor: rooms.floor
        }
      })
      .from(reservations)
      .leftJoin(guests, eq(reservations.guestId, guests.id))
      .leftJoin(rooms, eq(reservations.roomId, rooms.id));

    // Apply filters
    const conditions = [];
    
    if (status && status !== 'all') {
      conditions.push(eq(reservations.status, status));
    }
    
    if (fromDate) {
      conditions.push(gte(reservations.checkInDate, fromDate));
    }
    
    if (toDate) {
      conditions.push(lte(reservations.checkOutDate, toDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const allReservations = await query.orderBy(reservations.checkInDate);
    return NextResponse.json(allReservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      guestId, 
      roomId, 
      checkInDate, 
      checkOutDate, 
      numberOfGuests,
      specialRequests,
      notes,
      source = 'front_desk'
    } = body;

    if (!guestId || !roomId || !checkInDate || !checkOutDate || !numberOfGuests) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if room is available for the given dates
    const conflictingReservations = await db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.roomId, roomId),
          or(
            eq(reservations.status, 'confirmed'),
            eq(reservations.status, 'checked_in')
          ),
          or(
            and(
              gte(checkInDate, reservations.checkInDate),
              lte(checkInDate, reservations.checkOutDate)
            ),
            and(
              gte(checkOutDate, reservations.checkInDate),
              lte(checkOutDate, reservations.checkOutDate)
            ),
            and(
              lte(checkInDate, reservations.checkInDate),
              gte(checkOutDate, reservations.checkOutDate)
            )
          )
        )
      );

    if (conflictingReservations.length > 0) {
      return NextResponse.json({ error: 'Room is not available for the selected dates' }, { status: 400 });
    }

    // Get room details for rate calculation
    const room = await db.select().from(rooms).where(eq(rooms.id, roomId)).limit(1);
    if (room.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Calculate number of nights and total amount
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const totalAmount = nights * room[0].baseRate;

    // Generate confirmation number
    const confirmationNumber = `HTL-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const newReservation = {
      confirmationNumber,
      guestId: parseInt(guestId),
      roomId: parseInt(roomId),
      checkInDate,
      checkOutDate,
      numberOfGuests: parseInt(numberOfGuests),
      numberOfNights: nights,
      roomRate: room[0].baseRate,
      totalAmount,
      paidAmount: 0,
      status: 'confirmed',
      specialRequests: specialRequests || null,
      notes: notes || null,
      source,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await db.insert(reservations).values(newReservation).returning();
    return NextResponse.json({ success: true, reservation: result[0] });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}