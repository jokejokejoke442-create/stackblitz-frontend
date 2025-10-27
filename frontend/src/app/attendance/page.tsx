'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  CalendarIcon,
  Check,
  X,
  Clock,
  Download,
  Save,
  Loader2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { apiService } from '@/services/apiService';
import { DataNotFoundForEntity } from '@/components/ui/data-not-found';
import { Checkbox } from '@/components/ui/checkbox';

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsForClass();
    } else {
      setAttendance([]);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedDate && attendance.length > 0) {
      loadExistingAttendance();
    }
  }, [selectedDate]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await apiService.getClasses();
      if (response.success && response.data) {
        setClasses(response.data);
        
        // Set the first class as selected if available
        if (response.data.length > 0) {
          setSelectedClass(response.data[0].id);
        } else {
          setSelectedClass('');
        }
      } else {
        setClasses([]);
        setSelectedClass('');
      }
    } catch (error: any) {
      console.error('Classes fetch error:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch classes. Please try again.',
        variant: 'destructive',
      });
      setClasses([]);
      setSelectedClass('');
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const fetchStudentsForClass = async () => {
    if (!selectedClass) return;
    
    try {
      setLoading(true);
      const response = await apiService.getStudents({ classId: selectedClass });
      
      if (response.success) {
        // Handle both response formats: {students: [], pagination: {}} or just []
        let students: any[] = [];
        if (Array.isArray(response.data)) {
          students = response.data;
        } else if (response.data?.students && Array.isArray(response.data.students)) {
          students = response.data.students;
        }
        
        // Initialize all students with 'present' status by default
        const studentsWithStatus = students.map((student: any) => ({
          ...student,
          id: student.id,
          firstName: student.first_name || student.firstName || '',
          lastName: student.last_name || student.lastName || '',
          studentId: student.student_id || student.studentId || '',
          status: 'present' // Default to present
        }));
        setAttendance(studentsWithStatus);
        
        // Load existing attendance for the selected date
        if (selectedDate) {
          loadExistingAttendance();
        }
      } else {
        setAttendance([]);
      }
    } catch (error: any) {
      console.error('Students fetch error:', error);
      toast({
        title: 'Error',
        description: `Failed to fetch students: ${error.message || 'Unknown error'}.`,
        variant: 'destructive',
      });
      setAttendance([]);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingAttendance = async () => {
    if (!selectedClass || !selectedDate) return;
    
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const response = await apiService.getAttendance({ 
        date: dateString, 
        classId: selectedClass 
      });
      
      if (response.success && response.data) {
        const existingAttendance = response.data?.attendance || [];
        // Merge existing attendance with current student list
        setAttendance(prev => prev.map(student => {
          const existing = existingAttendance.find((a: any) => a.studentId === student.id || a.student_id === student.id);
          return existing ? { ...student, status: existing.status } : student;
        }));
      }
    } catch (error: any) {
      console.error('Load attendance error:', error);
      // Don't show error toast for missing attendance - it's expected for new dates
    }
  };

  const toggleAttendanceStatus = (studentId: string, isPresent: boolean) => {
    setAttendance((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, status: isPresent ? 'present' : 'absent' } : student
      )
    );
  };

  const saveAttendance = async () => {
    if (!selectedClass || !selectedDate) {
      toast({
        title: 'Error',
        description: 'Please select a class and date.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      
      const attendanceData = attendance.map(student => ({
        studentId: student.id,
        status: student.status
      }));

      const response = await apiService.saveAttendanceBatch({
        date: dateString,
        classId: selectedClass,
        attendance: attendanceData
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Attendance saved successfully.',
        });
      } else {
        throw new Error(response.message || 'Failed to save attendance');
      }
    } catch (error: any) {
      console.error('Save attendance error:', error);
      toast({
        title: 'Error',
        description: `Failed to save attendance: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge variant="success">Present</Badge>;
      case 'absent':
        return <Badge variant="crit">Absent</Badge>;
      case 'late':
        return <Badge variant="warn">Late</Badge>;
      case 'excused':
        return <Badge variant="info">Excused</Badge>;
      default:
        return <Badge variant="neutral">Unknown</Badge>;
    }
  };

  const exportToExcel = () => {
    if (attendance.length === 0) {
      toast({
        title: 'No Data',
        description: 'No attendance data to export.',
        variant: 'destructive',
      });
      return;
    }

    // Prepare data for CSV/Excel
    const className = classes.find(c => c.id === selectedClass)?.className || 
                      classes.find(c => c.id === selectedClass)?.class_name || 
                      'Class';
    const dateStr = format(selectedDate, 'EEEE, MMMM d, yyyy');
    
    // Create CSV content
    const headers = ['No.', 'Student ID', 'Student Name', 'Status', 'Remarks'];
    const rows = attendance.map((student, index) => [
      index + 1,
      student.studentId || '-',
      `${student.firstName} ${student.lastName}`,
      student.status === 'present' ? 'Present' : student.status === 'absent' ? 'Absent' : student.status,
      student.remarks || '-'
    ]);

    // Add title and metadata
    const csvContent = [
      [`Attendance Report - ${className}`],
      [`Date: ${dateStr}`],
      [''],
      headers,
      ...rows
    ].map(row => row.join(',')).join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Attendance_${className}_${format(selectedDate, 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Success',
      description: 'Attendance exported successfully as CSV.',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Attendance</h1>
            <p className="text-gray-500">Mark and track student attendance</p>
            <p className="text-sm mt-1 text-accent-info">Select a class and date, then mark attendance for each student.</p>
          </div>
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={exportToExcel}
              disabled={attendance.length === 0}
              className="w-full md:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button onClick={saveAttendance} loading={saving} loadingText="Saving..." disabled={loading || !selectedClass || attendance.length === 0} className="w-full md:w-auto">
              <Save className="mr-2 h-4 w-4" />
              Save Attendance
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-accent-neutral">{attendance.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Present</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-accent-success">
                {attendance.filter(s => s.status === 'present').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Absent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-accent-crit">
                {attendance.filter(s => s.status === 'absent').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">Late</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold text-accent-warn">
                {attendance.filter(s => s.status === 'late').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Select Class & Date</CardTitle>
            <CardDescription>Choose a class and date to mark attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Class Selection */}
              <div className="space-y-2">
                <Label htmlFor="class" className="text-sm font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Class *
                </Label>
                <Select 
                  value={selectedClass} 
                  onValueChange={setSelectedClass}
                  disabled={loading}
                >
                  <SelectTrigger id="class" className="w-full h-11">
                    <SelectValue placeholder="Select a class">
                      {selectedClass 
                        ? classes.find(c => c.id === selectedClass)?.className || 
                          classes.find(c => c.id === selectedClass)?.class_name ||
                          'Unknown Class'
                        : 'Select a class'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {classes.length > 0 ? (
                      classes.map((classItem) => (
                        <SelectItem key={classItem.id} value={classItem.id}>
                          {classItem.className || classItem.class_name || 'Unnamed Class'}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-classes" disabled>
                        No classes available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {selectedClass && (
                  <p className="text-xs text-muted-foreground">
                    {attendance.length} student{attendance.length !== 1 ? 's' : ''} in this class
                  </p>
                )}
              </div>
              
              {/* Date Selection */}
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-semibold flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Date *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={'outline'}
                      className={cn(
                        'w-full h-11 justify-start text-left font-normal',
                        !selectedDate && 'text-muted-foreground'
                      )}
                      disabled={loading || !selectedClass}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        format(selectedDate, 'EEEE, MMMM d, yyyy')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-2" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  {selectedDate ? format(selectedDate, 'PPP') : 'Select date to mark attendance'}
                </p>
              </div>
            </div>
            
            {classes.length === 0 && !loading && (
              <div className="flex items-center gap-3 p-4 mt-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">No classes found</p>
                  <p className="text-sm text-yellow-700">
                    Please create classes in the Classes section to start marking attendance.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>
              {selectedClass && selectedDate
                ? `Attendance for ${classes.find(c => c.id === selectedClass)?.className || 
                   classes.find(c => c.id === selectedClass)?.class_name || 
                   'Selected Class'} on ${selectedDate ? format(selectedDate, 'PPP') : ''}`
                : 'Select a class and date to view attendance records'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : attendance.length === 0 && selectedClass ? (
              <DataNotFoundForEntity entity="students" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead className="text-center">Present</TableHead>
                    <TableHead className="text-center">Absent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={student.profileImage} />
                            <AvatarFallback>
                              {getInitials(student.firstName, student.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {student.firstName} {student.lastName}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={student.status === 'present'}
                          onCheckedChange={(checked) => toggleAttendanceStatus(student.id, checked as boolean)}
                          className="mx-auto"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={student.status === 'absent'}
                          onCheckedChange={(checked) => toggleAttendanceStatus(student.id, !(checked as boolean))}
                          className="mx-auto"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {attendance.length > 0 && (
              <div className="flex justify-end mt-4">
                <Button onClick={saveAttendance} loading={saving} loadingText="Saving...">
                  <Save className="mr-2 h-4 w-4" />
                  Save Attendance
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}