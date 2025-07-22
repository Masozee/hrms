import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '../../../../lib/db';
import { reservations, guests, rooms, payments } from '../../../../schema';
import { authOptions } from '../../../../lib/auth';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reservationId = searchParams.get('reservationId');
    const format = searchParams.get('format') || 'json';

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

    const invoice = {
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
      generatedBy: session.user.name,
      generatedAt: new Date().toISOString()
    };

    if (format === 'pdf') {
      // In a real application, you would generate a PDF here
      // For now, we'll return the HTML content that could be printed as PDF
      const htmlInvoice = generateInvoiceHTML(invoice);
      return new NextResponse(htmlInvoice, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `inline; filename="invoice-${res.confirmationNumber}.html"`
        }
      });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error generating invoice:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateInvoiceHTML(invoice: any) {
  const { reservation, charges, taxes, summary, paymentHistory } = invoice;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${invoice.invoiceNumber}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          max-width: 800px; 
          margin: 0 auto; 
          padding: 20px; 
          line-height: 1.6;
        }
        .header { 
          text-align: center; 
          border-bottom: 2px solid #333; 
          padding-bottom: 20px; 
          margin-bottom: 30px; 
        }
        .invoice-info { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 30px; 
        }
        .billing-info { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 30px; 
        }
        .charges-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 20px; 
        }
        .charges-table th, 
        .charges-table td { 
          border: 1px solid #ddd; 
          padding: 12px; 
          text-align: left; 
        }
        .charges-table th { 
          background-color: #f5f5f5; 
        }
        .summary { 
          float: right; 
          width: 300px; 
          margin-top: 20px; 
        }
        .summary-row { 
          display: flex; 
          justify-content: space-between; 
          padding: 5px 0; 
        }
        .total-row { 
          font-weight: bold; 
          border-top: 2px solid #333; 
          padding-top: 10px; 
        }
        .payment-history { 
          clear: both; 
          margin-top: 40px; 
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>HOTEL INVOICE</h1>
        <h2>${invoice.invoiceNumber}</h2>
      </div>

      <div class="invoice-info">
        <div>
          <strong>Invoice Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}<br>
          <strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}<br>
          <strong>Confirmation #:</strong> ${reservation.confirmationNumber}
        </div>
        <div>
          <strong>Check-in:</strong> ${new Date(reservation.checkInDate).toLocaleDateString()}<br>
          <strong>Check-out:</strong> ${new Date(reservation.checkOutDate).toLocaleDateString()}<br>
          <strong>Room:</strong> ${reservation.room.roomNumber} (${reservation.room.roomType})
        </div>
      </div>

      <div class="billing-info">
        <div>
          <h3>Bill To:</h3>
          <strong>${reservation.guest.firstName} ${reservation.guest.lastName}</strong><br>
          ${reservation.guest.email}<br>
          ${reservation.guest.phone}<br>
          ${reservation.guest.address ? `${reservation.guest.address}<br>` : ''}
          ${reservation.guest.city && reservation.guest.country ? `${reservation.guest.city}, ${reservation.guest.country}` : ''}
        </div>
        <div>
          <h3>Hotel Information:</h3>
          <strong>Your Hotel Name</strong><br>
          123 Hotel Street<br>
          City, State 12345<br>
          Phone: (555) 123-4567
        </div>
      </div>

      <table class="charges-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantity</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${charges.map((charge: any) => `
            <tr>
              <td>${charge.description}</td>
              <td>${charge.quantity}</td>
              <td>$${charge.rate.toFixed(2)}</td>
              <td>$${charge.amount.toFixed(2)}</td>
            </tr>
          `).join('')}
          ${taxes.map((tax: any) => `
            <tr>
              <td>${tax.description}</td>
              <td>-</td>
              <td>${(tax.rate * 100).toFixed(1)}%</td>
              <td>$${tax.amount.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="summary">
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>$${summary.subtotal.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>Tax:</span>
          <span>$${summary.taxAmount.toFixed(2)}</span>
        </div>
        <div class="summary-row total-row">
          <span>Total Amount:</span>
          <span>$${summary.totalAmount.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>Amount Paid:</span>
          <span>$${summary.paidAmount.toFixed(2)}</span>
        </div>
        <div class="summary-row total-row" style="color: ${summary.balanceDue > 0 ? 'red' : 'green'};">
          <span>Balance Due:</span>
          <span>$${summary.balanceDue.toFixed(2)}</span>
        </div>
      </div>

      ${paymentHistory.length > 0 ? `
        <div class="payment-history">
          <h3>Payment History</h3>
          <table class="charges-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Type</th>
                <th>Processed By</th>
              </tr>
            </thead>
            <tbody>
              ${paymentHistory.map((payment: any) => `
                <tr>
                  <td>${new Date(payment.createdAt).toLocaleDateString()}</td>
                  <td>$${payment.amount.toFixed(2)}</td>
                  <td>${payment.paymentMethod.replace('_', ' ')}</td>
                  <td>${payment.paymentType}</td>
                  <td>${payment.processedBy}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}

      <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
        Generated by ${invoice.generatedBy} on ${new Date(invoice.generatedAt).toLocaleString()}
      </div>

      <div class="no-print" style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()" style="background: #007cba; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
          Print Invoice
        </button>
      </div>
    </body>
    </html>
  `;
}