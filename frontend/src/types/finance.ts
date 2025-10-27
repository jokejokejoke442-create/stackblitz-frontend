export interface FeeStructure {
  id: string;
  name: string;
  description: string;
  amount: number;
  feeType:
    | 'tuition'
    | 'admission'
    | 'extracurricular'
    | 'transport'
    | 'uniform'
    | 'books'
    | 'other';
  applicableGrades: string[];
  applicableClasses?: string[];
  isRecurring: boolean;
  frequency?: 'monthly' | 'termly' | 'annually';
  dueDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Discount {
  id: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  applicableFees: string[];
  applicableGrades?: string[];
  conditions?: string;
  maxDiscountAmount?: number;
  isActive: boolean;
  validFrom: string;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  feeStructureIds: string[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  discountId?: string;
  term: string;
  academicYear: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentDate?: string;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    studentId: string;
  };
  feeStructures: FeeStructure[];
  discount?: Discount;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amountPaid: number;
  paymentMethod: 'cash' | 'mobile_money' | 'bank_transfer' | 'cheque';
  paymentDate: string;
  transactionRef?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payerName: string;
  payerPhone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  invoice: Invoice;
}

export interface GenerateInvoiceData {
  studentIds: string[];
  feeStructureIds: string[];
  term: string;
  academicYear: string;
  discountId?: string;
  dueDate: string;
}

export interface FeeCalculation {
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  breakdown: Array<{
    feeStructureId: string;
    feeName: string;
    amount: number;
  }>;
}

export interface MobileMoneyPaymentRequest {
  invoiceId: string;
  phoneNumber: string;
  network: 'mtn' | 'vodafone' | 'airteltigo';
}

export interface MobileMoneyResponse {
  paymentId: string;
  transactionRef: string;
  status: string;
  message?: string;
}

export interface CashPaymentData {
  invoiceId: string;
  amountPaid: number;
  payerName: string;
  paymentDate: string;
  notes?: string;
}

export interface InvoiceFilters {
  studentId?: string;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  term?: string;
  academicYear?: string;
  dueDate?: string;
  page?: number;
  limit?: number;
}

export interface PaymentFilters {
  invoiceId?: string;
  paymentMethod?: 'cash' | 'mobile_money' | 'bank_transfer' | 'cheque';
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
