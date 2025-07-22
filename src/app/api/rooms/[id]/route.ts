import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '../../../../../lib/db';
import { rooms } from '../../../../../schema/rooms';
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
    const room = await db.select().from(rooms).where(eq(rooms.id, parseInt(id))).limit(1);
    
    if (room.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json(room[0]);
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'manager', 'front_desk'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { roomNumber, roomType, floor, maxOccupancy, baseRate, status, amenities, description } = body;

    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (roomNumber !== undefined) updateData.roomNumber = roomNumber;
    if (roomType !== undefined) updateData.roomType = roomType;
    if (floor !== undefined) updateData.floor = parseInt(floor);
    if (maxOccupancy !== undefined) updateData.maxOccupancy = parseInt(maxOccupancy);
    if (baseRate !== undefined) updateData.baseRate = parseFloat(baseRate);
    if (status !== undefined) updateData.status = status;
    if (amenities !== undefined) updateData.amenities = JSON.stringify(amenities);
    if (description !== undefined) updateData.description = description;

    const { id } = await params;
    const result = await db
      .update(rooms)
      .set(updateData)
      .where(eq(rooms.id, parseInt(id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, room: result[0] });
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const result = await db
      .delete(rooms)
      .where(eq(rooms.id, parseInt(id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}