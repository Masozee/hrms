'use client';

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Hotel, ChefHat, UserCheck, User } from "lucide-react";
import { useAuth } from "../../contexts/auth-context";
import LogoutButton from "../../components/auth/logout-button";
import NotificationBadge from "../../components/notifications/notification-badge";

export default function HomePage() {
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

  const categories = [
    {
      title: "Hotel Management",
      description: "Manage reservations, rooms, guests, housekeeping, payments, and invoicing",
      href: "/hotel",
      icon: Hotel,
      color: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
      features: ["Reservations", "Room Management", "Guest Services", "Housekeeping", "Billing & Payments"]
    },
    {
      title: "Restaurant Operations", 
      description: "Handle restaurant menu, orders, kitchen management, and dining services",
      href: "/restaurant-ops",
      icon: ChefHat,
      color: "bg-amber-600",
      hoverColor: "hover:bg-amber-700",
      features: ["Menu Management", "Order Processing", "Kitchen Operations", "Table Management"]
    },
    {
      title: "Hospitality Services",
      description: "Manage staff, notifications, reports, and overall service coordination",
      href: "/hospitality",
      icon: UserCheck,
      color: "bg-purple-600",
      hoverColor: "hover:bg-purple-700",
      features: ["Staff Management", "System Notifications", "Analytics & Reports", "Service Coordination"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hotel Management System</h1>
              <p className="text-sm text-gray-600">Choose your operational area</p>
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
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Select Your Department</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Access specialized tools and features for your specific operational needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <div key={category.href} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-8 h-full flex flex-col">
                {/* Icon Header */}
                <div className="text-center mb-6">
                  <div className={`${category.color} rounded-full p-6 inline-flex items-center justify-center`}>
                    <IconComponent className="h-12 w-12 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="text-center mb-8 flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {category.description}
                  </p>
                </div>

                {/* CTA Button */}
                <div className="text-center mt-auto">
                  <Link
                    href={category.href}
                    className={`${category.color} ${category.hoverColor} text-white px-8 py-4 rounded-lg font-medium hover:shadow-lg transition-all duration-300 inline-flex items-center justify-center w-full text-base`}
                  >
                    <span>Enter {category.title}</span>
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}