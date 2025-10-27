'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  BookOpen,
  DollarSign,
  Bell,
  Calendar,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { dashboardService, DashboardStats, Activity, TeacherStats, ParentStats, StudentStats } from '@/services/dashboardService';
import { DataNotFoundForEntity } from '@/components/ui/data-not-found';

export default function DashboardPage() {
  const { user } = useAuth();

  const getDashboardContent = () => {
    switch (user?.role) {
      case 'admin':
        return <AdminDashboard user={user} />;
      case 'teacher':
        return <TeacherDashboard user={user} />;
      case 'parent':
        return <ParentDashboard user={user} />;
      case 'student':
        return <StudentDashboard user={user} />;
      default:
        return <div>Invalid role</div>;
    }
  };

  return (
    <DashboardLayout>
      {getDashboardContent()}
    </DashboardLayout>
  );
}

function AdminDashboard({ user }: { user: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<{student?: boolean; teacher?: boolean; invoice?: boolean; calendar?: boolean}>({});
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, activitiesData] = await Promise.all([
          dashboardService.getAdminStats(),
          dashboardService.getRecentActivities()
        ]);
        setStats(statsData);
        setActivities(activitiesData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setDataLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleAddStudent = () => {
    router.push('/students?action=add');
  };

  const handleAddTeacher = () => {
    router.push('/teachers?action=add');
  };

  const handleGenerateInvoice = () => {
    router.push('/billing?action=generate');
  };

  const handleViewCalendar = async () => {
    try {
      setActionLoading((s) => ({ ...s, calendar: true }));
      router.push('/calendar');
    } finally {
      setActionLoading((s) => ({ ...s, calendar: false }));
    }
  };

  return (
    <div className="min-h-screen mesh-background px-4 py-6 sm:px-6">
      {dataLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : !stats ? (
        <DataNotFoundForEntity entity="dashboard" />
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, <span className="bg-gradient-primary bg-clip-text text-transparent">{user?.firstName || 'Admin'}</span>
            </h1>
            <p className="text-muted-foreground">Here's what's happening with your school today</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Card className="glass-card rounded-3xl hover-float shadow-soft border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground mb-2">
                    Total Students
                  </CardTitle>
                  <div className="text-4xl font-bold">
                    {stats.totalStudents?.toLocaleString() || '0'}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                      stats.studentChange >= 0
                        ? 'bg-success/10 text-success'
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {stats.studentChange >= 0 ? '↑' : '↓'} {Math.abs(stats.studentChange || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-primary">
                  <Users className="h-7 w-7 text-white" />
                </div>
              </CardHeader>
            </Card>
            <Card className="glass-card rounded-3xl hover-float shadow-soft border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground mb-2">
                    Total Teachers
                  </CardTitle>
                  <div className="text-4xl font-bold">
                    {stats.totalTeachers?.toLocaleString() || '0'}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                      stats.teacherChange >= 0
                        ? 'bg-success/10 text-success'
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {stats.teacherChange >= 0 ? '↑' : '↓'} {Math.abs(stats.teacherChange || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-gradient-secondary flex items-center justify-center shadow-secondary">
                  <Users className="h-7 w-7 text-white" />
                </div>
              </CardHeader>
            </Card>
            <Card className="glass-card rounded-3xl hover-float shadow-soft border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground mb-2">
                    Total Classes
                  </CardTitle>
                  <div className="text-4xl font-bold">
                    {stats.totalClasses?.toLocaleString() || '0'}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                      stats.classChange >= 0
                        ? 'bg-success/10 text-success'
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {stats.classChange >= 0 ? '↑' : '↓'} {Math.abs(stats.classChange || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-gradient-accent flex items-center justify-center shadow-accent">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
              </CardHeader>
            </Card>
            <Card className="glass-card rounded-3xl hover-float shadow-soft border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm font-medium text-muted-foreground mb-2">
                    Monthly Revenue
                  </CardTitle>
                  <div className="text-4xl font-bold">
                    ${stats.monthlyRevenue ? (stats.monthlyRevenue / 1000).toFixed(1) : '0'}k
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                      stats.revenueChange >= 0
                        ? 'bg-success/10 text-success'
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {stats.revenueChange >= 0 ? '↑' : '↓'} {Math.abs(stats.revenueChange || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-gradient-secondary flex items-center justify-center shadow-secondary">
                  <DollarSign className="h-7 w-7 text-white" />
                </div>
              </CardHeader>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 glass-card rounded-3xl shadow-soft border-border/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
                <CardDescription>
                  Latest actions performed in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-sm font-medium">No activities</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      There are no recent activities to display.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start p-3 rounded-xl hover:bg-muted/30 transition-colors">
                        <div className="flex-shrink-0">
                          <div className="bg-gradient-primary rounded-xl w-12 h-12 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          <div className="mt-1 flex items-center text-xs text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            {activity.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="glass-card rounded-3xl shadow-soft border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                  <CardDescription>
                    Common actions you can perform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full rounded-xl border-2 hover:border-primary"
                    variant="outline"
                    onClick={handleAddStudent}
                    loading={!!actionLoading.student}
                    loadingText="Opening..."
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Add Student
                  </Button>
                  <Button
                    className="w-full rounded-xl border-2 hover:border-primary"
                    variant="outline"
                    onClick={handleAddTeacher}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Add Teacher
                  </Button>
                  <Button
                    className="w-full rounded-xl border-2 hover:border-primary"
                    variant="outline"
                    onClick={handleGenerateInvoice}
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Generate Invoice
                  </Button>
                  <Button
                    className="w-full rounded-xl border-2 hover:border-primary"
                    variant="outline"
                    onClick={handleViewCalendar}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    View Calendar
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass-card rounded-3xl shadow-soft border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 rounded-xl hover:bg-muted/30 transition-colors">
                      <span className="text-sm font-medium">Database</span>
                      <Badge className="bg-success/10 text-success border-0">Operational</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-xl hover:bg-muted/30 transition-colors">
                      <span className="text-sm font-medium">API</span>
                      <Badge className="bg-success/10 text-success border-0">Operational</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-xl hover:bg-muted/30 transition-colors">
                      <span className="text-sm font-medium">Storage</span>
                      <Badge className="bg-success/10 text-success border-0">Operational</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TeacherDashboard({ user }: { user: any }) {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">75 total students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Classes
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              2 completed, 2 remaining
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Grades
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Due this week</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
          <CardDescription>Your teaching schedule for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Mathematics - Class 5A</p>
                <p className="text-sm text-gray-500">8:00 AM - 9:00 AM</p>
              </div>
              <Badge variant="outline">Completed</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium">Science - Class 5B</p>
                <p className="text-sm text-gray-500">9:30 AM - 10:30 AM</p>
              </div>
              <Badge variant="outline">In Progress</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">English - Class 4A</p>
                <p className="text-sm text-gray-500">11:00 AM - 12:00 PM</p>
              </div>
              <Badge variant="outline">Upcoming</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ParentDashboard({ user }: { user: any }) {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Children</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Active students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₵1,200</div>
            <p className="text-xs text-muted-foreground">Due this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Unread messages</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Children's Progress</CardTitle>
          <CardDescription>Academic performance overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">John Doe - Class 5A</h4>
                <Badge variant="outline">Good</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Attendance</p>
                  <p className="font-medium">95%</p>
                </div>
                <div>
                  <p className="text-gray-500">Average Grade</p>
                  <p className="font-medium">B+</p>
                </div>
                <div>
                  <p className="text-gray-500">Conduct</p>
                  <p className="font-medium">Excellent</p>
                </div>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Jane Doe - Class 3B</h4>
                <Badge variant="outline">Excellent</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Attendance</p>
                  <p className="font-medium">98%</p>
                </div>
                <div>
                  <p className="text-gray-500">Average Grade</p>
                  <p className="font-medium">A</p>
                </div>
                <div>
                  <p className="text-gray-500">Conduct</p>
                  <p className="font-medium">Excellent</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StudentDashboard({ user }: { user: any }) {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">B+</div>
            <p className="text-xs text-muted-foreground">+5% improvement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8/10</div>
            <p className="text-xs text-muted-foreground">2 pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Rank</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5th</div>
            <p className="text-xs text-muted-foreground">Out of 30 students</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Your classes for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Mathematics</p>
                  <p className="text-sm text-gray-500">8:00 AM - 9:00 AM</p>
                </div>
                <Badge variant="outline">Completed</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Science</p>
                  <p className="text-sm text-gray-500">9:30 AM - 10:30 AM</p>
                </div>
                <Badge variant="outline">In Progress</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">English</p>
                  <p className="text-sm text-gray-500">11:00 AM - 12:00 PM</p>
                </div>
                <Badge variant="outline">Upcoming</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Grades</CardTitle>
            <CardDescription>Latest academic performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mathematics Test</p>
                  <p className="text-sm text-gray-500">2 days ago</p>
                </div>
                <Badge variant="secondary">85%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Science Project</p>
                  <p className="text-sm text-gray-500">1 week ago</p>
                </div>
                <Badge variant="secondary">92%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">English Essay</p>
                  <p className="text-sm text-gray-500">2 weeks ago</p>
                </div>
                <Badge variant="secondary">88%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
