'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface RoomFormProps {
  room?: any;
  onSubmit: (data: any) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export default function RoomForm({ room, onSubmit, onClose, isLoading }: RoomFormProps) {
  const [formData, setFormData] = useState({
    roomNumber: room?.roomNumber || '',
    roomType: room?.roomType || 'single',
    floor: room?.floor || 1,
    maxOccupancy: room?.maxOccupancy || 1,
    baseRate: room?.baseRate || 0,
    status: room?.status || 'available',
    description: room?.description || '',
    amenities: room?.amenities?.join(', ') || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Process amenities string into array
    const processedData = {
      ...formData,
      amenities: formData.amenities 
        ? formData.amenities.split(',').map((a: string) => a.trim()).filter((a: string) => a.length > 0)
        : []
    };
    onSubmit(processedData);
  };

  const roomTypes = [
    { value: 'single', label: 'Single Room' },
    { value: 'double', label: 'Double Room' },
    { value: 'suite', label: 'Suite' },
    { value: 'deluxe', label: 'Deluxe Room' },
    { value: 'family', label: 'Family Room' }
  ];

  const roomStatuses = [
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'dirty', label: 'Dirty' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'blocked', label: 'Blocked' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {room ? 'Edit Room' : 'Add New Room'}
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
              Room Number *
            </label>
            <input
              type="text"
              required
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., 101, A-201"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Type *
            </label>
            <select
              required
              value={formData.roomType}
              onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {roomTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Floor *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Occupancy *
              </label>
              <input
                type="number"
                required
                min="1"
                max="10"
                value={formData.maxOccupancy}
                onChange={(e) => setFormData({ ...formData, maxOccupancy: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Rate (per night) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.baseRate}
              onChange={(e) => setFormData({ ...formData, baseRate: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {roomStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amenities
            </label>
            <input
              type="text"
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="WiFi, AC, TV, Mini Bar (comma separated)"
            />
            <p className="text-xs text-gray-500 mt-1">Separate amenities with commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Room description and additional details"
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
              className="flex-1 px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : (room ? 'Update Room' : 'Add Room')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}