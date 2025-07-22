'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Plus, Search, CreditCard, DollarSign, Calendar, FileText } from "lucide-react";
import { formatCurrency } from '../../../lib/currency';
import { billingApi, hotelApi } from '../../../lib/api';

export default function PaymentsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'cash',
    paymentType: 'payment',
    transactionId: '',
    notes: ''
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPayments();
      fetchUnpaidReservations();
    }
  }, [isAuthenticated]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const data = await billingApi.getPayments();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnpaidReservations = async () => {
    try {
      const data = await hotelApi.getBookings();
      // Filter reservations with outstanding balances based on payment_status
      const unpaid = data.filter((res: any) => 
        res.payment_status === 'pending' || res.payment_status === 'partial'
      );
      setReservations(unpaid);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReservation) {
      alert('Please select a reservation');
      return;
    }

    setIsSubmitting(true);
    try {
      const paymentData = {
        invoice: parseInt(selectedReservation), // Assuming selectedReservation is an invoice ID
        amount_paid: paymentForm.amount,
        payment_method: paymentForm.paymentMethod,
        transaction_id: paymentForm.transactionId || null
      };

      await billingApi.createPayment(paymentData);
      
      setShowPaymentForm(false);
      setPaymentForm({
        amount: '',
        paymentMethod: 'cash',
        paymentType: 'payment',
        transactionId: '',
        notes: ''
      });
      setSelectedReservation('');
      fetchPayments();
      fetchUnpaidReservations();
      alert('Payment recorded successfully!');
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('An error occurred while recording the payment');
    } finally {
      setIsSubmitting(false);
    }
  };


  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'cash': return <DollarSign className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'payment': return 'bg-green-100 text-green-800';
      case 'deposit': return 'bg-blue-100 text-blue-800';
      case 'refund': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payments</h1>
            <p className="text-gray-600">Track payments and manage billing</p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Dashboard
            </Link>
            <Link 
              href="/invoices"
              className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Manage Invoices
            </Link>
            <button 
              onClick={() => setShowPaymentForm(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Record Payment
            </button>
          </div>
        </div>

        {/* Outstanding Balances */}
        {reservations.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-4">Outstanding Balances</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reservations.map((reservation: any) => (
                <div key={reservation.id} className="bg-white p-4 rounded border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{reservation.reservation_number}</p>
                      <p className="text-sm text-gray-600">
                        {reservation.guest_full_name}
                      </p>
                      <p className="text-sm text-gray-600">Room {reservation.room_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-bold text-blue-600">
                        {formatCurrency(parseFloat(reservation.total_amount))}
                      </p>
                      <p className="text-xs text-gray-500">Status: {reservation.payment_status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Form Modal */}
        {showPaymentForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Record Payment</h2>
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reservation *
                  </label>
                  <select
                    required
                    value={selectedReservation}
                    onChange={(e) => setSelectedReservation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select a reservation</option>
                    {reservations.map((res: any) => (
                      <option key={res.id} value={res.id}>
                        {res.reservation_number} - {res.guest_full_name} 
                        (Room: {res.room_number}, Total: {formatCurrency(parseFloat(res.total_amount))})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method *
                    </label>
                    <select
                      required
                      value={paymentForm.paymentMethod}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Credit/Debit Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="online">Online Payment</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Type
                  </label>
                  <select
                    value={paymentForm.paymentType}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="payment">Payment</option>
                    <option value="deposit">Deposit</option>
                    <option value="refund">Refund</option>
                  </select>
                </div>

                {(paymentForm.paymentMethod === 'card' || paymentForm.paymentMethod === 'online') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      value={paymentForm.transactionId}
                      onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Transaction reference number"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={2}
                    value={paymentForm.notes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Payment notes or reference"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Recording...' : 'Record Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment History */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Payment History</h2>
          </div>
          
          {isLoading ? (
            <div className="p-6">
              <div className="text-center py-8">Loading payments...</div>
            </div>
          ) : payments.length === 0 ? (
            <div className="p-6">
              <div className="text-center py-8">
                <p className="text-gray-500">No payments recorded yet.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reservation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment: any) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payment.invoice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {/* Guest name from invoice relationship - may need to be populated */}
                        -
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="text-green-600">
                          {formatCurrency(parseFloat(payment.amount_paid))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          {getPaymentMethodIcon(payment.payment_method)}
                          <span className="ml-2 capitalize">{payment.payment_method.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Payment
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.transaction_id || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}