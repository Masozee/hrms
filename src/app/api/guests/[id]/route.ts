import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '../../../../../lib/db';
import { guests } from '../../../../../schema/guests';
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
    const guest = await db.select().from(guests).where(eq(guests.id, parseInt(id))).limit(1);
    
    if (guest.length === 0) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    return NextResponse.json(guest[0]);
  } catch (error) {
    console.error('Error fetching guest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      idType, 
      idNumber, 
      nationality, 
      address, 
      city, 
      country, 
      dateOfBirth, 
      specialRequests, 
      notes 
    } = body;

    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (idType !== undefined) updateData.idType = idType;
    if (idNumber !== undefined) updateData.idNumber = idNumber;
    if (nationality !== undefined) updateData.nationality = nationality;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (country !== undefined) updateData.country = country;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (specialRequests !== undefined) updateData.specialRequests = specialRequests;
    if (notes !== undefined) updateData.notes = notes;

    const { id } = await params;
    const result = await db
      .update(guests)
      .set(updateData)
      .where(eq(guests.id, parseInt(id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, guest: result[0] });
  } catch (error) {
    console.error('Error updating guest:', error);
    if ((error as any).message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'Email address already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'manager'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const result = await db
      .delete(guests)
      .where(eq(guests.id, parseInt(id)))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Guest deleted successfully' });
  } catch (error) {
    console.error('Error deleting guest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}