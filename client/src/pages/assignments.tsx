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
import { FileText, Download, Plus, Search, Calendar, Edit, Eye, Trash2 } from "lucide-react";
import type { Assignment, Class } from "@shared/schema";

export default function Assignments() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

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

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: selectedClass ? ["/api/assignments/class", selectedClass] : ["/api/assignments"],
    enabled: isAuthenticated,
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      await apiRequest("DELETE", `/api/assignments/${assignmentId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      if (selectedClass) {
        queryClient.invalidateQueries({ queryKey: ["/api/assignments/class", selectedClass] });
      }
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
        description: "Failed to delete assignment",
        variant: "destructive",
      });
    },
  });

  const filteredAssignments = assignments?.filter((assignment: Assignment) =>
    `${assignment.title} ${assignment.subject}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-accent bg-opacity-10 text-accent';
      case 'completed':
        return 'bg-primary bg-opacity-10 text-primary';
      case 'cancelled':
        return 'bg-destructive bg-opacity-10 text-destructive';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
        <Header title="Assignments Management" />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6" data-testid="main-assignments">
          <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
            <CardContent className="p-6">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary bg-opacity-10 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Assignments</h2>
                    <p className="text-sm text-gray-500">
                      Manage assignments and track student submissions
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => console.log("Create assignment")}
                    className="bg-primary text-white hover:bg-primary/90"
                    data-testid="button-create-assignment"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Assignment
                  </Button>
                  <Button variant="outline" data-testid="button-export">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Filters Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Class</label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger data-testid="select-class">
                      <SelectValue placeholder="All classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All classes</SelectItem>
                      {classes?.map((classItem: Class) => (
                        <SelectItem key={classItem.id} value={classItem.id}>
                          {classItem.name} - Section {classItem.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search assignments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search"
                    />
                  </div>
                </div>
              </div>

              {/* Assignment Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">
                      {assignments?.length || 0}
                    </div>
                    <div className="text-sm text-gray-500">Total Assignments</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-accent">
                      {assignments?.filter((a: Assignment) => a.status === 'active').length || 0}
                    </div>
                    <div className="text-sm text-gray-500">Active</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-warning">
                      {assignments?.filter((a: Assignment) => {
                        const daysUntilDue = getDaysUntilDue(a.dueDate);
                        return daysUntilDue <= 3 && daysUntilDue >= 0 && a.status === 'active';
                      }).length || 0}
                    </div>
                    <div className="text-sm text-gray-500">Due Soon</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-secondary">
                      {assignments?.filter((a: Assignment) => a.status === 'completed').length || 0}
                    </div>
                    <div className="text-sm text-gray-500">Completed</div>
                  </CardContent>
                </Card>
              </div>

              {/* Assignments Table */}
              {assignmentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredAssignments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || selectedClass ? "No assignments match your criteria." : "Start by creating your first assignment."}
                  </p>
                  {!searchTerm && !selectedClass && (
                    <Button onClick={() => console.log("Create assignment")} data-testid="button-create-first">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Assignment
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Assignment</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Max Marks</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssignments.map((assignment: Assignment) => {
                        const daysUntilDue = getDaysUntilDue(assignment.dueDate);
                        return (
                          <TableRow key={assignment.id} data-testid={`assignment-row-${assignment.id}`}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                  <FileText className="h-4 w-4 text-gray-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900" data-testid={`assignment-title-${assignment.id}`}>
                                    {assignment.title}
                                  </div>
                                  <div className="text-sm text-gray-500 max-w-xs truncate">
                                    {assignment.description}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-900">
                                Class: {assignment.classId}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-primary bg-opacity-10 text-primary">
                                {assignment.subject}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-900">
                                {new Date(assignment.dueDate).toLocaleDateString()}
                              </div>
                              {daysUntilDue >= 0 && daysUntilDue <= 3 && assignment.status === 'active' && (
                                <div className="text-xs text-warning font-medium">
                                  Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}
                                </div>
                              )}
                              {daysUntilDue < 0 && assignment.status === 'active' && (
                                <div className="text-xs text-destructive font-medium">
                                  Overdue
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm font-medium text-gray-900">
                                {assignment.maxMarks} marks
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(assignment.status)}>
                                {assignment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-primary hover:text-primary/80"
                                  data-testid={`button-edit-${assignment.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-400 hover:text-gray-600"
                                  data-testid={`button-view-${assignment.id}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive/80"
                                  onClick={() => deleteAssignmentMutation.mutate(assignment.id)}
                                  disabled={deleteAssignmentMutation.isPending}
                                  data-testid={`button-delete-${assignment.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
