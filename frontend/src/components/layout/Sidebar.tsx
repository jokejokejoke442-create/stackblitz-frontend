'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  DollarSign,
  FileText,
  Bell,
  Settings,
  BarChart3,
  UserCog,
  ClipboardList,
  MessageSquare,
  Building,
  Bus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  title: string;
  href: string;
  icon: any;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'teacher', 'parent', 'student'],
  },
  {
    title: 'Driver Dashboard',
    href: '/driver/dashboard',
    icon: Bus,
    roles: ['driver'],
  },
  {
    title: 'Students',
    href: '/students',
    icon: Users,
    roles: ['admin', 'teacher'],
  },
  {
    title: 'Teachers',
    href: '/teachers',
    icon: GraduationCap,
    roles: ['admin'],
  },
  {
    title: 'Classes',
    href: '/classes',
    icon: BookOpen,
    roles: ['admin', 'teacher'],
  },
  {
    title: 'Subjects',
    href: '/subjects',
    icon: ClipboardList,
    roles: ['admin', 'teacher'],
  },
  {
    title: 'Attendance',
    href: '/attendance',
    icon: Calendar,
    roles: ['admin', 'teacher'],
  },
  {
    title: 'Grades',
    href: '/grades',
    icon: BarChart3,
    roles: ['admin', 'teacher', 'student', 'parent'],
  },
  {
    title: 'Bus Tracking',
    href: '/buses',
    icon: Bus,
    roles: ['admin'],
  },
  {
    title: 'Finance',
    href: '/finance',
    icon: DollarSign,
    roles: ['admin', 'parent'],
  },
  {
    title: 'Invoices',
    href: '/invoices',
    icon: FileText,
    roles: ['admin', 'parent'],
  },
  {
    title: 'Payments',
    href: '/payments',
    icon: DollarSign,
    roles: ['admin', 'parent'],
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: FileText,
    roles: ['admin', 'teacher'],
  },
  {
    title: 'Messages',
    href: '/messages',
    icon: MessageSquare,
    roles: ['admin', 'teacher', 'parent', 'student'],
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
    roles: ['admin', 'teacher', 'parent', 'student', 'driver'],
  },
  {
    title: 'My Profile',
    href: '/profile',
    icon: UserCog,
    roles: ['admin', 'teacher', 'parent', 'student', 'driver'],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['admin'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  // Clear pending state when the route matches the clicked href
  useEffect(() => {
    if (!pendingHref) return;
    if (pathname === pendingHref || pathname.startsWith(pendingHref + '/')) {
      setPendingHref(null);
    }
  }, [pathname, pendingHref]);

  const handleNavClick = useCallback((href: string) => () => {
    setPendingHref(href);
  }, []);

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role || '')
  );

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r">
      <div className="flex h-16 items-center border-b px-6">
        <Building className="h-6 w-6 text-primary mr-2" />
        <span className="text-xl font-bold">EduCloud</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick(item.href)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="flex items-center gap-2">
                {item.title}
                {pendingHref === item.href && (
                  <svg className="size-3 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                )}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}