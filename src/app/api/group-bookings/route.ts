import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '../../../../lib/db';
import { groupBookings, groupBookingRooms, reservations, guests, rooms } from '../../../../schema';
import { authOptions } from '../../../../lib/auth';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = db
      .select({
        id: groupBookings.id,
        groupName: groupBookings.groupName,
        eventType: groupBookings.eventType,
        contactPersonName: groupBookings.contactPersonName,
        contactEmail: groupBookings.contactEmail,
        contactPhone: groupBookings.contactPhone,
        company: groupBookings.company,
        eventStartDate: groupBookings.eventStartDate,
        eventEndDate: groupBookings.eventEndDate,
        totalRooms: groupBookings.totalRooms,
        totalGuests: groupBookings.totalGuests,
        specialRequests: groupBookings.specialRequests,
        notes: groupBookings.notes,
        totalAmount: groupBookings.totalAmount,
        paidAmount: groupBookings.paidAmount,
        status: groupBookings.status,
        createdBy: groupBookings.createdBy,
        createdAt: groupBookings.createdAt,
        updatedAt: groupBookings.updatedAt,
      })
      .from(groupBookings);

    if (status && status !== 'all') {
      query = query.where(eq(groupBookings.status, status)) as any;
    }

    const allGroupBookings = await query.orderBy(desc(groupBookings.createdAt));
    return NextResponse.json(allGroupBookings);
  } catch (error) {
    console.error('Error fetching group bookings:', error);
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
      groupName,
      eventType,
      contactPersonName,
      contactEmail,
      contactPhone,
      company,
      eventStartDate,
      eventEndDate,
      totalRooms,
      totalGuests,
      specialRequests,
      notes,
      roomRequirements = [] // Array of room requirements
    } = body;

    if (!groupName || !eventType || !contactPersonName || !contactEmail || !contactPhone || 
        !eventStartDate || !eventEndDate || !totalRooms || !totalGuests) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create the group booking
    const newGroupBooking = {
      groupName,
      eventType,
      contactPersonName,
      contactEmail,
      contactPhone,
      company: company || null,
      eventStartDate,
      eventEndDate,
      totalRooms: parseInt(totalRooms),
      totalGuests: parseInt(totalGuests),
      specialRequests: specialRequests || null,
      notes: notes || null,
      totalAmount: 0, // Will be calculated after creating individual reservations
      paidAmount: 0,
      status: 'pending',
      createdBy: session.user.name || 'Unknown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const groupBookingResult = await db.insert(groupBookings).values(newGroupBooking).returning();
    const groupBookingId = groupBookingResult[0].id;

    // If room requirements are provided, create individual reservations
    let totalAmount = 0;
    const createdReservations = [];

    for (const roomReq of roomRequirements) {
      // Create a guest record for this room
      const guestData = {
        firstName: roomReq.guestFirstName || contactPersonName,
        lastName: roomReq.guestLastName || '',
        email: roomReq.guestEmail || contactEmail,
        phone: roomReq.guestPhone || contactPhone,
        address: '',
        city: '',
        country: '',
        postalCode: '',
        idType: '',
        idNumber: '',
        notes: `Group booking: ${groupName}`,
        createdBy: session.user.name || 'Unknown',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const guestResult = await db.insert(guests).values(guestData).returning();
      const guestId = guestResult[0].id;

      // Get room details for rate calculation
      const room = await db.select().from(rooms).where(eq(rooms.id, roomReq.roomId)).limit(1);
      if (room.length === 0) {
        continue; // Skip if room not found
      }

      const nights = Math.ceil((new Date(eventEndDate).getTime() - new Date(eventStartDate).getTime()) / (1000 * 60 * 60 * 24));
      const roomTotal = room[0].baseRate * nights;
      totalAmount += roomTotal;

      // Create reservation
      const reservationData = {
        guestId: guestId,
        roomId: roomReq.roomId,
        checkInDate: eventStartDate,
        checkOutDate: eventEndDate,
        numberOfGuests: roomReq.numberOfGuests || 1,
        numberOfNights: nights,
        roomRate: room[0].baseRate,
        specialRequests: roomReq.specialRequests || specialRequests || null,
        totalAmount: roomTotal,
        paidAmount: 0,
        status: 'confirmed',
        confirmationNumber: `GRP-${groupBookingId}-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        createdBy: session.user.name || 'Unknown',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const reservationResult = await db.insert(reservations).values(reservationData).returning();
      createdReservations.push(reservationResult[0]);

      // Link reservation to group booking
      await db.insert(groupBookingRooms).values({
        groupBookingId: groupBookingId,
        reservationId: reservationResult[0].id,
        createdAt: new Date().toISOString()
      });
    }

    // Update group booking with total amount
    await db
      .update(groupBookings)
      .set({
        totalAmount: totalAmount,
        updatedAt: new Date().toISOString()
      })
      .where(eq(groupBookings.id, groupBookingId));

    return NextResponse.json({ 
      success: true, 
      groupBooking: { ...groupBookingResult[0], totalAmount },
      reservations: createdReservations
    });
  } catch (error) {
    console.error('Error creating group booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}