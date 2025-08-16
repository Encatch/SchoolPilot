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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Download, Edit, Eye, Trash2, Search, Users } from "lucide-react";
import AddStudentModal from "@/components/forms/add-student-modal";
import type { Student } from "@shared/schema";

export default function Students() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddStudent, setShowAddStudent] = useState(false);
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

  const { data: students, isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/students"],
    enabled: isAuthenticated,
  });

  const deleteStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      await apiRequest("DELETE", `/api/students/${studentId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Student deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
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
        description: "Failed to delete student",
        variant: "destructive",
      });
    },
  });

  const filteredStudents = students?.filter((student: Student) =>
    `${student.firstName} ${student.lastName} ${student.studentId}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  ) || [];

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
        <Header title="Students Management" />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6" data-testid="main-students">
          <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
            <CardContent className="p-6">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Students</h2>
                    <p className="text-sm text-gray-500">
                      Manage student enrollment and information
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => setShowAddStudent(true)}
                    className="bg-primary text-white hover:bg-primary/90"
                    data-testid="button-add-student"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                  <Button variant="outline" data-testid="button-export">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Search Section */}
              <div className="mb-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-students"
                  />
                </div>
              </div>

              {/* Students Table */}
              {studentsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? "No students match your search criteria." : "Start by adding your first student."}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setShowAddStudent(true)} data-testid="button-add-first-student">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Student
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Parent</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Admission Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student: Student) => (
                        <TableRow key={student.id} data-testid={`student-row-${student.id}`}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <Users className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900" data-testid={`student-name-${student.id}`}>
                                  {student.firstName} {student.lastName}
                                </div>
                                <div className="text-sm text-gray-500" data-testid={`student-id-${student.id}`}>
                                  {student.studentId}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-900">
                              {student.classId ? `Class ${student.classId}` : "Not assigned"}
                            </div>
                            {student.rollNumber && (
                              <div className="text-sm text-gray-500">Roll: {student.rollNumber}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-900">
                              {student.parentId ? `Parent: ${student.parentId}` : "Not assigned"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={student.status === 'active' ? 'default' : 'secondary'}
                              className={
                                student.status === 'active' 
                                  ? 'bg-accent bg-opacity-10 text-accent'
                                  : 'bg-gray-100 text-gray-700'
                              }
                            >
                              {student.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-900">
                              {new Date(student.admissionDate).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary/80"
                                data-testid={`button-edit-${student.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-gray-600"
                                data-testid={`button-view-${student.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive/80"
                                onClick={() => deleteStudentMutation.mutate(student.id)}
                                disabled={deleteStudentMutation.isPending}
                                data-testid={`button-delete-${student.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      <AddStudentModal isOpen={showAddStudent} onClose={() => setShowAddStudent(false)} />
    </div>
  );
}
