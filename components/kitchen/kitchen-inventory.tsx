'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp,
  Search,
  Filter,
  Plus,
  Minus,
  RefreshCw,
  Calendar,
  BarChart3
} from 'lucide-react';
import { formatCurrency } from '../../lib/currency';

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  current_stock: number;
  unit: string;
  minimum_stock: number;
  maximum_stock: number;
  unit_cost: number;
  supplier: string;
  last_restocked: string;
  expiry_date?: string;
  location: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
}

interface KitchenInventoryProps {
  onClose?: () => void;
}

export default function KitchenInventory({ onClose }: KitchenInventoryProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    filterInventory();
  }, [inventory, searchTerm, selectedCategory, selectedStatus]);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const { inventoryApi } = await import('../../lib/api');
      const items = await inventoryApi.getItems();
      
      // Transform API data to match our interface
      const transformedItems: InventoryItem[] = items.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category?.name || item.category || 'Unknown',
        current_stock: item.quantity || item.current_stock || 0,
        unit: item.unit || 'pieces',
        minimum_stock: item.minimum_quantity || item.minimum_stock || 0,
        maximum_stock: item.maximum_quantity || item.maximum_stock || 100,
        unit_cost: item.unit_price || item.cost_per_unit || item.unit_cost || 0,
        supplier: item.supplier?.name || item.supplier || 'Unknown Supplier',
        last_restocked: item.last_restocked || item.updated_at || new Date().toISOString().split('T')[0],
        expiry_date: item.expiry_date,
        location: item.location || item.storage_location || 'Kitchen Storage',
        status: determineStatus(item)
      }));

      setInventory(transformedItems);
    } catch (error) {
      console.error('Error fetching inventory from API:', error);
      
      // Fallback to mock data if API fails
      const mockInventory: InventoryItem[] = [
        {
          id: 1,
          name: 'Beras Premium',
          category: 'Grains',
          current_stock: 25,
          unit: 'kg',
          minimum_stock: 20,
          maximum_stock: 100,
          unit_cost: 15000,
          supplier: 'PT Beras Sejahtera',
          last_restocked: '2024-01-10',
          location: 'Storage Room A',
          status: 'in_stock'
        },
        {
          id: 2,
          name: 'Daging Sapi',
          category: 'Meat',
          current_stock: 5,
          unit: 'kg',
          minimum_stock: 10,
          maximum_stock: 50,
          unit_cost: 120000,
          supplier: 'CV Daging Fresh',
          last_restocked: '2024-01-12',
          expiry_date: '2024-01-15',
          location: 'Freezer 1',
          status: 'low_stock'
        },
        {
          id: 3,
          name: 'Minyak Goreng',
          category: 'Cooking Oil',
          current_stock: 0,
          unit: 'liter',
          minimum_stock: 5,
          maximum_stock: 30,
          unit_cost: 25000,
          supplier: 'Toko Minyak Jaya',
          last_restocked: '2024-01-05',
          location: 'Storage Room B',
          status: 'out_of_stock'
        },
        {
          id: 4,
          name: 'Santan Kelapa',
          category: 'Dairy/Coconut',
          current_stock: 15,
          unit: 'liter',
          minimum_stock: 10,
          maximum_stock: 40,
          unit_cost: 18000,
          supplier: 'UD Kelapa Segar',
          last_restocked: '2024-01-11',
          expiry_date: '2024-01-20',
          location: 'Refrigerator 2',
          status: 'in_stock'
        },
        {
          id: 5,
          name: 'Cabai Merah',
          category: 'Vegetables',
          current_stock: 8,
          unit: 'kg',
          minimum_stock: 5,
          maximum_stock: 25,
          unit_cost: 35000,
          supplier: 'Pasar Sayur Segar',
          last_restocked: '2024-01-08',
          expiry_date: '2024-01-14',
          location: 'Vegetable Storage',
          status: 'in_stock'
        },
        {
          id: 6,
          name: 'Garam Dapur',
          category: 'Seasonings',
          current_stock: 2,
          unit: 'kg',
          minimum_stock: 3,
          maximum_stock: 15,
          unit_cost: 8000,
          supplier: 'CV Bumbu Nusantara',
          last_restocked: '2024-01-01',
          location: 'Spice Rack',
          status: 'low_stock'
        }
      ];
      setInventory(mockInventory);
    } finally {
      setIsLoading(false);
    }
  };

  const determineStatus = (item: any): 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired' => {
    const quantity = item.quantity || item.current_stock || 0;
    const minQuantity = item.minimum_quantity || item.minimum_stock || 0;
    
    // Check if expired
    if (item.expiry_date && new Date(item.expiry_date) < new Date()) {
      return 'expired';
    }
    
    // Check stock levels
    if (quantity === 0) {
      return 'out_of_stock';
    } else if (quantity <= minQuantity) {
      return 'low_stock';
    } else {
      return 'in_stock';
    }
  };

  const filterInventory = () => {
    let filtered = inventory;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    setFilteredInventory(filtered);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800 border-green-300';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'out_of_stock': return 'bg-red-100 text-red-800 border-red-300';
      case 'expired': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStockPercentage = (item: InventoryItem): number => {
    return (item.current_stock / item.maximum_stock) * 100;
  };

  const categories = Array.from(new Set(inventory.map(item => item.category)));
  const statuses = ['in_stock', 'low_stock', 'out_of_stock', 'expired'];

  const inventoryStats = {
    total_items: inventory.length,
    low_stock_items: inventory.filter(item => item.status === 'low_stock').length,
    out_of_stock_items: inventory.filter(item => item.status === 'out_of_stock').length,
    expired_items: inventory.filter(item => item.status === 'expired').length,
    total_value: inventory.reduce((sum, item) => sum + (item.current_stock * item.unit_cost), 0)
  };

  return (
    <div className="bg-white text-gray-900 p-6 rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Package className="h-6 w-6 mr-3 text-blue-600" />
            Kitchen Inventory Management
          </h2>
          <p className="text-gray-600 mt-1">Track and manage kitchen supplies and ingredients</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchInventory}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-xs text-gray-600">Total Items</p>
              <p className="text-xl font-bold">{inventoryStats.total_items}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <TrendingDown className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-xs text-gray-600">Low Stock</p>
              <p className="text-xl font-bold">{inventoryStats.low_stock_items}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-xs text-gray-600">Out of Stock</p>
              <p className="text-xl font-bold">{inventoryStats.out_of_stock_items}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-red-600 mr-3" />
            <div>
              <p className="text-xs text-gray-600">Expired</p>
              <p className="text-xl font-bold">{inventoryStats.expired_items}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-xs text-gray-600">Total Value</p>
              <p className="text-xl font-bold">{formatCurrency(inventoryStats.total_value)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search items, category, supplier..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Item</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Stock Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Unit Cost</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Total Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">ID: {item.id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">{item.category}</td>
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.current_stock} {item.unit}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${
                            getStockPercentage(item) > 50 ? 'bg-green-500' :
                            getStockPercentage(item) > 25 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.max(getStockPercentage(item), 5)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Min: {item.minimum_stock} | Max: {item.maximum_stock}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">{formatCurrency(item.unit_cost)}</td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(item.current_stock * item.unit_cost)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">{item.supplier}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{item.location}</td>
                  <td className="px-4 py-4 text-sm">
                    {item.expiry_date ? (
                      <span className={`${new Date(item.expiry_date) < new Date() ? 'text-red-600' : 'text-gray-700'}`}>
                        {new Date(item.expiry_date).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInventory.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No inventory items found</p>
            <p className="text-gray-500 text-sm">Try adjusting your search filters</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex flex-wrap gap-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Generate Restock Report
        </button>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Bulk Add Items
        </button>
        <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Check Expiring Items
        </button>
      </div>
    </div>
  );
}