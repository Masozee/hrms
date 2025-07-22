'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { guestApi } from '../../../lib/api';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Plus, Table as TableIcon, Grid3X3 } from "lucide-react";
import GuestForm from '../../../components/guests/guest-form';
import { DataTable } from '../../../components/ui/data-table';
import { columns, Guest } from '../../../components/guests/guest-columns';

export default function GuestsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchGuests();
    }
  }, [isAuthenticated]);

  const fetchGuests = async () => {
    setIsLoading(true);
    try {
      const data = await guestApi.getGuests();
      setGuests(data || []);
      
    } catch (error) {
      console.error('Error fetching guests:', error);
      // Show user-friendly error message
      alert('Failed to load guests. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      if (editingGuest) {
        // Update existing guest
        await guestApi.updateGuest(editingGuest.id, formData);
      } else {
        // Create new guest
        await guestApi.createGuest(formData);
      }
      
      setShowForm(false);
      setEditingGuest(null);
      fetchGuests();
    } catch (error) {
      console.error('Error saving guest:', error);
      alert('An error occurred while saving the guest. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setShowForm(true);
  };

  const handleDelete = async (guest: Guest) => {
    const firstName = guest.first_name || '';
    const lastName = guest.last_name || '';
    if (!confirm(`Are you sure you want to delete ${firstName} ${lastName}?`)) {
      return;
    }

    try {
      await guestApi.deleteGuest(parseInt(guest.id));
      fetchGuests();
    } catch (error) {
      console.error('Error deleting guest:', error);
      alert('An error occurred while deleting the guest. Please try again.');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingGuest(null);
  };

  if (authLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Guests</h1>
            <p className="text-gray-600">Manage guest profiles and information</p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Dashboard
            </Link>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Guest
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TableIcon className="h-4 w-4" />
              Table
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
              Cards
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center py-8">Loading guests...</div>
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-white rounded-lg shadow-md">
            <DataTable columns={columns(handleEdit, handleDelete)} data={guests} searchKey="first_name" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guests.map((guest) => (
              <div key={guest.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {guest.first_name} {guest.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">Guest ID: {guest.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(guest)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(guest)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-20">Email:</span>
                    <span className="text-gray-900">{guest.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-gray-500 w-20">Phone:</span>
                    <span className="text-gray-900">{guest.phone_number}</span>
                  </div>
                  <div className="flex items-start text-sm">
                    <span className="text-gray-500 w-20">Address:</span>
                    <span className="text-gray-900 flex-1">{guest.address}</span>
                  </div>
                </div>
              </div>
            ))}
            {guests.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No guests found.</p>
              </div>
            )}
          </div>
        )}

        {showForm && (
          <GuestForm
            guest={editingGuest}
            onSubmit={handleSubmit}
            onClose={handleCloseForm}
            isLoading={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}