import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '../../../../lib/db';
import { reservations, guests, rooms, housekeepingTasks } from '../../../../schema';
import { authOptions } from '../../../../lib/auth';
import { eq, and, gte, lte, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const notifications = [];

    // Today's Check-ins
    if (type === 'all' || type === 'checkins') {
      const todayCheckins = await db
        .select({
          id: reservations.id,
          confirmationNumber: reservations.confirmationNumber,
          checkInDate: reservations.checkInDate,
          numberOfGuests: reservations.numberOfGuests,
          status: reservations.status,
          guest: {
            firstName: guests.firstName,
            lastName: guests.lastName,
            phone: guests.phone
          },
          room: {
            roomNumber: rooms.roomNumber,
            roomType: rooms.roomType
          }
        })
        .from(reservations)
        .leftJoin(guests, eq(reservations.guestId, guests.id))
        .leftJoin(rooms, eq(reservations.roomId, rooms.id))
        .where(
          and(
            gte(reservations.checkInDate, todayStr),
            lte(reservations.checkInDate, todayStr),
            eq(reservations.status, 'confirmed')
          )
        );

      todayCheckins.forEach(checkin => {
        // Skip if guest or room data is missing
        if (!checkin.guest || !checkin.room) return;
        
        notifications.push({
          id: `checkin-${checkin.id}`,
          type: 'checkin',
          priority: 'high',
          title: 'Check-in Today',
          message: `${checkin.guest.firstName} ${checkin.guest.lastName} - Room ${checkin.room.roomNumber}`,
          details: {
            confirmationNumber: checkin.confirmationNumber,
            guests: checkin.numberOfGuests,
            roomType: checkin.room.roomType,
            phone: checkin.guest.phone
          },
          timestamp: checkin.checkInDate,
          actionRequired: checkin.status === 'confirmed'
        });
      });
    }

    // Today's Check-outs
    if (type === 'all' || type === 'checkouts') {
      const todayCheckouts = await db
        .select({
          id: reservations.id,
          confirmationNumber: reservations.confirmationNumber,
          checkOutDate: reservations.checkOutDate,
          status: reservations.status,
          paidAmount: reservations.paidAmount,
          totalAmount: reservations.totalAmount,
          guest: {
            firstName: guests.firstName,
            lastName: guests.lastName
          },
          room: {
            roomNumber: rooms.roomNumber,
            roomType: rooms.roomType
          }
        })
        .from(reservations)
        .leftJoin(guests, eq(reservations.guestId, guests.id))
        .leftJoin(rooms, eq(reservations.roomId, rooms.id))
        .where(
          and(
            gte(reservations.checkOutDate, todayStr),
            lte(reservations.checkOutDate, todayStr),
            eq(reservations.status, 'checked_in')
          )
        );

      todayCheckouts.forEach(checkout => {
        // Skip if guest or room data is missing
        if (!checkout.guest || !checkout.room) return;
        
        const hasOutstandingBalance = checkout.paidAmount < checkout.totalAmount;
        notifications.push({
          id: `checkout-${checkout.id}`,
          type: 'checkout',
          priority: hasOutstandingBalance ? 'high' : 'medium',
          title: 'Check-out Today',
          message: `${checkout.guest.firstName} ${checkout.guest.lastName} - Room ${checkout.room.roomNumber}`,
          details: {
            confirmationNumber: checkout.confirmationNumber,
            outstandingBalance: hasOutstandingBalance ? checkout.totalAmount - checkout.paidAmount : 0,
            roomType: checkout.room.roomType
          },
          timestamp: checkout.checkOutDate,
          actionRequired: hasOutstandingBalance
        });
      });
    }

    // Overdue Housekeeping Tasks
    if (type === 'all' || type === 'housekeeping') {
      const overdueTasks = await db
        .select({
          id: housekeepingTasks.id,
          taskType: housekeepingTasks.taskType,
          priority: housekeepingTasks.priority,
          status: housekeepingTasks.status,
          assignedTo: housekeepingTasks.assignedTo,
          createdAt: housekeepingTasks.createdAt,
          room: {
            roomNumber: rooms.roomNumber,
            roomType: rooms.roomType
          }
        })
        .from(housekeepingTasks)
        .leftJoin(rooms, eq(housekeepingTasks.roomId, rooms.id))
        .where(
          and(
            or(
              eq(housekeepingTasks.status, 'pending'),
              eq(housekeepingTasks.status, 'in_progress')
            ),
            lte(housekeepingTasks.createdAt, todayStr)
          )
        );

      overdueTasks.forEach(task => {
        // Skip if room data is missing
        if (!task.room) return;
        
        const createdDate = new Date(task.createdAt);
        const hoursOld = Math.ceil((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60));
        const isOverdue = hoursOld > 24; // Tasks pending for more than 24 hours
        
        notifications.push({
          id: `housekeeping-${task.id}`,
          type: 'housekeeping',
          priority: isOverdue ? 'urgent' : task.priority,
          title: isOverdue ? 'Overdue Housekeeping Task' : 'Pending Housekeeping Task',
          message: `${task.taskType} - Room ${task.room.roomNumber}`,
          details: {
            assignedTo: task.assignedTo || 'Unassigned',
            createdAt: task.createdAt,
            roomType: task.room.roomType,
            hoursOld: hoursOld
          },
          timestamp: task.createdAt,
          actionRequired: true
        });
      });
    }

    // Rooms Out of Order / Maintenance
    if (type === 'all' || type === 'maintenance') {
      const maintenanceRooms = await db
        .select({
          id: rooms.id,
          roomNumber: rooms.roomNumber,
          roomType: rooms.roomType,
          status: rooms.status,
          notes: rooms.notes,
          updatedAt: rooms.updatedAt
        })
        .from(rooms)
        .where(
          or(
            eq(rooms.status, 'maintenance'),
            eq(rooms.status, 'blocked')
          )
        );

      maintenanceRooms.forEach(room => {
        notifications.push({
          id: `maintenance-${room.id}`,
          type: 'maintenance',
          priority: 'medium',
          title: 'Room Out of Service',
          message: `Room ${room.roomNumber} (${room.roomType}) - ${room.status}`,
          details: {
            status: room.status,
            notes: room.notes,
            lastUpdated: room.updatedAt
          },
          timestamp: room.updatedAt,
          actionRequired: false
        });
      });
    }

    // Outstanding Payments
    if (type === 'all' || type === 'payments') {
      const outstandingPayments = await db
        .select({
          id: reservations.id,
          confirmationNumber: reservations.confirmationNumber,
          totalAmount: reservations.totalAmount,
          paidAmount: reservations.paidAmount,
          checkOutDate: reservations.checkOutDate,
          status: reservations.status,
          guest: {
            firstName: guests.firstName,
            lastName: guests.lastName,
            phone: guests.phone
          },
          room: {
            roomNumber: rooms.roomNumber
          }
        })
        .from(reservations)
        .leftJoin(guests, eq(reservations.guestId, guests.id))
        .leftJoin(rooms, eq(reservations.roomId, rooms.id))
        .where(
          and(
            eq(reservations.status, 'checked_out'),
            // Has outstanding balance
          )
        );

      const unpaidReservations = outstandingPayments.filter(res => res.paidAmount < res.totalAmount);
      
      unpaidReservations.forEach(reservation => {
        // Skip if guest or room data is missing
        if (!reservation.guest || !reservation.room) return;
        
        const balance = reservation.totalAmount - reservation.paidAmount;
        const checkoutDate = new Date(reservation.checkOutDate);
        const daysOverdue = Math.ceil((today.getTime() - checkoutDate.getTime()) / (1000 * 60 * 60 * 24));
        
        notifications.push({
          id: `payment-${reservation.id}`,
          type: 'payment',
          priority: daysOverdue > 7 ? 'urgent' : daysOverdue > 3 ? 'high' : 'medium',
          title: 'Outstanding Payment',
          message: `${reservation.guest.firstName} ${reservation.guest.lastName} - Rp ${balance.toLocaleString('id-ID')} due`,
          details: {
            confirmationNumber: reservation.confirmationNumber,
            room: reservation.room.roomNumber,
            outstandingAmount: balance,
            daysOverdue: daysOverdue,
            phone: reservation.guest.phone
          },
          timestamp: reservation.checkOutDate,
          actionRequired: true
        });
      });
    }

    // Sort notifications by priority and timestamp
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    notifications.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return NextResponse.json({
      notifications,
      summary: {
        total: notifications.length,
        urgent: notifications.filter(n => n.priority === 'urgent').length,
        high: notifications.filter(n => n.priority === 'high').length,
        actionRequired: notifications.filter(n => n.actionRequired).length
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}