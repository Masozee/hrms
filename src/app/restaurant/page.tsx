'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChefHat, 
  UtensilsCrossed, 
  Receipt, 
  Users, 
  ClipboardList,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { restaurantApi } from '../../../lib/api';

export default function RestaurantDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    activeOrders: 0,
    availableTables: 0,
    menuItems: 0,
    todayRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch basic restaurant data
      const [orders, tables, menuItems] = await Promise.all([
        restaurantApi.getOrders(),
        restaurantApi.getTables(),
        restaurantApi.getMenuItems()
      ]);

      // Calculate stats
      const activeOrders = orders.filter((order: any) => 
        order.status === 'pending' || order.status === 'preparing'
      ).length;
      
      const availableTables = tables.filter((table: any) => 
        table.status === 'available'
      ).length;

      const todayRevenue = orders
        .filter((order: any) => {
          const orderDate = new Date(order.created_at || order.order_date);
          const today = new Date();
          return orderDate.toDateString() === today.toDateString();
        })
        .reduce((sum: number, order: any) => sum + parseFloat(order.total_amount || 0), 0);

      setStats({
        activeOrders,
        availableTables,
        menuItems: menuItems.length,
        todayRevenue
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    {
      title: "Menu Management",
      description: "Manage food items, categories, and pricing",
      href: "/restaurant/menu",
      icon: UtensilsCrossed,
      color: "bg-orange-500"
    },
    {
      title: "Order Management", 
      description: "View and manage customer orders",
      href: "/restaurant/orders",
      icon: ClipboardList,
      color: "bg-blue-500"
    },
    {
      title: "Table Management",
      description: "Manage table reservations and availability",
      href: "/restaurant/tables", 
      icon: Users,
      color: "bg-green-500"
    },
    {
      title: "Public Menu",
      description: "Customer-facing menu for orders",
      href: "/restaurant/public-menu",
      icon: ChefHat,
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurant Management</h1>
            <p className="text-gray-600">Manage your restaurant operations efficiently</p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Dashboard
            </Link>
            <Link
              href="/restaurant/orders"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Order
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3 mr-4">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3 mr-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available Tables</p>
                <p className="text-2xl font-bold text-gray-900">{stats.availableTables}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 rounded-lg p-3 mr-4">
                <UtensilsCrossed className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Menu Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.menuItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3 mr-4">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Today&apos;s Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.todayRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Management Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 group"
              >
                <div className="flex items-center mb-4">
                  <div className={`${item.color} rounded-lg p-3 mr-4`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <span className="text-sm text-blue-600 group-hover:text-blue-700">
                    Access {item.title.toLowerCase()} →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
          </div>
          
          {isLoading ? (
            <div className="p-6">
              <div className="text-center py-8">Loading orders...</div>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-6">
              <div className="text-center py-8">
                <Receipt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent orders found.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Table
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order: any) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Table {order.table || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.items_count || 0} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${parseFloat(order.total_amount || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'preparing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at || order.order_date || Date.now()).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}