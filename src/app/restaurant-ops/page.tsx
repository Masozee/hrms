'use client';

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChefHat, UtensilsCrossed, ArrowLeft, User, Clock, TrendingUp } from "lucide-react";
import { useAuth } from "../../../contexts/auth-context";
import LogoutButton from "../../../components/auth/logout-button";
import NotificationBadge from "../../../components/notifications/notification-badge";

export default function RestaurantOperationsPage() {
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const restaurantModules = [
    {
      title: "Restaurant",
      description: "Menu management, table reservations, customer orders, and dining service coordination",
      href: "/restaurant",
      icon: ChefHat,
      color: "bg-amber-500",
      stats: "45 orders today",
      features: ["Menu Management", "Table Reservations", "Order Taking", "Customer Service"]
    },
    {
      title: "Kitchen Management",
      description: "Kitchen operations, order processing, inventory tracking, and food preparation workflows",
      href: "/kitchen",
      icon: UtensilsCrossed,
      color: "bg-orange-600",
      stats: "12 orders in queue",
      features: ["Order Processing", "Inventory Management", "Recipe Management", "Kitchen Workflow"]
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
                <div className="bg-amber-600 rounded-lg p-2 mr-3">
                  <ChefHat className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Restaurant Operations</h1>
                  <p className="text-sm text-gray-600">Manage dining services and kitchen operations</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Welcome, {user.first_name} {user.last_name}</span>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                  {user.role || 'Staff'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <NotificationBadge />
                <Link 
                  href="/dashboard"
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
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
                  href="/restaurant/orders" 
                  className="flex items-center w-full bg-amber-500 text-white py-3 px-4 rounded-md hover:bg-amber-600 transition-colors text-sm font-medium"
                >
                  <ChefHat className="h-4 w-4 mr-2" />
                  New Order
                </Link>
                <Link 
                  href="/kitchen" 
                  className="flex items-center w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 transition-colors text-sm font-medium"
                >
                  <UtensilsCrossed className="h-4 w-4 mr-2" />
                  Kitchen View
                </Link>
                <Link 
                  href="/restaurant/menu" 
                  className="flex items-center w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
                >
                  <ChefHat className="h-4 w-4 mr-2" />
                  Menu Items
                </Link>
                <Link 
                  href="/restaurant/tables" 
                  className="flex items-center w-full bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  <UtensilsCrossed className="h-4 w-4 mr-2" />
                  Table Status
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-amber-100 rounded-full p-2 mr-3">
                      <ChefHat className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Orders</p>
                      <p className="text-xs text-gray-500">Today&apos;s total</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-amber-600">45</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-orange-100 rounded-full p-2 mr-3">
                      <Clock className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Queue</p>
                      <p className="text-xs text-gray-500">In kitchen</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-orange-600">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-green-100 rounded-full p-2 mr-3">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Revenue</p>
                      <p className="text-xs text-gray-500">Restaurant</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-green-600">Rp 8.2M</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-100 rounded-full p-2 mr-3">
                      <UtensilsCrossed className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Prep Time</p>
                      <p className="text-xs text-gray-500">Average</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-blue-600">18min</span>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
              <div className="space-y-3">
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <div className="text-lg font-bold text-amber-600">45</div>
                  <div className="text-xs text-gray-600">Orders Completed</div>
                  <div className="text-xs text-green-600">+15% from yesterday</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">4.8/5</div>
                  <div className="text-xs text-gray-600">Customer Rating</div>
                  <div className="text-xs text-green-600">Excellent service</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Restaurant Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {restaurantModules.map((module) => {
                const IconComponent = module.icon;
                return (
                  <div key={module.href} className="bg-white rounded-lg shadow-lg p-8">
                    {/* Module Header */}
                    <div className="flex items-center mb-6">
                      <div className={`${module.color} rounded-lg p-4 mr-4`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{module.title}</h3>
                        <p className="text-sm text-gray-500">{module.stats}</p>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {module.description}
                    </p>
                    
                    {/* Features */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Features:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {module.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-2"></div>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <Link
                      href={module.href}
                      className={`${module.color} hover:${module.color.replace('bg-', 'bg-').replace('-500', '-600').replace('-600', '-700')} text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 inline-flex items-center group w-full justify-center`}
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
          </div>
        </div>
      </div>
    </div>
  );
}