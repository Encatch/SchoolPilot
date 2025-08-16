import { Link, useLocation } from "wouter";
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  School, 
  Calendar, 
  UserCheck, 
  DollarSign, 
  FileText, 
  Book, 
  Bus, 
  Bell,
  Presentation,
  Variable,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentRole: 'admin' | 'teacher' | 'parent';
}

const adminMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Presentation, label: "Teachers", href: "/teachers" },
  { icon: Users, label: "Students", href: "/students" },
  { icon: School, label: "Classes", href: "/classes" },
  { icon: Calendar, label: "Timetable", href: "/timetable" },
  { icon: UserCheck, label: "Attendance", href: "/attendance" },
  { icon: DollarSign, label: "Fees", href: "/fees" },
  { icon: FileText, label: "Exams", href: "/exams" },
  { icon: Book, label: "Curriculum", href: "/curriculum" },
  { icon: Bus, label: "Transport", href: "/transport" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
];

const teacherMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Users, label: "My Students", href: "/students" },
  { icon: Variable, label: "Assignments", href: "/assignments" },
  { icon: UserCheck, label: "Attendance", href: "/attendance" },
  { icon: BarChart3, label: "Progress Reports", href: "/reports" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
];

const parentMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: BarChart3, label: "Child Progress", href: "/progress" },
  { icon: UserCheck, label: "Attendance", href: "/attendance" },
  { icon: DollarSign, label: "Fee Payments", href: "/fees" },
  { icon: Bus, label: "Transport", href: "/transport" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
];

export default function Sidebar({ currentRole }: SidebarProps) {
  const [location] = useLocation();
  
  const menuItems = 
    currentRole === 'admin' ? adminMenuItems :
    currentRole === 'teacher' ? teacherMenuItems :
    parentMenuItems;

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col" data-testid="sidebar">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r border-gray-200">
        {/* Logo Section */}
        <div className="flex items-center flex-shrink-0 px-4" data-testid="logo-section">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="text-white text-sm" />
            </div>
            <h1 className="ml-3 text-xl font-semibold text-gray-900">EduManage</h1>
          </div>
        </div>

        {/* Role Badge */}
        <div className="mt-6 px-4">
          <div className="px-3 py-2 text-sm font-medium text-center bg-gray-100 rounded-lg text-gray-700 capitalize">
            {currentRole} Portal
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6 flex-1 px-2 pb-4 space-y-1" data-testid="navigation-menu">
          {menuItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <a className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive 
                    ? "bg-primary text-white" 
                    : "text-gray-700 hover:bg-gray-100"
                )}
                data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className={cn(
                    "mr-3 text-sm",
                    isActive ? "text-white" : "text-gray-500"
                  )} />
                  {item.label}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4" data-testid="user-profile-section">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <Users className="text-gray-600 text-sm" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700" data-testid="user-name">User</p>
              <p className="text-xs text-gray-500 capitalize" data-testid="user-role">{currentRole}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
