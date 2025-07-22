import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { formatCurrency } from '../../lib/currency';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#333333',
    paddingBottom: 20,
  },
  hotelName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333333',
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  invoiceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  infoColumn: {
    flex: 1,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#333333',
  },
  value: {
    marginBottom: 8,
    color: '#666666',
  },
  billingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  billingColumn: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333',
  },
  table: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableCell: {
    flex: 1,
    textAlign: 'left',
  },
  tableCellRight: {
    flex: 1,
    textAlign: 'right',
  },
  tableCellHeader: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#333333',
  },
  tableCellHeaderRight: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'right',
    color: '#333333',
  },
  summarySection: {
    alignSelf: 'flex-end',
    width: 300,
    marginTop: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontWeight: 'normal',
    color: '#666666',
  },
  summaryValue: {
    fontWeight: 'normal',
    color: '#333333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: '#333333',
    marginTop: 8,
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#333333',
  },
  totalValue: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#333333',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  balanceLabel: {
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  balanceValue: {
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  paymentHistory: {
    marginTop: 40,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#999999',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
  },
});

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  reservation: {
    confirmationNumber: string;
    checkInDate: string;
    checkOutDate: string;
    guest: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address?: string;
      city?: string;
      country?: string;
      postalCode?: string;
    };
    room: {
      roomNumber: string;
      roomType: string;
    };
  };
  charges: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  taxes: Array<{
    description: string;
    rate: number;
    amount: number;
  }>;
  summary: {
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    paidAmount: number;
    balanceDue: number;
  };
  paymentHistory: Array<{
    id: number;
    amount: number;
    paymentMethod: string;
    paymentType: string;
    createdAt: string;
  }>;
  generatedBy: string;
  generatedAt: string;
}

interface PDFInvoiceProps {
  invoiceData: InvoiceData;
}

const PDFInvoice: React.FC<PDFInvoiceProps> = ({ invoiceData }) => {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.hotelName}>Hotel Nusantara</Text>
          <Text>Jl. Merdeka No. 123, Jakarta Pusat 10110</Text>
          <Text>Telepon: (021) 123-4567 | Email: info@hotelnusantara.co.id</Text>
          <Text style={styles.invoiceTitle}>FAKTUR {invoiceData.invoiceNumber}</Text>
        </View>

        {/* Invoice Information */}
        <View style={styles.invoiceInfo}>
          <View style={styles.infoColumn}>
            <Text style={styles.label}>Tanggal Faktur:</Text>
            <Text style={styles.value}>{formatDate(invoiceData.invoiceDate)}</Text>
            
            <Text style={styles.label}>Jatuh Tempo:</Text>
            <Text style={styles.value}>{formatDate(invoiceData.dueDate)}</Text>
            
            <Text style={styles.label}>No. Konfirmasi:</Text>
            <Text style={styles.value}>{invoiceData.reservation.confirmationNumber}</Text>
          </View>
          
          <View style={styles.infoColumn}>
            <Text style={styles.label}>Tanggal Check-in:</Text>
            <Text style={styles.value}>{formatDate(invoiceData.reservation.checkInDate)}</Text>
            
            <Text style={styles.label}>Tanggal Check-out:</Text>
            <Text style={styles.value}>{formatDate(invoiceData.reservation.checkOutDate)}</Text>
            
            <Text style={styles.label}>Kamar:</Text>
            <Text style={styles.value}>
              {invoiceData.reservation.room.roomNumber} ({invoiceData.reservation.room.roomType})
            </Text>
          </View>
        </View>

        {/* Billing Information */}
        <View style={styles.billingSection}>
          <View style={styles.billingColumn}>
            <Text style={styles.sectionTitle}>Tagihan Kepada:</Text>
            <Text style={styles.label}>
              {invoiceData.reservation.guest.firstName} {invoiceData.reservation.guest.lastName}
            </Text>
            <Text style={styles.value}>{invoiceData.reservation.guest.email}</Text>
            <Text style={styles.value}>{invoiceData.reservation.guest.phone}</Text>
            {invoiceData.reservation.guest.address && (
              <Text style={styles.value}>{invoiceData.reservation.guest.address}</Text>
            )}
            {invoiceData.reservation.guest.city && invoiceData.reservation.guest.country && (
              <Text style={styles.value}>
                {invoiceData.reservation.guest.city}, {invoiceData.reservation.guest.country}
                {invoiceData.reservation.guest.postalCode && ` ${invoiceData.reservation.guest.postalCode}`}
              </Text>
            )}
          </View>
          
          <View style={styles.billingColumn}>
            <Text style={styles.sectionTitle}>Informasi Hotel:</Text>
            <Text style={styles.label}>Hotel Nusantara</Text>
            <Text style={styles.value}>Jl. Merdeka No. 123</Text>
            <Text style={styles.value}>Jakarta Pusat 10110</Text>
            <Text style={styles.value}>Telepon: (021) 123-4567</Text>
          </View>
        </View>

        {/* Charges Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCellHeader}>Description</Text>
            <Text style={styles.tableCellHeaderRight}>Quantity</Text>
            <Text style={styles.tableCellHeaderRight}>Rate</Text>
            <Text style={styles.tableCellHeaderRight}>Amount</Text>
          </View>
          
          {invoiceData.charges.map((charge, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{charge.description}</Text>
              <Text style={styles.tableCellRight}>{charge.quantity}</Text>
              <Text style={styles.tableCellRight}>{formatCurrency(charge.rate)}</Text>
              <Text style={styles.tableCellRight}>{formatCurrency(charge.amount)}</Text>
            </View>
          ))}
          
          {invoiceData.taxes.map((tax, index) => (
            <View key={`tax-${index}`} style={styles.tableRow}>
              <Text style={styles.tableCell}>{tax.description}</Text>
              <Text style={styles.tableCellRight}>-</Text>
              <Text style={styles.tableCellRight}>{(tax.rate * 100).toFixed(1)}%</Text>
              <Text style={styles.tableCellRight}>{formatCurrency(tax.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(invoiceData.summary.subtotal)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(invoiceData.summary.taxAmount)}</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoiceData.summary.totalAmount)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount Paid:</Text>
            <Text style={styles.summaryValue}>{formatCurrency(invoiceData.summary.paidAmount)}</Text>
          </View>
          
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Balance Due:</Text>
            <Text style={styles.balanceValue}>{formatCurrency(invoiceData.summary.balanceDue)}</Text>
          </View>
        </View>

        {/* Payment History */}
        {invoiceData.paymentHistory.length > 0 && (
          <View style={styles.paymentHistory}>
            <Text style={styles.sectionTitle}>Payment History</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableCellHeader}>Date</Text>
                <Text style={styles.tableCellHeaderRight}>Amount</Text>
                <Text style={styles.tableCellHeader}>Method</Text>
                <Text style={styles.tableCellHeader}>Type</Text>
              </View>
              
              {invoiceData.paymentHistory.map((payment) => (
                <View key={payment.id} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{formatDate(payment.createdAt)}</Text>
                  <Text style={styles.tableCellRight}>{formatCurrency(payment.amount)}</Text>
                  <Text style={styles.tableCell}>
                    {payment.paymentMethod.replace('_', ' ')}
                  </Text>
                  <Text style={styles.tableCell}>{payment.paymentType}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Generated by {invoiceData.generatedBy} on {formatDate(invoiceData.generatedAt)}
          </Text>
          <Text>Thank you for choosing our hotel!</Text>
        </View>
      </Page>
    </Document>
  );
};

export default PDFInvoice;