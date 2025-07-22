'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChefHat, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Timer,
  PlayCircle,
  PauseCircle,
  Bell,
  Users,
  UtensilsCrossed,
  X,
  Plus,
  Minus,
  RefreshCw,
  Eye,
  DollarSign,
  Package,
  UserCheck,
  Settings,
  BarChart3,
  Utensils
} from 'lucide-react';
import { restaurantApi, checkApiHealth } from '../../../lib/api';
import { formatCurrency } from '../../../lib/currency';
import KitchenInventory from '../../../components/kitchen/kitchen-inventory';
import KitchenStaff from '../../../components/kitchen/kitchen-staff';

interface KitchenOrder {
  id: number;
  customer_name: string;
  table: string;
  items: any[];
  total_amount: number;
  status: string;
  order_type: string;
  created_at: string;
  preparation_started_at?: string;
  estimated_completion?: string;
  priority: 'normal' | 'high' | 'urgent';
  special_notes?: string;
}

export default function KitchenDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState('active'); // active, all, completed
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeView, setActiveView] = useState('orders'); // orders, inventory, staff
  const [showInventory, setShowInventory] = useState(false);
  const [showStaff, setShowStaff] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      checkApiStatus();
      fetchOrders();
    }
  }, [isAuthenticated]);

  const checkApiStatus = async () => {
    setApiStatus('checking');
    const isOnline = await checkApiHealth();
    setApiStatus(isOnline ? 'online' : 'offline');
  };

  // Auto-refresh every 30 seconds (only when there are active orders)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const hasActiveOrders = orders.some(order => ['pending', 'preparing'].includes(order.status));
    
    if (autoRefresh && isAuthenticated && hasActiveOrders) {
      interval = setInterval(() => {
        fetchOrders();
        setCurrentTime(new Date());
      }, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, isAuthenticated, orders]);

  // Update current time every 30 seconds (less frequent to reduce re-renders)
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timeInterval);
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await restaurantApi.getOrders();
      
      // If API returns empty or no data, use fallback
      if (!data || data.length === 0) {
        console.info('No orders from API, using fallback data');
        throw new Error('No orders available from API');
      }
      
      // Transform and enhance orders for kitchen display
      const kitchenOrders = await Promise.all(data.map(async (order: any) => {
        // Fetch detailed order items with menu information
        let enhancedItems = order.items || [];
        
        try {
          // Get order items with menu details
          const orderItems = await restaurantApi.getOrderItems({ order: order.id });
          enhancedItems = await Promise.all(orderItems.map(async (item: any) => {
            try {
              // Get menu item details
              const menuItems = await restaurantApi.getMenuItems({ id: item.menu_item });
              const menuItem = menuItems[0] || {};
              
              return {
                ...item,
                name: menuItem.name || item.name || 'Unknown Item',
                description: menuItem.description || '',
                preparation_time: menuItem.preparation_time || item.preparation_time || 15,
                price: item.unit_price || menuItem.price || 0,
                customizations: item.customizations || {}
              };
            } catch (error) {
              console.warn('Error fetching menu item details:', error);
              return {
                ...item,
                name: item.name || 'Unknown Item',
                preparation_time: 15,
                price: item.unit_price || 0
              };
            }
          }));
        } catch (error) {
          console.warn('Error fetching order items:', error);
          // Use basic order items if detailed fetch fails
          enhancedItems = order.items?.map((item: any, index: number) => ({
            ...item,
            name: item.name || `Item ${index + 1}`,
            preparation_time: item.preparation_time || 15,
            price: item.price || 0
          })) || [];
        }

        return {
          ...order,
          items: enhancedItems,
          customer_name: order.customer_name || order.guest?.name || `Guest ${order.id}`,
          table: order.table?.number || order.table || 'Unknown',
          priority: calculatePriority(order),
          estimated_completion: calculateEstimatedCompletion({...order, items: enhancedItems})
        };
      }));

      setOrders(kitchenOrders);
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
      
      // Fallback to mock data with proper menu items
      const mockOrders = [
        {
          id: 1,
          customer_name: 'Ahmad Wijaya',
          table: '5',
          items: [
            {
              id: 1,
              name: 'Nasi Goreng Special',
              quantity: 2,
              price: 45000,
              preparation_time: 20,
              customizations: {
                spiceLevel: 'hot',
                extraIngredients: ['Kerupuk', 'Acar'],
                specialInstructions: 'Extra pedas'
              }
            },
            {
              id: 2,
              name: 'Es Teh Manis',
              quantity: 2,
              price: 8000,
              preparation_time: 5,
              customizations: {}
            }
          ],
          total_amount: 106000,
          status: 'pending',
          order_type: 'dine_in',
          created_at: new Date(Date.now() - 5 * 60000).toISOString(),
          priority: 'normal',
          estimated_completion: new Date(Date.now() + 20 * 60000).toLocaleTimeString()
        },
        {
          id: 2,
          customer_name: 'Sari Dewi',
          table: '12',
          items: [
            {
              id: 3,
              name: 'Rendang Daging',
              quantity: 1,
              price: 65000,
              preparation_time: 25,
              customizations: {
                removeIngredients: ['Cabai'],
                specialInstructions: 'Tidak pedas untuk anak'
              }
            },
            {
              id: 4,
              name: 'Nasi Putih',
              quantity: 1,
              price: 8000,
              preparation_time: 5,
              customizations: {}
            },
            {
              id: 5,
              name: 'Gado-Gado',
              quantity: 1,
              price: 35000,
              preparation_time: 15,
              customizations: {
                extraIngredients: ['Tahu', 'Tempe'],
                spiceLevel: 'mild'
              }
            }
          ],
          total_amount: 108000,
          status: 'preparing',
          order_type: 'dine_in',
          created_at: new Date(Date.now() - 15 * 60000).toISOString(),
          preparation_started_at: new Date(Date.now() - 10 * 60000).toISOString(),
          priority: 'high',
          estimated_completion: new Date(Date.now() + 15 * 60000).toLocaleTimeString()
        },
        {
          id: 3,
          customer_name: 'Budi Santoso',
          table: '8',
          items: [
            {
              id: 6,
              name: 'Ayam Bakar Kecap',
              quantity: 1,
              price: 55000,
              preparation_time: 30,
              customizations: {
                spiceLevel: 'medium',
                specialInstructions: 'Matang sempurna'
              }
            },
            {
              id: 7,
              name: 'Sayur Asem',
              quantity: 1,
              price: 25000,
              preparation_time: 15,
              customizations: {}
            },
            {
              id: 8,
              name: 'Es Jeruk',
              quantity: 2,
              price: 12000,
              preparation_time: 5,
              customizations: {
                specialInstructions: 'Es banyak'
              }
            }
          ],
          total_amount: 91000,
          status: 'ready',
          order_type: 'dine_in',
          created_at: new Date(Date.now() - 35 * 60000).toISOString(),
          preparation_started_at: new Date(Date.now() - 30 * 60000).toISOString(),
          priority: 'urgent',
          estimated_completion: new Date(Date.now() - 5 * 60000).toLocaleTimeString()
        }
      ];
      
      setOrders(mockOrders);
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePriority = (order: any): 'normal' | 'high' | 'urgent' => {
    const orderTime = new Date(order.created_at || Date.now());
    const now = new Date();
    const minutesOld = (now.getTime() - orderTime.getTime()) / (1000 * 60);
    
    if (minutesOld > 30) return 'urgent';
    if (minutesOld > 15) return 'high';
    return 'normal';
  };

  const calculateEstimatedCompletion = (order: any): string => {
    const totalPrepTime = order.items?.reduce((total: number, item: any) => {
      return total + (item.preparation_time || 15); // Default 15 minutes
    }, 0) || 20;
    
    const startTime = order.preparation_started_at 
      ? new Date(order.preparation_started_at)
      : new Date(order.created_at || Date.now());
    
    const estimated = new Date(startTime.getTime() + totalPrepTime * 60000);
    return estimated.toLocaleTimeString();
  };

  const getTimeSinceOrder = (orderTime: string): string => {
    const now = new Date();
    const order = new Date(orderTime);
    const diffMs = now.getTime() - order.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m ago`;
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'urgent': return 'border-red-300 text-red-800';
      case 'high': return 'border-orange-300 text-orange-800';
      default: return 'border-green-300 text-green-800';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      // Update local state immediately for better UX
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: newStatus,
              preparation_started_at: newStatus === 'preparing' && !order.preparation_started_at 
                ? new Date().toISOString() 
                : order.preparation_started_at
            }
          : order
      ));

      // Call the real API to update order status
      await restaurantApi.updateOrderStatus(orderId, newStatus);
      
      // If API call succeeds, fetch fresh data to ensure consistency
      setTimeout(() => {
        fetchOrders();
      }, 1000);
      
    } catch (error) {
      console.error('Error updating order status:', error);
      // Revert the optimistic update by fetching fresh data
      fetchOrders();
    }
  };

  const filteredOrders = orders.filter(order => {
    switch (filterStatus) {
      case 'active':
        return ['pending', 'preparing'].includes(order.status);
      case 'completed':
        return ['ready', 'completed'].includes(order.status);
      default:
        return true;
    }
  });

  const activeOrdersCount = orders.filter(order => 
    ['pending', 'preparing'].includes(order.status)
  ).length;

  const averagePrepTime = orders.filter(order => 
    order.preparation_started_at && order.status === 'ready'
  ).length; // Simplified calculation

  if (authLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <ChefHat className="h-8 w-8 mr-3 text-orange-600" />
              Kitchen Management System
            </h1>
            <p className="text-gray-600">Real-time order tracking and kitchen operations</p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="text-right text-sm text-gray-600">
              <div>{currentTime.toLocaleTimeString()}</div>
              <div>{currentTime.toLocaleDateString()}</div>
              <div className="flex items-center gap-1 mt-1">
                <div className={`w-2 h-2 rounded-full ${
                  apiStatus === 'online' ? 'bg-green-500' : 
                  apiStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-xs">
                  {apiStatus === 'online' ? 'API Online' : 
                   apiStatus === 'offline' ? 'API Offline' : 'Checking API'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors text-white ${
                autoRefresh ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'
              }`}
              title={autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                checkApiStatus();
                fetchOrders();
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <Link 
              href="/restaurant"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Restaurant
            </Link>
          </div>
        </div>

        {/* API Status Banner */}
        {apiStatus === 'offline' && (
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <p className="font-medium">Backend API is currently offline</p>
              <p className="text-sm">Using local mock data. Some features may be limited.</p>
            </div>
          </div>
        )}

        {/* Kitchen Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="bg-blue-600 rounded-lg p-3 mr-4">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Orders</p>
                <p className="text-2xl font-bold text-gray-900">{activeOrdersCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="bg-green-600 rounded-lg p-3 mr-4">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ready Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(order => order.status === 'ready').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="bg-orange-600 rounded-lg p-3 mr-4">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Urgent Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orders.filter(order => order.priority === 'urgent').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="bg-purple-600 rounded-lg p-3 mr-4">
                <Timer className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Prep Time</p>
                <p className="text-2xl font-bold text-gray-900">{averagePrepTime || 15}m</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200 shadow-sm">
          <div className="flex flex-wrap gap-4">
            {[
              { key: 'orders', label: 'Kitchen Orders', icon: UtensilsCrossed },
              { key: 'inventory', label: 'Inventory', icon: Package },
              { key: 'staff', label: 'Staff Management', icon: UserCheck },
              { key: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveView(tab.key)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  activeView === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Tabs for Orders View */}
        {activeView === 'orders' && (
          <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200 shadow-sm">
            <div className="flex gap-4">
              {[
                { key: 'active', label: 'Active Orders', count: activeOrdersCount },
                { key: 'completed', label: 'Ready/Completed', count: orders.filter(o => ['ready', 'completed'].includes(o.status)).length },
                { key: 'all', label: 'All Orders', count: orders.length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilterStatus(tab.key)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    filterStatus === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                  <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content based on active view */}
        {activeView === 'orders' && (
          <>
            {/* Kitchen Display System (KDS) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`rounded-lg p-6 border-2 transition-all bg-white shadow-sm ${getPriorityColor(order.priority)} ${
                order.priority === 'urgent' ? 'ring-2 ring-red-500 ring-opacity-75' : ''
              }`}
            >
              {/* Order Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Table {order.table}
                  </h3>
                  <p className="text-sm opacity-75">{order.customer_name}</p>
                  <p className="text-xs opacity-60">Order #{order.id}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <p className="text-xs mt-1 opacity-75">
                    {getTimeSinceOrder(order.created_at)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2 mb-4">
                {order.items?.map((item: any, index: number) => (
                  <div key={index} className="bg-gray-50 rounded p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name || `Item ${index + 1}`}</h4>
                        <p className="text-xs opacity-75">Qty: {item.quantity}</p>
                        
                        {/* Show customizations */}
                        {item.customizations && (
                          <div className="mt-2 text-xs space-y-1 opacity-90">
                            {item.customizations.removeIngredients?.length > 0 && (
                              <p className="flex items-center">
                                <X className="h-3 w-3 mr-1 text-red-400" />
                                No: {item.customizations.removeIngredients.join(', ')}
                              </p>
                            )}
                            {item.customizations.extraIngredients?.length > 0 && (
                              <p className="flex items-center">
                                <Plus className="h-3 w-3 mr-1 text-green-400" />
                                Extra: {item.customizations.extraIngredients.join(', ')}
                              </p>
                            )}
                            {item.customizations.spiceLevel && item.customizations.spiceLevel !== 'medium' && (
                              <p>🌶️ {item.customizations.spiceLevel}</p>
                            )}
                            {item.customizations.specialInstructions && (
                              <p className="italic">&#34;{item.customizations.specialInstructions}&#34;</p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-75">
                          ~{item.preparation_time || 15}m
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Actions */}
              <div className="space-y-2">
                {order.status === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <PlayCircle className="h-4 w-4" />
                    Start Preparing
                  </button>
                )}
                
                {order.status === 'preparing' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'ready')}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark Ready
                  </button>
                )}

                {order.status === 'ready' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'completed')}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Bell className="h-4 w-4" />
                    Mark Served
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowOrderModal(true);
                  }}
                  className="w-full bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
              </div>

              {/* Timing Info */}
              <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                <div className="flex justify-between text-xs opacity-75">
                  <span>Est. Ready: {order.estimated_completion}</span>
                  <span className="flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {formatCurrency(order.total_amount)}
                  </span>
                </div>
              </div>
            </div>
              ))}

              {filteredOrders.length === 0 && !isLoading && (
                <div className="text-center py-12 col-span-full">
                  <ChefHat className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No orders to display</p>
                  <p className="text-gray-500 text-sm">
                    {filterStatus === 'active' ? 'All orders are completed' : 'No orders found'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Inventory Management View */}
        {activeView === 'inventory' && (
          <KitchenInventory />
        )}

        {/* Staff Management View */}
        {activeView === 'staff' && (
          <KitchenStaff />
        )}

        {/* Analytics View */}
        {activeView === 'analytics' && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <BarChart3 className="h-6 w-6 mr-3 text-purple-600" />
              Kitchen Analytics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Today&apos;s Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Orders Completed:</span>
                    <span className="text-gray-900 font-bold">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Prep Time:</span>
                    <span className="text-gray-900 font-bold">18 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Revenue:</span>
                    <span className="text-gray-900 font-bold">{formatCurrency(2450000)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Popular Items</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nasi Goreng Special:</span>
                    <span className="text-gray-900 font-bold">8 orders</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rendang Daging:</span>
                    <span className="text-gray-900 font-bold">6 orders</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gado-Gado:</span>
                    <span className="text-gray-900 font-bold">5 orders</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Kitchen Efficiency</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">On-time Rate:</span>
                    <span className="text-green-600 font-bold">94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Error Rate:</span>
                    <span className="text-orange-600 font-bold">2.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer Rating:</span>
                    <span className="text-green-600 font-bold">4.7/5</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Peak Hours Analysis</h3>
              <div className="text-gray-700">
                <p className="mb-2">🕐 <strong>Lunch Rush:</strong> 12:00 PM - 2:00 PM (Peak: 18 orders/hour)</p>
                <p>🕖 <strong>Dinner Rush:</strong> 7:00 PM - 9:00 PM (Peak: 22 orders/hour)</p>
              </div>
              <div className="mt-4 flex gap-4">
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  View Detailed Reports
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Export Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">
                  Order #{selectedOrder.id} - Table {selectedOrder.table}
                </h2>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 text-white">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold mb-2 text-gray-300">Customer Information</h3>
                  <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                  <p><strong>Table:</strong> {selectedOrder.table}</p>
                  <p><strong>Order Type:</strong> {selectedOrder.order_type}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-gray-300">Order Details</h3>
                  <p><strong>Status:</strong> <span className="capitalize">{selectedOrder.status}</span></p>
                  <p><strong>Priority:</strong> <span className="capitalize">{selectedOrder.priority}</span></p>
                  <p><strong>Time:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-4 text-gray-300">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any, index: number) => (
                    <div key={index} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{item.name || `Item ${index + 1}`}</h4>
                          <p className="text-sm text-gray-300">Quantity: {item.quantity}</p>
                          <p className="text-sm text-gray-300">Prep time: ~{item.preparation_time || 15} minutes</p>
                          
                          {item.customizations && (
                            <div className="mt-2 text-sm space-y-1">
                              {item.customizations.removeIngredients?.length > 0 && (
                                <p className="text-red-400">Remove: {item.customizations.removeIngredients.join(', ')}</p>
                              )}
                              {item.customizations.extraIngredients?.length > 0 && (
                                <p className="text-green-400">Add: {item.customizations.extraIngredients.join(', ')}</p>
                              )}
                              {item.customizations.spiceLevel && item.customizations.spiceLevel !== 'medium' && (
                                <p className="text-orange-400">Spice: {item.customizations.spiceLevel}</p>
                              )}
                              {item.customizations.specialInstructions && (
                                <p className="text-yellow-400 italic">Special: {item.customizations.specialInstructions}</p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}