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
  Edit,
  Trash2,
  Eye,
  Download,
  Filter,
  Loader2,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/apiService';
import { DataNotFoundForEntity } from '@/components/ui/data-not-found';
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
import type { Guardian } from '@/types'; // Import Guardian type

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [deletingStudent, setDeletingStudent] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await apiService.getClasses();
      if (response.success) {
        const classData = (response.data || []).map((cls: any) => ({
          id: cls.id,
          className: cls.class_name || cls.className || 'Unnamed Class',
        }));
        setClasses(classData);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await apiService.getStudents();
      if (response.success) {
        const raw = response.data as any;
        const list = Array.isArray(raw) ? raw : (raw?.students || []);
        console.log('Raw student data:', list[0]); // Debug: Check first student
        const normalized = list.map((s: any) => {
          const user = s.users || s.user || {};
          const cls = s.classes || s.class || {};
          console.log('Student class data:', { studentId: s.student_id, cls, class_id: s.class_id }); // Debug
          const addr = s.address;
          const addressStr = typeof addr === 'object' && addr !== null
            ? [addr.street, addr.city, [addr.state, addr.postalCode].filter(Boolean).join(' ')].filter(Boolean).join(', ')
            : (addr || '');
          // Handle guardian data from JSONB column
          const guardianData = s.guardian || {};
          const guardianName = guardianData.name || s.guardian_name || s.guardianName || '';
          const guardianPhone = guardianData.phone || s.guardian_phone || s.guardianPhone || '';
          const guardianEmail = guardianData.email || s.guardian_email || s.guardianEmail || '';

          // Extract class information - prioritize the joined classes table data
          const className = cls?.class_name || cls?.className || '';
          const classId = cls?.id || s.class_id || '';

          return {
            id: s.id,
            firstName: s.first_name || s.firstName || '',
            lastName: s.last_name || s.lastName || '',
            email: s.email || user.email || '',
            phone: s.phone || '',
            dateOfBirth: s.date_of_birth || s.dateOfBirth || '',
            // keep gender lowercase for Select prefill; capitalize only when displaying
            gender: (s.gender || '').toString().toLowerCase(),
            address: addressStr,
            studentId: s.student_id || s.studentId || '',
            class: className,
            classId: classId,
            profileImage: user.profile_image_url || '',
            status: s.is_active === false ? 'inactive' : 'active',
            guardianName: guardianName,
            guardianPhone: guardianPhone,
            guardianEmail: guardianEmail,
            guardian: {
              firstName: guardianName.split(' ')[0] || '',
              lastName: guardianName.split(' ').slice(1).join(' ') || '',
              phone: guardianPhone,
              email: guardianEmail,
            },
          };
        });
        setStudents(normalized);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch students',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      (student.firstName && student.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.lastName && student.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.studentId && student.studentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (student.email && student.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesClass =
      filterClass === 'all' || (student.classId && student.classId === filterClass);

    return matchesSearch && matchesClass;
  });

  const handleDeleteStudent = async () => {
    if (!deletingStudent) return;
    setDeleteLoading(true);
    try {
      await apiService.deleteStudent(deletingStudent.id);
      toast({
        title: 'Success',
        description: 'Student deleted successfully',
      });
      fetchStudents();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete student',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Students</h1>
            <p className="text-gray-500">Manage student records and information</p>
            <p className="text-sm mt-1 text-accent-info">Use filters and search to quickly locate specific students.</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl w-full mx-4">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Enter student information to create a new record
                </DialogDescription>
              </DialogHeader>
              <AddStudentForm
                onClose={() => setIsAddDialogOpen(false)}
                onSuccess={fetchStudents}
                onError={(message) => {
                  setErrorMessage(message);
                  setErrorModalOpen(true);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-500">
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-accent-neutral">{students.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-500">
                Active Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-accent-success">
                {students.filter((s) => s.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-500">
                Male Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-accent-info">
                {students.filter((s) => (s.gender || '').toLowerCase() === 'male').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-500">
                Female Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-accent-warn">
                {students.filter((s) => (s.gender || '').toLowerCase() === 'female').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Student List</CardTitle>
            <CardDescription>
              View and manage all student records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by name, ID, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" loading={loading} loadingText="Exporting..." className="w-full md:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>

            {/* Table */}
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredStudents.length === 0 && searchQuery === '' && filterClass === 'all' ? (
              <DataNotFoundForEntity 
                entity="students" 
                actionText="Add Your First Student"
                onAction={() => setIsAddDialogOpen(true)}
              />
            ) : filteredStudents.length === 0 ? (
              <DataNotFoundForEntity 
                entity="students" 
                actionText="Clear Search"
                onAction={() => {
                  setSearchQuery('');
                  setFilterClass('all');
                }}
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Student</TableHead>
                      <TableHead className="min-w-[100px]">Student ID</TableHead>
                      <TableHead className="min-w-[120px]">Class</TableHead>
                      <TableHead className="min-w-[120px]">Contact</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="text-right min-w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={student.profileImage} />
                              <AvatarFallback className="h-8 w-8 text-xs">
                                {getInitials(student.firstName, student.lastName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">
                                {student.firstName} {student.lastName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {student.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{student.studentId}</TableCell>
                        <TableCell className="text-sm">
                          {classes.find((c) => c.id === student.classId)?.className || student.class || 'Not assigned'}
                        </TableCell>
                        <TableCell className="text-sm">{student.phone}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              student.status === 'active' ? 'success' : student.status === 'suspended' ? 'crit' : 'neutral'
                            }
                            className="text-xs"
                          >
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-72">
                                <div className="space-y-2">
                                  <h4 className="font-medium text-sm">{student.firstName} {student.lastName}</h4>
                                  <p className="text-xs text-gray-600">ID: {student.studentId}</p>
                                  <p className="text-xs text-gray-600">Email: {student.email}</p>
                                  <p className="text-xs text-gray-600">Phone: {student.phone}</p>
                                  <p className="text-xs text-gray-600">Class: {classes.find((c) => c.id === student.classId)?.className || student.class || 'Not assigned'}</p>
                                  <p className="text-xs text-gray-600">Gender: {student.gender}</p>
                                  <p className="text-xs text-gray-600">DOB: {student.dateOfBirth}</p>
                                  <p className="text-xs text-gray-600">Status: {student.status}</p>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 p-0"
                              title="Edit"
                              onClick={() => {
                                setEditingStudent(student);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 p-0"
                              title="Delete"
                              onClick={() => {
                                setDeletingStudent(student);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Student Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>
                Update student information
              </DialogDescription>
            </DialogHeader>
            <EditStudentForm
              student={editingStudent}
              onClose={() => setIsEditDialogOpen(false)}
              onSuccess={() => {
                fetchStudents();
                setIsEditDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Student Alert */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Student</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {deletingStudent?.firstName} {deletingStudent?.lastName}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteStudent}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Error Modal */}
        <Dialog open={errorModalOpen} onOpenChange={setErrorModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Error</DialogTitle>
              <DialogDescription>
                {errorMessage}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setErrorModalOpen(false)}>OK</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function EditStudentForm({ student, onClose, onSuccess }: { student: any; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    firstName: student?.firstName || '',
    lastName: student?.lastName || '',
    email: student?.email || '',
    phone: student?.phone || '',
    dateOfBirth: student?.dateOfBirth || '',
    gender: student?.gender || '',
    class: student?.classId || '',
    guardianName: student?.guardianName || '',
    guardianPhone: student?.guardianPhone || '',
    guardianEmail: student?.guardianEmail || '',
    address: student?.address || '',
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const { toast } = useToast();

  // Fetch classes when component mounts
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await apiService.getClasses();
        if (response.success) {
          setClasses(response.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch classes:', error);
        toast({
          title: 'Error',
          description: 'Failed to load classes',
          variant: 'destructive',
        });
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  // Update form data when student prop changes
  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        email: student.email || '',
        phone: student.phone || '',
        dateOfBirth: student.dateOfBirth || '',
        gender: student.gender || '',
        class: student.classId || '',
        guardianName: student.guardianName || '',
        guardianPhone: student.guardianPhone || '',
        guardianEmail: student.guardianEmail || '',
        address: student.address || '',
      });
    }
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      // Transform form data to match API requirements
      const transformedData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone,
        guardianEmail: formData.guardianEmail,
      };

      // Conditionally add fields that might not exist in DB
      if (formData.email) transformedData.email = formData.email;
      if (formData.phone) transformedData.phone = formData.phone;

      // Add address as a string
      if (formData.address && typeof formData.address === 'string') {
        transformedData.address = formData.address;
      }

      // Add classId if it's a valid UUID
      if (formData.class) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(formData.class)) {
          transformedData.classId = formData.class;
        }
      }

      await apiService.updateStudent(student.id, transformedData);
      toast({
        title: 'Success',
        description: 'Student updated successfully',
      });
      onSuccess();
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update student',
        variant: 'destructive',
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            required
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            required
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            required
            value={formData.dateOfBirth}
            onChange={(e) =>
              setFormData({ ...formData, dateOfBirth: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) =>
              setFormData({ ...formData, gender: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="class">Class *</Label>
          <Select
            value={formData.class}
            onValueChange={(value) =>
              setFormData({ ...formData, class: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {loadingClasses ? (
                <SelectItem value="loading" disabled>
                  Loading classes...
                </SelectItem>
              ) : (
                classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.className}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="guardianName">Guardian Name *</Label>
          <Input
            id="guardianName"
            required
            value={formData.guardianName}
            onChange={(e) =>
              setFormData({ ...formData, guardianName: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="guardianPhone">Guardian Phone *</Label>
          <Input
            id="guardianPhone"
            required
            value={formData.guardianPhone}
            onChange={(e) =>
              setFormData({ ...formData, guardianPhone: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="guardianEmail">Guardian Email</Label>
          <Input
            id="guardianEmail"
            type="email"
            value={formData.guardianEmail}
            onChange={(e) =>
              setFormData({ ...formData, guardianEmail: e.target.value })
            }
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          placeholder="Street, City, State PostalCode"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={updateLoading} loadingText="Updating...">
          Update Student
        </Button>
      </DialogFooter>
    </form>
  );
}

function AddStudentForm({ onClose, onSuccess, onError }: { onClose: () => void; onSuccess: () => void; onError?: (message: string) => void }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    class: '',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    address: '',
  });
  const [classes, setClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const { toast } = useToast();

  // Fetch classes when component mounts
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await apiService.getClasses();
        if (response.success) {
          setClasses(response.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch classes:', error);
        toast({
          title: 'Error',
          description: 'Failed to load classes',
          variant: 'destructive',
        });
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  // Transform frontend form data to backend required format (flat fields)
  const transformStudentData = (data: any) => {
    const transformedData: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      address: data.address, // backend stores address as a string
      guardianName: data.guardianName,
      guardianPhone: data.guardianPhone,
      guardianEmail: data.guardianEmail,
      admissionDate: new Date().toISOString().split('T')[0],
      academicYear: '2024-2025'
    };

    if (data.email) transformedData.email = data.email;
    if (data.phone) transformedData.phone = data.phone;

    // Add classId if it's a valid UUID
    if (data.class && data.class.length > 0) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(data.class)) transformedData.classId = data.class;
      // Also send className so backend can store name if only 'class' column exists
      const selected = classes.find(c => c.id === data.class);
      if (selected?.className) transformedData.className = selected.className;
    } else if (data.class) {
      // If value isn't a UUID, treat it as a name
      transformedData.className = data.class;
    }

    return transformedData;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const transformedData = transformStudentData(formData);
      await apiService.createStudent(transformedData as any);
      toast({
        title: 'Success',
        description: 'Student created successfully',
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      const status = error.response?.status;
      const message = error.response?.data?.message || 'Failed to create student';
      if (status === 400 || status === 409 || status === 422) {
        if (onError) {
          onError(message);
        } else {
          setErrorMessage(message);
          setErrorModalOpen(true);
        }
      } else {
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      }
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            required
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            required
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            required
            value={formData.dateOfBirth}
            onChange={(e) =>
              setFormData({ ...formData, dateOfBirth: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) =>
              setFormData({ ...formData, gender: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="class">Class *</Label>
          <Select
            value={formData.class}
            onValueChange={(value) =>
              setFormData({ ...formData, class: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {loadingClasses ? (
                <SelectItem value="loading" disabled>
                  Loading classes...
                </SelectItem>
              ) : (
                classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.className}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="guardianName">Guardian Name *</Label>
          <Input
            id="guardianName"
            required
            value={formData.guardianName}
            onChange={(e) =>
              setFormData({ ...formData, guardianName: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="guardianPhone">Guardian Phone *</Label>
          <Input
            id="guardianPhone"
            required
            value={formData.guardianPhone}
            onChange={(e) =>
              setFormData({ ...formData, guardianPhone: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="guardianEmail">Guardian Email</Label>
          <Input
            id="guardianEmail"
            type="email"
            value={formData.guardianEmail}
            onChange={(e) =>
              setFormData({ ...formData, guardianEmail: e.target.value })
            }
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          placeholder="Street, City, State PostalCode"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={createLoading} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
          {createLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Add Student
        </Button>
      </DialogFooter>
    </form>
  );
}


