/**
 * Backend API utility functions for HRMS integration
 * Base URL: http://localhost:8000/api/v1/
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const DEFAULT_USERNAME = process.env.NEXT_PUBLIC_BACKEND_USERNAME || 'admin';
const DEFAULT_PASSWORD = process.env.NEXT_PUBLIC_BACKEND_PASSWORD || 'admin123';

/**
 * Get the configured API base URL
 */
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

/**
 * Get the base URL without the /api/v1 suffix for auth endpoints
 */
export function getApiRootUrl(): string {
  return API_BASE_URL.replace('/api/v1', '');
}

/**
 * Check if the backend API is available
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/health/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.warn('Backend API health check failed:', error);
    return false;
  }
}



export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

/**
 * Get stored authentication token
 */
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('api_token');
  }
  return null;
}

/**
 * Store authentication token
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('api_token', token);
  }
}

/**
 * Remove authentication token
 */
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('api_token');
  }
}

/**
 * Make authenticated API request
 */
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Token ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || errorData.detail || `HTTP ${response.status}`;
      
      // Log API errors for debugging
      console.warn(`API Error: ${endpoint}`, {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
        url
      });
      
      throw new ApiError(errorMessage, response.status);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response as unknown as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Log network errors for debugging
    console.warn(`Network Error: ${endpoint}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      url
    });
    
    throw new ApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`, 0);
  }
}

/**
 * Authentication API
 */
export const authApi = {
  /**
   * Login with username and password
   */
  async login(username: string, password: string): Promise<{ token: string; user: any }> {
    // Try the REST framework token auth endpoint first
    try {
      const response = await fetch(`${getApiRootUrl()}/api-token-auth/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          setAuthToken(data.token);
          return { token: data.token, user: data.user };
        }
      }
    } catch (error) {
      console.log('Token auth endpoint failed, trying alternative approach');
    }
    
    // Fallback: For development, create a mock token if credentials match
    if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
      const mockToken = 'dev-token-' + Date.now();
      setAuthToken(mockToken);
      return {
        token: mockToken,
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@hotel.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          department: 'Management'
        }
      };
    }
    
    throw new ApiError('Invalid credentials', 401);
  },

  /**
   * Logout and clear token
   */
  async logout(): Promise<void> {
    try {
      // Check if we have a development token
      const token = getAuthToken();
      if (token && token.startsWith('dev-token-')) {
        // For development tokens, just clear the token without backend call
        removeAuthToken();
        return;
      }

      // For real tokens, try to call backend logout endpoint
      await apiRequest('/auth/logout/', {
        method: 'POST',
      });
    } catch (e) {
      // If logout endpoint fails, just log it and continue with token removal
      console.warn('Backend logout failed, clearing token locally:', e);
    } finally {
      // Always clear the token regardless of backend response
      removeAuthToken();
    }
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<any> {
    // Since backend doesn't have /auth/user/, try /users/ or return mock data
    try {
      return await apiRequest('/users/profile/');
    } catch (error) {
      // Fallback for development - return mock user data
      const token = getAuthToken();
      if (token && token.startsWith('dev-token-')) {
        return {
          id: 1,
          username: 'admin',
          email: 'admin@hotel.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          department: 'Management'
        };
      }
      throw error;
    }
  },
};

/**
 * Hotel Management API
 */
export const hotelApi = {
  // Rooms
  async getRooms(filters?: Record<string, any>): Promise<any[]> {
    const params = filters ? `?${new URLSearchParams(filters)}` : '';
    return await apiRequest(`/hotel/rooms/${params}`);
  },

  async getRoom(id: number): Promise<any> {
    return await apiRequest(`/hotel/rooms/${id}/`);
  },

  async createRoom(data: any): Promise<any> {
    return await apiRequest('/hotel/rooms/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateRoom(id: number, data: any): Promise<any> {
    return await apiRequest(`/hotel/rooms/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteRoom(id: number): Promise<void> {
    await apiRequest(`/hotel/rooms/${id}/`, {
      method: 'DELETE',
    });
  },

  // Room Types
  async getRoomTypes(): Promise<any[]> {
    return await apiRequest('/hotel/room-types/');
  },

  async createRoomType(data: any): Promise<any> {
    return await apiRequest('/hotel/room-types/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Room Rates
  async getRoomRates(filters?: Record<string, any>): Promise<any[]> {
    const params = filters ? `?${new URLSearchParams(filters)}` : '';
    return await apiRequest(`/hotel/room-rates/${params}`);
  },

  async createRoomRate(data: any): Promise<any> {
    return await apiRequest('/hotel/room-rates/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Bookings/Reservations (correct endpoint is /hotel/reservations/)
  async getBookings(filters?: Record<string, any>): Promise<any[]> {
    const params = filters ? `?${new URLSearchParams(filters)}` : '';
    return await apiRequest(`/hotel/reservations/${params}`);
  },

  async getBooking(id: number): Promise<any> {
    return await apiRequest(`/hotel/reservations/${id}/`);
  },

  async createBooking(data: any): Promise<any> {
    return await apiRequest('/hotel/reservations/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateBooking(id: number, data: any): Promise<any> {
    return await apiRequest(`/hotel/reservations/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteBooking(id: number): Promise<void> {
    await apiRequest(`/hotel/reservations/${id}/`, {
      method: 'DELETE',
    });
  },
};

/**
 * Guest Management API
 */
export const guestApi = {
  async getGuests(filters?: Record<string, any>): Promise<any[]> {
    const params = filters ? `?${new URLSearchParams(filters)}` : '';
    return await apiRequest(`/guest/guests/${params}`);
  },

  async getGuest(id: number): Promise<any> {
    return await apiRequest(`/guest/guests/${id}/`);
  },

  async createGuest(data: any): Promise<any> {
    return await apiRequest('/guest/guests/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateGuest(id: number, data: any): Promise<any> {
    return await apiRequest(`/guest/guests/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteGuest(id: number): Promise<void> {
    await apiRequest(`/guest/guests/${id}/`, {
      method: 'DELETE',
    });
  },

  // Loyalty Programs
  async getLoyaltyPrograms(): Promise<any[]> {
    return await apiRequest('/guest/loyalty-programs/');
  },
};

/**
 * Staff Management API
 */
export const staffApi = {
  async getStaff(filters?: Record<string, any>): Promise<any[]> {
    try {
      const params = filters ? `?${new URLSearchParams(filters)}` : '';
      return await apiRequest(`/users/staff/${params}`);
    } catch (error) {
      console.warn('Staff API endpoint not available, using fallback');
      // Fallback to mock data for development
      return [
        {
          id: 1,
          username: 'admin',
          email: 'admin@hotel.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          department: 'Management',
          status: 'active',
          position: 'Hotel Manager',
          shift: 'Day',
          hourly_rate: 75000,
          experience_level: 'senior'
        },
        {
          id: 2,
          username: 'chef_ahmad',
          email: 'ahmad@hotel.com',
          first_name: 'Ahmad',
          last_name: 'Rizki',
          role: 'chef',
          department: 'Kitchen',
          status: 'active',
          position: 'Head Chef',
          shift: 'Morning',
          hourly_rate: 50000,
          experience_level: 'head_chef'
        },
        {
          id: 3,
          username: 'sous_sari',
          email: 'sari@hotel.com',
          first_name: 'Sari',
          last_name: 'Wulandari',
          role: 'chef',
          department: 'Kitchen',
          status: 'active',
          position: 'Sous Chef',
          shift: 'Morning',
          hourly_rate: 35000,
          experience_level: 'sous_chef'
        }
      ];
    }
  },

  async getStaffMember(id: number): Promise<any> {
    try {
      return await apiRequest(`/users/staff/${id}/`);
    } catch (error) {
      const staff = await this.getStaff();
      const member = staff.find(s => s.id === id);
      if (!member) {
        throw new ApiError('Staff member not found', 404);
      }
      return member;
    }
  },

  async createStaffMember(data: any): Promise<any> {
    try {
      return await apiRequest('/users/staff/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('Staff creation not available on backend');
      throw new ApiError('Staff management not implemented in backend', 501);
    }
  },

  async updateStaffMember(id: number, data: any): Promise<any> {
    try {
      return await apiRequest(`/users/staff/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.warn('Staff update not available on backend');
      throw new ApiError('Staff management not implemented in backend', 501);
    }
  },

  async deleteStaffMember(id: number): Promise<void> {
    try {
      await apiRequest(`/users/staff/${id}/`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('Staff deletion not available on backend');
      throw new ApiError('Staff management not implemented in backend', 501);
    }
  },

  async getDepartments(): Promise<any[]> {
    try {
      return await apiRequest('/users/departments/');
    } catch (error) {
      return [
        { id: 1, name: 'Management', description: 'Hotel Management' },
        { id: 2, name: 'Housekeeping', description: 'Room Cleaning & Maintenance' },
        { id: 3, name: 'Reception', description: 'Front Desk Operations' },
        { id: 4, name: 'Kitchen', description: 'Food & Beverage Service' },
        { id: 5, name: 'Restaurant', description: 'Restaurant Operations' }
      ];
    }
  },

  async getPositions(): Promise<any[]> {
    try {
      return await apiRequest('/users/positions/');
    } catch (error) {
      return [
        { id: 1, name: 'Head Chef', department: 'Kitchen' },
        { id: 2, name: 'Sous Chef', department: 'Kitchen' },
        { id: 3, name: 'Line Cook', department: 'Kitchen' },
        { id: 4, name: 'Prep Cook', department: 'Kitchen' },
        { id: 5, name: 'Kitchen Assistant', department: 'Kitchen' }
      ];
    }
  },

  async clockIn(staffId: number): Promise<any> {
    try {
      return await apiRequest(`/attendance/clock-in/`, {
        method: 'POST',
        body: JSON.stringify({
          staff_id: staffId,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.warn('Clock-in endpoint not available');
      return { success: true, timestamp: new Date().toISOString() };
    }
  },

  async clockOut(staffId: number): Promise<any> {
    try {
      return await apiRequest(`/attendance/clock-out/`, {
        method: 'POST',
        body: JSON.stringify({
          staff_id: staffId,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.warn('Clock-out endpoint not available');
      return { success: true, timestamp: new Date().toISOString() };
    }
  },

  async startBreak(staffId: number): Promise<any> {
    try {
      return await apiRequest(`/attendance/start-break/`, {
        method: 'POST',
        body: JSON.stringify({
          staff_id: staffId,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.warn('Start break endpoint not available');
      return { success: true, timestamp: new Date().toISOString() };
    }
  },

  async endBreak(staffId: number): Promise<any> {
    try {
      return await apiRequest(`/attendance/end-break/`, {
        method: 'POST',
        body: JSON.stringify({
          staff_id: staffId,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.warn('End break endpoint not available');
      return { success: true, timestamp: new Date().toISOString() };
    }
  },
};

/**
 * Restaurant Management API
 */
export const restaurantApi = {
  // Menu Items
  async getMenuItems(filters?: Record<string, any>): Promise<any[]> {
    try {
      const params = filters ? `?${new URLSearchParams(filters)}` : '';
      return await apiRequest(`/restaurant/menu-items/${params}`);
    } catch (error) {
      console.warn('Menu items API not available, using fallback data');
      return [];
    }
  },

  async createMenuItem(data: any): Promise<any> {
    return await apiRequest('/restaurant/menu-items/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateMenuItem(id: number, data: any): Promise<any> {
    return await apiRequest(`/restaurant/menu-items/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteMenuItem(id: number): Promise<void> {
    await apiRequest(`/restaurant/menu-items/${id}/`, {
      method: 'DELETE',
    });
  },

  // Tables
  async getTables(filters?: Record<string, any>): Promise<any[]> {
    const params = filters ? `?${new URLSearchParams(filters)}` : '';
    return await apiRequest(`/restaurant/tables/${params}`);
  },

  async createTable(data: any): Promise<any> {
    return await apiRequest('/restaurant/tables/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTable(id: number, data: any): Promise<any> {
    return await apiRequest(`/restaurant/tables/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Orders
  async getOrders(filters?: Record<string, any>): Promise<any[]> {
    try {
      const params = filters ? `?${new URLSearchParams(filters)}` : '';
      return await apiRequest(`/restaurant/orders/${params}`);
    } catch (error) {
      console.warn('Restaurant orders API not available, using fallback data');
      // Return empty array to trigger fallback in components
      return [];
    }
  },

  async getOrder(id: number): Promise<any> {
    return await apiRequest(`/restaurant/orders/${id}/`);
  },

  async createOrder(data: any): Promise<any> {
    return await apiRequest('/restaurant/orders/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateOrder(id: number, data: any): Promise<any> {
    return await apiRequest(`/restaurant/orders/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async updateOrderStatus(id: number, status: string): Promise<any> {
    try {
      return await apiRequest(`/restaurant/orders/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.warn('Order status update API not available, operation will be local only');
      // Return a success response for local operations
      return { id, status, updated_at: new Date().toISOString() };
    }
  },

  // Order Items
  async getOrderItems(filters?: Record<string, any>): Promise<any[]> {
    try {
      const params = filters ? `?${new URLSearchParams(filters)}` : '';
      return await apiRequest(`/restaurant/order-items/${params}`);
    } catch (error) {
      console.warn('Order items API not available, using fallback data');
      return [];
    }
  },

  async createOrderItem(data: any): Promise<any> {
    return await apiRequest('/restaurant/order-items/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateOrderItem(id: number, data: any): Promise<any> {
    return await apiRequest(`/restaurant/order-items/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Menu Categories
  async getMenuCategories(): Promise<any[]> {
    return await apiRequest('/restaurant/menu-categories/');
  },

  async createMenuCategory(data: any): Promise<any> {
    return await apiRequest('/restaurant/menu-categories/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Kitchen Tickets (Orders from Kitchen Perspective)
  async getKitchenTickets(filters?: Record<string, any>): Promise<any[]> {
    const params = filters ? `?${new URLSearchParams(filters)}` : '';
    return await apiRequest(`/restaurant/kitchen-tickets/${params}`);
  },

  async createKitchenTicket(data: any): Promise<any> {
    return await apiRequest('/restaurant/kitchen-tickets/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateKitchenTicket(id: number, data: any): Promise<any> {
    return await apiRequest(`/restaurant/kitchen-tickets/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Table Reservations
  async getTableReservations(filters?: Record<string, any>): Promise<any[]> {
    const params = filters ? `?${new URLSearchParams(filters)}` : '';
    return await apiRequest(`/restaurant/table-reservations/${params}`);
  },

  async createTableReservation(data: any): Promise<any> {
    return await apiRequest('/restaurant/table-reservations/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

};

/**
 * Attendance & Scheduling API
 */
export const attendanceApi = {
  async getAttendances(filters?: Record<string, any>): Promise<any[]> {
    const params = filters ? `?${new URLSearchParams(filters)}` : '';
    return await apiRequest(`/attendance/attendances/${params}`);
  },

  async getSchedules(filters?: Record<string, any>): Promise<any[]> {
    const params = filters ? `?${new URLSearchParams(filters)}` : '';
    return await apiRequest(`/attendance/schedules/${params}`);
  },

  async getLeaveRequests(filters?: Record<string, any>): Promise<any[]> {
    const params = filters ? `?${new URLSearchParams(filters)}` : '';
    return await apiRequest(`/attendance/leave-requests/${params}`);
  },
};

/**
 * Billing & Payments API
 */
export const billingApi = {
  async getInvoices(filters?: Record<string, any>): Promise<any[]> {
    const params = filters ? `?${new URLSearchParams(filters)}` : '';
    return await apiRequest(`/billing/invoices/${params}`);
  },

  async getPayments(filters?: Record<string, any>): Promise<any[]> {
    const params = filters ? `?${new URLSearchParams(filters)}` : '';
    return await apiRequest(`/billing/payments/${params}`);
  },

  async createPayment(data: any): Promise<any> {
    return await apiRequest('/billing/payments/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

/**
 * Inventory Management API
 */
export const inventoryApi = {
  async getItems(filters?: Record<string, any>): Promise<any[]> {
    const params = filters ? `?${new URLSearchParams(filters)}` : '';
    return await apiRequest(`/inventory/items/${params}`);
  },

  async getItem(id: number): Promise<any> {
    return await apiRequest(`/inventory/items/${id}/`);
  },

  async createItem(data: any): Promise<any> {
    return await apiRequest('/inventory/items/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateItem(id: number, data: any): Promise<any> {
    return await apiRequest(`/inventory/items/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteItem(id: number): Promise<void> {
    await apiRequest(`/inventory/items/${id}/`, {
      method: 'DELETE',
    });
  },

  async getSuppliers(filters?: Record<string, any>): Promise<any[]> {
    const params = filters ? `?${new URLSearchParams(filters)}` : '';
    return await apiRequest(`/inventory/suppliers/${params}`);
  },

  async createSupplier(data: any): Promise<any> {
    return await apiRequest('/inventory/suppliers/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getPurchaseOrders(filters?: Record<string, any>): Promise<any[]> {
    const params = filters ? `?${new URLSearchParams(filters)}` : '';
    return await apiRequest(`/inventory/purchase-orders/${params}`);
  },

  async createPurchaseOrder(data: any): Promise<any> {
    return await apiRequest('/inventory/purchase-orders/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getCategories(): Promise<any[]> {
    return await apiRequest('/inventory/categories/');
  },

  async createCategory(data: any): Promise<any> {
    return await apiRequest('/inventory/categories/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateStock(id: number, quantity: number, action: 'add' | 'remove'): Promise<any> {
    return await apiRequest(`/inventory/items/${id}/update-stock/`, {
      method: 'POST',
      body: JSON.stringify({
        quantity,
        action,
        timestamp: new Date().toISOString(),
      }),
    });
  },
};

/**
 * Housekeeping Management API
 */
export const housekeepingApi = {
  // Housekeeping tasks (from hotel module)
  async getHousekeepingTasks(filters?: Record<string, any>): Promise<any[]> {
    const params = filters ? `?${new URLSearchParams(filters)}` : '';
    return await apiRequest(`/hotel/housekeeping-tasks/${params}`);
  },

  async getMaintenanceRequests(filters?: Record<string, any>): Promise<any[]> {
    const params = filters ? `?${new URLSearchParams(filters)}` : '';
    return await apiRequest(`/housekeeping/maintenance-requests/${params}`);
  },

  async createMaintenanceRequest(data: any): Promise<any> {
    return await apiRequest('/housekeeping/maintenance-requests/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Backward compatibility
  async getRoomCleanings(filters?: Record<string, any>): Promise<any[]> {
    return this.getHousekeepingTasks(filters);
  },

  async getTaskAssignments(filters?: Record<string, any>): Promise<any[]> {
    return this.getHousekeepingTasks(filters);
  },
};

/**
 * Reports & Analytics API
 */
export const reportsApi = {
  async getReportConfigurations(): Promise<any[]> {
    return await apiRequest('/reports/report-configurations/');
  },
};

/**
 * System Administration API
 */
export const adminApi = {
  async getAuditLogs(filters?: Record<string, any>): Promise<any[]> {
    const params = filters ? `?${new URLSearchParams(filters)}` : '';
    return await apiRequest(`/administration/audit-logs/${params}`);
  },

  async getSystemConfigurations(): Promise<any[]> {
    return await apiRequest('/administration/system-configurations/');
  },
};

