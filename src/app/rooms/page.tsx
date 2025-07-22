'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { hotelApi } from '../../../lib/api';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Plus, Search, Filter, Table as TableIcon, Grid3X3 } from "lucide-react";
import RoomForm from '../../../components/rooms/room-form';
import RoomCard from '../../../components/rooms/room-card';
import { DataTable } from '../../../components/ui/data-table';
import { columns, Room } from '../../../components/rooms/room-columns';

export default function RoomsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRooms();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterRooms();
  }, [rooms, searchTerm, statusFilter]);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      // Use real API to fetch rooms
      const filters = statusFilter !== 'all' ? { status: statusFilter } : undefined;
      const data = await hotelApi.getRooms(filters);
      
      // Map API response to our Room interface
      const rooms: Room[] = data.map((room: any) => ({
        id: room.id,
        roomNumber: room.room_number || room.roomNumber || `${room.id}`,
        roomType: room.room_type || room.roomType || 'standard',
        status: room.status || 'available',
        baseRate: room.base_rate || room.baseRate || room.rate || 0,
        maxOccupancy: room.max_occupancy || room.maxOccupancy || room.capacity || 1,
        floor: room.floor || 1,
        description: room.description || '',
        amenities: room.amenities || []
      }));
      
      setRooms(rooms);
      console.log('Fetched rooms from API:', rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      // Show user-friendly error message
      alert('Failed to load rooms. Please check your connection and ensure the backend API is running.');
      setRooms([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const filterRooms = () => {
    let filtered = rooms;

    if (searchTerm) {
      filtered = filtered.filter(room => 
        room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.roomType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(room => room.status === statusFilter);
    }

    setFilteredRooms(filtered);
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      // Map form data to API format
      const apiData = {
        room_number: formData.roomNumber,
        room_type: formData.roomType,
        floor: parseInt(formData.floor),
        max_occupancy: parseInt(formData.maxOccupancy),
        base_rate: parseFloat(formData.baseRate),
        status: formData.status,
        description: formData.description,
        amenities: formData.amenities || []
      };

      if (editingRoom) {
        // Update existing room
        await hotelApi.updateRoom(editingRoom.id, apiData);
      } else {
        // Create new room
        await hotelApi.createRoom(apiData);
      }
      
      setShowForm(false);
      setEditingRoom(null);
      fetchRooms();
    } catch (error) {
      console.error('Error saving room:', error);
      alert('An error occurred while saving the room. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (room: any) => {
    setEditingRoom(room);
    setShowForm(true);
  };

  const handleDelete = async (room: any) => {
    if (!confirm(`Are you sure you want to delete room ${room.roomNumber}?`)) {
      return;
    }

    try {
      await hotelApi.deleteRoom(room.id);
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('An error occurred while deleting the room. Please try again.');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRoom(null);
  };

  if (authLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'dirty', label: 'Needs Cleaning' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'blocked', label: 'Blocked' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Rooms</h1>
            <p className="text-gray-600">Manage room inventory and status</p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Dashboard
            </Link>
            {['admin', 'manager'].includes(user?.role || 'staff') && (
              <button 
                onClick={() => setShowForm(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Room
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TableIcon className="h-4 w-4" />
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
                Cards
              </button>
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
            <div className="text-center py-8">Loading rooms...</div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <p className="text-gray-500">
                {rooms.length === 0 ? 'No rooms found. Add your first room to get started.' : 'No rooms match your search criteria.'}
              </p>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-white rounded-lg shadow-md">
            <DataTable 
              columns={columns(handleEdit, handleDelete, user?.role || 'staff')} 
              data={filteredRooms} 
              searchKey="roomNumber" 
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onEdit={handleEdit}
                onDelete={handleDelete}
                userRole={user?.role || 'staff'}
              />
            ))}
          </div>
        )}

        {showForm && (
          <RoomForm
            room={editingRoom}
            onSubmit={handleSubmit}
            onClose={handleCloseForm}
            isLoading={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}