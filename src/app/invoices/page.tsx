'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/auth-context';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Download, Search, Calendar, DollarSign, Eye } from "lucide-react";
import { formatCurrency } from '../../../lib/currency';
import { billingApi, hotelApi } from '../../../lib/api';

export default function InvoicesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchInvoices();
    }
  }, [isAuthenticated]);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const data = await billingApi.getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const viewInvoice = async (invoiceId: number) => {
    try {
      // For now, show a simple modal with invoice details
      // In the future, this could be enhanced with PDF generation
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (invoice) {
        setInvoiceData(invoice);
        setShowInvoiceModal(true);
      }
    } catch (error) {
      console.error('Error viewing invoice:', error);
      alert('Error viewing invoice');
    }
  };

  const downloadPdf = async (invoiceId: number) => {
    // PDF generation disabled for now since external API doesn't provide this endpoint
    alert('PDF generation is not yet available with the external API. This feature will be implemented in a future update.');
  };


  const filteredInvoices = invoices.filter((invoice: any) =>
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.guest && invoice.guest.toString().includes(searchTerm))
  );

  if (authLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice Management</h1>
            <p className="text-gray-600">Generate and manage invoices for reservations</p>
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

        {/* Search */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by invoice number or guest ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Invoices</h2>
          </div>
          
          {isLoading ? (
            <div className="p-6">
              <div className="text-center py-8">Loading invoices...</div>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-6">
              <div className="text-center py-8">
                <p className="text-gray-500">No invoices found.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Guest ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issue Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvoices.map((invoice: any) => (
                    <tr key={invoice.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.guest}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {new Date(invoice.issue_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {new Date(invoice.due_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                          {formatCurrency(parseFloat(invoice.amount))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          invoice.paid 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {invoice.paid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewInvoice(invoice.id)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </button>
                          <button
                            onClick={() => downloadPdf(invoice.id)}
                            disabled={isGeneratingPdf}
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Download className="h-3 w-3" />
                            {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Invoice Modal */}
        {showInvoiceModal && invoiceData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Invoice {invoiceData.invoiceNumber}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => generateInvoice(invoiceData.reservation.id, 'pdf')}
                    disabled={isGeneratingPdf}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="h-4 w-4" />
                    {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}
                  </button>
                  <button
                    onClick={() => setShowInvoiceModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Invoice Header */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Invoice Details</h3>
                    <p><strong>Invoice #:</strong> {invoiceData.invoice_number}</p>
                    <p><strong>Issue Date:</strong> {new Date(invoiceData.issue_date).toLocaleDateString()}</p>
                    <p><strong>Due Date:</strong> {new Date(invoiceData.due_date).toLocaleDateString()}</p>
                    <p><strong>Amount:</strong> {formatCurrency(parseFloat(invoiceData.amount))}</p>
                    <p><strong>Status:</strong> <span className={invoiceData.paid ? 'text-green-600' : 'text-red-600'}>{invoiceData.paid ? 'Paid' : 'Unpaid'}</span></p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Guest Information</h3>
                    <p><strong>Guest ID:</strong> {invoiceData.guest}</p>
                    <p className="text-sm text-gray-600">Full guest details can be viewed in the Guest Management section</p>
                  </div>
                </div>

                {/* Additional Details */}
                <div>
                  <h3 className="font-semibold mb-4">Additional Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2"><strong>Created:</strong> {new Date(invoiceData.created_at).toLocaleString()}</p>
                    <p className="text-sm text-gray-600"><strong>Last Updated:</strong> {new Date(invoiceData.updated_at).toLocaleString()}</p>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="flex justify-end">
                  <div className="w-64 bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Amount:</span>
                      <span className="text-xl font-bold text-blue-600">{formatCurrency(parseFloat(invoiceData.amount))}</span>
                    </div>
                    <div className="mt-2">
                      <span className={`text-sm font-medium ${invoiceData.paid ? 'text-green-600' : 'text-red-600'}`}>
                        {invoiceData.paid ? '✓ Paid' : '⚠ Unpaid'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}