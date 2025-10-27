import { BentoCard } from "@/components/BentoCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, Phone, MapPin, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const students = [
  {
    id: 1,
    name: "Emma Watson",
    email: "emma.watson@school.edu",
    phone: "+1 234 567 8901",
    class: "10-A",
    grade: "A+",
    status: "active",
    address: "123 Main St",
    avatar: "EW",
    color: "bg-gradient-primary",
    attendance: 96,
  },
  {
    id: 2,
    name: "John Smith",
    email: "john.smith@school.edu",
    phone: "+1 234 567 8902",
    class: "10-B",
    grade: "A",
    status: "active",
    address: "456 Oak Ave",
    avatar: "JS",
    color: "bg-gradient-secondary",
    attendance: 94,
  },
  {
    id: 3,
    name: "Sarah Johnson",
    email: "sarah.j@school.edu",
    phone: "+1 234 567 8903",
    class: "9-A",
    grade: "A-",
    status: "active",
    address: "789 Pine Rd",
    avatar: "SJ",
    color: "bg-gradient-accent",
    attendance: 92,
  },
  {
    id: 4,
    name: "Michael Chen",
    email: "m.chen@school.edu",
    phone: "+1 234 567 8904",
    class: "11-C",
    grade: "B+",
    status: "active",
    address: "321 Elm St",
    avatar: "MC",
    color: "linear-gradient(135deg, hsl(200 90% 55%), hsl(200 90% 65%))",
    attendance: 90,
  },
  {
    id: 5,
    name: "Lisa Anderson",
    email: "lisa.a@school.edu",
    phone: "+1 234 567 8905",
    class: "10-A",
    grade: "A+",
    status: "active",
    address: "654 Maple Dr",
    avatar: "LA",
    color: "bg-gradient-primary",
    attendance: 98,
  },
  {
    id: 6,
    name: "David Wilson",
    email: "d.wilson@school.edu",
    phone: "+1 234 567 8906",
    class: "9-B",
    grade: "B",
    status: "active",
    address: "987 Cedar Ln",
    avatar: "DW",
    color: "bg-gradient-secondary",
    attendance: 88,
  },
];

export default function Students() {
  return (
    <div className="min-h-screen mesh-background">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-secondary bg-clip-text text-transparent">Students</span>
            </h1>
            <p className="text-muted-foreground">Manage your student community</p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90 shadow-primary rounded-2xl px-6">
            <Plus className="mr-2 h-5 w-5" />
            Add Student
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {students.map((student) => (
            <BentoCard key={student.id} className="group cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14 ring-2 ring-background">
                    <AvatarFallback className={`${student.color} text-white font-bold text-lg`}>
                      {student.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                      {student.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">Class {student.class}</p>
                  </div>
                </div>
                <Badge className="bg-success/10 text-success border-0 font-semibold">
                  {student.grade}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{student.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{student.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">{student.address}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium">Attendance</span>
                </div>
                <span className="font-bold text-success">{student.attendance}%</span>
              </div>

              <div className="mt-4 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 rounded-xl border-2 hover:border-primary hover:text-primary"
                >
                  View Profile
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 rounded-xl border-2 hover:border-secondary hover:text-secondary"
                >
                  Message
                </Button>
              </div>
            </BentoCard>
          ))}
        </div>
      </div>
    </div>
  );
}
