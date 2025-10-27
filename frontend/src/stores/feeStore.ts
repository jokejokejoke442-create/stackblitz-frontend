import { create } from 'zustand';
import { feeService } from '@/services';
import {
  FeeStructure,
  Discount,
  Invoice,
  GenerateInvoiceData,
  InvoiceFilters,
  FeeCalculation,
} from '@/types';

interface FeeStore {
  feeStructures: FeeStructure[];
  discounts: Discount[];
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  isLoading: boolean;
  error: string | null;
  total: number;
  calculation: FeeCalculation | null;

  // Fee Structure actions
  fetchFeeStructures: () => Promise<void>;
  createFeeStructure: (
    data: Omit<FeeStructure, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateFeeStructure: (
    id: string,
    data: Partial<FeeStructure>
  ) => Promise<void>;
  deleteFeeStructure: (id: string) => Promise<void>;

  // Discount actions
  fetchDiscounts: () => Promise<void>;
  createDiscount: (
    data: Omit<Discount, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateDiscount: (id: string, data: Partial<Discount>) => Promise<void>;
  deleteDiscount: (id: string) => Promise<void>;

  // Invoice actions
  fetchInvoices: (filters?: InvoiceFilters) => Promise<void>;
  fetchInvoice: (id: string) => Promise<void>;
  generateInvoices: (data: GenerateInvoiceData) => Promise<void>;
  updateInvoice: (id: string, data: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  applyDiscount: (invoiceId: string, discountId: string) => Promise<void>;
  removeDiscount: (invoiceId: string) => Promise<void>;
  calculateFeeAmount: (
    feeStructureIds: string[],
    discountId?: string
  ) => Promise<void>;
  sendInvoiceReminder: (invoiceId: string) => Promise<void>;
  downloadInvoice: (invoiceId: string) => Promise<void>;

  // Utility actions
  clearCurrentInvoice: () => void;
  clearError: () => void;
  clearCalculation: () => void;
}

export const useFeeStore = create<FeeStore>((set, get) => ({
  feeStructures: [],
  discounts: [],
  invoices: [],
  currentInvoice: null,
  isLoading: false,
  error: null,
  total: 0,
  calculation: null,

  // Fee Structure actions
  fetchFeeStructures: async () => {
    set({ isLoading: true, error: null });
    try {
      const feeStructures = await feeService.getFeeStructures();
      set({ feeStructures, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch fee structures',
        isLoading: false,
      });
    }
  },

  createFeeStructure: async (
    data: Omit<FeeStructure, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    set({ isLoading: true, error: null });
    try {
      const newFeeStructure = await feeService.createFeeStructure(data);
      set((state) => ({
        feeStructures: [...state.feeStructures, newFeeStructure],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create fee structure',
        isLoading: false,
      });
    }
  },

  updateFeeStructure: async (id: string, data: Partial<FeeStructure>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedFeeStructure = await feeService.updateFeeStructure(id, data);
      set((state) => ({
        feeStructures: state.feeStructures.map((fs) =>
          fs.id === id ? updatedFeeStructure : fs
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update fee structure',
        isLoading: false,
      });
    }
  },

  deleteFeeStructure: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await feeService.deleteFeeStructure(id);
      set((state) => ({
        feeStructures: state.feeStructures.filter((fs) => fs.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete fee structure',
        isLoading: false,
      });
    }
  },

  // Discount actions
  fetchDiscounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const discounts = await feeService.getDiscounts();
      set({ discounts, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch discounts',
        isLoading: false,
      });
    }
  },

  createDiscount: async (
    data: Omit<Discount, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    set({ isLoading: true, error: null });
    try {
      const newDiscount = await feeService.createDiscount(data);
      set((state) => ({
        discounts: [...state.discounts, newDiscount],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to create discount',
        isLoading: false,
      });
    }
  },

  updateDiscount: async (id: string, data: Partial<Discount>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedDiscount = await feeService.updateDiscount(id, data);
      set((state) => ({
        discounts: state.discounts.map((d) =>
          d.id === id ? updatedDiscount : d
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to update discount',
        isLoading: false,
      });
    }
  },

  deleteDiscount: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await feeService.deleteDiscount(id);
      set((state) => ({
        discounts: state.discounts.filter((d) => d.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to delete discount',
        isLoading: false,
      });
    }
  },

  // Invoice actions
  fetchInvoices: async (filters: InvoiceFilters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await feeService.getInvoices(filters);
      set({
        invoices: response.invoices,
        total: response.total,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch invoices',
        isLoading: false,
      });
    }
  },

  fetchInvoice: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const invoice = await feeService.getInvoice(id);
      set({ currentInvoice: invoice, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch invoice',
        isLoading: false,
      });
    }
  },

  generateInvoices: async (data: GenerateInvoiceData) => {
    set({ isLoading: true, error: null });
    try {
      const invoices = await feeService.generateInvoices(data);
      set((state) => ({
        invoices: [...invoices, ...state.invoices],
        total: state.total + invoices.length,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate invoices',
        isLoading: false,
      });
    }
  },

  updateInvoice: async (id: string, data: Partial<Invoice>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedInvoice = await feeService.updateInvoice(id, data);
      set((state) => ({
        invoices: state.invoices.map((invoice) =>
          invoice.id === id ? updatedInvoice : invoice
        ),
        currentInvoice:
          state.currentInvoice?.id === id
            ? updatedInvoice
            : state.currentInvoice,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to update invoice',
        isLoading: false,
      });
    }
  },

  deleteInvoice: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await feeService.deleteInvoice(id);
      set((state) => ({
        invoices: state.invoices.filter((invoice) => invoice.id !== id),
        total: state.total - 1,
        currentInvoice:
          state.currentInvoice?.id === id ? null : state.currentInvoice,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to delete invoice',
        isLoading: false,
      });
    }
  },

  applyDiscount: async (invoiceId: string, discountId: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedInvoice = await feeService.applyDiscount(
        invoiceId,
        discountId
      );
      set((state) => ({
        invoices: state.invoices.map((invoice) =>
          invoice.id === invoiceId ? updatedInvoice : invoice
        ),
        currentInvoice:
          state.currentInvoice?.id === invoiceId
            ? updatedInvoice
            : state.currentInvoice,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to apply discount',
        isLoading: false,
      });
    }
  },

  removeDiscount: async (invoiceId: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedInvoice = await feeService.removeDiscount(invoiceId);
      set((state) => ({
        invoices: state.invoices.map((invoice) =>
          invoice.id === invoiceId ? updatedInvoice : invoice
        ),
        currentInvoice:
          state.currentInvoice?.id === invoiceId
            ? updatedInvoice
            : state.currentInvoice,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to remove discount',
        isLoading: false,
      });
    }
  },

  calculateFeeAmount: async (
    feeStructureIds: string[],
    discountId?: string
  ) => {
    set({ isLoading: true, error: null });
    try {
      const calculation = await feeService.calculateFeeAmount(
        feeStructureIds,
        discountId
      );
      set({ calculation, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to calculate fee amount',
        isLoading: false,
      });
    }
  },

  sendInvoiceReminder: async (invoiceId: string) => {
    try {
      await feeService.sendInvoiceReminder(invoiceId);
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to send invoice reminder',
      });
    }
  },

  downloadInvoice: async (invoiceId: string) => {
    try {
      await feeService.downloadInvoice(invoiceId);
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to download invoice',
      });
    }
  },

  // Utility actions
  clearCurrentInvoice: () => {
    set({ currentInvoice: null });
  },

  clearError: () => {
    set({ error: null });
  },

  clearCalculation: () => {
    set({ calculation: null });
  },
}));