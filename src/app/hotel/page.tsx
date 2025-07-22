'use client';

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Users, Bed, ClipboardList, DollarSign, FileText, ArrowLeft, Hotel, User } from "lucide-react";
import { useAuth } from "../../../contexts/auth-context";
import LogoutButton from "../../../components/auth/logout-button";
import NotificationBadge from "../../../components/notifications/notification-badge";

export default function HotelManagementPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const hotelModules = [
    {
      title: "Reservations",
      description: "Manage bookings, check-ins, check-outs, and reservation modifications",
      href: "/reservations",
      icon: Calendar,
      color: "bg-blue-500",
      stats: "24 active reservations"
    },
    {
      title: "Rooms",
      description: "Room management, status tracking, and maintenance scheduling",
      href: "/rooms", 
      icon: Bed,
      color: "bg-green-500",
      stats: "78% occupancy rate"
    },
    {
      title: "Guests",
      description: "Guest profiles, history, preferences, and loyalty management",
      href: "/guests",
      icon: Users,
      color: "bg-purple-500",
      stats: "156 registered guests"
    },
    {
      title: "Housekeeping",
      description: "Room cleaning schedules, task management, and maintenance requests",
      href: "/housekeeping",
      icon: ClipboardList,
      color: "bg-orange-500",
      stats: "8 pending tasks"
    },
    {
      title: "Payments",
      description: "Payment processing, transaction tracking, and financial records",
      href: "/payments",
      icon: DollarSign,
      color: "bg-yellow-500",
      stats: "Rp 12,450,000 today"
    },
    {
      title: "Invoices",
      description: "Invoice generation, billing management, and financial documentation",
      href: "/invoices",
      icon: FileText,
      color: "bg-indigo-500",
      stats: "15 pending invoices"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/" className="mr-4 text-gray-500 hover:text-gray-700 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center">
                <div className="bg-blue-600 rounded-lg p-2 mr-3">
                  <Hotel className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Hotel Management</h1>
                  <p className="text-sm text-gray-600">Manage all hotel operations and services</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Welcome, {user.first_name} {user.last_name}</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {user.role || 'Staff'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <NotificationBadge />
                <Link 
                  href="/dashboard"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Full Dashboard
                </Link>
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  href="/reservations" 
                  className="flex items-center w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  New Reservation
                </Link>
                <Link 
                  href="/guests" 
                  className="flex items-center w-full bg-purple-500 text-white py-3 px-4 rounded-md hover:bg-purple-600 transition-colors text-sm font-medium"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Add Guest
                </Link>
                <Link 
                  href="/housekeeping" 
                  className="flex items-center w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 transition-colors text-sm font-medium"
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Mark Room Clean
                </Link>
                <Link 
                  href="/payments" 
                  className="flex items-center w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Record Payment
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-full p-2 mr-3">
                      <Bed className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Occupancy</p>
                      <p className="text-xs text-gray-500">Current rate</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-blue-600">78%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-green-100 rounded-full p-2 mr-3">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Reservations</p>
                      <p className="text-xs text-gray-500">Active today</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-green-600">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-purple-100 rounded-full p-2 mr-3">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Revenue</p>
                      <p className="text-xs text-gray-500">Today&apos;s total</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-purple-600">Rp 12.45M</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-orange-100 rounded-full p-2 mr-3">
                      <ClipboardList className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Tasks</p>
                      <p className="text-xs text-gray-500">Pending</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-orange-600">8</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Hotel Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {hotelModules.map((module) => {
                const IconComponent = module.icon;
                return (
                  <Link
                    key={module.href}
                    href={module.href}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-6 group hover:-translate-y-1"
                  >
                    <div className="flex items-center mb-4">
                      <div className={`${module.color} rounded-lg p-3 mr-4 group-hover:scale-110 transition-transform`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {module.title}
                        </h3>
                        <p className="text-sm text-gray-500">{module.stats}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      {module.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm text-blue-600 group-hover:text-blue-700 font-medium">
                        Access {module.title}
                      </span>
                      <svg className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}