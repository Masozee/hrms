'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Star, 
  Clock,
  ChefHat,
  Coffee,
  Cookie,
  Fish,
  Beef,
  Salad,
  Settings,
  X
} from 'lucide-react';
import { restaurantApi } from '../../../../lib/api';
import { formatCurrency } from '../../../../lib/currency';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  customizations?: {
    removeIngredients: string[];
    extraIngredients: string[];
    specialInstructions: string;
    spiceLevel?: string;
  };
  uniqueId: string; // To distinguish same items with different customizations
}

export default function PublicMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [selectedItemForCustomization, setSelectedItemForCustomization] = useState<any>(null);
  const [currentCustomizations, setCurrentCustomizations] = useState({
    removeIngredients: [] as string[],
    extraIngredients: [] as string[],
    specialInstructions: '',
    spiceLevel: 'medium'
  });
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    table: '',
    phone: ''
  });

  useEffect(() => {
    fetchMenuItems(selectedCategory);
  }, []);

  // Fetch items when category changes
  useEffect(() => {
    fetchMenuItems(selectedCategory);
  }, [selectedCategory]);

  const fetchMenuItems = async (category?: string) => {
    setIsLoading(true);
    try {
      // Use the correct API endpoint with optional category filter
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1/';
      const token = localStorage.getItem('api_token');
      
      let url = `${baseUrl}restaurant/menu-items/`;
      if (category && category !== 'all') {
        // Map internal category IDs to proper case category names for API
        const categoryNameMap = {
          'appetizers': 'Appetizer',
          'main': 'Main',
          'seafood': 'Seafood', 
          'salads': 'Salads',
          'beverages': 'Beverages'
        };
        const categoryName = categoryNameMap[category] || category;
        url += `?category__name=${categoryName}`;
      }
      
      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      // Only add authorization if token exists (for public menu access)
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }
      
      const response = await fetch(url, { headers });
      
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data.results || data);
        return; // Successfully fetched data, exit the function
      } else {
        console.warn(`API request failed with status ${response.status}, falling back to mock data`);
        // Fall through to mock data
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      // Fall through to mock data
    }
    
    // Fallback to mock data for development/testing
    const mockItems = [
        {
          id: 1,
          name: 'Nasi Goreng Spesial',
          category: 'main',
          price: '45000',
          description: 'Indonesian special fried rice with chicken, prawns, and vegetables',
          preparation_time: 20,
          is_available: true
        },
        {
          id: 2,
          name: 'Sate Ayam',
          category: 'main', 
          price: '35000',
          description: 'Grilled chicken satay with peanut sauce and rice cake',
          preparation_time: 25,
          is_available: true
        },
        {
          id: 3,
          name: 'Gado-Gado',
          category: 'salads',
          price: '25000',
          description: 'Indonesian vegetable salad with peanut dressing',
          preparation_time: 15,
          is_available: true
        },
        {
          id: 4,
          name: 'Lumpia Semarang',
          category: 'appetizers',
          price: '20000',
          description: 'Fresh spring rolls with vegetables and sweet sauce',
          preparation_time: 10,
          is_available: true
        },
        {
          id: 5,
          name: 'Es Teh Manis',
          category: 'beverages',
          price: '8000',
          description: 'Sweet Indonesian iced tea',
          preparation_time: 5,
          is_available: true
        },
        {
          id: 6,
          name: 'Grilled Salmon',
          category: 'seafood',
          price: '75000',
          description: 'Fresh grilled salmon with Indonesian spices',
          preparation_time: 30,
          is_available: true
        }
      ];
      
    // Filter mock data by category if provided
    const filteredMockItems = category && category !== 'all' 
      ? mockItems.filter(item => item.category === category)
      : mockItems;
    
    setMenuItems(filteredMockItems);
    setIsLoading(false);
  };

  const categories = [
    { id: 'all', name: 'All Items', icon: ChefHat },
    { id: 'appetizers', name: 'Appetizers', icon: Cookie },
    { id: 'main', name: 'Main Courses', icon: Beef },
    { id: 'seafood', name: 'Seafood', icon: Fish },
    { id: 'salads', name: 'Salads', icon: Salad },
    { id: 'beverages', name: 'Beverages', icon: Coffee }
  ];

  // Items are already filtered by the API based on selected category
  const filteredItems = menuItems;

  const addToCart = (item: any, customizations?: any) => {
    const uniqueId = `${item.id}_${Date.now()}_${Math.random()}`;
    
    setCart(prevCart => {
      // If no customizations, try to find existing item without customizations
      if (!customizations || (
        customizations.removeIngredients.length === 0 && 
        customizations.extraIngredients.length === 0 && 
        !customizations.specialInstructions && 
        customizations.spiceLevel === 'medium'
      )) {
        const existingItem = prevCart.find(cartItem => 
          cartItem.id === item.id && !cartItem.customizations
        );
        if (existingItem) {
          return prevCart.map(cartItem =>
            cartItem.uniqueId === existingItem.uniqueId
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          );
        }
      }
      
      // Add new item (with or without customizations)
      return [...prevCart, {
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
        quantity: 1,
        description: item.description,
        uniqueId,
        customizations: customizations && (
          customizations.removeIngredients.length > 0 || 
          customizations.extraIngredients.length > 0 || 
          customizations.specialInstructions ||
          customizations.spiceLevel !== 'medium'
        ) ? customizations : undefined
      }];
    });
  };

  const showCustomizationFor = (item: any) => {
    setSelectedItemForCustomization(item);
    setCurrentCustomizations({
      removeIngredients: [],
      extraIngredients: [],
      specialInstructions: '',
      spiceLevel: 'medium'
    });
    setShowCustomizationModal(true);
  };

  const addCustomizedItemToCart = () => {
    if (selectedItemForCustomization) {
      addToCart(selectedItemForCustomization, currentCustomizations);
      setShowCustomizationModal(false);
      setSelectedItemForCustomization(null);
    }
  };

  const removeFromCart = (uniqueId: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.uniqueId === uniqueId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(cartItem =>
          cartItem.uniqueId === uniqueId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      } else {
        return prevCart.filter(cartItem => cartItem.uniqueId !== uniqueId);
      }
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (!customerInfo.name || !customerInfo.table) {
      alert('Please fill in your name and table number');
      return;
    }

    if (cart.length === 0) {
      alert('Please add items to your cart');
      return;
    }

    try {
      const orderData = {
        customer_name: customerInfo.name,
        table: customerInfo.table,
        phone: customerInfo.phone,
        items: cart.map(item => ({
          menu_item: item.id,
          quantity: item.quantity,
          price: item.price,
          customizations: item.customizations
        })),
        total_amount: getCartTotal(),
        status: 'pending',
        order_type: 'dine_in'
      };

      await restaurantApi.createOrder(orderData);
      
      // Reset cart and form
      setCart([]);
      setCustomerInfo({ name: '', table: '', phone: '' });
      setShowCart(false);
      
      alert('Order placed successfully! Your food will be prepared shortly.');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order. Please try again.');
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.id === category);
    const IconComponent = categoryData?.icon || ChefHat;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Restaurant Menu</h1>
              <p className="text-sm text-gray-600">Order your favorite dishes</p>
            </div>
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              Cart
              {getCartItemCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  disabled={isLoading}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {category.name}
                  {isLoading && selectedCategory === category.id && (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white ml-1"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Items */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading menu...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item: any) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {getCategoryIcon(item.category)}
                  <span className="ml-2 text-gray-500">Food Image</span>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">4.5</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      {item.preparation_time || 15} min
                    </div>
                    <div className="text-green-600 font-semibold">
                      {formatCurrency(parseFloat(item.price))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {cart.find(cartItem => cartItem.id === item.id) ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const firstMatch = cart.find(cartItem => cartItem.id === item.id);
                                if (firstMatch) removeFromCart(firstMatch.uniqueId);
                              }}
                              className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="font-semibold min-w-[2rem] text-center">
                              {cart.filter(cartItem => cartItem.id === item.id).reduce((sum, item) => sum + item.quantity, 0)}
                            </span>
                            <button
                              onClick={() => addToCart(item)}
                              className="bg-green-500 text-white rounded-full p-1 hover:bg-green-600 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item)}
                            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                          >
                            <Plus className="h-4 w-4" />
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Customization Button */}
                    <button
                      onClick={() => showCustomizationFor(item)}
                      className="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Settings className="h-4 w-4" />
                      Customize
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Your Order</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Customer Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Your Name *"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Table Number *"
                    value={customerInfo.table}
                    onChange={(e) => setCustomerInfo({...customerInfo, table: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Phone Number (optional)"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4"
                />
              </div>

              {/* Cart Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Your cart is empty</p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.uniqueId} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-gray-600">{formatCurrency(item.price)} each</p>
                            
                            {/* Show customizations */}
                            {item.customizations && (
                              <div className="mt-2 text-xs text-gray-600 space-y-1">
                                {item.customizations.removeIngredients.length > 0 && (
                                  <p className="flex items-center">
                                    <X className="h-3 w-3 mr-1 text-red-500" />
                                    No: {item.customizations.removeIngredients.join(', ')}
                                  </p>
                                )}
                                {item.customizations.extraIngredients.length > 0 && (
                                  <p className="flex items-center">
                                    <Plus className="h-3 w-3 mr-1 text-green-500" />
                                    Extra: {item.customizations.extraIngredients.join(', ')}
                                  </p>
                                )}
                                {item.customizations.spiceLevel && item.customizations.spiceLevel !== 'medium' && (
                                  <p>🌶️ Spice: {item.customizations.spiceLevel}</p>
                                )}
                                {item.customizations.specialInstructions && (
                                  <p className="italic">Note: {item.customizations.specialInstructions}</p>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => removeFromCart(item.uniqueId)}
                              className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="font-semibold min-w-[2rem] text-center">{item.quantity}</span>
                            <button
                              onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, description: item.description }, item.customizations)}
                              className="bg-green-500 text-white rounded-full p-1 hover:bg-green-600 transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                            <span className="ml-4 font-semibold">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total and Actions */}
              {cart.length > 0 && (
                <div>
                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(getCartTotal())}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowCart(false)}
                      className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Continue Shopping
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Place Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customization Modal */}
      {showCustomizationModal && selectedItemForCustomization && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Customize {selectedItemForCustomization.name}</h2>
                <button
                  onClick={() => setShowCustomizationModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Remove Ingredients */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Remove Ingredients</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['Onion', 'Garlic', 'Tomato', 'Bell Pepper', 'Cheese', 'Cilantro', 'Spicy Sauce', 'Mushrooms'].map((ingredient) => (
                    <label key={ingredient} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={currentCustomizations.removeIngredients.includes(ingredient)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCurrentCustomizations({
                              ...currentCustomizations,
                              removeIngredients: [...currentCustomizations.removeIngredients, ingredient]
                            });
                          } else {
                            setCurrentCustomizations({
                              ...currentCustomizations,
                              removeIngredients: currentCustomizations.removeIngredients.filter(item => item !== ingredient)
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">No {ingredient}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Extra Ingredients */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Extra Ingredients</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['Extra Cheese', 'Extra Sauce', 'Avocado', 'Bacon', 'Extra Vegetables', 'Pickles', 'Extra Meat', 'Jalapeños'].map((ingredient) => (
                    <label key={ingredient} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={currentCustomizations.extraIngredients.includes(ingredient)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCurrentCustomizations({
                              ...currentCustomizations,
                              extraIngredients: [...currentCustomizations.extraIngredients, ingredient]
                            });
                          } else {
                            setCurrentCustomizations({
                              ...currentCustomizations,
                              extraIngredients: currentCustomizations.extraIngredients.filter(item => item !== ingredient)
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{ingredient}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Spice Level */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Spice Level</h3>
                <div className="flex gap-4">
                  {['mild', 'medium', 'hot', 'extra hot'].map((level) => (
                    <label key={level} className="flex items-center">
                      <input
                        type="radio"
                        name="spiceLevel"
                        value={level}
                        checked={currentCustomizations.spiceLevel === level}
                        onChange={(e) => setCurrentCustomizations({
                          ...currentCustomizations,
                          spiceLevel: e.target.value
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Special Instructions</h3>
                <textarea
                  value={currentCustomizations.specialInstructions}
                  onChange={(e) => setCurrentCustomizations({
                    ...currentCustomizations,
                    specialInstructions: e.target.value
                  })}
                  placeholder="Any special requests or cooking instructions..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Price and Add Button */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Price:</span>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(parseFloat(selectedItemForCustomization.price))}
                  </span>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowCustomizationModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addCustomizedItemToCart}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}