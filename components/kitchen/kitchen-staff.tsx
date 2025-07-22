'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Clock, 
  UserCheck, 
  UserX,
  Calendar,
  ChefHat,
  Settings,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface KitchenStaff {
  id: number;
  name: string;
  position: string;
  shift: string;
  status: 'on_duty' | 'off_duty' | 'break' | 'sick';
  specialties: string[];
  assigned_stations: string[];
  hourly_rate: number;
  clock_in_time?: string;
  break_start?: string;
  experience_level: 'junior' | 'senior' | 'head_chef' | 'sous_chef';
  contact: string;
  emergency_contact?: string;
}

interface ShiftSchedule {
  id: number;
  staff_id: number;
  date: string;
  shift_start: string;
  shift_end: string;
  position: string;
  station: string;
}

interface KitchenStaffProps {
  onClose?: () => void;
}

export default function KitchenStaff({ onClose }: KitchenStaffProps) {
  const [staff, setStaff] = useState<KitchenStaff[]>([]);
  const [schedules, setSchedules] = useState<ShiftSchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<KitchenStaff | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchStaffData();
    fetchSchedules();
  }, [selectedDate]);

  const fetchStaffData = async () => {
    setIsLoading(true);
    try {
      const { staffApi } = await import('../../lib/api');
      const staffMembers = await staffApi.getStaff({ department: 'Kitchen' });
      
      // Transform API data to match our interface
      const transformedStaff: KitchenStaff[] = staffMembers.map((member: any) => ({
        id: member.id,
        name: `${member.first_name} ${member.last_name}`,
        position: member.position || member.role || 'Kitchen Staff',
        shift: member.shift || determineShiftFromTime(),
        status: member.status === 'active' ? 'off_duty' : member.status || 'off_duty',
        specialties: member.specialties || ['General Kitchen Work'],
        assigned_stations: member.assigned_stations || ['General'],
        hourly_rate: member.hourly_rate || 25000,
        clock_in_time: member.clock_in_time,
        break_start: member.break_start,
        experience_level: member.experience_level || 'junior',
        contact: member.phone || member.contact || 'N/A',
        emergency_contact: member.emergency_contact
      }));

      setStaff(transformedStaff);
    } catch (error) {
      console.error('Error fetching staff data from API:', error);
      
      // Fallback to mock data if API fails
      const mockStaff: KitchenStaff[] = [
        {
          id: 1,
          name: 'Chef Ahmad Rizki',
          position: 'Head Chef',
          shift: 'Morning',
          status: 'on_duty',
          specialties: ['Indonesian Cuisine', 'Grilling', 'Menu Development'],
          assigned_stations: ['Main Kitchen', 'Grill Station'],
          hourly_rate: 50000,
          clock_in_time: '2024-01-13T06:00:00',
          experience_level: 'head_chef',
          contact: '081234567890',
          emergency_contact: '081234567891'
        },
        {
          id: 2,
          name: 'Sari Wulandari',
          position: 'Sous Chef',
          shift: 'Morning',
          status: 'on_duty',
          specialties: ['Pastry', 'Desserts', 'Plating'],
          assigned_stations: ['Pastry Station', 'Cold Prep'],
          hourly_rate: 35000,
          clock_in_time: '2024-01-13T06:30:00',
          experience_level: 'sous_chef',
          contact: '081234567892'
        },
        {
          id: 3,
          name: 'Budi Prasetyo',
          position: 'Line Cook',
          shift: 'Morning',
          status: 'break',
          specialties: ['Wok Cooking', 'Prep Work'],
          assigned_stations: ['Wok Station'],
          hourly_rate: 25000,
          clock_in_time: '2024-01-13T07:00:00',
          break_start: '2024-01-13T10:30:00',
          experience_level: 'senior',
          contact: '081234567893'
        },
        {
          id: 4,
          name: 'Diana Kusuma',
          position: 'Prep Cook',
          shift: 'Evening',
          status: 'off_duty',
          specialties: ['Vegetable Prep', 'Sauce Making'],
          assigned_stations: ['Prep Station'],
          hourly_rate: 22000,
          experience_level: 'junior',
          contact: '081234567894'
        },
        {
          id: 5,
          name: 'Roni Hartono',
          position: 'Line Cook',
          shift: 'Evening',
          status: 'on_duty',
          specialties: ['Frying', 'Hot Line'],
          assigned_stations: ['Fry Station', 'Hot Line'],
          hourly_rate: 28000,
          clock_in_time: '2024-01-13T14:00:00',
          experience_level: 'senior',
          contact: '081234567895'
        }
      ];

      setStaff(mockStaff);
    } finally {
      setIsLoading(false);
    }
  };

  const determineShiftFromTime = (): string => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) return 'Morning';
    if (hour >= 14 && hour < 22) return 'Evening';
    return 'Night';
  };

  const fetchSchedules = async () => {
    try {
      // Mock schedule data
      const mockSchedules: ShiftSchedule[] = [
        {
          id: 1,
          staff_id: 1,
          date: selectedDate,
          shift_start: '06:00',
          shift_end: '15:00',
          position: 'Head Chef',
          station: 'Main Kitchen'
        },
        {
          id: 2,
          staff_id: 2,
          date: selectedDate,
          shift_start: '06:30',
          shift_end: '15:30',
          position: 'Sous Chef',
          station: 'Pastry Station'
        },
        {
          id: 3,
          staff_id: 3,
          date: selectedDate,
          shift_start: '07:00',
          shift_end: '16:00',
          position: 'Line Cook',
          station: 'Wok Station'
        },
        {
          id: 4,
          staff_id: 5,
          date: selectedDate,
          shift_start: '14:00',
          shift_end: '23:00',
          position: 'Line Cook',
          station: 'Fry Station'
        }
      ];

      setSchedules(mockSchedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'on_duty': return 'bg-green-100 text-green-800 border-green-300';
      case 'off_duty': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'break': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'sick': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getExperienceColor = (level: string): string => {
    switch (level) {
      case 'head_chef': return 'bg-purple-100 text-purple-800';
      case 'sous_chef': return 'bg-blue-100 text-blue-800';
      case 'senior': return 'bg-green-100 text-green-800';
      case 'junior': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateStaffStatus = async (staffId: number, newStatus: string) => {
    try {
      const { staffApi } = await import('../../lib/api');
      
      // Call appropriate API endpoints based on status change
      if (newStatus === 'on_duty') {
        await staffApi.clockIn(staffId);
      } else if (newStatus === 'off_duty') {
        await staffApi.clockOut(staffId);
      } else if (newStatus === 'break') {
        await staffApi.startBreak(staffId);
      }

      // Update local state
      setStaff(staff.map(member => 
        member.id === staffId 
          ? { 
              ...member, 
              status: newStatus as any,
              clock_in_time: newStatus === 'on_duty' ? new Date().toISOString() : member.clock_in_time,
              break_start: newStatus === 'break' ? new Date().toISOString() : undefined
            }
          : member
      ));
    } catch (error) {
      console.error('Error updating staff status:', error);
      
      // Still update local state even if API call fails
      setStaff(staff.map(member => 
        member.id === staffId 
          ? { 
              ...member, 
              status: newStatus as any,
              clock_in_time: newStatus === 'on_duty' ? new Date().toISOString() : member.clock_in_time,
              break_start: newStatus === 'break' ? new Date().toISOString() : undefined
            }
          : member
      ));
    }
  };

  const staffStats = {
    total_staff: staff.length,
    on_duty: staff.filter(s => s.status === 'on_duty').length,
    on_break: staff.filter(s => s.status === 'break').length,
    off_duty: staff.filter(s => s.status === 'off_duty').length,
    sick: staff.filter(s => s.status === 'sick').length
  };

  const getCurrentShift = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) return 'Morning';
    if (hour >= 14 && hour < 22) return 'Evening';
    return 'Night';
  };

  const onDutyStaff = staff.filter(s => s.status === 'on_duty');
  const currentShiftStaff = staff.filter(s => s.shift === getCurrentShift());

  return (
    <div className="bg-white text-gray-900 p-6 rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Users className="h-6 w-6 mr-3 text-green-600" />
            Kitchen Staff Management
          </h2>
          <p className="text-gray-600 mt-1">Manage kitchen staff schedules and assignments</p>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {onClose && (
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-xs text-gray-600">Total Staff</p>
              <p className="text-xl font-bold">{staffStats.total_staff}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <UserCheck className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-xs text-gray-600">On Duty</p>
              <p className="text-xl font-bold">{staffStats.on_duty}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-xs text-gray-600">On Break</p>
              <p className="text-xl font-bold">{staffStats.on_break}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <UserX className="h-8 w-8 text-gray-500 mr-3" />
            <div>
              <p className="text-xs text-gray-600">Off Duty</p>
              <p className="text-xl font-bold">{staffStats.off_duty}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-xs text-gray-600">Sick</p>
              <p className="text-xl font-bold">{staffStats.sick}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Shift Overview */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ChefHat className="h-5 w-5 mr-2 text-orange-600" />
          Current Shift: {getCurrentShift()} ({new Date().toLocaleTimeString()})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {onDutyStaff.map((member) => (
            <div key={member.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{member.name}</h4>
                  <p className="text-sm text-gray-600">{member.position}</p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(member.status)}`}>
                  {member.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Stations:</p>
                  <p className="text-sm text-gray-900">{member.assigned_stations.join(', ')}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500">Clock In:</p>
                  <p className="text-sm text-gray-900">
                    {member.clock_in_time ? new Date(member.clock_in_time).toLocaleTimeString() : 'Not clocked in'}
                  </p>
                </div>
                
                {member.status === 'break' && member.break_start && (
                  <div>
                    <p className="text-xs text-gray-500">Break Start:</p>
                    <p className="text-sm text-yellow-600">
                      {new Date(member.break_start).toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-3 flex gap-2">
                {member.status === 'on_duty' && (
                  <button
                    onClick={() => updateStaffStatus(member.id, 'break')}
                    className="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700 transition-colors"
                  >
                    Start Break
                  </button>
                )}
                {member.status === 'break' && (
                  <button
                    onClick={() => updateStaffStatus(member.id, 'on_duty')}
                    className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
                  >
                    End Break
                  </button>
                )}
                {member.status === 'on_duty' && (
                  <button
                    onClick={() => updateStaffStatus(member.id, 'off_duty')}
                    className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors"
                  >
                    Clock Out
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center justify-between">
            All Kitchen Staff
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" />
              Add Staff
            </button>
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Staff Member</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Position</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Experience</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Shift</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Stations</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Specialties</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.contact}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">{member.position}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getExperienceColor(member.experience_level)}`}>
                      {member.experience_level.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(member.status)}`}>
                      {member.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">{member.shift}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    {member.assigned_stations.join(', ')}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <div className="max-w-32">
                      {member.specialties.slice(0, 2).join(', ')}
                      {member.specialties.length > 2 && (
                        <span className="text-gray-500"> +{member.specialties.length - 2} more</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      {member.status === 'off_duty' && (
                        <button
                          onClick={() => updateStaffStatus(member.id, 'on_duty')}
                          className="text-green-600 hover:text-green-500"
                          title="Clock In"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedStaff(member)}
                        className="text-blue-600 hover:text-blue-500"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex flex-wrap gap-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          View Schedule
        </button>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Shift Settings
        </button>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
          <Users className="h-4 w-4" />
          Staff Performance
        </button>
      </div>
    </div>
  );
}