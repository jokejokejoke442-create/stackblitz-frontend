import { apiClient } from './apiClient';
import {
  FeeStructure,
  Discount,
  Invoice,
  GenerateInvoiceData,
  FeeCalculation,
  InvoiceFilters,
} from '@/types';

export const feeService = {
  // Fee Structures
  async getFeeStructures(filters?: any): Promise<FeeStructure[]> {
    const response = await apiClient.get<FeeStructure[]>('/fees/structures', {
      params: filters,
    });
    return response.data!;
  },

  async getFeeStructure(id: string): Promise<FeeStructure> {
    const response = await apiClient.get<FeeStructure>(
      `/fees/structures/${id}`
    );
    return response.data!;
  },

  async createFeeStructure(
    data: Omit<FeeStructure, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<FeeStructure> {
    const response = await apiClient.post<FeeStructure>(
      '/fees/structures',
      data
    );
    return response.data!;
  },

  async updateFeeStructure(
    id: string,
    data: Partial<FeeStructure>
  ): Promise<FeeStructure> {
    const response = await apiClient.put<FeeStructure>(
      `/fees/structures/${id}`,
      data
    );
    return response.data!;
  },

  async deleteFeeStructure(id: string): Promise<void> {
    await apiClient.delete(`/fees/structures/${id}`);
  },

  // Discounts
  async getDiscounts(filters?: any): Promise<Discount[]> {
    const response = await apiClient.get<Discount[]>('/fees/discounts', {
      params: filters,
    });
    return response.data!;
  },

  async getDiscount(id: string): Promise<Discount> {
    const response = await apiClient.get<Discount>(`/fees/discounts/${id}`);
    return response.data!;
  },

  async createDiscount(
    data: Omit<Discount, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Discount> {
    const response = await apiClient.post<Discount>('/fees/discounts', data);
    return response.data!;
  },

  async updateDiscount(id: string, data: Partial<Discount>): Promise<Discount> {
    const response = await apiClient.put<Discount>(
      `/fees/discounts/${id}`,
      data
    );
    return response.data!;
  },

  async deleteDiscount(id: string): Promise<void> {
    await apiClient.delete(`/fees/discounts/${id}`);
  },

  // Invoices
  async getInvoices(
    filters: InvoiceFilters = {}
  ): Promise<{ invoices: Invoice[]; total: number }> {
    const response = await apiClient.get<{
      invoices: Invoice[];
      total: number;
    }>('/invoices', { params: filters });
    return response.data!;
  },

  async getInvoice(id: string): Promise<Invoice> {
    const response = await apiClient.get<Invoice>(`/invoices/${id}`);
    return response.data!;
  },

  async generateInvoices(data: GenerateInvoiceData): Promise<Invoice[]> {
    const response = await apiClient.post<Invoice[]>('/invoices', data);
    return response.data!;
  },

  async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
    const response = await apiClient.put<Invoice>(`/invoices/${id}`, data);
    return response.data!;
  },

  async deleteInvoice(id: string): Promise<void> {
    await apiClient.delete(`/invoices/${id}`);
  },

  async getStudentInvoices(
    studentId: string,
    filters?: InvoiceFilters
  ): Promise<Invoice[]> {
    const response = await apiClient.get<Invoice[]>(
      `/invoices/student/${studentId}`,
      { params: filters }
    );
    return response.data!;
  },

  // Apply discount to invoice
  async applyDiscount(invoiceId: string, discountId: string): Promise<Invoice> {
    const response = await apiClient.post<Invoice>(
      `/invoices/${invoiceId}/apply-discount`,
      { discountId }
    );
    return response.data!;
  },

  // Remove discount from invoice
  async removeDiscount(invoiceId: string): Promise<Invoice> {
    const response = await apiClient.delete<Invoice>(
      `/invoices/${invoiceId}/discount`
    );
    return response.data!;
  },

  // Calculate fee with discount
  async calculateFeeAmount(
    feeStructureIds: string[],
    discountId?: string
  ): Promise<FeeCalculation> {
    const response = await apiClient.post<FeeCalculation>('/fees/calculate', {
      feeStructureIds,
      discountId,
    });
    return response.data!;
  },

  // Send invoice reminder
  async sendInvoiceReminder(invoiceId: string): Promise<void> {
    await apiClient.post(`/invoices/${invoiceId}/send-reminder`);
  },

  // Download invoice PDF
  async downloadInvoice(invoiceId: string): Promise<void> {
    await apiClient.download(
      `/invoices/${invoiceId}/pdf`,
      `invoice-${invoiceId}.pdf`
    );
  },

  // Get fee statistics
  async getFeeStatistics(filters?: any): Promise<any> {
    const response = await apiClient.get('/fees/statistics', {
      params: filters,
    });
    return response.data!;
  },
};