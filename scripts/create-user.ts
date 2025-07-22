import bcrypt from 'bcryptjs';
import { db } from '../lib/db';
import { staff } from '../schema/staff';

async function createUser() {
  try {
    const hashedPassword = await bcrypt.hash('B6585esp__', 12);
    
    const newUser = {
      username: 'oji-001',
      email: 'oji@hotel.com',
      firstName: 'Oji',
      lastName: 'Staff',
      role: 'front_desk',
      department: 'front_office',
      phone: '+1234567891',
      isActive: true,
      passwordHash: hashedPassword,
      permissions: JSON.stringify({
        modules: ['reservations', 'rooms', 'guests', 'housekeeping']
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.insert(staff).values(newUser);
    
    console.log('✅ User created successfully!');
    console.log('Username: oji-001');
    console.log('Password: B6585esp__');
    console.log('Role: front_desk');
    console.log('Department: front_office');
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
  }
}

createUser();