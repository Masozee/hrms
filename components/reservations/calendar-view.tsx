'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Reservation {
  id: number;
  confirmationNumber: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  status: string;
  guest: {
    firstName: string;
    lastName: string;
  };
  room: {
    roomNumber: string;
    roomType: string;
  };
}

interface CalendarViewProps {
  reservations: Reservation[];
}

export default function CalendarView({ reservations }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get days in current month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(month - 1);
    } else {
      newDate.setMonth(month + 1);
    }
    setCurrentDate(newDate);
  };

  const getReservationsForDate = (date: Date) => {
    if (!date) return [];
    
    const dateStr = date.toISOString().split('T')[0];
    return reservations.filter(reservation => {
      const checkIn = reservation.checkInDate.split('T')[0];
      const checkOut = reservation.checkOutDate.split('T')[0];
      return dateStr >= checkIn && dateStr < checkOut;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-500';
      case 'checked_in': return 'bg-green-500';
      case 'checked_out': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isToday = (date: Date) => {
    if (!date) return false;
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {monthNames[month]} {year}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Week
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Weekday Headers */}
        {weekDays.map(day => (
          <div key={day} className="p-3 text-center font-medium text-gray-500 text-sm">
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {calendarDays.map((date, index) => {
          const dayReservations = date ? getReservationsForDate(date) : [];
          
          return (
            <div
              key={index}
              className={`min-h-[120px] p-2 border border-gray-200 ${
                date ? 'bg-white' : 'bg-gray-50'
              } ${date && isToday(date) ? 'bg-blue-50 border-blue-300' : ''}`}
            >
              {date && (
                <>
                  {/* Day Number */}
                  <div className={`text-sm font-medium mb-2 ${
                    isToday(date) ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {date.getDate()}
                  </div>
                  
                  {/* Reservations */}
                  <div className="space-y-1">
                    {dayReservations.slice(0, 3).map(reservation => (
                      <div
                        key={reservation.id}
                        className={`text-xs p-1 rounded text-white truncate ${getStatusColor(reservation.status)}`}
                        title={`${reservation.guest.firstName} ${reservation.guest.lastName} - Room ${reservation.room.roomNumber}`}
                      >
                        <div className="font-medium">
                          {reservation.guest.firstName} {reservation.guest.lastName}
                        </div>
                        <div className="opacity-90">
                          Room {reservation.room.roomNumber}
                        </div>
                      </div>
                    ))}
                    
                    {dayReservations.length > 3 && (
                      <div className="text-xs text-gray-500 text-center py-1">
                        +{dayReservations.length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Confirmed</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Checked In</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-500 rounded"></div>
          <span>Checked Out</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Cancelled</span>
        </div>
      </div>
    </div>
  );
}