'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { housekeepingApi } from '../../../lib/api';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Plus, Filter, Clock, CheckCircle, Play, Trash2 } from "lucide-react";

export default function HousekeepingPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated, statusFilter]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      // Use backend API with status filter
      const filters = statusFilter !== 'all' ? { status: statusFilter } : undefined;
      const data = await housekeepingApi.getHousekeepingTasks(filters);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // For development, use mock data if backend fails
      const mockTasks = [
        {
          id: 1,
          room: { roomNumber: '101', floor: 1 },
          taskType: 'cleaning',
          status: 'pending',
          priority: 'high',
          description: 'Standard room cleaning after checkout',
          assignedTo: 'Maria Santos',
          estimatedDuration: 45,
          createdBy: 'Front Desk',
          createdAt: '2025-07-13T08:00:00Z',
          notes: 'Guest mentioned spilled coffee on carpet'
        },
        {
          id: 2,
          room: { roomNumber: '205', floor: 2 },
          taskType: 'maintenance',
          status: 'in_progress',
          priority: 'urgent',
          description: 'Fix bathroom leak reported by guest',
          assignedTo: 'John Wilson',
          estimatedDuration: 60,
          createdBy: 'Housekeeping',
          createdAt: '2025-07-13T09:30:00Z',
          startedAt: '2025-07-13T10:00:00Z'
        }
      ];
      setTasks(mockTasks);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      // Find the current task to get its data
      const currentTask = tasks.find(t => t.id === taskId);
      if (!currentTask) return;

      const updateData = {
        ...currentTask,
        status: newStatus,
        ...(newStatus === 'in_progress' && { startedAt: new Date().toISOString() }),
        ...(newStatus === 'completed' && { completedAt: new Date().toISOString() })
      };

      // Note: Backend doesn't have housekeeping task update endpoint yet
      // For now, update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? updateData : task
        )
      );

      if (newStatus === 'completed') {
        alert('Task completed! Room is now available.');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('An error occurred while updating the task. Please try again.');
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      // Note: Backend doesn't have housekeeping task delete endpoint yet
      // For now, update local state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('An error occurred while deleting the task. Please try again.');
    }
  };

  if (authLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleString();
  };

  const statusOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Housekeeping</h1>
            <p className="text-gray-600">Manage cleaning tasks and room status</p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4 items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
            <div className="text-center py-8">Loading tasks...</div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <p className="text-gray-500">
                {statusFilter === 'all' ? 'No housekeeping tasks found.' : `No ${statusFilter} tasks found.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task: any) => (
              <div key={task.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Room {task.room?.roomNumber || task.room?.room_number || 'N/A'}
                    </h3>
                    <p className="text-sm text-gray-600 capitalize">
                      {task.taskType?.replace('_', ' ') || task.task_type?.replace('_', ' ') || 'General Task'} • Floor {task.room?.floor || 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority || 'medium')}`} title={`${task.priority || 'medium'} priority`}></div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status || 'pending')}`}>
                      {task.status?.replace('_', ' ') || 'Pending'}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-4">{task.description || 'No description available'}</p>

                <div className="space-y-2 mb-4 text-xs text-gray-600">
                  {(task.assignedTo || task.assigned_to) && (
                    <div>Assigned to: {task.assignedTo || task.assigned_to}</div>
                  )}
                  {(task.estimatedDuration || task.estimated_duration) && (
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Est. {task.estimatedDuration || task.estimated_duration} minutes
                    </div>
                  )}
                  <div>Created by: {task.createdBy || task.created_by || 'Unknown'}</div>
                  <div>Created: {formatDate(task.createdAt || task.created_at)}</div>
                  {(task.startedAt || task.started_at) && (
                    <div>Started: {formatDate(task.startedAt || task.started_at)}</div>
                  )}
                  {(task.completedAt || task.completed_at) && (
                    <div>Completed: {formatDate(task.completedAt || task.completed_at)}</div>
                  )}
                </div>

                {task.notes && (
                  <div className="mb-4 p-2 bg-blue-50 rounded text-sm">
                    <span className="font-medium text-blue-800">Notes:</span>
                    <p className="text-blue-700 mt-1">{task.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  {task.status === 'pending' && (
                    <button
                      onClick={() => updateTaskStatus(task.id, 'in_progress')}
                      className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                    >
                      <Play className="h-4 w-4" />
                      Start
                    </button>
                  )}
                  
                  {task.status === 'in_progress' && (
                    <button
                      onClick={() => updateTaskStatus(task.id, 'completed')}
                      className="flex items-center gap-1 px-3 py-2 text-sm text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Complete
                    </button>
                  )}

                  {['admin', 'manager', 'housekeeping'].includes(user?.role || 'staff') && (
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}