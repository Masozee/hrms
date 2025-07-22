'use client';

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, BarChart3, Building2, ArrowLeft, UserCheck, User, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { useAuth } from "../../../contexts/auth-context";
import LogoutButton from "../../../components/auth/logout-button";
import NotificationBadge from "../../../components/notifications/notification-badge";

export default function HospitalityServicesPage() {
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const hospitalityModules = [
    {
      title: "Notifications",
      description: "System alerts, staff notifications, guest communications, and automated messaging",
      href: "/notifications",
      icon: Bell,
      color: "bg-pink-500",
      stats: "5 active alerts",
      features: ["System Alerts", "Staff Messages", "Guest Communications", "Automated Notifications"]
    },
    {
      title: "Reports",
      description: "Analytics dashboard, performance metrics, financial reports, and business insights",
      href: "/reports",
      icon: BarChart3,
      color: "bg-red-500",
      stats: "12 reports available",
      features: ["Revenue Analytics", "Occupancy Reports", "Staff Performance", "Guest Satisfaction"]
    },
    {
      title: "Staff",
      description: "Employee management, scheduling, performance tracking, and departmental coordination",
      href: "/staff",
      icon: Building2,
      color: "bg-gray-500",
      stats: "24 staff members",
      features: ["Employee Profiles", "Shift Scheduling", "Performance Reviews", "Department Management"]
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
                <div className="bg-purple-600 rounded-lg p-2 mr-3">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Hospitality Services</h1>
                  <p className="text-sm text-gray-600">Manage staff, communications, and business insights</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Welcome, {user.first_name} {user.last_name}</span>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  {user.role || 'Staff'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <NotificationBadge />
                <Link 
                  href="/dashboard"
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
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
                  href="/notifications" 
                  className="flex items-center w-full bg-pink-500 text-white py-3 px-4 rounded-md hover:bg-pink-600 transition-colors text-sm font-medium"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  View Alerts
                </Link>
                <Link 
                  href="/reports" 
                  className="flex items-center w-full bg-red-500 text-white py-3 px-4 rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Report
                </Link>
                <Link 
                  href="/staff" 
                  className="flex items-center w-full bg-gray-500 text-white py-3 px-4 rounded-md hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Manage Staff
                </Link>
                <Link 
                  href="/reports/performance" 
                  className="flex items-center w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Performance
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-purple-100 rounded-full p-2 mr-3">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Staff</p>
                      <p className="text-xs text-gray-500">Active today</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-purple-600">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-pink-100 rounded-full p-2 mr-3">
                      <Bell className="h-4 w-4 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Alerts</p>
                      <p className="text-xs text-gray-500">System</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-pink-600">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-green-100 rounded-full p-2 mr-3">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Revenue</p>
                      <p className="text-xs text-gray-500">This month</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-green-600">Rp 245M</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-orange-100 rounded-full p-2 mr-3">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Issues</p>
                      <p className="text-xs text-gray-500">To review</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-orange-600">3</span>
                </div>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
              <div className="space-y-3">
                <div className="flex items-center p-2 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-yellow-900">Room 305 AC Issue</p>
                    <p className="text-xs text-yellow-600">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center p-2 bg-red-50 rounded-lg">
                  <Bell className="h-4 w-4 text-red-600 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-red-900">High Check-in Volume</p>
                    <p className="text-xs text-red-600">Expected at 3 PM</p>
                  </div>
                </div>
                <div className="flex items-center p-2 bg-blue-50 rounded-lg">
                  <Users className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-blue-900">Staff Shift Change</p>
                    <p className="text-xs text-blue-600">In 30 minutes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Hospitality Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {hospitalityModules.map((module) => {
                const IconComponent = module.icon;
                return (
                  <div key={module.href} className="bg-white rounded-lg shadow-lg p-6">
                    {/* Module Header */}
                    <div className="flex items-center mb-4">
                      <div className={`${module.color} rounded-lg p-3 mr-4`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{module.title}</h3>
                        <p className="text-sm text-gray-500">{module.stats}</p>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                      {module.description}
                    </p>
                    
                    {/* Features */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Features:</h4>
                      <div className="space-y-1">
                        {module.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></div>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <Link
                      href={module.href}
                      className={`${module.color} hover:${module.color.replace('bg-', 'bg-').replace('-500', '-600')} text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 inline-flex items-center group w-full justify-center text-sm`}
                    >
                      <span>Access {module.title}</span>
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Staff Overview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Overview by Department</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-blue-900">Front Desk</span>
                  </div>
                  <span className="text-sm text-blue-600 font-bold">6 staff</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-green-900">Housekeeping</span>
                  </div>
                  <span className="text-sm text-green-600 font-bold">8 staff</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-purple-900">Restaurant</span>
                  </div>
                  <span className="text-sm text-purple-600 font-bold">10 staff</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}