import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserCheck, Calendar, Download, Check, X, Clock } from "lucide-react";
import type { Attendance, Class } from "@shared/schema";

export default function Attendance() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

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

  const { data: classes } = useQuery({
    queryKey: ["/api/classes"],
    enabled: isAuthenticated,
  });

  const { data: attendance, isLoading: attendanceLoading } = useQuery({
    queryKey: ["/api/attendance/class", selectedClass, selectedDate],
    enabled: isAuthenticated && !!selectedClass && !!selectedDate,
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async (data: { studentId: string; classId: string; date: string; status: string }) => {
      await apiRequest("POST", "/api/attendance", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Attendance marked successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/class", selectedClass, selectedDate] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive",
      });
    },
  });

  const handleMarkAttendance = (studentId: string, status: 'present' | 'absent' | 'late') => {
    if (!selectedClass || !selectedDate) return;
    
    markAttendanceMutation.mutate({
      studentId,
      classId: selectedClass,
      date: selectedDate,
      status,
    });
  };

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
      <Sidebar currentRole={user?.role || 'admin'} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Attendance Management" />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6" data-testid="main-attendance">
          <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
            <CardContent className="p-6">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent bg-opacity-10 rounded-lg flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Attendance</h2>
                    <p className="text-sm text-gray-500">
                      Track student attendance by class and date
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" data-testid="button-export">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>

              {/* Filters Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger data-testid="select-class">
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes?.map((classItem: Class) => (
                        <SelectItem key={classItem.id} value={classItem.id}>
                          {classItem.name} - Section {classItem.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    data-testid="input-date"
                  />
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={() => {
                      if (selectedClass && selectedDate) {
                        queryClient.invalidateQueries({ queryKey: ["/api/attendance/class", selectedClass, selectedDate] });
                      }
                    }}
                    disabled={!selectedClass || !selectedDate}
                    data-testid="button-load-attendance"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Load Attendance
                  </Button>
                </div>
              </div>

              {/* Attendance Content */}
              {!selectedClass || !selectedDate ? (
                <div className="text-center py-12">
                  <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select Class and Date</h3>
                  <p className="text-gray-500">
                    Choose a class and date to view or mark attendance records.
                  </p>
                </div>
              ) : attendanceLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div>
                  {/* Attendance Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-accent">
                          {attendance?.filter((a: Attendance) => a.status === 'present').length || 0}
                        </div>
                        <div className="text-sm text-gray-500">Present</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-destructive">
                          {attendance?.filter((a: Attendance) => a.status === 'absent').length || 0}
                        </div>
                        <div className="text-sm text-gray-500">Absent</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-warning">
                          {attendance?.filter((a: Attendance) => a.status === 'late').length || 0}
                        </div>
                        <div className="text-sm text-gray-500">Late</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">
                          {attendance?.length || 0}
                        </div>
                        <div className="text-sm text-gray-500">Total</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Attendance Table */}
                  {attendance && attendance.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Marked By</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attendance.map((record: Attendance) => (
                            <TableRow key={record.id} data-testid={`attendance-row-${record.id}`}>
                              <TableCell>
                                <div className="font-medium text-gray-900">
                                  Student: {record.studentId}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className={
                                    record.status === 'present' 
                                      ? 'bg-accent bg-opacity-10 text-accent'
                                      : record.status === 'absent'
                                      ? 'bg-destructive bg-opacity-10 text-destructive'
                                      : 'bg-warning bg-opacity-10 text-warning'
                                  }
                                >
                                  {record.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-gray-900">
                                  {record.markedBy || "System"}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-gray-500">
                                  {new Date(record.createdAt!).toLocaleTimeString()}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMarkAttendance(record.studentId, 'present')}
                                    className="text-accent hover:text-accent/80"
                                    disabled={markAttendanceMutation.isPending}
                                    data-testid={`button-present-${record.id}`}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMarkAttendance(record.studentId, 'absent')}
                                    className="text-destructive hover:text-destructive/80"
                                    disabled={markAttendanceMutation.isPending}
                                    data-testid={`button-absent-${record.id}`}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMarkAttendance(record.studentId, 'late')}
                                    className="text-warning hover:text-warning/80"
                                    disabled={markAttendanceMutation.isPending}
                                    data-testid={`button-late-${record.id}`}
                                  >
                                    <Clock className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records</h3>
                      <p className="text-gray-500">
                        No attendance has been marked for this class on the selected date.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
