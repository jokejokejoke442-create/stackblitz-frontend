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
  Download,
  TrendingUp,
  TrendingDown,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { apiService } from '@/services/apiService';
import { DataNotFoundForEntity } from '@/components/ui/data-not-found';

export default function GradesPage() {
  const [grades, setGrades] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchGrades(); // Fetch all grades on initial load
  }, []);

  useEffect(() => {
    // Fetch grades when filters change (but skip initial render since we fetch in the first useEffect)
    fetchGrades();
  }, [selectedClass, selectedSubject]);

  const fetchClasses = async () => {
    try {
      const response = await apiService.getClasses();
      if (response.success && response.data) {
        setClasses(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await apiService.getSubjects();
      if (response.success && response.data) {
        setSubjects(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    }
  };

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedClass !== 'all') params.classId = selectedClass;
      if (selectedSubject !== 'all') params.subjectId = selectedSubject;
      const response = await apiService.getGrades(params);
      if (response.success) {
        // Handle both response formats: {grades: [], pagination: {}} or just []
        let gradesData: any[] = [];
        if (Array.isArray(response.data)) {
          gradesData = response.data;
        } else if (response.data?.grades && Array.isArray(response.data.grades)) {
          gradesData = response.data.grades;
        }
        setGrades(gradesData);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error('Fetch grades error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch grades',
        variant: 'destructive',
      });
      // Set to empty array on error to prevent further issues
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredGrades = grades.filter((grade) => {
    const matchesSearch =
      grade.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grade.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grade.studentId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass = selectedClass === 'all' || grade.class === selectedClass;
    const matchesSubject =
      selectedSubject === 'all' || grade.subject === selectedSubject;

    return matchesSearch && matchesClass && matchesSubject;
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getGradeVariant = (grade: string) => {
    if (grade === 'A' || grade === 'A+') return 'success' as const;
    if (grade === 'B' || grade === 'B+') return 'info' as const;
    if (grade === 'C' || grade === 'C+') return 'warn' as const;
    return 'crit' as const;
  };

  const avgScore =
    grades.length > 0
      ? Math.round(
          grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) /
            grades.length
        )
      : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Grades</h1>
            <p className="text-gray-500">Manage student grades and assessments</p>
            <p className="text-sm mt-1 text-accent-info">Track student performance and academic progress.</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Grade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl w-full mx-4">
              <DialogHeader>
                <DialogTitle>Add New Grade</DialogTitle>
                <DialogDescription>
                  Enter grade information for a student
                </DialogDescription>
              </DialogHeader>
              <AddGradeForm
                onClose={() => setIsAddDialogOpen(false)}
                onSuccess={fetchGrades}
                classes={classes}
                subjects={subjects}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-500">
                Total Grades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-accent-neutral">{grades.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-500">
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-accent-success">{avgScore}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-500">
                A Grades
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-accent-success">
                {grades.filter((g) => g.grade.startsWith('A')).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-500">
                Below Average
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-accent-crit">
                {grades.filter((g) => (g.score / g.maxScore) * 100 < 60).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grades List */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Records</CardTitle>
            <CardDescription>View and manage all grade records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by student name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {classItem.className || classItem.class_name || 'Unnamed Class'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" loading={loading} loadingText="Exporting..." className="w-full md:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredGrades.length === 0 && searchQuery === '' && selectedClass === 'all' && selectedSubject === 'all' ? (
              <DataNotFoundForEntity entity="grades" actionText="Add First Grade" onAction={() => setIsAddDialogOpen(true)} />
            ) : filteredGrades.length === 0 ? (
              <DataNotFoundForEntity entity="grades" actionText="Clear Search" onAction={() => {
                setSearchQuery('');
                setSelectedClass('all');
                setSelectedSubject('all');
              }} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGrades.map((grade) => (
                    <TableRow key={grade.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={grade.profileImage} />
                            <AvatarFallback className="text-xs">
                              {getInitials(grade.firstName, grade.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">
                              {grade.firstName} {grade.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {grade.studentId}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{grade.class}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{grade.subject}</Badge>
                      </TableCell>
                      <TableCell>{grade.assessment}</TableCell>
                      <TableCell>
                        {grade.score}/{grade.maxScore} (
                        {Math.round((grade.score / grade.maxScore) * 100)}%)
                      </TableCell>
                      <TableCell>
                        <Badge variant={getGradeVariant(grade.grade)}>
                          {grade.grade}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {grade.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit"
                          onClick={() => {
                            setEditingGrade(grade);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Grade Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Grade</DialogTitle>
              <DialogDescription>
                Update grade information
              </DialogDescription>
            </DialogHeader>
            <EditGradeForm
              grade={editingGrade}
              onClose={() => setIsEditDialogOpen(false)}
              onSuccess={() => {
                fetchGrades();
                setIsEditDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function EditGradeForm({
  grade,
  onClose,
  onSuccess,
}: {
  grade: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    score: grade?.score?.toString() || '',
    maxScore: grade?.maxScore?.toString() || '100',
    assessment: grade?.assessment || '',
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      await apiService.updateGrade(grade.id, {
        score: parseInt(formData.score),
        maxScore: parseInt(formData.maxScore),
        type: formData.assessment,
      });
      toast({
        title: 'Success',
        description: 'Grade updated successfully',
      });
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update grade',
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
          <Label htmlFor="score">Score *</Label>
          <Input
            id="score"
            type="number"
            required
            value={formData.score}
            onChange={(e) => setFormData({ ...formData, score: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxScore">Max Score *</Label>
          <Input
            id="maxScore"
            type="number"
            required
            value={formData.maxScore}
            onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
          />
        </div>
        <div className="space-y-2 col-span-2">
          <Label htmlFor="assessment">Assessment Type *</Label>
          <Input
            id="assessment"
            required
            value={formData.assessment}
            onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={updateLoading} loadingText="Updating...">
          Update Grade
        </Button>
      </DialogFooter>
    </form>
  );
}

function AddGradeForm({
  onClose,
  onSuccess,
  classes,
  subjects,
}: {
  onClose: () => void;
  onSuccess: () => void;
  classes: any[];
  subjects: any[];
}) {
  const [formData, setFormData] = useState({
    studentId: '',
    subjectId: '',
    score: '',
    maxScore: '100',
    type: '',
    classId: '',
  });
  const [students, setStudents] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (formData.classId) {
      fetchStudents(formData.classId);
    } else {
      setStudents([]);
    }
  }, [formData.classId]);

  const fetchStudents = async (classId: string) => {
    try {
      setLoadingStudents(true);
      const response = await apiService.getStudents({ classId });
      if (response.success) {
        const studentData = Array.isArray(response.data) 
          ? response.data 
          : response.data?.students || [];
        setStudents(studentData);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      // Get the classId for the selected student
      let classId = formData.classId;
      
      // If classId is not set but we have a studentId, fetch the student to get their classId
      if (!classId && formData.studentId) {
        try {
          const studentResponse = await apiService.getStudent(formData.studentId);
          if (studentResponse.success && studentResponse.data) {
            classId = (studentResponse.data as any).class?.id || (studentResponse.data as any).classId;
          }
        } catch (studentError) {
          console.error('Failed to fetch student data:', studentError);
        }
      }
      
      if (!classId) {
        toast({
          title: 'Error',
          description: 'Unable to determine student class. Please select a class.',
          variant: 'destructive',
        });
        setCreateLoading(false);
        return;
      }

      await apiService.createGrade({
        studentId: formData.studentId,
        subjectId: formData.subjectId,
        classId: classId,
        score: parseInt(formData.score),
        maxScore: parseInt(formData.maxScore),
        type: formData.type,
      });
      toast({
        title: 'Success',
        description: 'Grade created successfully',
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create grade',
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
          <Label htmlFor="classId">Class *</Label>
          <Select
            value={formData.classId}
            onValueChange={(value) =>
              setFormData({ ...formData, classId: value, studentId: '' })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select class first" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((classItem) => (
                <SelectItem key={classItem.id} value={classItem.id}>
                  {classItem.className || classItem.class_name || 'Unnamed Class'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="studentId">Student *</Label>
          <Select
            value={formData.studentId}
            onValueChange={(value) =>
              setFormData({ ...formData, studentId: value })
            }
            disabled={!formData.classId || loadingStudents}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingStudents ? "Loading..." : formData.classId ? "Select student" : "Select class first"} />
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
                  No students in this class
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="subjectId">Subject *</Label>
          <Select
            value={formData.subjectId}
            onValueChange={(value) =>
              setFormData({ ...formData, subjectId: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.length > 0 ? (
                subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-subjects" disabled>
                  No subjects available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Assessment Type *</Label>
          <Input
            id="type"
            required
            placeholder="e.g., Mid-term Exam"
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="score">Score *</Label>
          <Input
            id="score"
            type="number"
            required
            placeholder="e.g., 85"
            value={formData.score}
            onChange={(e) => setFormData({ ...formData, score: e.target.value })}
          />
        </div>
        <div className="space-y-2 col-span-2">
          <Label htmlFor="maxScore">Max Score *</Label>
          <Input
            id="maxScore"
            type="number"
            required
            value={formData.maxScore}
            onChange={(e) =>
              setFormData({ ...formData, maxScore: e.target.value })
            }
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={createLoading} loadingText="Creating...">
          Add Grade
        </Button>
      </DialogFooter>
    </form>
  );
}
