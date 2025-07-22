import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '../../../../lib/db';
import { housekeepingTasks, rooms } from '../../../../schema';
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
        id: housekeepingTasks.id,
        taskType: housekeepingTasks.taskType,
        priority: housekeepingTasks.priority,
        status: housekeepingTasks.status,
        assignedTo: housekeepingTasks.assignedTo,
        description: housekeepingTasks.description,
        estimatedDuration: housekeepingTasks.estimatedDuration,
        startedAt: housekeepingTasks.startedAt,
        completedAt: housekeepingTasks.completedAt,
        notes: housekeepingTasks.notes,
        createdBy: housekeepingTasks.createdBy,
        createdAt: housekeepingTasks.createdAt,
        room: {
          id: rooms.id,
          roomNumber: rooms.roomNumber,
          roomType: rooms.roomType,
          floor: rooms.floor
        }
      })
      .from(housekeepingTasks)
      .leftJoin(rooms, eq(housekeepingTasks.roomId, rooms.id));

    if (status && status !== 'all') {
      query = query.where(eq(housekeepingTasks.status, status)) as any;
    }

    const tasks = await query.orderBy(desc(housekeepingTasks.createdAt));
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching housekeeping tasks:', error);
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
      roomId, 
      taskType, 
      priority = 'normal',
      description,
      estimatedDuration,
      assignedTo
    } = body;

    if (!roomId || !taskType || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newTask = {
      roomId: parseInt(roomId),
      taskType,
      priority,
      status: 'pending',
      assignedTo: assignedTo || null,
      description,
      estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : null,
      createdBy: session.user.name || 'Unknown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await db.insert(housekeepingTasks).values(newTask).returning();
    return NextResponse.json({ success: true, task: result[0] });
  } catch (error) {
    console.error('Error creating housekeeping task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}