import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '../../../../lib/db';
import { reservations, rooms, guests } from '../../../../schema';
import { authOptions } from '../../../../lib/auth';
import { eq, and, gte, lte, sql, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'dashboard';
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    switch (reportType) {
      case 'dashboard':
        return await getDashboardMetrics(fromDate, toDate);
      case 'occupancy':
        return await getOccupancyReport(fromDate, toDate);
      case 'revenue':
        return await getRevenueReport(fromDate, toDate);
      case 'rooms':
        return await getRoomStatusReport();
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getDashboardMetrics(fromDate?: string | null, toDate?: string | null) {
  const today = new Date().toISOString().split('T')[0];
  const startDate = fromDate || today;
  const endDate = toDate || today;

  // Total rooms
  const totalRoomsResult = await db.select({ count: count() }).from(rooms);
  const totalRooms = totalRoomsResult[0].count;

  // Available rooms
  const availableRoomsResult = await db
    .select({ count: count() })
    .from(rooms)
    .where(eq(rooms.status, 'available'));
  const availableRooms = availableRoomsResult[0].count;

  // Occupied rooms
  const occupiedRoomsResult = await db
    .select({ count: count() })
    .from(rooms)
    .where(eq(rooms.status, 'occupied'));
  const occupiedRooms = occupiedRoomsResult[0].count;

  // Today's check-ins
  const todayCheckInsResult = await db
    .select({ count: count() })
    .from(reservations)
    .where(
      and(
        eq(reservations.checkInDate, today),
        eq(reservations.status, 'confirmed')
      )
    );
  const todayCheckIns = todayCheckInsResult[0].count;

  // Today's check-outs
  const todayCheckOutsResult = await db
    .select({ count: count() })
    .from(reservations)
    .where(
      and(
        eq(reservations.checkOutDate, today),
        eq(reservations.status, 'checked_in')
      )
    );
  const todayCheckOuts = todayCheckOutsResult[0].count;

  // Revenue for date range
  const revenueResult = await db
    .select({ 
      totalRevenue: sql<number>`COALESCE(SUM(${reservations.paidAmount}), 0)`,
      totalExpected: sql<number>`COALESCE(SUM(${reservations.totalAmount}), 0)`
    })
    .from(reservations)
    .where(
      and(
        gte(reservations.checkInDate, startDate),
        lte(reservations.checkOutDate, endDate),
        eq(reservations.status, 'checked_out')
      )
    );

  const revenue = revenueResult[0];

  // Recent reservations
  const recentReservationsResult = await db
    .select({
      id: reservations.id,
      confirmationNumber: reservations.confirmationNumber,
      checkInDate: reservations.checkInDate,
      checkOutDate: reservations.checkOutDate,
      status: reservations.status,
      totalAmount: reservations.totalAmount,
      guest: {
        firstName: guests.firstName,
        lastName: guests.lastName
      },
      room: {
        roomNumber: rooms.roomNumber
      }
    })
    .from(reservations)
    .leftJoin(guests, eq(reservations.guestId, guests.id))
    .leftJoin(rooms, eq(reservations.roomId, rooms.id))
    .orderBy(sql`${reservations.createdAt} DESC`)
    .limit(5);

  // Calculate occupancy rate
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Calculate ADR (Average Daily Rate) for completed stays
  const adrResult = await db
    .select({ 
      avgRate: sql<number>`COALESCE(AVG(${reservations.roomRate}), 0)`
    })
    .from(reservations)
    .where(
      and(
        gte(reservations.checkInDate, startDate),
        lte(reservations.checkOutDate, endDate),
        eq(reservations.status, 'checked_out')
      )
    );

  const adr = Math.round(adrResult[0].avgRate || 0);

  // Calculate RevPAR (Revenue per Available Room)
  const revpar = totalRooms > 0 ? Math.round((revenue.totalRevenue || 0) / totalRooms) : 0;

  return NextResponse.json({
    totalRooms,
    availableRooms,
    occupiedRooms,
    occupancyRate,
    todayCheckIns,
    todayCheckOuts,
    revenue: revenue.totalRevenue || 0,
    expectedRevenue: revenue.totalExpected || 0,
    adr,
    revpar,
    recentReservations: recentReservationsResult,
    dateRange: { from: startDate, to: endDate }
  });
}

async function getOccupancyReport(fromDate?: string | null, toDate?: string | null) {
  const startDate = fromDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDate = toDate || new Date().toISOString().split('T')[0];

  // Daily occupancy for the date range
  const occupancyData = await db
    .select({
      date: reservations.checkInDate,
      occupied: sql<number>`COUNT(CASE WHEN ${reservations.status} IN ('checked_in', 'checked_out') THEN 1 END)`,
      total: sql<number>`(SELECT COUNT(*) FROM ${rooms})`
    })
    .from(reservations)
    .where(
      and(
        gte(reservations.checkInDate, startDate),
        lte(reservations.checkInDate, endDate)
      )
    )
    .groupBy(reservations.checkInDate)
    .orderBy(reservations.checkInDate);

  return NextResponse.json({
    occupancyData,
    dateRange: { from: startDate, to: endDate }
  });
}

async function getRevenueReport(fromDate?: string | null, toDate?: string | null) {
  const startDate = fromDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDate = toDate || new Date().toISOString().split('T')[0];

  // Revenue by date
  const revenueData = await db
    .select({
      date: reservations.checkOutDate,
      revenue: sql<number>`COALESCE(SUM(${reservations.paidAmount}), 0)`,
      expected: sql<number>`COALESCE(SUM(${reservations.totalAmount}), 0)`,
      bookings: sql<number>`COUNT(*)`
    })
    .from(reservations)
    .where(
      and(
        gte(reservations.checkOutDate, startDate),
        lte(reservations.checkOutDate, endDate),
        eq(reservations.status, 'checked_out')
      )
    )
    .groupBy(reservations.checkOutDate)
    .orderBy(reservations.checkOutDate);

  // Revenue by room type
  const revenueByRoomType = await db
    .select({
      roomType: rooms.roomType,
      revenue: sql<number>`COALESCE(SUM(${reservations.paidAmount}), 0)`,
      bookings: sql<number>`COUNT(*)`
    })
    .from(reservations)
    .leftJoin(rooms, eq(reservations.roomId, rooms.id))
    .where(
      and(
        gte(reservations.checkOutDate, startDate),
        lte(reservations.checkOutDate, endDate),
        eq(reservations.status, 'checked_out')
      )
    )
    .groupBy(rooms.roomType)
    .orderBy(sql`revenue DESC`);

  return NextResponse.json({
    revenueData,
    revenueByRoomType,
    dateRange: { from: startDate, to: endDate }
  });
}

async function getRoomStatusReport() {
  // Room status breakdown
  const roomStatusData = await db
    .select({
      status: rooms.status,
      count: sql<number>`COUNT(*)`
    })
    .from(rooms)
    .groupBy(rooms.status);

  // Rooms by type and status
  const roomsByType = await db
    .select({
      roomType: rooms.roomType,
      status: rooms.status,
      count: sql<number>`COUNT(*)`
    })
    .from(rooms)
    .groupBy(rooms.roomType, rooms.status)
    .orderBy(rooms.roomType);

  return NextResponse.json({
    roomStatusData,
    roomsByType
  });
}