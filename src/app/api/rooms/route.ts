import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '../../../../lib/db';
import { rooms } from '../../../../schema/rooms';
import { authOptions } from '../../../../lib/auth';


export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allRooms = await db.select().from(rooms).orderBy(rooms.roomNumber);
    return NextResponse.json(allRooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { roomNumber, roomType, floor, maxOccupancy, baseRate, amenities, description } = body;

    if (!roomNumber || !roomType || !floor || !maxOccupancy || !baseRate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newRoom = {
      roomNumber,
      roomType,
      floor: parseInt(floor),
      maxOccupancy: parseInt(maxOccupancy),
      baseRate: parseFloat(baseRate),
      status: 'available',
      amenities: amenities ? JSON.stringify(amenities) : null,
      description: description || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await db.insert(rooms).values(newRoom).returning();
    return NextResponse.json({ success: true, room: result[0] });
  } catch (error) {
    console.error('Error creating room:', error);
    if (error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'Room number already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}