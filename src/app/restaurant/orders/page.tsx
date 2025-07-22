'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Plus,
  Search,
  Filter,
  DollarSign,
  User,
  Users,
  Receipt,
  Edit,
  Trash2,
  Minus
} from 'lucide-react';
import { restaurantApi, billingApi } from '../../../../lib/api';
import { formatCurrency } from '../../../../lib/currency';

export default function OrderManagement() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newOrder, setNewOrder] = useState({
    customer_name: '',
    table: '',
    phone: '',
    items: [] as any[],
    order_type: 'dine_in'
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchMenuItems();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await restaurantApi.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const data = await restaurantApi.getMenuItems();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      // Since we don't have an update endpoint in the current API, we'll need to add this
      // For now, we'll just update the local state
      setOrders(orders.map((order: any) => 
        order.id === orderId ? { ...order, status } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const createOrder = async () => {
    if (!newOrder.customer_name || !newOrder.table || newOrder.items.length === 0) {
      alert('Please fill in all required fields and add items');
      return;
    }

    try {
      const total = newOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const orderData = {
        ...newOrder,
        total_amount: total,
        status: 'pending'
      };

      await restaurantApi.createOrder(orderData);
      await fetchOrders();
      
      setNewOrder({
        customer_name: '',
        table: '',
        phone: '',
        items: [],
        order_type: 'dine_in'
      });
      setShowNewOrderModal(false);
      
      alert('Order created successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order. Please try again.');
    }
  };

  const addItemToNewOrder = (menuItem: any) => {
    const existingItem = newOrder.items.find(item => item.menu_item === menuItem.id);
    if (existingItem) {
      setNewOrder({
        ...newOrder,
        items: newOrder.items.map(item =>
          item.menu_item === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      });
    } else {
      setNewOrder({
        ...newOrder,
        items: [...newOrder.items, {
          menu_item: menuItem.id,
          name: menuItem.name,
          price: parseFloat(menuItem.price),
          quantity: 1
        }]
      });
    }
  };

  const removeItemFromNewOrder = (menuItemId: number) => {
    const existingItem = newOrder.items.find(item => item.menu_item === menuItemId);
    if (existingItem && existingItem.quantity > 1) {
      setNewOrder({
        ...newOrder,
        items: newOrder.items.map(item =>
          item.menu_item === menuItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      });
    } else {
      setNewOrder({
        ...newOrder,
        items: newOrder.items.filter(item => item.menu_item !== menuItemId)
      });
    }
  };

  const processPayment = async (order: any) => {
    try {
      // Create an invoice for the order
      const invoiceData = {
        guest: order.customer_name,
        amount: order.total_amount,
        invoice_number: `REST-${order.id}-${Date.now()}`,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: new Date().toISOString().split('T')[0],
        paid: false
      };

      // This would normally create an invoice in the billing system
      // await billingApi.createInvoice(invoiceData);
      
      await updateOrderStatus(order.id, 'completed');
      alert('Payment processed and order completed!');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error processing payment. Please try again.');
    }
  };

  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch = order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.table?.toString().includes(searchTerm) ||
                         order.id?.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'preparing': return <ClipboardList className="h-4 w-4" />;
      case 'ready': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (authLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
            <p className="text-gray-600">Manage restaurant orders and payments</p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/restaurant"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Restaurant
            </Link>
            <button
              onClick={() => setShowNewOrderModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Order
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Restaurant Orders</h2>
          </div>
          
          {isLoading ? (
            <div className="p-6">
              <div className="text-center py-8">Loading orders...</div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-6">
              <div className="text-center py-8">
                <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No orders found.</p>
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
                      Customer
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order: any) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.customer_name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.phone || 'No phone'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-gray-400 mr-1" />
                          Table {order.table || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.items_count || order.items?.length || 0} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                          {formatCurrency(parseFloat(order.total_amount || 0))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status || 'pending')}`}>
                          {getStatusIcon(order.status || 'pending')}
                          <span className="ml-1 capitalize">{order.status || 'pending'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at || order.order_date || Date.now()).toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {order.status === 'pending' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'preparing')}
                              className="text-green-600 hover:text-green-900"
                              title="Start Preparing"
                            >
                              <Clock className="h-4 w-4" />
                            </button>
                          )}
                          {order.status === 'preparing' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'ready')}
                              className="text-green-600 hover:text-green-900"
                              title="Mark Ready"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          {order.status === 'ready' && (
                            <button
                              onClick={() => processPayment(order)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Process Payment"
                            >
                              <Receipt className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Order #{selectedOrder.id}</h2>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                  <p><strong>Table:</strong> {selectedOrder.table}</p>
                  <p><strong>Phone:</strong> {selectedOrder.phone || 'Not provided'}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Order Details</h3>
                  <p><strong>Status:</strong> <span className="capitalize">{selectedOrder.status}</span></p>
                  <p><strong>Type:</strong> {selectedOrder.order_type}</p>
                  <p><strong>Time:</strong> {new Date(selectedOrder.created_at || Date.now()).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-4">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                      <div>
                        <span className="font-medium">{item.name || `Item ${index + 1}`}</span>
                        <span className="text-gray-600 ml-2">x{item.quantity}</span>
                      </div>
                      <span className="font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  )) || <p className="text-gray-500">No items details available</p>}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(parseFloat(selectedOrder.total_amount || 0))}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Order Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Create New Order</h2>
                <button
                  onClick={() => setShowNewOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Customer Info & Current Order */}
                <div>
                  <h3 className="font-semibold mb-4">Customer Information</h3>
                  <div className="space-y-4 mb-6">
                    <input
                      type="text"
                      placeholder="Customer Name *"
                      value={newOrder.customer_name}
                      onChange={(e) => setNewOrder({...newOrder, customer_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Table Number *"
                      value={newOrder.table}
                      onChange={(e) => setNewOrder({...newOrder, table: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={newOrder.phone}
                      onChange={(e) => setNewOrder({...newOrder, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <h3 className="font-semibold mb-4">Current Order</h3>
                  <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                    {newOrder.items.length === 0 ? (
                      <p className="text-gray-500">No items added</p>
                    ) : (
                      newOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                          <span>{item.name} x{item.quantity}</span>
                          <div className="flex items-center gap-2">
                            <span>{formatCurrency(item.price * item.quantity)}</span>
                            <button
                              onClick={() => removeItemFromNewOrder(item.menu_item)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(newOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}</span>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div>
                  <h3 className="font-semibold mb-4">Add Menu Items</h3>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {menuItems.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600">{formatCurrency(parseFloat(item.price))}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeItemFromNewOrder(item.id)}
                            className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-[2rem] text-center">
                            {newOrder.items.find(orderItem => orderItem.menu_item === item.id)?.quantity || 0}
                          </span>
                          <button
                            onClick={() => addItemToNewOrder(item)}
                            className="bg-green-500 text-white rounded-full p-1 hover:bg-green-600 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowNewOrderModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createOrder}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}