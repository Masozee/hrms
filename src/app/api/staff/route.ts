import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import { db } from '../../../../lib/db';
import { staff } from '../../../../schema/staff';
import { authOptions } from '../../../../lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const staffMembers = await db.select({
      id: staff.id,
      username: staff.username,
      email: staff.email,
      firstName: staff.firstName,
      lastName: staff.lastName,
      role: staff.role,
      department: staff.department,
      phone: staff.phone,
      isActive: staff.isActive,
      lastLogin: staff.lastLogin,
      createdAt: staff.createdAt
    }).from(staff);

    return NextResponse.json(staffMembers);
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { username, email, firstName, lastName, role, department, phone, password } = body;

    if (!username || !email || !firstName || !lastName || !role || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newStaffMember = {
      username,
      email,
      firstName,
      lastName,
      role,
      department: department || null,
      phone: phone || null,
      isActive: true,
      passwordHash: hashedPassword,
      permissions: JSON.stringify({
        modules: role === 'admin' ? ['reservations', 'rooms', 'guests', 'housekeeping', 'reports', 'staff', 'admin'] : ['reservations', 'rooms', 'guests', 'housekeeping']
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await db.insert(staff).values(newStaffMember).returning();

    return NextResponse.json({ success: true, staff: result[0] });
  } catch (error) {
    console.error('Error creating staff member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}