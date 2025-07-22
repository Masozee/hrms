import { db } from '../lib/db';
import { rooms, guests, reservations } from '../schema';

async function seedSampleData() {
  try {
    console.log('🌱 Seeding sample data...');

    // Add sample rooms
    const sampleRooms = [
      { roomNumber: '101', roomType: 'single', floor: 1, maxOccupancy: 1, baseRate: 89.99, status: 'available', description: 'Cozy single room with city view' },
      { roomNumber: '102', roomType: 'double', floor: 1, maxOccupancy: 2, baseRate: 129.99, status: 'available', description: 'Comfortable double room with garden view' },
      { roomNumber: '103', roomType: 'double', floor: 1, maxOccupancy: 2, baseRate: 129.99, status: 'occupied', description: 'Standard double room' },
      { roomNumber: '201', roomType: 'suite', floor: 2, maxOccupancy: 4, baseRate: 249.99, status: 'available', description: 'Luxurious suite with separate living area' },
      { roomNumber: '202', roomType: 'deluxe', floor: 2, maxOccupancy: 2, baseRate: 189.99, status: 'dirty', description: 'Deluxe room with premium amenities' },
      { roomNumber: '203', roomType: 'family', floor: 2, maxOccupancy: 4, baseRate: 199.99, status: 'available', description: 'Family room with bunk beds' },
      { roomNumber: '301', roomType: 'suite', floor: 3, maxOccupancy: 4, baseRate: 269.99, status: 'maintenance', description: 'Premium suite with balcony' },
      { roomNumber: '302', roomType: 'deluxe', floor: 3, maxOccupancy: 2, baseRate: 189.99, status: 'available', description: 'Deluxe room with ocean view' },
    ];

    for (const room of sampleRooms) {
      await db.insert(rooms).values({
        ...room,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    console.log('✅ Sample rooms created');

    // Add sample guests
    const sampleGuests = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0101',
        idType: 'passport',
        idNumber: 'US1234567',
        nationality: 'American',
        address: '123 Main St',
        city: 'New York',
        country: 'USA',
        dateOfBirth: '1985-06-15'
      },
      {
        firstName: 'Emily',
        lastName: 'Johnson',
        email: 'emily.johnson@email.com',
        phone: '+1-555-0102',
        idType: 'driver_license',
        idNumber: 'DL789012',
        nationality: 'Canadian',
        address: '456 Oak Ave',
        city: 'Toronto',
        country: 'Canada',
        specialRequests: 'Vegetarian meals preferred'
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@email.com',
        phone: '+1-555-0103',
        idType: 'passport',
        idNumber: 'UK9876543',
        nationality: 'British',
        address: '789 Queen St',
        city: 'London',
        country: 'UK',
        dateOfBirth: '1978-12-03'
      },
      {
        firstName: 'Sarah',
        lastName: 'Davis',
        email: 'sarah.davis@email.com',
        phone: '+1-555-0104',
        nationality: 'American',
        address: '321 Pine St',
        city: 'Los Angeles',
        country: 'USA',
        specialRequests: 'Late check-out if possible'
      }
    ];

    for (const guest of sampleGuests) {
      await db.insert(guests).values({
        ...guest,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    console.log('✅ Sample guests created');

    // Add sample reservations
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const sampleReservations = [
      {
        confirmationNumber: 'HTL-2024-001',
        guestId: 1,
        roomId: 3, // Room 103 (occupied)
        checkInDate: today.toISOString().split('T')[0],
        checkOutDate: tomorrow.toISOString().split('T')[0],
        numberOfGuests: 2,
        numberOfNights: 1,
        roomRate: 129.99,
        totalAmount: 129.99,
        paidAmount: 129.99,
        status: 'checked_in',
        source: 'front_desk'
      },
      {
        confirmationNumber: 'HTL-2024-002',
        guestId: 2,
        roomId: 1, // Room 101
        checkInDate: tomorrow.toISOString().split('T')[0],
        checkOutDate: nextWeek.toISOString().split('T')[0],
        numberOfGuests: 1,
        numberOfNights: 6,
        roomRate: 89.99,
        totalAmount: 539.94,
        paidAmount: 100.00,
        status: 'confirmed',
        specialRequests: 'Early check-in requested',
        source: 'online'
      },
      {
        confirmationNumber: 'HTL-2024-003',
        guestId: 3,
        roomId: 2, // Room 102
        checkInDate: lastWeek.toISOString().split('T')[0],
        checkOutDate: today.toISOString().split('T')[0],
        numberOfGuests: 2,
        numberOfNights: 7,
        roomRate: 129.99,
        totalAmount: 909.93,
        paidAmount: 909.93,
        status: 'checked_out',
        source: 'phone'
      }
    ];

    for (const reservation of sampleReservations) {
      await db.insert(reservations).values({
        ...reservation,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        checkedInAt: reservation.status === 'checked_in' ? new Date().toISOString() : null,
        checkedOutAt: reservation.status === 'checked_out' ? new Date().toISOString() : null
      });
    }

    console.log('✅ Sample reservations created');
    console.log('🎉 Sample data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${sampleRooms.length} rooms created`);
    console.log(`- ${sampleGuests.length} guests created`);
    console.log(`- ${sampleReservations.length} reservations created`);
    console.log('\n🔑 Test login credentials:');
    console.log('Admin: username "admin", password "admin123"');
    console.log('Staff: username "oji-001", password "B6585esp__"');

  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
  }
}

seedSampleData();