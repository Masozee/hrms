'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ReservationFormProps {
  reservation?: any;
  onSubmit: (data: any) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export default function ReservationForm({ reservation, onSubmit, onClose, isLoading }: ReservationFormProps) {
  const [formData, setFormData] = useState({
    guestId: reservation?.guest_id || reservation?.guestId || '',
    guest_full_name: reservation?.guest_full_name || reservation?.guestName || '',
    guest_email: reservation?.guest_email || reservation?.email || '',
    guest_phone: reservation?.guest_phone || reservation?.phone || '',
    roomId: reservation?.room_id || reservation?.roomId || '',
    room_number: reservation?.room_number || reservation?.roomNumber || '',
    checkInDate: reservation?.check_in_date || reservation?.checkInDate || '',
    checkOutDate: reservation?.check_out_date || reservation?.checkOutDate || '',
    adults: reservation?.adults || 1,
    children: reservation?.children || 0,
    numberOfGuests: (reservation?.adults || 1) + (reservation?.children || 0),
    specialRequests: reservation?.special_requests || reservation?.specialRequests || '',
    notes: reservation?.notes || '',
    total_amount: reservation?.total_amount || reservation?.totalAmount || '',
    payment_status: reservation?.payment_status || 'pending',
    status: reservation?.status || 'confirmed'
  });

  const [guests, setGuests] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  const calculateNights = () => {
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const getSelectedRoom = () => {
    return availableRooms.find((room: any) => room.id.toString() === formData.roomId);
  };

  const calculateTotal = () => {
    const room = getSelectedRoom() as any;
    const nights = calculateNights();
    const rate = room?.rate_per_night || room?.baseRate || 0;
    return room && nights && rate ? (rate * nights) : 0;
  };

  const getFormattedTotal = () => {
    const total = calculateTotal();
    return total > 0 ? total.toLocaleString() : '0';
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      fetchAvailableRooms();
    }
  }, [formData.checkInDate, formData.checkOutDate]);

  // Auto-calculate total amount when room or dates change
  useEffect(() => {
    const calculatedTotal = calculateTotal();
    if (calculatedTotal > 0 && formData.roomId) {
      setFormData(prev => ({
        ...prev,
        total_amount: calculatedTotal.toString()
      }));
    }
  }, [formData.roomId, formData.checkInDate, formData.checkOutDate, availableRooms]);

  const fetchGuests = async () => {
    try {
      // Use the hotel API to get guest profiles
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1/'}guest/profiles/`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('api_token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setGuests(data.results || data);
      } else {
        // Fallback: provide manual entry option
        setGuests([]);
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
      // For new reservations, allow manual guest entry
      setGuests([]);
    }
  };

  const fetchAvailableRooms = async () => {
    setLoadingRooms(true);
    try {
      // Use the hotel API to get available rooms
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1/'}hotel/rooms/?status=available`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('api_token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableRooms(data.results || data);
      } else {
        // Fallback: allow manual room entry
        setAvailableRooms([]);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      // For new reservations, allow manual room entry
      setAvailableRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For editing existing reservations, we need guest_full_name and room_number
    // For new reservations, we need guestId and roomId
    const hasGuestInfo = formData.guest_full_name || formData.guestId;
    const hasRoomInfo = formData.room_number || formData.roomId;
    
    if (!hasGuestInfo || !hasRoomInfo || !formData.checkInDate || !formData.checkOutDate) {
      alert('Please fill in all required fields');
      return;
    }

    if (new Date(formData.checkInDate) >= new Date(formData.checkOutDate)) {
      alert('Check-out date must be after check-in date');
      return;
    }

    // Prepare data in the correct format for the API
    const submitData = {
      ...formData,
      check_in_date: formData.checkInDate,
      check_out_date: formData.checkOutDate,
      special_requests: formData.specialRequests,
      // Guest information
      guest_full_name: formData.guest_full_name,
      guest_email: formData.guest_email,
      guest_phone: formData.guest_phone,
      // Room information
      room_number: formData.room_number,
      // Generate reservation number for new reservations
      reservation_number: reservation ? reservation.reservation_number : `RES${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      // Ensure total_amount is a number
      total_amount: formData.total_amount ? parseInt(formData.total_amount.toString()) : 0,
    };

    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {reservation ? 'Edit Reservation' : 'New Reservation'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Guest Information *
            </label>
            {formData.guest_full_name ? (
              <div>
                <input
                  type="text"
                  required
                  value={formData.guest_full_name}
                  onChange={(e) => setFormData({ ...formData, guest_full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Full Name"
                />
                <p className="text-xs text-gray-500 mt-1">Editing existing guest</p>
              </div>
            ) : guests.length > 0 ? (
              <div className="space-y-2">
                <select
                  value={formData.guestId}
                  onChange={(e) => {
                    if (e.target.value === 'manual') {
                      setFormData({ ...formData, guestId: '', guest_full_name: '' });
                    } else {
                      setFormData({ ...formData, guestId: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select existing guest</option>
                  {guests.map((guest: any) => (
                    <option key={guest.id} value={guest.id}>
                      {guest.full_name || `${guest.first_name} ${guest.last_name}`} - {guest.email}
                    </option>
                  ))}
                  <option value="manual">Enter new guest manually</option>
                </select>
                {formData.guestId === '' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      value={formData.guest_full_name}
                      onChange={(e) => setFormData({ ...formData, guest_full_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter guest full name"
                    />
                    <input
                      type="email"
                      value={formData.guest_email || ''}
                      onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Guest email (optional)"
                    />
                    <input
                      type="tel"
                      value={formData.guest_phone || ''}
                      onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Guest phone (optional)"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  value={formData.guest_full_name}
                  onChange={(e) => setFormData({ ...formData, guest_full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter guest full name"
                />
                <input
                  type="email"
                  value={formData.guest_email || ''}
                  onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Guest email (optional)"
                />
                <input
                  type="tel"
                  value={formData.guest_phone || ''}
                  onChange={(e) => setFormData({ ...formData, guest_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Guest phone (optional)"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-in Date *
              </label>
              <input
                type="date"
                required
                value={formData.checkInDate}
                onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-out Date *
              </label>
              <input
                type="date"
                required
                value={formData.checkOutDate}
                onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room *
              </label>
              {formData.room_number ? (
                <div>
                  <input
                    type="text"
                    required
                    value={formData.room_number}
                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Room Number"
                  />
                  <p className="text-xs text-gray-500 mt-1">Editing existing room</p>
                </div>
              ) : availableRooms.length > 0 ? (
                <div className="space-y-2">
                  <select
                    value={formData.roomId}
                    onChange={(e) => {
                      if (e.target.value === 'manual') {
                        setFormData({ ...formData, roomId: '', room_number: '' });
                      } else {
                        setFormData({ ...formData, roomId: e.target.value });
                      }
                    }}
                    disabled={loadingRooms || !formData.checkInDate || !formData.checkOutDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="">
                      {loadingRooms ? 'Loading rooms...' : 'Select available room'}
                    </option>
                    {availableRooms.map((room: any) => (
                      <option key={room.id} value={room.id}>
                        Room {room.room_number || room.roomNumber} - {room.room_type || room.roomType} (Rp {room.rate_per_night?.toLocaleString() || room.baseRate?.toLocaleString()}/night)
                      </option>
                    ))}
                    <option value="manual">Enter room manually</option>
                  </select>
                  {formData.roomId === '' && (
                    <input
                      type="text"
                      required
                      value={formData.room_number}
                      onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter room number (e.g., 101, 205)"
                    />
                  )}
                  {!formData.checkInDate || !formData.checkOutDate ? (
                    <p className="text-xs text-yellow-600">Select check-in and check-out dates to see available rooms</p>
                  ) : null}
                </div>
              ) : (
                <input
                  type="text"
                  required
                  value={formData.room_number}
                  onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter room number (e.g., 101, 205)"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guests *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="number"
                    required
                    min="1"
                    max="10"
                    value={formData.adults}
                    onChange={(e) => setFormData({ ...formData, adults: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Adults"
                  />
                  <label className="text-xs text-gray-500">Adults</label>
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={formData.children}
                    onChange={(e) => setFormData({ ...formData, children: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Children"
                  />
                  <label className="text-xs text-gray-500">Children</label>
                </div>
              </div>
            </div>
          </div>

          {formData.checkInDate && formData.checkOutDate && (
            <div className="bg-blue-50 p-4 rounded-md">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Number of nights:</span> {calculateNights()}
                </div>
                <div>
                  <span className="font-medium">Total amount:</span> Rp {getFormattedTotal()}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reservation Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="checked_in">Checked In</option>
                <option value="checked_out">Checked Out</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Status
              </label>
              <select
                value={formData.payment_status}
                onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Amount (Rp) *
            </label>
            <input
              type="number"
              required
              value={formData.total_amount}
              onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2500000"
            />
            {formData.roomId && formData.checkInDate && formData.checkOutDate && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Auto-calculated based on room rate (Rp {getFormattedTotal()}) - you can edit if needed
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Requests
            </label>
            <textarea
              rows={3}
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Late check-in, early check-out, accessibility needs, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Internal Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Internal notes for staff"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : (reservation ? 'Update Reservation' : 'Create Reservation')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}