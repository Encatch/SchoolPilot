import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import AdminDashboard from "@/pages/admin-dashboard";
import TeacherDashboard from "@/pages/teacher-dashboard";
import ParentDashboard from "@/pages/parent-dashboard";
import Students from "@/pages/students";
import Teachers from "@/pages/teachers";
import Classes from "@/pages/classes";
import Attendance from "@/pages/attendance";
import Fees from "@/pages/fees";
import Assignments from "@/pages/assignments";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={() => {
            if (user?.role === 'admin') return <AdminDashboard />;
            if (user?.role === 'teacher') return <TeacherDashboard />;
            return <ParentDashboard />;
          }} />
          <Route path="/students" component={Students} />
          <Route path="/teachers" component={Teachers} />
          <Route path="/classes" component={Classes} />
          <Route path="/attendance" component={Attendance} />
          <Route path="/fees" component={Fees} />
          <Route path="/assignments" component={Assignments} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
