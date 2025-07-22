import bcrypt from 'bcryptjs';
import { db } from '../lib/db';
import { staff } from '../schema/staff';

async function createAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = {
      username: 'admin',
      email: 'admin@hotel.com',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      department: 'management',
      phone: '+1234567890',
      isActive: true,
      passwordHash: hashedPassword,
      permissions: JSON.stringify({
        all: true,
        modules: ['reservations', 'rooms', 'guests', 'housekeeping', 'reports', 'staff', 'admin']
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.insert(staff).values(adminUser);
    
    console.log('✅ Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('⚠️  Please change the password after first login!');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

createAdminUser();