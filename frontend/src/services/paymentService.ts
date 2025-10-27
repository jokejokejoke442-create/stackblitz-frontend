import { apiClient } from './apiClient';
import {
  Payment,
  MobileMoneyPaymentRequest,
  MobileMoneyResponse,
  CashPaymentData,
  PaymentFilters,
} from '@/types';

export const paymentService = {
  // Get all payments with filters
  async getPayments(
    filters: PaymentFilters = {}
  ): Promise<{ payments: Payment[]; total: number }> {
    const response = await apiClient.get<{
      payments: Payment[];
      total: number;
    }>('/payments', { params: filters });
    return response.data!;
  },

  // Get payment by ID
  async getPayment(id: string): Promise<Payment> {
    const response = await apiClient.get<Payment>(`/payments/${id}`);
    return response.data!;
  },

  // Initiate mobile money payment
  async initiateMobileMoneyPayment(
    data: MobileMoneyPaymentRequest
  ): Promise<MobileMoneyResponse> {
    const response = await apiClient.post<MobileMoneyResponse>(
      '/payments/mobile-money/initiate',
      data
    );
    return response.data!;
  },

  // Record cash payment
  async recordCashPayment(data: CashPaymentData): Promise<Payment> {
    const response = await apiClient.post<Payment>('/payments/cash', data);
    return response.data!;
  },

  // Record bank transfer payment
  async recordBankTransfer(
    data: CashPaymentData & { bankName: string; accountNumber: string }
  ): Promise<Payment> {
    const response = await apiClient.post<Payment>(
      '/payments/bank-transfer',
      data
    );
    return response.data!;
  },

  // Record cheque payment
  async recordChequePayment(
    data: CashPaymentData & { chequeNumber: string; bankName: string }
  ): Promise<Payment> {
    const response = await apiClient.post<Payment>('/payments/cheque', data);
    return response.data!;
  },

  // Check payment status
  async checkPaymentStatus(paymentId: string): Promise<Payment> {
    const response = await apiClient.get<Payment>(
      `/payments/${paymentId}/status`
    );
    return response.data!;
  },

  // Get payment receipt
  async getPaymentReceipt(paymentId: string): Promise<Blob> {
    const response = await apiClient.get(`/payments/${paymentId}/receipt`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Download payment receipt
  async downloadPaymentReceipt(paymentId: string): Promise<void> {
    await apiClient.download(
      `/payments/${paymentId}/receipt`,
      `receipt-${paymentId}.pdf`
    );
  },

  // Refund payment
  async refundPayment(paymentId: string, reason: string): Promise<Payment> {
    const response = await apiClient.post<Payment>(
      `/payments/${paymentId}/refund`,
      { reason }
    );
    return response.data!;
  },

  // Get invoice payments
  async getInvoicePayments(invoiceId: string): Promise<Payment[]> {
    const response = await apiClient.get<Payment[]>(
      `/payments/invoice/${invoiceId}`
    );
    return response.data!;
  },

  // Get student payments
  async getStudentPayments(
    studentId: string,
    filters?: PaymentFilters
  ): Promise<Payment[]> {
    const response = await apiClient.get<Payment[]>(
      `/payments/student/${studentId}`,
      { params: filters }
    );
    return response.data!;
  },

  // Verify mobile money payment
  async verifyMobileMoneyPayment(transactionRef: string): Promise<Payment> {
    const response = await apiClient.post<Payment>(
      '/payments/mobile-money/verify',
      { transactionRef }
    );
    return response.data!;
  },

  // Cancel pending payment
  async cancelPayment(paymentId: string): Promise<Payment> {
    const response = await apiClient.post<Payment>(
      `/payments/${paymentId}/cancel`
    );
    return response.data!;
  },

  // Get payment statistics
  async getPaymentStatistics(filters?: any): Promise<any> {
    const response = await apiClient.get('/payments/statistics', {
      params: filters,
    });
    return response.data!;
  },

  // Export payments
  async exportPayments(filters: PaymentFilters = {}): Promise<void> {
    await apiClient.download('/payments/export', 'payments.xlsx');
  },
};
