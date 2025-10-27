import { BentoCard } from "@/components/BentoCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Clock, BookOpen, Calendar } from "lucide-react";

const classes = [
  {
    id: 1,
    name: "Advanced Mathematics",
    grade: "10-A",
    teacher: "Dr. Sarah Miller",
    students: 32,
    schedule: "Mon, Wed, Fri",
    time: "9:00 AM",
    subject: "Mathematics",
    room: "Room 201",
    color: "bg-gradient-primary",
    progress: 75,
  },
  {
    id: 2,
    name: "Physics Lab",
    grade: "11-B",
    teacher: "Prof. John Davis",
    students: 28,
    schedule: "Tue, Thu",
    time: "10:30 AM",
    subject: "Physics",
    room: "Lab 305",
    color: "bg-gradient-secondary",
    progress: 82,
  },
  {
    id: 3,
    name: "English Literature",
    grade: "10-A",
    teacher: "Ms. Emily Brown",
    students: 30,
    schedule: "Mon, Wed",
    time: "2:00 PM",
    subject: "English",
    room: "Room 103",
    color: "bg-gradient-accent",
    progress: 68,
  },
  {
    id: 4,
    name: "Chemistry Honors",
    grade: "11-C",
    teacher: "Dr. Michael Wilson",
    students: 25,
    schedule: "Tue, Thu",
    time: "1:00 PM",
    subject: "Chemistry",
    room: "Lab 402",
    color: "linear-gradient(135deg, hsl(150 60% 50%), hsl(150 60% 60%))",
    progress: 90,
  },
  {
    id: 5,
    name: "World History",
    grade: "9-A",
    teacher: "Mr. David Anderson",
    students: 35,
    schedule: "Mon, Wed, Fri",
    time: "11:00 AM",
    subject: "History",
    room: "Room 205",
    color: "bg-gradient-primary",
    progress: 55,
  },
  {
    id: 6,
    name: "Computer Science",
    grade: "10-B",
    teacher: "Dr. Lisa Chen",
    students: 30,
    schedule: "Tue, Thu",
    time: "9:00 AM",
    subject: "CS",
    room: "Computer Lab",
    color: "bg-gradient-secondary",
    progress: 88,
  },
];

export default function Classes() {
  return (
    <div className="min-h-screen mesh-background">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-accent bg-clip-text text-transparent">Classes</span>
            </h1>
            <p className="text-muted-foreground">Explore all active courses</p>
          </div>
          <Button className="bg-gradient-accent hover:opacity-90 shadow-accent rounded-2xl px-6">
            <Plus className="mr-2 h-5 w-5" />
            Create Class
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {classes.map((classItem) => (
            <BentoCard key={classItem.id} className="group cursor-pointer relative overflow-hidden">
              {/* Background decoration */}
              <div className={`absolute top-0 right-0 h-32 w-32 ${classItem.color} opacity-10 rounded-full -mr-16 -mt-16`} />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className={`h-14 w-14 rounded-2xl ${classItem.color} flex items-center justify-center shadow-primary`}
                  >
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                  <Badge variant="outline" className="border-2 font-semibold">
                    {classItem.grade}
                  </Badge>
                </div>

                <h3 className="font-bold text-xl mb-1 group-hover:text-primary transition-colors">
                  {classItem.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{classItem.teacher}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Students</span>
                    </div>
                    <span className="font-semibold">{classItem.students}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Schedule</span>
                    </div>
                    <span className="font-semibold">{classItem.schedule}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Time</span>
                    </div>
                    <span className="font-semibold">{classItem.time}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Course Progress</span>
                    <span className="font-semibold">{classItem.progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${classItem.color} transition-all duration-500`}
                      style={{ width: `${classItem.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1 rounded-xl bg-gradient-primary hover:opacity-90 shadow-primary"
                    size="sm"
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl border-2 hover:border-primary"
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </BentoCard>
          ))}
        </div>
      </div>
    </div>
  );
}
