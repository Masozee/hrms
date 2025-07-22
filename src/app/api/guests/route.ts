import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '../../../../lib/db';
import { guests } from '../../../../schema/guests';
import { authOptions } from '../../../../lib/auth';
import { like, or } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = db.select().from(guests);

    if (search) {
      query = query.where(
        or(
          like(guests.firstName, `%${search}%`),
          like(guests.lastName, `%${search}%`),
          like(guests.email, `%${search}%`),
          like(guests.phone, `%${search}%`)
        )
      ) as any;
    }

    const allGuests = await query.orderBy(guests.lastName, guests.firstName);
    return NextResponse.json(allGuests);
  } catch (error) {
    console.error('Error fetching guests:', error);
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

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: 'First name, last name, and email are required' }, { status: 400 });
    }

    const newGuest = {
      firstName,
      lastName,
      email,
      phone: phone || null,
      idType: idType || null,
      idNumber: idNumber || null,
      nationality: nationality || null,
      address: address || null,
      city: city || null,
      country: country || null,
      dateOfBirth: dateOfBirth || null,
      specialRequests: specialRequests || null,
      notes: notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await db.insert(guests).values(newGuest).returning();
    return NextResponse.json({ success: true, guest: result[0] });
  } catch (error) {
    console.error('Error creating guest:', error);
    if ((error as any).message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'Email address already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}