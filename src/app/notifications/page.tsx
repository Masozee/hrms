'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Wrench, 
  Calendar,
  CheckCircle,
  RefreshCw
} from "lucide-react";

export default function NotificationsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [summary, setSummary] = useState({ total: 0, urgent: 0, high: 0, actionRequired: 0 });
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, filter]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/notifications?type=${filter}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'checkin': return <Calendar className="h-5 w-5" />;
      case 'checkout': return <CheckCircle className="h-5 w-5" />;
      case 'housekeeping': return <Clock className="h-5 w-5" />;
      case 'maintenance': return <Wrench className="h-5 w-5" />;
      case 'payment': return <DollarSign className="h-5 w-5" />;
      default: return <Bell className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'checkin': return 'text-green-600';
      case 'checkout': return 'text-blue-600';
      case 'housekeeping': return 'text-purple-600';
      case 'maintenance': return 'text-orange-600';
      case 'payment': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  if (authLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications & Alerts</h1>
            <p className="text-gray-600">Stay updated on important hotel operations</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={fetchNotifications}
              disabled={isLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link 
              href="/"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3 mr-4">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-lg p-3 mr-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-red-600">{summary.urgent}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 rounded-lg p-3 mr-4">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">{summary.high}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3 mr-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Action Required</p>
                <p className="text-2xl font-bold text-green-600">{summary.actionRequired}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'all', label: 'All Notifications', icon: Bell },
                { key: 'checkins', label: 'Check-ins', icon: Calendar },
                { key: 'checkouts', label: 'Check-outs', icon: CheckCircle },
                { key: 'housekeeping', label: 'Housekeeping', icon: Clock },
                { key: 'maintenance', label: 'Maintenance', icon: Wrench },
                { key: 'payments', label: 'Payments', icon: DollarSign }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      filter === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-md">
          {isLoading ? (
            <div className="p-6">
              <div className="text-center py-8">Loading notifications...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6">
              <div className="text-center py-8">
                <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No notifications at this time.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification: any) => (
                <div key={notification.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 p-2 rounded-lg ${getTypeColor(notification.type)} bg-gray-50`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                          {notification.actionRequired && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
                              Action Required
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3">
                        {notification.message}
                      </p>
                      
                      {notification.details && (
                        <div className="text-xs text-gray-600 space-y-1">
                          {notification.details.confirmationNumber && (
                            <p><strong>Confirmation:</strong> {notification.details.confirmationNumber}</p>
                          )}
                          {notification.details.phone && (
                            <p><strong>Phone:</strong> {notification.details.phone}</p>
                          )}
                          {notification.details.outstandingAmount > 0 && (
                            <p><strong>Outstanding:</strong> ${notification.details.outstandingAmount.toFixed(2)}</p>
                          )}
                          {notification.details.daysOverdue > 0 && (
                            <p><strong>Days Overdue:</strong> {notification.details.daysOverdue}</p>
                          )}
                          {notification.details.assignedTo && (
                            <p><strong>Assigned To:</strong> {notification.details.assignedTo}</p>
                          )}
                          {notification.details.hoursOld > 0 && (
                            <p className={notification.details.hoursOld > 24 ? "text-red-600" : "text-yellow-600"}>
                              <strong>Age:</strong> {notification.details.hoursOld} hours
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}