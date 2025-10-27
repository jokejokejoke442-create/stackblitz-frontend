"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";
import { DataNotFoundForEntity } from "@/components/ui/data-not-found";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSubjects } from "@/hooks/useSubjects";

// Mock data for the form
const mockClasses = [
  { id: "1", name: "Class 1A" },
  { id: "2", name: "Class 2B" },
  { id: "3", name: "Class 3C" },
];

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  qualification: string;
  experience: number;
  status: "active" | "inactive";
  classes: string[];
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);

  const { toast } = useToast();

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTeachers({ limit: 100 });
      const respAny: any = response as any;
      const raw = Array.isArray(respAny.data)
        ? respAny.data
        : (respAny.data?.teachers || respAny.data?.data || []);
      const mapped: Teacher[] = (raw as any[]).map((t: any) => ({
        id: t.id,
        firstName: t.first_name || t.firstName || "",
        lastName: t.last_name || t.lastName || "",
        email: t.email || t.users?.email || "",
        phone: t.phone || "",
        subject: t.specialization || t.subject || "General",
        qualification: t.qualification || "",
        experience: Number(t.experience || 0),
        status: t.is_active === false ? "inactive" : "active",
        classes: t.class_id ? [t.class_id] : [],
      }));
      setTeachers(mapped);
    } catch (err: any) {
      console.error("Failed to fetch teachers:", err);
      setError("Failed to load teachers");
      toast({
        title: "Error",
        description: "Failed to load teachers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    const filtered = teachers.filter(
      (teacher) =>
        teacher.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTeachers(filtered);
  }, [searchQuery, teachers]);

  const handleDeleteTeacher = async () => {
    if (!deletingTeacher) return;

    try {
      await apiService.deleteTeacher(deletingTeacher.id);
      toast({
        title: "Success",
        description: "Teacher deleted successfully",
      });
      fetchTeachers();
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Teacher delete error:", error?.response?.data || error);
      toast({
        title: "Error",
        description: "Failed to delete teacher",
        variant: "destructive",
      });
    }
  };

  const showNoData = !loading && !error && (!teachers || teachers.length === 0);
  const showNoResults =
    !loading && !error && teachers && teachers.length > 0 && filteredTeachers.length === 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Teachers</h1>
            <p className="text-gray-500">Manage teaching staff and profiles</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl w-full mx-4">
              <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
                <DialogDescription>
                  Create a new teacher profile
                </DialogDescription>
              </DialogHeader>
              <AddTeacherForm
                onClose={() => setIsAddDialogOpen(false)}
                onSuccess={fetchTeachers}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-500">
                Total Teachers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{teachers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-500">
                Active Teachers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">
                {teachers.filter((t) => t.status === "active").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-500">
                Subjects Taught
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">
                {new Set(teachers.map((t) => t.subject)).size}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs md:text-sm font-medium text-gray-500">
                Avg Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">
                {teachers.length > 0
                  ? (
                      teachers.reduce((sum, t) => sum + (t.experience || 0), 0) /
                      teachers.length
                    ).toFixed(1) + " years"
                  : "0 years"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Teacher List</CardTitle>
            <CardDescription>
              View and manage all teaching staff
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by name, subject, or email..."
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
                  <p className="text-red-500">{error}</p>
                  <Button variant="outline" onClick={fetchTeachers}>
                    Try Again
                  </Button>
                </div>
              </div>
            ) : showNoData ? (
              <DataNotFoundForEntity
                entity="teachers"
                actionText="Add Your First Teacher"
                onAction={() => setIsAddDialogOpen(true)}
              />
            ) : showNoResults ? (
              <DataNotFoundForEntity
                entity="teachers"
                actionText="Clear Search"
                onAction={() => setSearchQuery("")}
              />
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium">Teacher</th>
                      <th className="text-left py-3 px-4 font-medium">Contact</th>
                      <th className="text-left py-3 px-4 font-medium">Subject</th>
                      <th className="text-left py-3 px-4 font-medium">Classes</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                      <th className="text-right py-3 px-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTeachers.map((teacher) => (
                      <tr key={teacher.id}>
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">
                              {teacher.firstName} {teacher.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {teacher.qualification}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">{teacher.email}</div>
                          <div className="text-sm text-gray-500">
                            {teacher.phone}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">{teacher.subject}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {teacher.classes.slice(0, 2).map((cls, index) => (
                              <Badge key={index} variant="outline">
                                {cls}
                              </Badge>
                            ))}
                            {teacher.classes.length > 2 && (
                              <Badge variant="outline">
                                +{teacher.classes.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              teacher.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {teacher.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" title="View">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80">
                                <div className="space-y-2">
                                  <h4 className="font-medium">
                                    {teacher.firstName} {teacher.lastName}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    Email: {teacher.email}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Phone: {teacher.phone}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Subject: {teacher.subject}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Qualification: {teacher.qualification}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Experience: {teacher.experience} years
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Status: {teacher.status}
                                  </p>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit"
                              onClick={() => {
                                setEditingTeacher(teacher);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete"
                              onClick={() => {
                                setDeletingTeacher(teacher);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Teacher Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Teacher</DialogTitle>
              <DialogDescription>
                Update teacher profile information
              </DialogDescription>
            </DialogHeader>
            {editingTeacher && (
              <EditTeacherForm
                teacherData={editingTeacher}
                onClose={() => setIsEditDialogOpen(false)}
                onSuccess={() => {
                  fetchTeachers();
                  setIsEditDialogOpen(false);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Teacher</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this teacher? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteTeacher}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function AddTeacherForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    qualification: "",
    experience: "",
    dateOfBirth: "",
    gender: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
    },
    dateJoined: "",
    salary: "",
    isClassTeacher: false,
    classId: "",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const { toast } = useToast();
  const { data: subjects } = useSubjects();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      // Normalize data before sending
      const normalizedData = {
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        qualification: formData.qualification.trim(),
        experience: Number(formData.experience || 0),
        gender: formData.gender.toLowerCase(), // Ensure lowercase
        salary: Number(formData.salary || 0),
        address: {
          street: formData.address.street.trim(),
          city: formData.address.city.trim(),
          state: formData.address.state.trim(),
          postalCode: formData.address.postalCode.trim(),
        }
      };

      await apiService.createTeacher(normalizedData as any);
      toast({
        title: "Success",
        description: "Teacher created successfully",
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Teacher create error:", error?.response?.data || error);
      const msg = error?.response?.data?.message || "Failed to create teacher";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
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
            placeholder="e.g., John"
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
            placeholder="e.g., Doe"
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
            placeholder="e.g., john.doe@school.edu"
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
            type="tel"
            placeholder="e.g., +1234567890"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">Subject *</Label>
          <Select
            value={formData.subject}
            onValueChange={(value) =>
              setFormData({ ...formData, subject: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects && subjects.length > 0 ? (
                subjects.map((subject: any) => (
                  <SelectItem key={subject.id} value={subject.name}>
                    {subject.name} {subject.code ? `(${subject.code})` : ''}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  No subjects available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="qualification">Qualification *</Label>
          <Input
            id="qualification"
            required
            placeholder="e.g., B.Ed"
            value={formData.qualification}
            onChange={(e) =>
              setFormData({ ...formData, qualification: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="experience">Experience (years)</Label>
          <Input
            id="experience"
            type="number"
            min="0"
            placeholder="e.g., 5"
            value={formData.experience}
            onChange={(e) =>
              setFormData({ ...formData, experience: e.target.value })
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
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={createLoading} loadingText="Creating...">
          Add Teacher
        </Button>
      </DialogFooter>
    </form>
  );
}

function EditTeacherForm({
  teacherData,
  onClose,
  onSuccess,
}: {
  teacherData: Teacher;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    firstName: teacherData.firstName || "",
    lastName: teacherData.lastName || "",
    email: teacherData.email || "",
    phone: teacherData.phone || "",
    subject: teacherData.subject || "",
    qualification: teacherData.qualification || "",
    experience: String(teacherData.experience || ""),
    // Add other fields as needed
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const { toast } = useToast();
  const { data: subjects } = useSubjects();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      // Normalize data before sending
      const normalizedData = {
        ...formData,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        qualification: formData.qualification.trim(),
        experience: Number(formData.experience || 0),
      };

      await apiService.updateTeacher(teacherData.id, normalizedData as any);
      toast({
        title: "Success",
        description: "Teacher updated successfully",
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Teacher update error:", error?.response?.data || error);
      const msg = error?.response?.data?.message || "Failed to update teacher";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-firstName">First Name *</Label>
          <Input
            id="edit-firstName"
            required
            placeholder="e.g., John"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-lastName">Last Name *</Label>
          <Input
            id="edit-lastName"
            required
            placeholder="e.g., Doe"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-email">Email *</Label>
          <Input
            id="edit-email"
            type="email"
            required
            placeholder="e.g., john.doe@school.edu"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-phone">Phone</Label>
          <Input
            id="edit-phone"
            type="tel"
            placeholder="e.g., +1234567890"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-subject">Subject *</Label>
          <Select
            value={formData.subject}
            onValueChange={(value) =>
              setFormData({ ...formData, subject: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects && subjects.length > 0 ? (
                subjects.map((subject: any) => (
                  <SelectItem key={subject.id} value={subject.name}>
                    {subject.name} {subject.code ? `(${subject.code})` : ''}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  No subjects available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-qualification">Qualification *</Label>
          <Input
            id="edit-qualification"
            required
            placeholder="e.g., B.Ed"
            value={formData.qualification}
            onChange={(e) =>
              setFormData({ ...formData, qualification: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-experience">Experience (years)</Label>
          <Input
            id="edit-experience"
            type="number"
            min="0"
            placeholder="e.g., 5"
            value={formData.experience}
            onChange={(e) =>
              setFormData({ ...formData, experience: e.target.value })
            }
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={updateLoading} loadingText="Updating...">
          Update Teacher
        </Button>
      </DialogFooter>
    </form>
  );
}