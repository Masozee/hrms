'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { hotelApi } from '../../../lib/api';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Plus, Search, Calendar, Filter, List, Users, Edit, Trash2, CheckCircle, Eye, Download } from "lucide-react";
import ReservationForm from '../../../components/reservations/reservation-form';
import CalendarView from '../../../components/reservations/calendar-view';
import { formatCurrency } from '../../../lib/currency';

interface Reservation {
  id: number;
  guest_full_name: string;
  room_number: string;
  check_in_date: string;
  check_out_date: string;
  status: string;
  payment_status: string;
  total_amount: string | number;
  adults: number;
  children: number;
  reservation_number: string;
  special_requests: string;
  [key: string]: any;
}

export default function ReservationsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [sortField, setSortField] = useState('check_in_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [selectedReservations, setSelectedReservations] = useState<number[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchReservations();
    }
  }, [isAuthenticated, statusFilter]);

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      // Use backend API with status filter
      const filters = statusFilter !== 'all' ? { status: statusFilter } : undefined;
      const data = await hotelApi.getBookings(filters);
      setReservations(data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      // For development, use mock data if backend fails
      const mockReservations = [
        {
          id: 1,
          guest_full_name: 'John Smith',
          room_number: '101',
          check_in_date: '2025-07-15',
          check_out_date: '2025-07-17',
          status: 'confirmed',
          payment_status: 'paid',
          total_amount: '2500000',
          adults: 2,
          children: 0,
          reservation_number: 'RES20250715001',
          special_requests: 'Late check-in'
        },
        {
          id: 2,
          guest_full_name: 'Jane Doe',
          room_number: '205',
          check_in_date: '2025-07-16',
          check_out_date: '2025-07-20',
          status: 'pending',
          payment_status: 'pending',
          total_amount: '4000000',
          adults: 1,
          children: 1,
          reservation_number: 'RES20250716002',
          special_requests: ''
        }
      ];
      setReservations(mockReservations);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      if (editingReservation) {
        // Update existing reservation
        await hotelApi.updateBooking(editingReservation.id, formData);
      } else {
        // Create new reservation
        await hotelApi.createBooking(formData);
      }
      
      setShowForm(false);
      setEditingReservation(null);
      fetchReservations();
    } catch (error) {
      console.error('Error saving reservation:', error);
      alert('An error occurred while saving the reservation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (reservation: any) => {
    setEditingReservation(reservation);
    setShowForm(true);
  };

  const handleDelete = async (reservation: any) => {
    if (!confirm(`Are you sure you want to delete reservation ${reservation.confirmationNumber || reservation.id}?`)) {
      return;
    }

    try {
      await hotelApi.deleteBooking(reservation.id);
      fetchReservations();
    } catch (error) {
      console.error('Error deleting reservation:', error);
      alert('An error occurred while deleting the reservation. Please try again.');
    }
  };

  const handleCheckIn = async (reservation: any) => {
    const guestName = reservation.guest_full_name || reservation.guestName || 'Guest';
    if (!confirm(`Check in ${guestName}?`)) {
      return;
    }

    try {
      await hotelApi.updateBooking(reservation.id, {
        ...reservation,
        status: 'checked_in',
        actual_check_in: new Date().toISOString()
      });
      
      fetchReservations();
      alert('Guest checked in successfully!');
    } catch (error) {
      console.error('Error checking in guest:', error);
      alert('An error occurred while checking in the guest. Please try again.');
    }
  };

  const handleCheckOut = async (reservation: any) => {
    const guestName = reservation.guest_full_name || reservation.guestName || 'Guest';
    if (!confirm(`Check out ${guestName}?`)) {
      return;
    }

    try {
      await hotelApi.updateBooking(reservation.id, {
        ...reservation,
        status: 'checked_out',
        actual_check_out: new Date().toISOString()
      });
      
      fetchReservations();
      alert('Guest checked out successfully!');
    } catch (error) {
      console.error('Error checking out guest:', error);
      alert('An error occurred while checking out the guest. Please try again.');
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectReservation = (id: number) => {
    setSelectedReservations(prev => 
      prev.includes(id) 
        ? prev.filter(resId => resId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedReservations.length === filteredReservations.length) {
      setSelectedReservations([]);
    } else {
      setSelectedReservations(filteredReservations.map(r => r.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'checked_in': return 'bg-blue-100 text-blue-800';
      case 'checked_out': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-orange-100 text-orange-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Sort and filter reservations
  const sortedReservations = [...reservations].sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    const modifier = sortDirection === 'asc' ? 1 : -1;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * modifier;
    }
    return (aValue < bValue ? -1 : aValue > bValue ? 1 : 0) * modifier;
  });

  const filteredReservations = sortedReservations.filter(reservation => {
    if (statusFilter !== 'all' && reservation.status !== statusFilter) {
      return false;
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReservations = filteredReservations.slice(startIndex, startIndex + itemsPerPage);

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingReservation(null);
  };

  if (authLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  const statusOptions = [
    { value: 'all', label: 'All Reservations' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'checked_in', label: 'Checked In' },
    { value: 'checked_out', label: 'Checked Out' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no_show', label: 'No Show' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reservations</h1>
            <p className="text-gray-600">Manage bookings and check-ins</p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Dashboard
            </Link>
            <Link 
              href="/group-bookings"
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Group Bookings
            </Link>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Reservation
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
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

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  viewMode === 'table' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <List className="h-4 w-4" />
                Table View
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  viewMode === 'calendar' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Calendar className="h-4 w-4" />
                Calendar View
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">Loading reservations...</div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <p className="text-gray-500">
                {statusFilter === 'all' ? 'No reservations found. Create your first reservation to get started.' : `No ${statusFilter} reservations found.`}
              </p>
            </div>
          </div>
        ) : viewMode === 'calendar' ? (
          <CalendarView reservations={reservations} />
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Bulk Actions */}
            {selectedReservations.length > 0 && (
              <div className="px-6 py-3 bg-blue-50 border-b flex items-center justify-between">
                <span className="text-sm text-blue-700">
                  {selectedReservations.length} reservation(s) selected
                </span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                    <Download className="h-4 w-4 inline mr-1" />
                    Export
                  </button>
                  {['admin', 'manager'].includes(user?.role || 'staff') && (
                    <button 
                      onClick={() => {
                        if (confirm('Delete selected reservations?')) {
                          // Handle bulk delete
                        }
                      }}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      <Trash2 className="h-4 w-4 inline mr-1" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedReservations.length === filteredReservations.length && filteredReservations.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('reservation_number')}
                    >
                      Reservation #
                      {sortField === 'reservation_number' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('guest_full_name')}
                    >
                      Guest
                      {sortField === 'guest_full_name' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('room_number')}
                    >
                      Room
                      {sortField === 'room_number' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('check_in_date')}
                    >
                      Check-in
                      {sortField === 'check_in_date' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('check_out_date')}
                    >
                      Check-out
                      {sortField === 'check_out_date' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guests
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('total_amount')}
                    >
                      Amount
                      {sortField === 'total_amount' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('status')}
                    >
                      Status
                      {sortField === 'status' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('payment_status')}
                    >
                      Payment
                      {sortField === 'payment_status' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedReservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedReservations.includes(reservation.id)}
                          onChange={() => handleSelectReservation(reservation.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {reservation.reservation_number || `RES${reservation.id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {reservation.guest_full_name || reservation.guestName || 'Unknown Guest'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reservation.room_number || reservation.roomNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(reservation.check_in_date || reservation.checkIn).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(reservation.check_out_date || reservation.checkOut).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(reservation.adults || 0) + (reservation.children || 0)} 
                        <span className="text-gray-500">
                          ({reservation.adults || 0}A, {reservation.children || 0}C)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(reservation.total_amount || reservation.totalAmount || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                          {reservation.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(reservation.payment_status || 'pending')}`}>
                          {(reservation.payment_status || 'pending').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(reservation)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          
                          {reservation.status === 'confirmed' && (
                            <button
                              onClick={() => handleCheckIn(reservation)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Check In"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          
                          {reservation.status === 'checked_in' && (
                            <button
                              onClick={() => handleCheckOut(reservation)}
                              className="text-orange-600 hover:text-orange-900 p-1"
                              title="Check Out"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button
                            className="text-gray-600 hover:text-gray-900 p-1"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {['admin', 'manager'].includes(user?.role || 'staff') && (
                            <button
                              onClick={() => handleDelete(reservation)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-3 border-t bg-gray-50 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredReservations.length)} of {filteredReservations.length} reservations
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + Math.max(1, currentPage - 2);
                    if (page > totalPages) return null;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 text-sm border rounded ${
                          currentPage === page 
                            ? 'bg-blue-500 text-white border-blue-500' 
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {showForm && (
          <ReservationForm
            reservation={editingReservation}
            onSubmit={handleSubmit}
            onClose={handleCloseForm}
            isLoading={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}