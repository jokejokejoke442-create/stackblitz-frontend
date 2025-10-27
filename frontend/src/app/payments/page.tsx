'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  Eye,
  Download,
  Trash2,
  Filter,
  CreditCard,
  Loader2,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/apiService';
import { DataNotFoundForEntity } from '@/components/ui/data-not-found';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingPayment, setDeletingPayment] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, [filterStatus]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (searchQuery) params.search = searchQuery;
      const response = await apiService.getPayments(params);
      if (response.success) {
        setPayments(response.data?.payments || []);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch payments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.paymentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || payment.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleDeletePayment = async () => {
    if (!deletingPayment) return;
    setDeleteLoading(true);
    try {
      await apiService.deletePayment(deletingPayment.id);
      toast({
        title: 'Success',
        description: 'Payment deleted successfully',
      });
      fetchPayments();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete payment',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDownloadReceipt = async (paymentId: string) => {
    try {
      const blob = await apiService.downloadReceipt(paymentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${paymentId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: 'Success',
        description: 'Receipt downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download receipt',
        variant: 'destructive',
      });
    }
  };

  const handleExport = () => {
    // Mock export
    toast({
      title: 'Success',
      description: 'Payments exported successfully',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalAmount = payments.reduce((sum, pay) => sum + pay.amount, 0);
  const completedAmount = payments
    .filter((pay) => pay.status === 'completed')
    .reduce((sum, pay) => sum + pay.amount, 0);
  const pendingAmount = payments
    .filter((pay) => pay.status === 'pending')
    .reduce((sum, pay) => sum + pay.amount, 0);
  const failedAmount = payments
    .filter((pay) => pay.status === 'failed')
    .reduce((sum, pay) => sum + pay.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Payments</h1>
            <p className="text-gray-500">Track and manage student payments</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Record New Payment</DialogTitle>
                <DialogDescription>
                  Record a payment received from a student
                </DialogDescription>
              </DialogHeader>
              <RecordPaymentForm
                onClose={() => setIsAddDialogOpen(false)}
                onSuccess={fetchPayments}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payments.length}</div>
              <p className="text-xs text-gray-500">
                ₵{totalAmount.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {payments.filter((p) => p.status === 'completed').length}
              </div>
              <p className="text-xs text-gray-500">
                ₵{completedAmount.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {payments.filter((p) => p.status === 'pending').length}
              </div>
              <p className="text-xs text-gray-500">
                ₵{pendingAmount.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {payments.filter((p) => p.status === 'failed').length}
              </div>
              <p className="text-xs text-gray-500">
                ₵{failedAmount.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payments List */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Records</CardTitle>
            <CardDescription>View and manage all payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by student name, payment ID, or reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredPayments.length === 0 && searchQuery === '' && filterStatus === 'all' ? (
              <DataNotFoundForEntity entity="payments" actionText="Record First Payment" onAction={() => setIsAddDialogOpen(true)} />
            ) : filteredPayments.length === 0 ? (
              <DataNotFoundForEntity entity="payments" actionText="Clear Search" onAction={() => {
                setSearchQuery('');
                setFilterStatus('all');
              }} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment ID</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.paymentId}
                      </TableCell>
                      <TableCell>{payment.studentName}</TableCell>
                      <TableCell>{payment.class}</TableCell>
                      <TableCell>₵{payment.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-gray-500" />
                          {payment.method}
                        </div>
                      </TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" title="View">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="font-medium">{payment.paymentId}</h4>
                                <p className="text-sm text-gray-600">Student: {payment.studentName}</p>
                                <p className="text-sm text-gray-600">Class: {payment.class}</p>
                                <p className="text-sm text-gray-600">Amount: ₵{payment.amount.toLocaleString()}</p>
                                <p className="text-sm text-gray-600">Method: {payment.method}</p>
                                <p className="text-sm text-gray-600">Reference: {payment.reference}</p>
                                <p className="text-sm text-gray-600">Date: {payment.date}</p>
                                <p className="text-sm text-gray-600">Status: {payment.status}</p>
                                <p className="text-sm text-gray-600">Invoice: {payment.invoiceId}</p>
                              </div>
                            </PopoverContent>
                          </Popover>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Download"
                            onClick={() => handleDownloadReceipt(payment.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete"
                            onClick={() => {
                              setDeletingPayment(payment);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Delete Payment Alert */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Payment</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete payment {deletingPayment?.paymentId}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePayment}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}

function RecordPaymentForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    invoiceId: '',
    amount: '',
    method: '',
    reference: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const response = await apiService.getInvoices({ status: 'pending' });
      if (response.success) {
        const invoiceData = response.data?.invoices || [];
        setInvoices(invoiceData);
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await apiService.createPayment({
        invoice_id: formData.invoiceId,
        amount: parseFloat(formData.amount),
        payment_method: formData.method,
        payment_date: formData.date,
        transaction_id: formData.reference,
        status: 'completed',
        notes: formData.notes,
      });
      toast({
        title: 'Success',
        description: 'Payment recorded successfully',
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record payment',
        variant: 'destructive',
      });
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="invoiceId">Invoice *</Label>
          <Select
            value={formData.invoiceId}
            onValueChange={(value) => {
              const invoice = invoices.find(inv => inv.id === value);
              setFormData({ 
                ...formData, 
                invoiceId: value,
                amount: invoice?.total_amount?.toString() || ''
              });
            }}
            disabled={loadingInvoices}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingInvoices ? "Loading invoices..." : "Select invoice"} />
            </SelectTrigger>
            <SelectContent>
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <SelectItem key={invoice.id} value={invoice.id}>
                    {invoice.invoice_number} - {invoice.students?.first_name} {invoice.students?.last_name} (${invoice.total_amount})
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-invoices" disabled>
                  No pending invoices
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            type="number"
            required
            placeholder="e.g., 1200"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="method">Payment Method *</Label>
          <Select
            value={formData.method}
            onValueChange={(value) =>
              setFormData({ ...formData, method: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              <SelectItem value="Mobile Money">Mobile Money</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Cheque">Cheque</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Payment Date *</Label>
          <Input
            id="date"
            type="date"
            required
            value={formData.date}
            onChange={(e) =>
              setFormData({ ...formData, date: e.target.value })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reference">Reference/Transaction ID</Label>
        <Input
          id="reference"
          placeholder="Payment reference or transaction ID"
          value={formData.reference}
          onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input
          id="notes"
          placeholder="Additional notes (optional)"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={createLoading}>
          {createLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Record Payment
        </Button>
      </DialogFooter>
    </form>
  );
}
