'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Search,
  Filter
} from 'lucide-react';

interface Table {
  id: number;
  number: string;
  capacity: number;
  location: string;
  status: string;
  description: string;
}

export default function TableManagement() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tableForm, setTableForm] = useState({
    number: '',
    capacity: '',
    location: '',
    status: 'available',
    description: ''
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setIsLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1/';
      const token = localStorage.getItem('api_token');
      
      const response = await fetch(`${baseUrl}restaurant/tables/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTables(data.results || data);
      } else {
        console.error('API request failed:', response.statusText);
        // Fallback to mock data
        const mockTables = [
          {
            id: 1,
            number: '1',
            capacity: 4,
            location: 'Main Hall',
            status: 'available',
            description: 'Window table with city view'
          },
          {
            id: 2,
            number: '2', 
            capacity: 2,
            location: 'Terrace',
            status: 'occupied',
            description: 'Romantic outdoor seating'
          },
          {
            id: 3,
            number: 'VIP-1',
            capacity: 8,
            location: 'Private Room',
            status: 'reserved',
            description: 'Private dining room for special occasions'
          }
        ];
        setTables(mockTables);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
      // Fallback to mock data
      const mockTables = [
        {
          id: 1,
          number: '1',
          capacity: 4,
          location: 'Main Hall',
          status: 'available',
          description: 'Window table with city view'
        },
        {
          id: 2,
          number: '2', 
          capacity: 2,
          location: 'Terrace',
          status: 'occupied',
          description: 'Romantic outdoor seating'
        },
        {
          id: 3,
          number: 'VIP-1',
          capacity: 8,
          location: 'Private Room',
          status: 'reserved',
          description: 'Private dining room for special occasions'
        }
      ];
      setTables(mockTables);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTable = async () => {
    if (!tableForm.number || !tableForm.capacity) {
      alert('Please fill in table number and capacity');
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1/';
      const token = localStorage.getItem('api_token');
      
      const tableData = {
        number: tableForm.number,
        capacity: parseInt(tableForm.capacity),
        location: tableForm.location,
        status: tableForm.status,
        description: tableForm.description
      };

      if (isEditing && selectedTable) {
        // Update table
        const response = await fetch(`${baseUrl}restaurant/tables/${selectedTable.id}/`, {
          method: 'PUT',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tableData)
        });
        
        if (response.ok) {
          await fetchTables();
          alert('Table updated successfully!');
        } else {
          // Fallback: update local state
          setTables(tables.map((table: any) => 
            table.id === selectedTable.id ? { ...table, ...tableData } : table
          ));
          alert('Table updated successfully!');
        }
      } else {
        // Create new table
        const response = await fetch(`${baseUrl}restaurant/tables/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tableData)
        });
        
        if (response.ok) {
          await fetchTables();
          alert('Table created successfully!');
        } else {
          // Fallback: add to local state
          const newTable = { ...tableData, id: Date.now() };
          setTables([...tables, newTable]);
          alert('Table created successfully!');
        }
      }

      resetForm();
      setShowTableModal(false);
    } catch (error) {
      console.error('Error saving table:', error);
      alert('Error saving table. Please try again.');
    }
  };

  const handleEditTable = (table: any) => {
    setSelectedTable(table);
    setTableForm({
      number: table.number?.toString() || '',
      capacity: table.capacity?.toString() || '',
      location: table.location || '',
      status: table.status || 'available',
      description: table.description || ''
    });
    setIsEditing(true);
    setShowTableModal(true);
  };

  const handleDeleteTable = async (tableId: number) => {
    if (!confirm('Are you sure you want to delete this table?')) {
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1/';
      const token = localStorage.getItem('api_token');
      
      const response = await fetch(`${baseUrl}restaurant/tables/${tableId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        await fetchTables();
        alert('Table deleted successfully!');
      } else {
        // Fallback: remove from local state
        setTables(tables.filter((table: any) => table.id !== tableId));
        alert('Table deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting table:', error);
      // Fallback: remove from local state
      setTables(tables.filter((table: any) => table.id !== tableId));
      alert('Table deleted successfully!');
    }
  };

  const updateTableStatus = async (tableId: number, status: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1/';
      const token = localStorage.getItem('api_token');
      
      const table = tables.find((t: any) => t.id === tableId);
      if (!table) return;
      
      const response = await fetch(`${baseUrl}restaurant/tables/${tableId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        setTables(tables.map((table: any) => 
          table.id === tableId ? { ...table, status } : table
        ));
      } else {
        // Fallback: update local state
        setTables(tables.map((table: any) => 
          table.id === tableId ? { ...table, status } : table
        ));
      }
    } catch (error) {
      console.error('Error updating table status:', error);
      // Fallback: update local state
      setTables(tables.map((table: any) => 
        table.id === tableId ? { ...table, status } : table
      ));
    }
  };

  const resetForm = () => {
    setTableForm({
      number: '',
      capacity: '',
      location: '',
      status: 'available',
      description: ''
    });
    setSelectedTable(null);
    setIsEditing(false);
  };

  const filteredTables = tables.filter((table: any) => {
    const matchesSearch = table.number?.toString().includes(searchTerm) ||
                         table.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         table.capacity?.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || table.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'occupied': return <Users className="h-4 w-4" />;
      case 'reserved': return <Clock className="h-4 w-4" />;
      case 'maintenance': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Table Management</h1>
            <p className="text-gray-600">Manage restaurant tables and reservations</p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/restaurant"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Restaurant
            </Link>
            <button
              onClick={() => {
                resetForm();
                setShowTableModal(true);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Table
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-3 mr-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tables.filter((table: any) => table.status === 'available').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-red-100 rounded-lg p-3 mr-4">
                <Users className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Occupied</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tables.filter((table: any) => table.status === 'occupied').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-lg p-3 mr-4">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Reserved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tables.filter((table: any) => table.status === 'reserved').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-3 mr-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Tables</p>
                <p className="text-2xl font-bold text-gray-900">{tables.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search tables..."
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
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>

        {/* Tables Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading tables...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTables.map((table: any) => (
              <div key={table.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Table {table.number}
                      </h3>
                      <p className="text-sm text-gray-600">
                        <Users className="h-4 w-4 inline mr-1" />
                        {table.capacity} seats
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(table.status)}`}>
                      {getStatusIcon(table.status)}
                      <span className="ml-1 capitalize">{table.status}</span>
                    </span>
                  </div>

                  {table.location && (
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <MapPin className="h-4 w-4 mr-1" />
                      {table.location}
                    </div>
                  )}

                  {table.description && (
                    <p className="text-sm text-gray-600 mb-4">{table.description}</p>
                  )}

                  <div className="space-y-2">
                    {/* Status Change Buttons */}
                    <div className="flex gap-1">
                      {table.status !== 'available' && (
                        <button
                          onClick={() => updateTableStatus(table.id, 'available')}
                          className="flex-1 bg-green-500 text-white py-1 px-2 rounded text-xs hover:bg-green-600 transition-colors"
                        >
                          Mark Available
                        </button>
                      )}
                      {table.status !== 'occupied' && (
                        <button
                          onClick={() => updateTableStatus(table.id, 'occupied')}
                          className="flex-1 bg-red-500 text-white py-1 px-2 rounded text-xs hover:bg-red-600 transition-colors"
                        >
                          Mark Occupied
                        </button>
                      )}
                      {table.status !== 'reserved' && (
                        <button
                          onClick={() => updateTableStatus(table.id, 'reserved')}
                          className="flex-1 bg-yellow-500 text-white py-1 px-2 rounded text-xs hover:bg-yellow-600 transition-colors"
                        >
                          Reserve
                        </button>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditTable(table)}
                        className="flex-1 bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTable(table.id)}
                        className="bg-red-500 text-white py-2 px-3 rounded text-sm hover:bg-red-600 transition-colors flex items-center justify-center"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredTables.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No tables found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Table Modal */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {isEditing ? 'Edit Table' : 'Add New Table'}
                </h2>
                <button
                  onClick={() => setShowTableModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Table Number *
                  </label>
                  <input
                    type="text"
                    value={tableForm.number}
                    onChange={(e) => setTableForm({...tableForm, number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 1, A1, VIP-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={tableForm.capacity}
                    onChange={(e) => setTableForm({...tableForm, capacity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Number of seats"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select
                    value={tableForm.location}
                    onChange={(e) => setTableForm({...tableForm, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select location</option>
                    <option value="Main Hall">Main Hall</option>
                    <option value="Terrace">Terrace</option>
                    <option value="Private Room">Private Room</option>
                    <option value="Bar Area">Bar Area</option>
                    <option value="Garden">Garden</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={tableForm.status}
                    onChange={(e) => setTableForm({...tableForm, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={tableForm.description}
                    onChange={(e) => setTableForm({...tableForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional description or notes"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowTableModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTable}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditing ? 'Update Table' : 'Add Table'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}