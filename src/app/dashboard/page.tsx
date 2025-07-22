'use client';

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Calendar, Users, Bed, ClipboardList, BarChart3, User, DollarSign, FileText, Bell, TrendingUp, CheckCircle, Clock, AlertTriangle, Activity, Plus, ChefHat, UtensilsCrossed, Hotel, Coffee, UserCheck } from "lucide-react";
import { useAuth } from "../../../contexts/auth-context";
import LogoutButton from "../../../components/auth/logout-button";
import NotificationBadge from "../../../components/notifications/notification-badge";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  
  const moduleCategories = {
    hotel: {
      title: "Hotel Management",
      icon: Hotel,
      color: "bg-blue-600",
      modules: [
        {
          title: "Reservations",
          description: "Manage bookings and check-ins",
          href: "/reservations",
          icon: Calendar,
          color: "bg-blue-500"
        },
        {
          title: "Rooms",
          description: "Room management and status",
          href: "/rooms", 
          icon: Bed,
          color: "bg-green-500"
        },
        {
          title: "Guests",
          description: "Guest profiles and history",
          href: "/guests",
          icon: Users,
          color: "bg-purple-500"
        },
        {
          title: "Housekeeping",
          description: "Cleaning tasks and status",
          href: "/housekeeping",
          icon: ClipboardList,
          color: "bg-orange-500"
        },
        {
          title: "Payments",
          description: "Payment tracking and billing",
          href: "/payments",
          icon: DollarSign,
          color: "bg-yellow-500"
        },
        {
          title: "Invoices",
          description: "Generate and manage invoices",
          href: "/invoices",
          icon: FileText,
          color: "bg-indigo-500"
        }
      ]
    },
    restaurant: {
      title: "Restaurant Operations",
      icon: ChefHat,
      color: "bg-amber-600",
      modules: [
        {
          title: "Restaurant",
          description: "Restaurant menu and order management",
          href: "/restaurant",
          icon: ChefHat,
          color: "bg-amber-500"
        },
        {
          title: "Kitchen Management",
          description: "Kitchen operations, orders & inventory",
          href: "/kitchen",
          icon: UtensilsCrossed,
          color: "bg-orange-600"
        }
      ]
    },
    hospitality: {
      title: "Hospitality Services",
      icon: UserCheck,
      color: "bg-purple-600",
      modules: [
        {
          title: "Notifications",
          description: "System alerts and notifications",
          href: "/notifications",
          icon: Bell,
          color: "bg-pink-500"
        },
        {
          title: "Reports",
          description: "Analytics and insights",
          href: "/reports",
          icon: BarChart3,
          color: "bg-red-500"
        },
        {
          title: "Staff",
          description: "Staff management",
          href: "/staff",
          icon: Building2,
          color: "bg-gray-500"
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Hotel Management Dashboard</h1>
            <p className="text-gray-600">Manage your hotel operations efficiently</p>
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
              <LogoutButton />
            </div>
          </div>
        </div>

        {/* Main Layout: Left Column + Right 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Column: Analytics & Shortcuts */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Analytics Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Analytics Overview
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Occupancy</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">78%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Revenue Today</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">$12,450</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Check-ins</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Check-outs</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">18</span>
                </div>
              </div>
              <Link 
                href="/reports"
                className="mt-4 block w-full text-center bg-blue-50 text-blue-600 py-2 px-4 rounded-md hover:bg-blue-100 transition-colors text-sm"
              >
                View Detailed Reports
              </Link>
            </div>

            {/* Key Metrics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Key Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Clean Rooms</p>
                    <p className="text-xs text-green-600">45 ready</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                  <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Pending Tasks</p>
                    <p className="text-xs text-yellow-600">8 housekeeping</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Maintenance</p>
                    <p className="text-xs text-red-600">3 urgent issues</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-purple-600" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link 
                  href="/reservations" 
                  className="flex items-center w-full text-left bg-blue-500 text-white py-2 px-3 rounded-md hover:bg-blue-600 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Reservation
                </Link>
                <Link 
                  href="/guests" 
                  className="flex items-center w-full text-left bg-purple-500 text-white py-2 px-3 rounded-md hover:bg-purple-600 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Guest
                </Link>
                <Link 
                  href="/housekeeping" 
                  className="flex items-center w-full text-left bg-orange-500 text-white py-2 px-3 rounded-md hover:bg-orange-600 transition-colors text-sm"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Room Clean
                </Link>
                <Link 
                  href="/payments" 
                  className="flex items-center w-full text-left bg-green-500 text-white py-2 px-3 rounded-md hover:bg-green-600 transition-colors text-sm"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Record Payment
                </Link>
                <Link 
                  href="/restaurant/orders" 
                  className="flex items-center w-full text-left bg-amber-500 text-white py-2 px-3 rounded-md hover:bg-amber-600 transition-colors text-sm"
                >
                  <ChefHat className="h-4 w-4 mr-2" />
                  Restaurant Orders
                </Link>
                <Link 
                  href="/kitchen" 
                  className="flex items-center w-full text-left bg-orange-600 text-white py-2 px-3 rounded-md hover:bg-orange-700 transition-colors text-sm"
                >
                  <UtensilsCrossed className="h-4 w-4 mr-2" />
                  Kitchen Dashboard
                </Link>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>API Connection:</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
                <div className="flex justify-between">
                  <span>Authentication:</span>
                  <span className="text-green-600 font-medium">Secure</span>
                </div>
                <div className="flex justify-between">
                  <span>User Role:</span>
                  <span className="text-blue-600 font-medium">{user.role || 'Staff'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Session:</span>
                  <span className="text-green-600 font-medium">Valid</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section: Categorized Menu */}
          <div className="lg:col-span-3 space-y-8">
            {Object.entries(moduleCategories).map(([categoryKey, category]) => {
              const CategoryIcon = category.icon;
              return (
                <div key={categoryKey} className="bg-white rounded-lg shadow-lg p-6">
                  {/* Category Header */}
                  <div className="flex items-center mb-6">
                    <div className={`${category.color} rounded-lg p-3 mr-4`}>
                      <CategoryIcon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{category.title}</h2>
                      <p className="text-sm text-gray-600">Manage your {category.title.toLowerCase()} operations</p>
                    </div>
                  </div>
                  
                  {/* Category Modules Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.modules.map((module) => {
                      const ModuleIcon = module.icon;
                      return (
                        <Link
                          key={module.href}
                          href={module.href}
                          className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 group transition-all duration-200 hover:shadow-md"
                        >
                          <div className="flex items-center mb-3">
                            <div className={`${module.color} rounded-md p-2 mr-3`}>
                              <ModuleIcon className="h-5 w-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {module.title}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                          <span className="text-xs text-blue-600 group-hover:text-blue-700 font-medium">
                            Access {module.title} →
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
