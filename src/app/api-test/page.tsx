'use client';

import { useState } from 'react';
import { 
  authApi, 
  hotelApi, 
  guestApi, 
  staffApi, 
  restaurantApi,
  getAuthToken,
  removeAuthToken,
  ApiError 
} from '../../../lib/api';

interface TestResult {
  endpoint: string;
  status: 'success' | 'error' | 'pending';
  data?: any;
  error?: string;
  duration?: number;
}

export default function ApiTestPage() {
  const [isTestingAuth, setIsTestingAuth] = useState(false);
  const [isTestingEndpoints, setIsTestingEndpoints] = useState(false);
  const [authResult, setAuthResult] = useState<TestResult | null>(null);
  const [endpointResults, setEndpointResults] = useState<TestResult[]>([]);
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  // Update token display
  const refreshTokenDisplay = () => {
    setCurrentToken(getAuthToken());
  };

  // Test authentication
  const testAuthentication = async () => {
    setIsTestingAuth(true);
    setAuthResult({ endpoint: 'Authentication', status: 'pending' });
    
    const startTime = Date.now();
    
    try {
      // First, clear any existing token
      removeAuthToken();
      refreshTokenDisplay();
      
      // Test login with admin credentials
      const response = await authApi.login('admin', 'admin123');
      
      const duration = Date.now() - startTime;
      
      setAuthResult({
        endpoint: 'Authentication',
        status: 'success',
        data: response,
        duration
      });
      
      refreshTokenDisplay();
    } catch (error) {
      const duration = Date.now() - startTime;
      setAuthResult({
        endpoint: 'Authentication',
        status: 'error',
        error: error instanceof ApiError ? error.message : 'Unknown error',
        duration
      });
    } finally {
      setIsTestingAuth(false);
    }
  };

  // Test various API endpoints
  const testEndpoints = async () => {
    setIsTestingEndpoints(true);
    setEndpointResults([]);
    
    const endpoints = [
      { name: 'Hotel Rooms', fn: () => hotelApi.getRooms() },
      { name: 'Hotel Bookings', fn: () => hotelApi.getBookings() },
      { name: 'Guests', fn: () => guestApi.getGuests() },
      { name: 'Loyalty Programs', fn: () => guestApi.getLoyaltyPrograms() },
      { name: 'Staff Members', fn: () => staffApi.getStaff() },
      { name: 'Departments', fn: () => staffApi.getDepartments() },
      { name: 'Menu Items', fn: () => restaurantApi.getMenuItems() },
      { name: 'Restaurant Tables', fn: () => restaurantApi.getTables() },
      { name: 'Restaurant Orders', fn: () => restaurantApi.getOrders() },
    ];

    const results: TestResult[] = [];

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      
      try {
        setEndpointResults(prev => [...prev, {
          endpoint: endpoint.name,
          status: 'pending'
        }]);

        const data = await endpoint.fn();
        const duration = Date.now() - startTime;
        
        const result: TestResult = {
          endpoint: endpoint.name,
          status: 'success',
          data: Array.isArray(data) ? `${data.length} items` : data,
          duration
        };
        
        results.push(result);
        setEndpointResults(prev => 
          prev.map(r => r.endpoint === endpoint.name ? result : r)
        );
      } catch (error) {
        const duration = Date.now() - startTime;
        
        const result: TestResult = {
          endpoint: endpoint.name,
          status: 'error',
          error: error instanceof ApiError ? `${error.status}: ${error.message}` : 'Unknown error',
          duration
        };
        
        results.push(result);
        setEndpointResults(prev => 
          prev.map(r => r.endpoint === endpoint.name ? result : r)
        );
      }
    }

    setIsTestingEndpoints(false);
  };

  const clearToken = () => {
    removeAuthToken();
    refreshTokenDisplay();
    setAuthResult(null);
    setEndpointResults([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '⭕';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Backend API Connection Test</h1>
          <p className="text-gray-600">
            Test connection to HRMS backend API at <code className="bg-gray-200 px-2 py-1 rounded">localhost:8000</code>
          </p>
        </div>

        {/* Token Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Token Status</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Token:</p>
              <code className="text-sm bg-gray-100 p-2 rounded block mt-1 break-all">
                {currentToken || 'No token stored'}
              </code>
            </div>
            <button
              onClick={clearToken}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Clear Token
            </button>
          </div>
        </div>

        {/* Authentication Test */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Authentication Test</h2>
            <button
              onClick={testAuthentication}
              disabled={isTestingAuth}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isTestingAuth ? 'Testing...' : 'Test Login (admin/admin123)'}
            </button>
          </div>

          {authResult && (
            <div className={`p-4 rounded-lg border ${getStatusColor(authResult.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">
                  {getStatusIcon(authResult.status)} {authResult.endpoint}
                </span>
                {authResult.duration && (
                  <span className="text-sm">({authResult.duration}ms)</span>
                )}
              </div>
              {authResult.error && (
                <p className="text-sm mt-2">Error: {authResult.error}</p>
              )}
              {authResult.data && (
                <pre className="text-sm mt-2 bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(authResult.data, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* API Endpoints Test */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">API Endpoints Test</h2>
            <button
              onClick={testEndpoints}
              disabled={isTestingEndpoints || !getAuthToken()}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {isTestingEndpoints ? 'Testing...' : 'Test All Endpoints'}
            </button>
          </div>

          {!getAuthToken() && (
            <p className="text-amber-600 bg-amber-50 p-4 rounded-lg mb-4">
              ⚠️ Please authenticate first before testing endpoints
            </p>
          )}

          <div className="space-y-3">
            {endpointResults.map((result, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">
                    {getStatusIcon(result.status)} {result.endpoint}
                  </span>
                  {result.duration && (
                    <span className="text-sm">({result.duration}ms)</span>
                  )}
                </div>
                {result.error && (
                  <p className="text-sm mt-2">Error: {result.error}</p>
                )}
                {result.data && (
                  <p className="text-sm mt-2">Response: {result.data}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="font-semibold text-blue-900 mb-2">Testing Instructions</h3>
          <ol className="list-decimal list-inside text-blue-800 space-y-1">
            <li>Make sure the backend API is running on <code>localhost:8000</code></li>
            <li>Click &quot;Test Login&quot; to authenticate with admin/admin123</li>
            <li>Once authenticated, click &quot;Test All Endpoints&quot; to verify API connectivity</li>
            <li>Check results to see which modules are available and working</li>
          </ol>
        </div>
      </div>
    </div>
  );
}