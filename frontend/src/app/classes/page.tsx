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
  Trash2,
  BookOpen,
  Users,
  Eye,
  Loader2,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/apiService';
import { useClasses } from '@/hooks/useClasses';
import { DataNotFoundForEntity } from '@/components/ui/data-not-found';
import type { Class } from '@/types/academic';

export default function ClassesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast } = useToast();

  const { data: classes, loading, error, refetch } = useClasses();

  const handleDeleteClass = async () => {
    if (!deletingClass) return;
    setDeleteLoading(true);
    try {
      await apiService.deleteClass(deletingClass.id);
      toast({
        title: 'Success',
        description: 'Class deleted successfully',
      });
      refetch();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete class',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredClasses = (classes as Class[] | undefined)?.filter((cls) => {
    const matchesSearch =
      cls.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.grade.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  }) || [];

  const showNoData = !loading && !error && (!classes || classes.length === 0);
  const showNoResults = !loading && !error && classes && classes.length > 0 && filteredClasses.length === 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Classes</h1>
            <p className="text-gray-500">Manage class schedules and assignments</p>
            <p className="text-sm mt-1 text-accent-info">Organize classes, assign teachers, and manage student enrollment.</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl w-full mx-4">
              <DialogHeader>
                <DialogTitle>Add New Class</DialogTitle>
                <DialogDescription>
                  Create a new class with teacher assignment
                </DialogDescription>
              </DialogHeader>
              <AddClassForm onClose={() => setIsAddDialogOpen(false)} onSuccess={refetch} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-500">
                Total Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-accent-neutral">{filteredClasses.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-500">
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-accent-info">
                {filteredClasses.reduce((sum, cls) => sum + (cls.currentStrength || 0), 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-500">
                Avg Students/Class
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-accent-neutral">
                {filteredClasses.length > 0
                  ? Math.round(
                      filteredClasses.reduce((sum, cls) => sum + (cls.currentStrength || 0), 0) /
                        filteredClasses.length
                    )
                  : 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-500">
                Active Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-accent-success">
                {filteredClasses.filter(cls => cls.isActive).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Class List</CardTitle>
            <CardDescription>
              View and manage all classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by class name, teacher, or room..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="flex justify-center py-8">
                <div className="text-center space-y-2">
                  <p className="text-red-500">Error loading classes</p>
                  <Button variant="outline" onClick={refetch}>
                    Try Again
                  </Button>
                </div>
              </div>
            ) : showNoData ? (
              <DataNotFoundForEntity 
                entity="classes" 
                actionText="Add Your First Class"
                onAction={() => setIsAddDialogOpen(true)}
              />
            ) : showNoResults ? (
              <DataNotFoundForEntity 
                entity="classes" 
                actionText="Clear Search"
                onAction={() => setSearchQuery('')}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClasses.map((cls) => (
                  <Card key={cls.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{cls.className}</CardTitle>
                          <CardDescription>Grade {cls.grade}</CardDescription>
                        </div>
                        <Badge variant={cls.isActive ? "success" : "neutral"}>
                          {cls.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Students:</span>
                          <span className="text-gray-600">{cls.currentStrength || 0} / {cls.capacity || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Room:</span>
                          <span className="text-gray-600">{cls.roomNumber || "Not assigned"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Teacher:</span>
                          <span className="text-gray-600">{cls.classTeacherId ? "Teacher Assigned" : "Not assigned"}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 border-t">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-medium">{cls.className}</h4>
                              <p className="text-sm text-gray-600">Grade: {cls.grade}</p>
                              {/* Section removed */}
                              {cls.classTeacherId && <p className="text-sm text-gray-600">Teacher: Assigned</p>}
                              {cls.roomNumber && <p className="text-sm text-gray-600">Room: {cls.roomNumber}</p>}
                              <p className="text-sm text-gray-600">Students: {cls.currentStrength || 0} / {cls.capacity || 0}</p>
                              <p className="text-sm text-gray-600">Academic Year: {cls.academicYear}</p>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingClass(cls);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDeletingClass(cls);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Class Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Class</DialogTitle>
              <DialogDescription>
                Update class information
              </DialogDescription>
            </DialogHeader>
            {editingClass && (
              <EditClassForm
                classData={editingClass}
                onClose={() => setIsEditDialogOpen(false)}
                onSuccess={() => {
                  refetch();
                  setIsEditDialogOpen(false);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Class Alert */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Class</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {deletingClass?.className}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteClass}
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

function AddClassForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    classTeacherId: '',
    capacity: '',
    room: '',
  });
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await apiService.getTeachers({ limit: 100 });
        if (res.success) {
          // API returns { teachers, pagination }
          const list = (res.data as any)?.teachers ?? (res.data as any) ?? [];
          setTeachers(list);
        }
      } catch (err) {
        console.error('Failed to load teachers', err);
      } finally {
        setLoadingTeachers(false);
      }
    };
    fetchTeachers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const payload: any = {
        className: formData.name,
        grade: formData.grade,
        // Only include classTeacherId if provided
        ...(formData.classTeacherId ? { classTeacherId: formData.classTeacherId } : {}),
        capacity: parseInt(formData.capacity),
        roomNumber: formData.room,
        subjects: [],
        academicYear: '2024-2025',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Partial<Class>;
      await apiService.createClass(payload);
      toast({
        title: 'Success',
        description: 'Class created successfully',
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create class',
        variant: 'destructive',
      });
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Class Name *</Label>
          <Input
            id="name"
            required
            placeholder="e.g., Class 5A"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="grade">Grade *</Label>
          <Select
            value={formData.grade}
            onValueChange={(value) =>
              setFormData({ ...formData, grade: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Grade 1</SelectItem>
              <SelectItem value="2">Grade 2</SelectItem>
              <SelectItem value="3">Grade 3</SelectItem>
              <SelectItem value="4">Grade 4</SelectItem>
              <SelectItem value="5">Grade 5</SelectItem>
              <SelectItem value="6">Grade 6</SelectItem>
              <SelectItem value="JHS1">JHS 1</SelectItem>
              <SelectItem value="JHS2">JHS 2</SelectItem>
              <SelectItem value="JHS3">JHS 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="teacherId">Class Teacher</Label>
          <Select
            value={formData.classTeacherId}
            onValueChange={(value) =>
              setFormData({ ...formData, classTeacherId: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select teacher" />
            </SelectTrigger>
            <SelectContent>
              {loadingTeachers ? (
                <SelectItem value="loading" disabled>
                  Loading teachers...
                </SelectItem>
              ) : teachers.length === 0 ? (
                <SelectItem value="none" disabled>
                  No teachers found
                </SelectItem>
              ) : (
                teachers.map((t: any) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.firstName && t.lastName ? `${t.firstName} ${t.lastName}` : (t.name || t.email || t.id)}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity *</Label>
          <Input
            id="capacity"
            type="number"
            required
            placeholder="e.g., 35"
            value={formData.capacity}
            onChange={(e) =>
              setFormData({ ...formData, capacity: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="room">Room *</Label>
          <Input
            id="room"
            required
            placeholder="e.g., Room 101"
            value={formData.room}
            onChange={(e) =>
              setFormData({ ...formData, room: e.target.value })
            }
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={createLoading} loadingText="Creating...">
          Add Class
        </Button>
      </DialogFooter>
    </form>
  );
}

function EditClassForm({ classData, onClose, onSuccess }: { classData: Class; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    className: classData.className || '',
    grade: classData.grade || '',
    classTeacherId: classData.classTeacherId || '',
    capacity: classData.capacity?.toString() || '',
    roomNumber: classData.roomNumber || '',
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);

  // Sync form with latest classData when dialog opens for a different class
  useEffect(() => {
    setFormData({
      className: classData.className || '',
      grade: classData.grade || '',
      classTeacherId: classData.classTeacherId || '',
      capacity: classData.capacity?.toString() || '',
      roomNumber: classData.roomNumber || '',
    });
  }, [classData]);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await apiService.getTeachers({ limit: 100 });
        if (res.success) {
          const list = (res.data as any)?.teachers ?? (res.data as any) ?? [];
          setTeachers(list);
        }
      } catch (err) {
        console.error('Failed to load teachers', err);
      } finally {
        setLoadingTeachers(false);
      }
    };
    fetchTeachers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      await apiService.updateClass(classData.id, {
        className: formData.className,
        grade: formData.grade,
        classTeacherId: formData.classTeacherId,
        capacity: parseInt(formData.capacity),
        roomNumber: formData.roomNumber,
        subjects: classData.subjects || [],
        academicYear: classData.academicYear || '2024-2025',
        currentStrength: classData.currentStrength || 0,
        isActive: classData.isActive !== undefined ? classData.isActive : true,
        createdAt: classData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Partial<Class>);
      toast({
        title: 'Success',
        description: 'Class updated successfully',
      });
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update class',
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
          <Label htmlFor="edit-name">Class Name *</Label>
          <Input
            id="edit-name"
            required
            placeholder="e.g., Class 5A"
            value={formData.className}
            onChange={(e) =>
              setFormData({ ...formData, className: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-grade">Grade *</Label>
          <Select
            value={formData.grade}
            onValueChange={(value) =>
              setFormData({ ...formData, grade: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Grade 1</SelectItem>
              <SelectItem value="2">Grade 2</SelectItem>
              <SelectItem value="3">Grade 3</SelectItem>
              <SelectItem value="4">Grade 4</SelectItem>
              <SelectItem value="5">Grade 5</SelectItem>
              <SelectItem value="6">Grade 6</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-teacherId">Class Teacher</Label>
          <Select
            value={formData.classTeacherId || ''}
            onValueChange={(value) =>
              setFormData({ ...formData, classTeacherId: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select teacher" />
            </SelectTrigger>
            <SelectContent>
              {loadingTeachers ? (
                <SelectItem value="loading" disabled>
                  Loading teachers...
                </SelectItem>
              ) : teachers.length === 0 ? (
                <SelectItem value="none" disabled>
                  No teachers found
                </SelectItem>
              ) : (
                teachers.map((t: any) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.firstName && t.lastName ? `${t.firstName} ${t.lastName}` : (t.name || t.email || t.id)}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-capacity">Capacity *</Label>
          <Input
            id="edit-capacity"
            type="number"
            required
            placeholder="e.g., 35"
            value={formData.capacity}
            onChange={(e) =>
              setFormData({ ...formData, capacity: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-room">Room</Label>
          <Input
            id="edit-room"
            placeholder="e.g., Room 101"
            value={formData.roomNumber || ''}
            onChange={(e) =>
              setFormData({ ...formData, roomNumber: e.target.value })
            }
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={updateLoading} loadingText="Updating...">
          Update Class
        </Button>
      </DialogFooter>
    </form>
  );
}