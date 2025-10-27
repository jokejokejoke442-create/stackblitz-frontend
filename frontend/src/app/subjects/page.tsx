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
import { useApi } from '@/hooks/useApi';
import { DataNotFoundForEntity } from '@/components/ui/data-not-found';
import { useSubjects } from '../..//hooks/useSubjects';
import { useTeachers } from '../..//hooks/useTeachers';

export default function SubjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [deletingSubject, setDeletingSubject] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast } = useToast();

  const { data: subjects, loading, error, refetch } = useSubjects();

  const handleDeleteSubject = async () => {
    if (!deletingSubject) return;
    setDeleteLoading(true);
    try {
      await apiService.deleteSubject(deletingSubject.id);
      toast({
        title: 'Success',
        description: 'Subject deleted successfully',
      });
      refetch();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete subject',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredSubjects = (subjects || []).filter((subject: any) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subject.teacher && subject.teacher.toLowerCase().includes(searchQuery.toLowerCase())) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const showNoData = !loading && !error && (!subjects || subjects.length === 0);
  const showNoResults = !loading && !error && subjects && subjects.length > 0 && filteredSubjects.length === 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Subjects</h1>
            <p className="text-gray-500">Manage academic subjects and curriculum</p>
            <p className="text-sm mt-1 text-accent-info">Create and organize subjects, assign teachers, and manage schedules.</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl w-full mx-4">
              <DialogHeader>
                <DialogTitle>Add New Subject</DialogTitle>
                <DialogDescription>
                  Create a new subject with teacher assignment
                </DialogDescription>
              </DialogHeader>
              <AddSubjectForm onClose={() => setIsAddDialogOpen(false)} onSuccess={refetch} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-500">
                Total Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-accent-neutral">{filteredSubjects.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-500">
                Avg Students/Subject
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-accent-info">
                {filteredSubjects.length > 0
                  ? Math.round(
                      filteredSubjects.reduce((sum: number, subj: any) => sum + (subj.students || 0), 0) /
                        filteredSubjects.length
                    )
                  : 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-500">
                Active Teachers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-accent-success">
                {new Set(filteredSubjects.map((subj: any) => subj.teacherId)).size}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-500">
                Assigned Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-accent-warn">
                {filteredSubjects.filter((subj: any) => subj.teacherId).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Subject List</CardTitle>
            <CardDescription>
              View and manage all subjects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by subject name, teacher, or code..."
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
                  <p className="text-red-500">Error loading subjects</p>
                  <Button variant="outline" onClick={refetch}>
                    Try Again
                  </Button>
                </div>
              </div>
            ) : showNoData ? (
              <DataNotFoundForEntity 
                entity="subjects" 
                actionText="Add Your First Subject"
                onAction={() => setIsAddDialogOpen(true)}
              />
            ) : showNoResults ? (
              <DataNotFoundForEntity 
                entity="subjects" 
                actionText="Clear Search"
                onAction={() => setSearchQuery('')}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubjects.map((subject) => (
                  <Card key={subject.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{subject.name}</CardTitle>
                          <CardDescription>{subject.code}</CardDescription>
                        </div>
                        <Badge variant="outline">
                          Grade {subject.grade}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Teacher:</span>
                          <span className="text-gray-600">{subject.teacher}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Students:</span>
                          <span className="text-gray-600">{subject.students}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600 text-xs">{subject.schedule}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">{subject.description}</p>
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
                              <h4 className="font-medium">{subject.name}</h4>
                              <p className="text-sm text-gray-600">Code: {subject.code}</p>
                              {subject.grade && <p className="text-sm text-gray-600">Grade: {subject.grade}</p>}
                              {subject.teacher && <p className="text-sm text-gray-600">Teacher: {subject.teacher}</p>}
                              {subject.students !== undefined && <p className="text-sm text-gray-600">Students: {subject.students}</p>}
                              {subject.schedule && <p className="text-sm text-gray-600">Schedule: {subject.schedule}</p>}
                              {subject.description && <p className="text-sm text-gray-600">{subject.description}</p>}
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSubject(subject);
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
                            setDeletingSubject(subject);
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

        {/* Edit Subject Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Subject</DialogTitle>
              <DialogDescription>
                Update subject information
              </DialogDescription>
            </DialogHeader>
            <EditSubjectForm
              subjectData={editingSubject}
              onClose={() => setIsEditDialogOpen(false)}
              onSuccess={() => {
                refetch();
                setIsEditDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Subject Alert */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Subject</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {deletingSubject?.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSubject}
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

function AddSubjectForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    teacherId: '',
    grade: '',
    schedule: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const { toast } = useToast();
  const { data: teachers } = useTeachers();
  const [scheduleDays, setScheduleDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');

  const days = [
    { id: 'Mon', label: 'Mon' },
    { id: 'Tue', label: 'Tue' },
    { id: 'Wed', label: 'Wed' },
    { id: 'Thu', label: 'Thu' },
    { id: 'Fri', label: 'Fri' },
    { id: 'Sat', label: 'Sat' },
    { id: 'Sun', label: 'Sun' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      if (!formData.grade) {
        toast({ title: 'Missing grade', description: 'Please select a grade.', variant: 'destructive' });
        setCreateLoading(false);
        return;
      }
      const scheduleString =
        scheduleDays.length > 0 && startTime && endTime
          ? `${scheduleDays.join(', ')} ${startTime} - ${endTime}`
          : formData.schedule;
      await apiService.createSubject({
        name: formData.name,
        code: formData.code,
        description: formData.description,
        teacherId: formData.teacherId,
        grade: formData.grade,
        schedule: scheduleString,
      });
      toast({
        title: 'Success',
        description: 'Subject created successfully',
      });
      onSuccess();
      onClose();
    } catch (error) {
      const anyErr: any = error as any;
      const msg = anyErr?.response?.data?.message || anyErr?.message || 'Failed to create subject';
      const details = anyErr?.response?.data?.details?.join?.('\n');
      console.error('Subject create error:', anyErr?.response?.data || anyErr);
      toast({
        title: 'Error',
        description: details ? `${msg}\n${details}` : msg,
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
          <Label htmlFor="name">Subject Name *</Label>
          <Input
            id="name"
            required
            placeholder="e.g., Mathematics"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">Subject Code *</Label>
          <Input
            id="code"
            required
            placeholder="e.g., MATH101"
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value })
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
          <Label htmlFor="teacherId">Subject Teacher *</Label>
          <Select
            value={formData.teacherId}
            onValueChange={(value) =>
              setFormData({ ...formData, teacherId: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select teacher" />
            </SelectTrigger>
            <SelectContent>
              {teachers && teachers.length > 0 ? (
                teachers.map((teacher: any) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-teachers" disabled>
                  No teachers available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Brief description of the subject"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <Label>Schedule</Label>
        <div className="flex flex-wrap gap-2">
          {days.map((d) => (
            <label key={d.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={scheduleDays.includes(d.id)}
                onChange={(e) => {
                  setScheduleDays((prev) =>
                    e.target.checked ? [...prev, d.id] : prev.filter((x) => x !== d.id)
                  );
                }}
              />
              {d.label}
            </label>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="space-y-1">
            <Label>Starts</Label>
            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Ends</Label>
            <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={createLoading} loadingText="Creating...">
          Add Subject
        </Button>
      </DialogFooter>
    </form>
  );
}

function EditSubjectForm({ subjectData, onClose, onSuccess }: { subjectData: any; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: subjectData?.name || '',
    code: subjectData?.code || '',
    description: subjectData?.description || '',
    teacherId: subjectData?.teacherId || subjectData?.teacher_id || '',
    grade: subjectData?.grade || subjectData?.grade_level || '',
    schedule: subjectData?.schedule || '',
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const { toast } = useToast();
  const { data: teachers } = useTeachers();
  const [scheduleDays, setScheduleDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');

  const days = [
    { id: 'Mon', label: 'Mon' },
    { id: 'Tue', label: 'Tue' },
    { id: 'Wed', label: 'Wed' },
    { id: 'Thu', label: 'Thu' },
    { id: 'Fri', label: 'Fri' },
    { id: 'Sat', label: 'Sat' },
    { id: 'Sun', label: 'Sun' },
  ];

  // Try to prefill schedule pickers from existing schedule string like "Mon, Wed 09:00 - 10:00"
  useEffect(() => {
    const s = (subjectData?.schedule || '').trim();
    // naive parse: split by space last 3 tokens for times
    // e.g., "Mon, Wed 09:00 - 10:00"
    const match = s.match(/^(.*)\s+(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})$/);
    if (match) {
      const dayPart = match[1];
      const start = match[2];
      const end = match[3];
      const parsedDays = dayPart
        .split(',')
        .map((d) => d.trim())
        .filter((d) => days.some((x) => x.id === d));
      if (parsedDays.length) setScheduleDays(parsedDays);
      if (start) setStartTime(start);
      if (end) setEndTime(end);
    }
  }, [subjectData]);

  // Keep form in sync if a different subject is selected (including teacher/grade)
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: subjectData?.name || '',
      code: subjectData?.code || '',
      description: subjectData?.description || '',
      teacherId: subjectData?.teacherId || subjectData?.teacher_id || '',
      grade: subjectData?.grade || subjectData?.grade_level || '',
      schedule: subjectData?.schedule || '',
    }));
  }, [subjectData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      const scheduleString =
        scheduleDays.length > 0 && startTime && endTime
          ? `${scheduleDays.join(', ')} ${startTime} - ${endTime}`
          : formData.schedule;
      await apiService.updateSubject(subjectData.id, {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        teacherId: formData.teacherId,
        grade: formData.grade,
        schedule: scheduleString,
      });
      toast({
        title: 'Success',
        description: 'Subject updated successfully',
      });
      onSuccess();
      onClose();
    } catch (error) {
      const anyErr: any = error as any;
      const msg = anyErr?.response?.data?.message || anyErr?.message || 'Failed to update subject';
      const details = anyErr?.response?.data?.details?.join?.('\n');
      console.error('Subject update error:', anyErr?.response?.data || anyErr);
      toast({
        title: 'Error',
        description: details ? `${msg}\n${details}` : msg,
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
          <Label htmlFor="edit-name">Subject Name *</Label>
          <Input
            id="edit-name"
            required
            placeholder="e.g., Mathematics"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-code">Subject Code *</Label>
          <Input
            id="edit-code"
            required
            placeholder="e.g., MATH101"
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value })
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
              <SelectItem value="JHS1">JHS 1</SelectItem>
              <SelectItem value="JHS2">JHS 2</SelectItem>
              <SelectItem value="JHS3">JHS 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-teacherId">Subject Teacher *</Label>
          <Select
            value={formData.teacherId}
            onValueChange={(value) =>
              setFormData({ ...formData, teacherId: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select teacher" />
            </SelectTrigger>
            <SelectContent>
              {teachers && teachers.length > 0 ? (
                teachers.map((teacher: any) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-teachers" disabled>
                  No teachers available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-description">Description</Label>
        <Input
          id="edit-description"
          placeholder="Brief description of the subject"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>
      <div className="space-y-2">
        <Label>Schedule</Label>
        <div className="flex flex-wrap gap-2">
          {days.map((d) => (
            <label key={d.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={scheduleDays.includes(d.id)}
                onChange={(e) => {
                  setScheduleDays((prev) =>
                    e.target.checked ? [...prev, d.id] : prev.filter((x) => x !== d.id)
                  );
                }}
              />
              {d.label}
            </label>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="space-y-1">
            <Label>Starts</Label>
            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Ends</Label>
            <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={updateLoading} loadingText="Updating...">
          Update Subject
        </Button>
      </DialogFooter>
    </form>
  );
}