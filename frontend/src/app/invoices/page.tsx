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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  Edit,
  Eye,
  Send,
  Download,
  Trash2,
  Filter,
  Loader2,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/apiService';
import { DataNotFoundForEntity } from '@/components/ui/data-not-found';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
  }, [filterStatus]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (searchQuery) params.search = searchQuery;
      const response = await apiService.getInvoices(params);
      if (response.success) {
        setInvoices(response.data?.invoices || []);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch invoices',
        variant: 'destructive',
      });
      // Set to empty array on error to prevent further issues
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || invoice.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success' as const;
      case 'pending':
        return 'warn' as const;
      case 'overdue':
        return 'crit' as const;
      default:
        return 'neutral' as const;
    }
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices
    .filter((inv) => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.amount, 0);
  const overdueAmount = invoices
    .filter((inv) => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      await apiService.sendInvoice(invoiceId);
      toast({
        title: 'Success',
        description: 'Invoice sent successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send invoice',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const blob = await apiService.downloadReceipt(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: 'Success',
        description: 'Invoice downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download invoice',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteInvoice = async () => {
    if (!deletingInvoice) return;
    setDeleteLoading(true);
    try {
      await apiService.deleteInvoice(deletingInvoice.id);
      toast({
        title: 'Success',
        description: 'Invoice deleted successfully',
      });
      fetchInvoices();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete invoice',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Invoices</h1>
            <p className="text-gray-500">Manage student invoices and billing</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>
                  Generate an invoice for a student
                </DialogDescription>
              </DialogHeader>
              <CreateInvoiceForm
                onClose={() => setIsAddDialogOpen(false)}
                onSuccess={fetchInvoices}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Total Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent-neutral">{invoices.length}</div>
              <p className="text-xs text-muted-foreground">
                ₵{totalAmount.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Paid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent-success">
                {invoices.filter((i) => i.status === 'paid').length}
              </div>
              <p className="text-xs text-muted-foreground">
                ₵{paidAmount.toLocaleString()}
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
              <div className="text-2xl font-bold text-accent-warn">
                {invoices.filter((i) => i.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">
                ₵{pendingAmount.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent-crit">
                {invoices.filter((i) => i.status === 'overdue').length}
              </div>
              <p className="text-xs text-muted-foreground">
                ₵{overdueAmount.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice List</CardTitle>
            <CardDescription>View and manage all invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by student name or invoice number..."
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
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" loading={loading} loadingText="Exporting...">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredInvoices.length === 0 && searchQuery === '' && filterStatus === 'all' ? (
              <DataNotFoundForEntity entity="invoices" actionText="Create First Invoice" onAction={() => setIsAddDialogOpen(true)} />
            ) : filteredInvoices.length === 0 ? (
              <DataNotFoundForEntity entity="invoices" actionText="Clear Search" onAction={() => {
                setSearchQuery('');
                setFilterStatus('all');
              }} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>{invoice.studentName}</TableCell>
                      <TableCell>{invoice.class}</TableCell>
                      <TableCell>₵{invoice.amount.toLocaleString()}</TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View"
                            onClick={() => {
                              setViewingInvoice(invoice);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Send"
                            onClick={() => handleSendInvoice(invoice.id)}
                            loading={loading}
                            aria-label="Send Invoice"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Download"
                            onClick={() => handleDownloadInvoice(invoice.id)}
                            loading={loading}
                            aria-label="Download Invoice"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Delete"
                            onClick={() => {
                              setDeletingInvoice(invoice);
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

        {/* View Invoice Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
              <DialogDescription>
                {viewingInvoice?.invoiceNumber}
              </DialogDescription>
            </DialogHeader>
            {viewingInvoice && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Student</Label>
                    <p className="text-sm">{viewingInvoice.studentName}</p>
                  </div>
                  <div>
                    <Label>Class</Label>
                    <p className="text-sm">{viewingInvoice.class}</p>
                  </div>
                  <div>
                    <Label>Amount</Label>
                    <p className="text-sm">₵{viewingInvoice.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label>Due Date</Label>
                    <p className="text-sm">{viewingInvoice.dueDate}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge variant={getStatusBadgeVariant(viewingInvoice.status)}>
                      {viewingInvoice.status}
                    </Badge>
                  </div>
                  <div>
                    <Label>Created</Label>
                    <p className="text-sm">{viewingInvoice.createdAt}</p>
                  </div>
                </div>
                <div>
                  <Label>Items</Label>
                  <div className="space-y-2 mt-2">
                    {viewingInvoice.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.description}</span>
                        <span>₵{item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Invoice Alert */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete invoice {deletingInvoice?.invoiceNumber}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteInvoice}
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

function CreateInvoiceForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    studentId: '',
    dueDate: '',
    items: [{ description: '', amount: '' }],
    notes: '',
  });
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const response = await apiService.getStudents({});
      if (response.success) {
        const studentData = Array.isArray(response.data)
          ? response.data
          : response.data?.students || [];
        setStudents(studentData);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', amount: '' }],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const invoiceData = {
        student_id: formData.studentId,
        due_date: formData.dueDate,
        items: formData.items.map(item => ({
          description: item.description,
          amount: parseFloat(item.amount) || 0,
        })),
        notes: formData.notes,
      };
      await apiService.createInvoice(invoiceData);
      toast({
        title: 'Success',
        description: 'Invoice created successfully',
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create invoice',
        variant: 'destructive',
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const totalAmount = formData.items.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="studentId">Student *</Label>
          <Select
            value={formData.studentId}
            onValueChange={(value) =>
              setFormData({ ...formData, studentId: value })
            }
            disabled={loadingStudents}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingStudents ? "Loading students..." : "Select student"} />
            </SelectTrigger>
            <SelectContent>
              {students.length > 0 ? (
                students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.first_name || student.firstName} {student.last_name || student.lastName} ({student.student_id || student.studentId})
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-students" disabled>
                  No students available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date *</Label>
          <Input
            id="dueDate"
            type="date"
            required
            value={formData.dueDate}
            onChange={(e) =>
              setFormData({ ...formData, dueDate: e.target.value })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Invoice Items *</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </Button>
        </div>
        {formData.items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="Description"
              value={item.description}
              onChange={(e) =>
                updateItem(index, 'description', e.target.value)
              }
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="Amount"
              value={item.amount}
              onChange={(e) => updateItem(index, 'amount', e.target.value)}
              className="w-32"
            />
            {formData.items.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        ))}
        <div className="flex justify-end">
          <p className="text-sm font-medium">
            Total: ₵{totalAmount.toLocaleString()}
          </p>
        </div>
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
        <Button type="submit" loading={createLoading} loadingText="Creating...">
          Create Invoice
        </Button>
      </DialogFooter>
    </form>
  );
}
