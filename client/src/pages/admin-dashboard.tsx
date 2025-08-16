import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCards from "@/components/dashboard/stats-cards";
import QuickActions from "@/components/dashboard/quick-actions";
import RecentActivities from "@/components/dashboard/recent-activities";
import SchedulePanel from "@/components/dashboard/schedule-panel";
import NotificationsPanel from "@/components/dashboard/notifications-panel";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentRole="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Admin Dashboard" />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6" data-testid="main-dashboard">
          <StatsCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <QuickActions />
              <RecentActivities />
            </div>
            
            <div className="space-y-6">
              <SchedulePanel />
              <NotificationsPanel />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
