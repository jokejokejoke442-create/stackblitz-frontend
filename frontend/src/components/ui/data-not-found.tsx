'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  FileText, 
  User, 
  GraduationCap,
  Wallet,
  Bell,
  BarChart3,
  Settings,
  Plus
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type React from 'react';

interface DataNotFoundProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const iconMap: Record<string, LucideIcon> = {
  classes: BookOpen,
  students: Users,
  teachers: User,
  subjects: BookOpen,
  attendance: Calendar,
  grades: FileText,
  invoices: Wallet,
  payments: Wallet,
  notifications: Bell,
  dashboard: BarChart3,
  settings: Settings,
  default: BookOpen
};

export function DataNotFound({
  title,
  description,
  icon: IconComponent,
  actionText,
  onAction,
  className,
  children
}: DataNotFoundProps) {
  const DefaultIcon = IconComponent || BookOpen;
  
  return (
    <div className={cn('flex items-center justify-center w-full py-8', className)}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-muted rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
            <DefaultIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">{description}</p>
          {children}
        </CardContent>
        {actionText && onAction && (
          <CardFooter className="flex justify-center">
            <Button onClick={onAction}>
              <Plus className="mr-2 h-4 w-4" />
              {actionText}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export function DataNotFoundForEntity({
  entity,
  actionText,
  onAction,
  className
}: {
  entity: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}) {
  const IconComponent = iconMap[entity.toLowerCase()] || iconMap.default;
  
  const entityTitles: Record<string, string> = {
    classes: 'No Classes Found',
    students: 'No Students Found',
    teachers: 'No Teachers Found',
    subjects: 'No Subjects Found',
    attendance: 'No Attendance Records Found',
    grades: 'No Grades Found',
    invoices: 'No Invoices Found',
    payments: 'No Payments Found',
    notifications: 'No Notifications Found',
    dashboard: 'No Data Available',
    settings: 'No Settings Found',
    default: `No ${entity} Found`
  };
  
  const entityDescriptions: Record<string, string> = {
    classes: "You haven't added any classes yet. Get started by creating your first class.",
    students: "You haven't added any students yet. Get started by adding your first student.",
    teachers: "You haven't added any teachers yet. Get started by adding your first teacher.",
    subjects: "You haven't added any subjects yet. Get started by creating your first subject.",
    attendance: "No attendance records found for the selected period.",
    grades: "No grades have been recorded yet. Start by adding grades for your students.",
    invoices: "You don't have any invoices yet. Create your first invoice to get started.",
    payments: "No payments have been recorded yet.",
    notifications: "You don't have any notifications at the moment.",
    dashboard: "No data available to display on the dashboard.",
    settings: "No settings found for this section.",
    default: `You haven't added any ${entity.toLowerCase()} yet.`
  };
  
  const title = entityTitles[entity.toLowerCase()] || entityTitles.default;
  const description = entityDescriptions[entity.toLowerCase()] || entityDescriptions.default;
  
  return (
    <DataNotFound
      title={title}
      description={description}
      icon={IconComponent}
      actionText={actionText}
      onAction={onAction}
      className={className}
    />
  );
}