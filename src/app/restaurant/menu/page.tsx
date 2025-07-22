'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  UtensilsCrossed, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  DollarSign,
  Clock,
  ChefHat,
  Coffee,
  Cookie,
  Fish,
  Beef,
  Salad,
  Eye,
  CheckCircle,
  Minus
} from 'lucide-react';
import { restaurantApi } from '../../../../lib/api';
import { formatCurrency } from '../../../../lib/currency';

export default function MenuManagement() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    preparation_time: '',
    available: true,
    ingredients: '',
    allergens: ''
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    setIsLoading(true);
    try {
      const data = await restaurantApi.getMenuItems();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveItem = async () => {
    if (!itemForm.name || !itemForm.price || !itemForm.category) {
      alert('Please fill in name, price, and category');
      return;
    }

    try {
      const itemData = {
        ...itemForm,
        price: parseFloat(itemForm.price),
        preparation_time: itemForm.preparation_time ? parseInt(itemForm.preparation_time) : null,
        ingredients: itemForm.ingredients.split(',').map(i => i.trim()).filter(i => i),
        allergens: itemForm.allergens.split(',').map(a => a.trim()).filter(a => a)
      };

      if (isEditing && selectedItem) {
        // Update item - would need an update endpoint
        setMenuItems(menuItems.map((item: any) => 
          item.id === selectedItem.id ? { ...item, ...itemData } : item
        ));
      } else {
        // Create new item
        await restaurantApi.createMenuItem(itemData);
        await fetchMenuItems();
      }

      resetForm();
      setShowItemModal(false);
      alert(isEditing ? 'Menu item updated successfully!' : 'Menu item created successfully!');
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Error saving menu item. Please try again.');
    }
  };

  const handleEditItem = (item: any) => {
    setSelectedItem(item);
    setItemForm({
      name: item.name || '',
      description: item.description || '',
      price: item.price?.toString() || '',
      category: item.category || '',
      preparation_time: item.preparation_time?.toString() || '',
      available: item.available ?? true,
      ingredients: Array.isArray(item.ingredients) ? item.ingredients.join(', ') : (item.ingredients || ''),
      allergens: Array.isArray(item.allergens) ? item.allergens.join(', ') : (item.allergens || '')
    });
    setIsEditing(true);
    setShowItemModal(true);
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      // Would need a delete endpoint
      setMenuItems(menuItems.filter((item: any) => item.id !== itemId));
      alert('Menu item deleted successfully!');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Error deleting menu item. Please try again.');
    }
  };

  const toggleItemAvailability = async (itemId: number, available: boolean) => {
    try {
      setMenuItems(menuItems.map((item: any) => 
        item.id === itemId ? { ...item, available } : item
      ));
    } catch (error) {
      console.error('Error updating item availability:', error);
    }
  };

  const resetForm = () => {
    setItemForm({
      name: '',
      description: '',
      price: '',
      category: '',
      preparation_time: '',
      available: true,
      ingredients: '',
      allergens: ''
    });
    setSelectedItem(null);
    setIsEditing(false);
  };

  const categories = [
    { id: 'all', name: 'All Categories', icon: ChefHat },
    { id: 'appetizers', name: 'Appetizers', icon: Cookie },
    { id: 'main', name: 'Main Courses', icon: Beef },
    { id: 'seafood', name: 'Seafood', icon: Fish },
    { id: 'salads', name: 'Salads', icon: Salad },
    { id: 'beverages', name: 'Beverages', icon: Coffee }
  ];

  const filteredItems = menuItems.filter((item: any) => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.id === category);
    const IconComponent = categoryData?.icon || ChefHat;
    return <IconComponent className="h-4 w-4" />;
  };

  const getItemsByCategory = () => {
    const itemsByCategory: { [key: string]: any[] } = {};
    filteredItems.forEach((item: any) => {
      const category = item.category || 'other';
      if (!itemsByCategory[category]) {
        itemsByCategory[category] = [];
      }
      itemsByCategory[category].push(item);
    });
    return itemsByCategory;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Menu Management</h1>
            <p className="text-gray-600">Manage restaurant menu items and pricing</p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/restaurant"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Restaurant
            </Link>
            <Link
              href="/restaurant/public-menu"
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Public Menu
            </Link>
            <button
              onClick={() => {
                resetForm();
                setShowItemModal(true);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Menu Item
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-lg p-3 mr-4">
                <UtensilsCrossed className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{menuItems.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3 mr-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {menuItems.filter((item: any) => item.available !== false).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 rounded-lg p-3 mr-4">
                <Coffee className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(menuItems.map((item: any) => item.category)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3 mr-4">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Price</p>
                <p className="text-2xl font-bold text-gray-900">
                  {menuItems.length > 0 
                    ? formatCurrency(menuItems.reduce((sum: number, item: any) => sum + parseFloat(item.price || 0), 0) / menuItems.length)
                    : '$0.00'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4 items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setCategoryFilter(category.id)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors text-sm ${
                    categoryFilter === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="h-3 w-3" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Items */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading menu items...</p>
          </div>
        ) : categoryFilter === 'all' ? (
          // Show by category
          <div className="space-y-8">
            {Object.entries(getItemsByCategory()).map(([category, items]) => (
              <div key={category} className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold flex items-center">
                    {getCategoryIcon(category)}
                    <span className="ml-2 capitalize">{category.replace('_', ' ')}</span>
                    <span className="ml-2 text-sm text-gray-500">({items.length})</span>
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item: any) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onEdit={handleEditItem}
                        onDelete={handleDeleteItem}
                        onToggleAvailability={toggleItemAvailability}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Show filtered items
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">
                {categories.find(cat => cat.id === categoryFilter)?.name || 'Menu Items'}
                <span className="ml-2 text-sm text-gray-500">({filteredItems.length})</span>
              </h2>
            </div>
            <div className="p-6">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <UtensilsCrossed className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No menu items found matching your criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item: any) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onEdit={handleEditItem}
                      onDelete={handleDeleteItem}
                      onToggleAvailability={toggleItemAvailability}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Menu Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h2>
                <button
                  onClick={() => setShowItemModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Grilled Salmon"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({...itemForm, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm({...itemForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    <option value="appetizers">Appetizers</option>
                    <option value="main">Main Courses</option>
                    <option value="seafood">Seafood</option>
                    <option value="salads">Salads</option>
                    <option value="beverages">Beverages</option>
                    <option value="desserts">Desserts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preparation Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={itemForm.preparation_time}
                    onChange={(e) => setItemForm({...itemForm, preparation_time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available
                  </label>
                  <select
                    value={itemForm.available.toString()}
                    onChange={(e) => setItemForm({...itemForm, available: e.target.value === 'true'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="true">Available</option>
                    <option value="false">Not Available</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={itemForm.description}
                    onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Description of the dish..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ingredients (comma-separated)
                  </label>
                  <textarea
                    value={itemForm.ingredients}
                    onChange={(e) => setItemForm({...itemForm, ingredients: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="salmon, herbs, olive oil..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allergens (comma-separated)
                  </label>
                  <textarea
                    value={itemForm.allergens}
                    onChange={(e) => setItemForm({...itemForm, allergens: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="fish, gluten, dairy..."
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowItemModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveItem}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditing ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Menu Item Card Component
function MenuItemCard({ 
  item, 
  onEdit, 
  onDelete, 
  onToggleAvailability 
}: { 
  item: any; 
  onEdit: (item: any) => void; 
  onDelete: (id: number) => void; 
  onToggleAvailability: (id: number, available: boolean) => void; 
}) {
  return (
    <div className={`border rounded-lg p-4 ${item.available === false ? 'bg-gray-50 opacity-75' : 'bg-white'}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900">{item.name}</h3>
        <div className="flex items-center">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-bold text-green-600">{parseFloat(item.price || 0).toFixed(2)}</span>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
      
      {item.preparation_time && (
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Clock className="h-3 w-3 mr-1" />
          {item.preparation_time} min
        </div>
      )}

      <div className="flex justify-between items-center">
        <span className={`text-xs px-2 py-1 rounded-full ${
          item.available !== false 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {item.available !== false ? 'Available' : 'Unavailable'}
        </span>
        
        <div className="flex gap-1">
          <button
            onClick={() => onToggleAvailability(item.id, !(item.available !== false))}
            className={`p-1 rounded text-xs ${
              item.available !== false 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
            title={item.available !== false ? 'Mark Unavailable' : 'Mark Available'}
          >
            {item.available !== false ? 'Hide' : 'Show'}
          </button>
          <button
            onClick={() => onEdit(item)}
            className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
          >
            <Edit className="h-3 w-3" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}