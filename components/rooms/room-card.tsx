'use client';

import { Edit, Trash2, Users, DollarSign } from 'lucide-react';

interface RoomCardProps {
  room: any;
  onEdit: (room: any) => void;
  onDelete: (room: any) => void;
  userRole: string;
}

export default function RoomCard({ room, onEdit, onDelete, userRole }: RoomCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'dirty': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'blocked': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'occupied': return 'Occupied';
      case 'dirty': return 'Needs Cleaning';
      case 'maintenance': return 'Maintenance';
      case 'blocked': return 'Blocked';
      default: return status;
    }
  };

  const getRoomTypeLabel = (type: string) => {
    switch (type) {
      case 'single': return 'Single Room';
      case 'double': return 'Double Room';
      case 'suite': return 'Suite';
      case 'deluxe': return 'Deluxe Room';
      case 'family': return 'Family Room';
      default: return type;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Room {room.roomNumber}</h3>
          <p className="text-sm text-gray-600">{getRoomTypeLabel(room.roomType)}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
          {getStatusLabel(room.status)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium">Floor:</span>
          <span className="ml-1">{room.floor}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Users className="h-4 w-4 mr-1" />
          <span>Max {room.maxOccupancy} guests</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign className="h-4 w-4 mr-1" />
          <span>${room.baseRate}/night</span>
        </div>
      </div>

      {room.amenities && room.amenities.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-700 mb-2">Amenities:</p>
          <div className="flex flex-wrap gap-1">
            {room.amenities.slice(0, 4).map((amenity: any, index: number) => (
              <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                {amenity}
              </span>
            ))}
            {room.amenities.length > 4 && (
              <span className="text-xs text-gray-500">+{room.amenities.length - 4} more</span>
            )}
          </div>
        </div>
      )}

      {room.description && (
        <p className="text-sm text-gray-600 mb-4">
          {room.description}
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(room)}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
        >
          <Edit className="h-4 w-4" />
          Edit
        </button>
        
        {userRole === 'admin' && (
          <button
            onClick={() => onDelete(room)}
            className="flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        )}
      </div>
    </div>
  );
}