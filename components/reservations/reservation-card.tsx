'use client';

import { Edit, Trash2, Calendar, Users, LogIn, LogOut } from 'lucide-react';
import { formatCurrency } from '../../lib/currency';

interface ReservationCardProps {
  reservation: any;
  onEdit: (reservation: any) => void;
  onDelete: (reservation: any) => void;
  onCheckIn: (reservation: any) => void;
  onCheckOut: (reservation: any) => void;
  userRole: string;
}

export default function ReservationCard({ 
  reservation, 
  onEdit, 
  onDelete, 
  onCheckIn, 
  onCheckOut, 
  userRole 
}: ReservationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'checked_in': return 'bg-green-100 text-green-800';
      case 'checked_out': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'checked_in': return 'Checked In';
      case 'checked_out': return 'Checked Out';
      case 'cancelled': return 'Cancelled';
      case 'no_show': return 'No Show';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };


  const isToday = (dateString: string) => {
    const today = new Date();
    const date = new Date(dateString);
    return today.toDateString() === date.toDateString();
  };

  const canCheckIn = () => {
    return reservation.status === 'confirmed' && 
           (isToday(reservation.checkInDate) || new Date(reservation.checkInDate) < new Date());
  };

  const canCheckOut = () => {
    return reservation.status === 'checked_in';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {reservation.confirmationNumber}
          </h3>
          <p className="text-sm text-gray-600">
            {reservation.guest.firstName} {reservation.guest.lastName}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
          {getStatusLabel(reservation.status)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          <span>
            {formatDate(reservation.checkInDate)} - {formatDate(reservation.checkOutDate)}
          </span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium">Room:</span>
          <span className="ml-1">
            {reservation.room.roomNumber} ({reservation.room.roomType})
          </span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Users className="h-4 w-4 mr-2" />
          <span>{reservation.numberOfGuests} guests</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium">Duration:</span>
          <span className="ml-1">{reservation.numberOfNights} nights</span>
        </div>
      </div>

      <div className="mb-4 p-3 bg-gray-50 rounded">
        <div className="flex justify-between items-center text-sm">
          <div>
            <span className="font-medium">Total:</span> {formatCurrency(reservation.totalAmount)}
          </div>
          <div>
            <span className="font-medium">Paid:</span> {formatCurrency(reservation.paidAmount)}
          </div>
        </div>
        {reservation.paidAmount < reservation.totalAmount && (
          <div className="mt-1 text-xs text-orange-600">
            Balance: {formatCurrency(reservation.totalAmount - reservation.paidAmount)}
          </div>
        )}
      </div>

      {reservation.specialRequests && (
        <div className="mb-4 p-2 bg-yellow-50 rounded text-sm">
          <span className="font-medium text-yellow-800">Special Requests:</span>
          <p className="text-yellow-700 mt-1">{reservation.specialRequests}</p>
        </div>
      )}

      {reservation.notes && (
        <div className="mb-4 p-2 bg-blue-50 rounded text-sm">
          <span className="font-medium text-blue-800">Notes:</span>
          <p className="text-blue-700 mt-1">{reservation.notes}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-2 border-t">
        {canCheckIn() && (
          <button
            onClick={() => onCheckIn(reservation)}
            className="flex items-center gap-1 px-3 py-2 text-sm text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Check In
          </button>
        )}
        
        {canCheckOut() && (
          <button
            onClick={() => onCheckOut(reservation)}
            className="flex items-center gap-1 px-3 py-2 text-sm text-orange-600 bg-orange-50 rounded-md hover:bg-orange-100 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Check Out
          </button>
        )}

        <button
          onClick={() => onEdit(reservation)}
          className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
        >
          <Edit className="h-4 w-4" />
          Edit
        </button>
        
        {['admin', 'manager'].includes(userRole) && (
          <button
            onClick={() => onDelete(reservation)}
            className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        )}
      </div>

      <div className="mt-2 text-xs text-gray-400">
        Created {formatDate(reservation.createdAt)}
        {reservation.checkedInAt && ` • Checked in ${formatDate(reservation.checkedInAt)}`}
        {reservation.checkedOutAt && ` • Checked out ${formatDate(reservation.checkedOutAt)}`}
      </div>
    </div>
  );
}