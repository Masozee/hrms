'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Plus, Users, Calendar, Building, Mail, Phone } from "lucide-react";
import { formatCurrency } from '../../../lib/currency';

export default function GroupBookingsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [groupBookings, setGroupBookings] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchGroupBookings = async () => {
    setIsLoading(true);
    try {
      const url = statusFilter !== 'all' ? `/api/group-bookings?status=${statusFilter}` : '/api/group-bookings';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setGroupBookings(data);
      } else {
        // Mock data fallback
        const mockData = [
          {
            id: 1,
            groupName: 'Corporate Retreat 2024',
            contactPerson: 'John Smith',
            email: 'john@company.com',
            phone: '+62-812-3456-7890',
            numberOfRooms: 10,
            numberOfGuests: 20,
            checkInDate: '2025-08-15',
            checkOutDate: '2025-08-18',
            totalAmount: 50000000,
            status: 'confirmed',
            specialRequests: 'Conference room setup for meetings'
          }
        ];
        setGroupBookings(mockData);
      }
    } catch (error) {
      console.error('Error fetching group bookings:', error);
      setGroupBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupBookings();
  }, [statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'checked_in': return 'bg-green-100 text-green-800';
      case 'checked_out': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'conference': return <Building className="h-4 w-4" />;
      case 'wedding': return <Users className="h-4 w-4" />;
      case 'corporate': return <Building className="h-4 w-4" />;
      case 'leisure': return <Calendar className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Group Bookings' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'checked_in', label: 'Checked In' },
    { value: 'checked_out', label: 'Checked Out' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Group Bookings</h1>
            <p className="text-gray-600">Manage group reservations and events</p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/reservations"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Reservations
            </Link>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Group Booking
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4 items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">Loading group bookings...</div>
          </div>
        ) : groupBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {statusFilter === 'all' ? 'No group bookings found. Create your first group booking to get started.' : `No ${statusFilter} group bookings found.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {groupBookings.map((groupBooking: any) => (
              <div key={groupBooking.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 rounded-lg p-2">
                      {getEventTypeIcon(groupBooking.eventType)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {groupBooking.groupName}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {groupBooking.eventType} Event
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(groupBooking.status)}`}>
                    {groupBooking.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {new Date(groupBooking.eventStartDate).toLocaleDateString()} - {new Date(groupBooking.eventEndDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{groupBooking.totalRooms} rooms, {groupBooking.totalGuests} guests</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{groupBooking.contactPersonName}</span>
                    <span className="mx-2">•</span>
                    <span>{groupBooking.contactEmail}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{groupBooking.contactPhone}</span>
                    {groupBooking.company && (
                      <>
                        <span className="mx-2">•</span>
                        <span>{groupBooking.company}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm">
                    <span className="text-gray-600">Total: </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(groupBooking.totalAmount)}
                    </span>
                    {groupBooking.paidAmount > 0 && (
                      <span className="text-green-600 ml-2">
                        (Paid: {formatCurrency(groupBooking.paidAmount)})
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors">
                      View Details
                    </button>
                    {groupBooking.status === 'pending' && (
                      <button className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors">
                        Confirm
                      </button>
                    )}
                  </div>
                </div>

                {groupBooking.specialRequests && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Special Requests:</span> {groupBooking.specialRequests}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Group Booking Form Modal - TODO: Implement */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">New Group Booking</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-600 mb-4">
                Group booking form will be implemented in the next step.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}