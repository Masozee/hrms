'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';

export default function NotificationBadge() {
  const [notificationCount, setNotificationCount] = useState(0);
  const [urgentCount, setUrgentCount] = useState(0);

  useEffect(() => {
    fetchNotificationSummary();
    // Refresh every 5 minutes
    const interval = setInterval(fetchNotificationSummary, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotificationSummary = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotificationCount(data.summary.total);
        setUrgentCount(data.summary.urgent);
      }
    } catch (error) {
      console.error('Error fetching notification summary:', error);
    }
  };

  if (notificationCount === 0) {
    return null;
  }

  return (
    <Link
      href="/notifications"
      className="relative inline-flex items-center p-2 text-gray-600 hover:text-gray-900 transition-colors"
    >
      <Bell className="h-5 w-5" />
      
      {/* Notification count badge */}
      {notificationCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {notificationCount > 9 ? '9+' : notificationCount}
        </span>
      )}
      
      {/* Urgent alert indicator */}
      {urgentCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 rounded-full h-3 w-3 animate-pulse"></span>
      )}
    </Link>
  );
}