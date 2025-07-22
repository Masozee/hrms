import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '../../../../../lib/db';
import { housekeepingTasks, rooms } from '../../../../../schema';
import { authOptions } from '../../../../../lib/auth';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, assignedTo, notes, estimatedDuration } = body;

    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (status !== undefined) {
      updateData.status = status;
      if (status === 'in_progress') {
        updateData.startedAt = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completedAt = new Date().toISOString();
        
        // Update room status to available when cleaning is completed
        const { id } = await params;
        const task = await db
          .select({ roomId: housekeepingTasks.roomId, taskType: housekeepingTasks.taskType })
          .from(housekeepingTasks)
          .where(eq(housekeepingTasks.id, parseInt(id)))
          .limit(1);

        if (task.length > 0 && task[0].taskType === 'cleaning') {
          await db
            .update(rooms)
            .set({ 
              status: 'available',
              updatedAt: new Date().toISOString()
            })
            .where(eq(rooms.id, task[0].roomId));
        }
      }
    }

    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (notes !== undefined) updateData.notes = notes;
    if (estimatedDuration !== undefined) updateData.estimatedDuration = parseInt(estimatedDuration);

    const { id: taskId } = await params;
    const result = await db
      .update(housekeepingTasks)
      .set(updateData)
      .where(eq(housekeepingTasks.id, parseInt(taskId)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, task: result[0] });
  } catch (error) {
    console.error('Error updating housekeeping task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'manager', 'housekeeping'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: deleteId } = await params;
    const result = await db
      .delete(housekeepingTasks)
      .where(eq(housekeepingTasks.id, parseInt(deleteId)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting housekeeping task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}