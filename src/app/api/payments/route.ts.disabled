import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '../../../../lib/db';
import { payments, reservations, guests, rooms } from '../../../../schema';
import { authOptions } from '../../../../lib/auth';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reservationId = searchParams.get('reservationId');

    let query = db
      .select({
        id: payments.id,
        amount: payments.amount,
        paymentMethod: payments.paymentMethod,
        paymentType: payments.paymentType,
        transactionId: payments.transactionId,
        status: payments.status,
        notes: payments.notes,
        processedBy: payments.processedBy,
        createdAt: payments.createdAt,
        reservation: {
          id: reservations.id,
          confirmationNumber: reservations.confirmationNumber,
          totalAmount: reservations.totalAmount,
          guest: {
            firstName: guests.firstName,
            lastName: guests.lastName
          },
          room: {
            roomNumber: rooms.roomNumber
          }
        }
      })
      .from(payments)
      .leftJoin(reservations, eq(payments.reservationId, reservations.id))
      .leftJoin(guests, eq(reservations.guestId, guests.id))
      .leftJoin(rooms, eq(reservations.roomId, rooms.id));

    if (reservationId) {
      query = query.where(eq(payments.reservationId, parseInt(reservationId)));
    }

    const allPayments = await query.orderBy(desc(payments.createdAt));
    return NextResponse.json(allPayments);
  } catch (error) {
    console.error('Error fetching payments:', error);
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
      reservationId,
      amount,
      paymentMethod,
      paymentType = 'payment',
      transactionId,
      notes
    } = body;

    if (!reservationId || !amount || !paymentMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate payment amount against reservation
    const reservation = await db
      .select()
      .from(reservations)
      .where(eq(reservations.id, parseInt(reservationId)))
      .limit(1);

    if (reservation.length === 0) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    const res = reservation[0];
    const newPaidAmount = res.paidAmount + parseFloat(amount);

    if (newPaidAmount > res.totalAmount && paymentType !== 'refund') {
      return NextResponse.json({ error: 'Payment amount exceeds total reservation amount' }, { status: 400 });
    }

    // Create payment record
    const newPayment = {
      reservationId: parseInt(reservationId),
      amount: parseFloat(amount),
      paymentMethod,
      paymentType,
      transactionId: transactionId || null,
      status: 'completed',
      notes: notes || null,
      processedBy: session.user.name || 'Unknown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const paymentResult = await db.insert(payments).values(newPayment).returning();

    // Update reservation paid amount
    await db
      .update(reservations)
      .set({
        paidAmount: paymentType === 'refund' ? res.paidAmount - parseFloat(amount) : newPaidAmount,
        updatedAt: new Date().toISOString()
      })
      .where(eq(reservations.id, parseInt(reservationId)));

    return NextResponse.json({ success: true, payment: paymentResult[0] });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}