import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '../../../../../lib/db';
import { reservations, guests, rooms, payments } from '../../../../../schema';
import { authOptions } from '../../../../../lib/auth';
import { eq } from 'drizzle-orm';
import { renderToBuffer } from '@react-pdf/renderer';
import PDFInvoice from '../../../../../components/invoices/pdf-invoice';
import React from 'react';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reservationId = searchParams.get('reservationId');

    if (!reservationId) {
      return NextResponse.json({ error: 'Reservation ID is required' }, { status: 400 });
    }

    // Get reservation details with guest and room info
    const reservation = await db
      .select({
        id: reservations.id,
        confirmationNumber: reservations.confirmationNumber,
        checkInDate: reservations.checkInDate,
        checkOutDate: reservations.checkOutDate,
        numberOfGuests: reservations.numberOfGuests,
        specialRequests: reservations.specialRequests,
        totalAmount: reservations.totalAmount,
        paidAmount: reservations.paidAmount,
        status: reservations.status,
        roomRate: reservations.roomRate,
        createdAt: reservations.createdAt,
        guest: {
          firstName: guests.firstName,
          lastName: guests.lastName,
          email: guests.email,
          phone: guests.phone,
          address: guests.address,
          city: guests.city,
          country: guests.country
        },
        room: {
          roomNumber: rooms.roomNumber,
          roomType: rooms.roomType,
          baseRate: rooms.baseRate,
          description: rooms.description
        }
      })
      .from(reservations)
      .leftJoin(guests, eq(reservations.guestId, guests.id))
      .leftJoin(rooms, eq(reservations.roomId, rooms.id))
      .where(eq(reservations.id, parseInt(reservationId)))
      .limit(1);

    if (reservation.length === 0) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // Get payment history
    const paymentHistory = await db
      .select({
        id: payments.id,
        amount: payments.amount,
        paymentMethod: payments.paymentMethod,
        paymentType: payments.paymentType,
        transactionId: payments.transactionId,
        processedBy: payments.processedBy,
        createdAt: payments.createdAt
      })
      .from(payments)
      .where(eq(payments.reservationId, parseInt(reservationId)));

    const res = reservation[0];
    
    // Check if guest and room data exist
    if (!res.guest || !res.room) {
      return NextResponse.json({ error: 'Incomplete reservation data' }, { status: 400 });
    }
    
    const checkIn = new Date(res.checkInDate);
    const checkOut = new Date(res.checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate charges breakdown
    const roomCharge = res.roomRate * nights;
    const taxRate = 0.10; // 10% tax rate
    const taxAmount = roomCharge * taxRate;
    const totalAmount = roomCharge + taxAmount;
    const balanceDue = totalAmount - res.paidAmount;

    const invoiceData = {
      invoiceNumber: `INV-${res.confirmationNumber}`,
      invoiceDate: new Date().toISOString(),
      dueDate: res.checkOutDate,
      reservation: res,
      charges: [
        {
          description: `Room ${res.room.roomNumber} (${res.room.roomType}) - ${nights} night${nights > 1 ? 's' : ''}`,
          quantity: nights,
          rate: res.roomRate,
          amount: roomCharge
        }
      ],
      taxes: [
        {
          description: 'Hotel Tax (10%)',
          rate: taxRate,
          amount: taxAmount
        }
      ],
      summary: {
        subtotal: roomCharge,
        taxAmount: taxAmount,
        totalAmount: totalAmount,
        paidAmount: res.paidAmount,
        balanceDue: balanceDue
      },
      paymentHistory: paymentHistory,
      generatedBy: session.user.name || 'Unknown',
      generatedAt: new Date().toISOString()
    };

    // Generate PDF using react-pdf
    const pdfBuffer = await renderToBuffer(React.createElement(PDFInvoice, { invoiceData }));

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${res.confirmationNumber}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating PDF invoice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}