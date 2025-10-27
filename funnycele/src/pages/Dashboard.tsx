import { BentoCard } from "@/components/BentoCard";
import { Users, GraduationCap, BookOpen, TrendingUp, Calendar, Award } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const attendanceData = [
  { day: "Mon", rate: 92 },
  { day: "Tue", rate: 95 },
  { day: "Wed", rate: 88 },
  { day: "Thu", rate: 96 },
  { day: "Fri", rate: 90 },
  { day: "Sat", rate: 85 },
];

const performanceData = [
  { subject: "Math", score: 85 },
  { subject: "Science", score: 92 },
  { subject: "English", score: 78 },
  { subject: "History", score: 88 },
  { subject: "Arts", score: 95 },
];

const topStudents = [
  { name: "Emma Watson", grade: "A+", avatar: "EW", color: "bg-gradient-primary" },
  { name: "John Smith", grade: "A+", avatar: "JS", color: "bg-gradient-secondary" },
  { name: "Sarah Lee", grade: "A", avatar: "SL", color: "bg-gradient-accent" },
  { name: "Mike Chen", grade: "A", avatar: "MC", color: "bg-gradient-primary" },
];

const upcomingEvents = [
  { title: "Parent-Teacher Meeting", date: "Tomorrow", time: "10:00 AM" },
  { title: "Science Fair", date: "Dec 15", time: "2:00 PM" },
  { title: "Sports Day", date: "Dec 20", time: "9:00 AM" },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen mesh-background">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span className="bg-gradient-primary bg-clip-text text-transparent">Admin</span>
          </h1>
          <p className="text-muted-foreground">Here's what's happening with your school today</p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Stats Cards */}
          <BentoCard
            title="Total Students"
            value="1,234"
            icon={Users}
            gradient="bg-gradient-primary"
            trend={{ value: "12%", isPositive: true }}
          />
          
          <BentoCard
            title="Total Teachers"
            value="87"
            icon={GraduationCap}
            gradient="bg-gradient-secondary"
            trend={{ value: "3%", isPositive: true }}
          />
          
          <BentoCard
            title="Active Classes"
            value="42"
            icon={BookOpen}
            gradient="bg-gradient-accent"
            trend={{ value: "5%", isPositive: false }}
          />
          
          <BentoCard
            title="Avg. Performance"
            value="87.6%"
            icon={TrendingUp}
            gradient="linear-gradient(135deg, hsl(150 60% 50%), hsl(150 60% 60%))"
            trend={{ value: "8%", isPositive: true }}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Attendance Chart - Spans 2 columns */}
          <BentoCard className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Weekly Attendance Trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={attendanceData}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(280, 70%, 55%)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(280, 70%, 55%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--glass-background)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "1rem",
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="hsl(280, 70%, 55%)" 
                  fillOpacity={1} 
                  fill="url(#colorRate)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </BentoCard>

          {/* Top Students */}
          <BentoCard>
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-warning" />
              <h3 className="text-lg font-semibold">Top Performers</h3>
            </div>
            <div className="space-y-3">
              {topStudents.map((student, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={`${student.color} text-white font-semibold`}>
                        {student.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{student.name}</span>
                  </div>
                  <Badge className="bg-success/10 text-success border-0">
                    {student.grade}
                  </Badge>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Performance Radar */}
          <BentoCard className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Subject Performance Overview</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={performanceData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" stroke="hsl(var(--muted-foreground))" />
                <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" />
                <Radar 
                  name="Score" 
                  dataKey="score" 
                  stroke="hsl(320, 85%, 60%)" 
                  fill="hsl(320, 85%, 60%)" 
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--glass-background)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "1rem",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </BentoCard>

          {/* Upcoming Events */}
          <BentoCard>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-info" />
              <h3 className="text-lg font-semibold">Upcoming Events</h3>
            </div>
            <div className="space-y-3">
              {upcomingEvents.map((event, index) => (
                <div 
                  key={index}
                  className="p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <p className="font-medium mb-1">{event.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{event.date}</span>
                    <span>•</span>
                    <span>{event.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>
        </div>
      </div>
    </div>
  );
}
