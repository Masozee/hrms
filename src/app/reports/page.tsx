'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Download, Calendar, BarChart3, PieChart, TrendingUp, Users, Bed } from "lucide-react";
import { formatCurrency } from '../../../lib/currency';

export default function ReportsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [roomStatusData, setRoomStatusData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
      fetchRoomStatusData();
    }
  }, [isAuthenticated, dateRange]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/reports?type=dashboard&fromDate=${dateRange.from}&toDate=${dateRange.to}`);
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoomStatusData = async () => {
    try {
      const response = await fetch('/api/reports?type=rooms');
      if (response.ok) {
        const data = await response.json();
        setRoomStatusData(data);
      }
    } catch (error) {
      console.error('Error fetching room status data:', error);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'occupied': return 'bg-blue-500';
      case 'dirty': return 'bg-yellow-500';
      case 'maintenance': return 'bg-orange-500';
      case 'blocked': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoomTypeLabel = (type: string) => {
    switch (type) {
      case 'single': return 'Single Room';
      case 'double': return 'Double Room';
      case 'suite': return 'Suite';
      case 'deluxe': return 'Deluxe Room';
      case 'family': return 'Family Room';
      default: return type;
    }
  };

  if (authLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
            <p className="text-gray-600">Business insights and key metrics</p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">Loading reports...</div>
          </div>
        ) : dashboardData ? (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.occupancyRate}%</p>
                    <p className="text-xs text-gray-500">{dashboardData.occupiedRooms}/{dashboardData.totalRooms} rooms</p>
                  </div>
                  <PieChart className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">ADR (Avg Daily Rate)</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.adr)}</p>
                    <p className="text-xs text-gray-500">Average daily rate</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">RevPAR</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.revpar)}</p>
                    <p className="text-xs text-gray-500">Revenue per available room</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.revenue)}</p>
                    <p className="text-xs text-gray-500">For selected period</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Today's Activity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today&apos;s Check-ins</p>
                    <p className="text-3xl font-bold text-blue-600">{dashboardData.todayCheckIns}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today&apos;s Check-outs</p>
                    <p className="text-3xl font-bold text-green-600">{dashboardData.todayCheckOuts}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Available Rooms</p>
                    <p className="text-3xl font-bold text-purple-600">{dashboardData.availableRooms}</p>
                  </div>
                  <Bed className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Room Status Breakdown */}
            {roomStatusData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Room Status Overview</h3>
                  <div className="space-y-3">
                    {roomStatusData.roomStatusData.map((item: any) => (
                      <div key={item.status} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded ${getStatusColor(item.status)} mr-3`}></div>
                          <span className="capitalize text-gray-700">{item.status.replace('_', ' ')}</span>
                        </div>
                        <span className="font-semibold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Room Types</h3>
                  <div className="space-y-3">
                    {roomStatusData.roomsByType.reduce((acc: any[], item: any) => {
                      const existing = acc.find(r => r.roomType === item.roomType);
                      if (existing) {
                        existing.count += item.count;
                      } else {
                        acc.push({ roomType: item.roomType, count: item.count });
                      }
                      return acc;
                    }, []).map((item: any) => (
                      <div key={item.roomType} className="flex items-center justify-between">
                        <span className="text-gray-700">{getRoomTypeLabel(item.roomType)}</span>
                        <span className="font-semibold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Reservations */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Reservations</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Confirmation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guest
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Room
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardData.recentReservations.map((reservation: any) => (
                      <tr key={reservation.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {reservation.confirmationNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {reservation.guest?.firstName} {reservation.guest?.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {reservation.room?.roomNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(reservation.checkInDate).toLocaleDateString()} - {new Date(reservation.checkOutDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {reservation.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(reservation.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">
              <p className="text-gray-500">No data available for the selected date range.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}