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
import { Plus, Download, Edit, Eye, Trash2, Search, Presentation } from "lucide-react";
import AddTeacherModal from "@/components/forms/add-teacher-modal";
import type { Teacher } from "@shared/schema";

export default function Teachers() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddTeacher, setShowAddTeacher] = useState(false);
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

  const { data: teachers, isLoading: teachersLoading } = useQuery({
    queryKey: ["/api/teachers"],
    enabled: isAuthenticated,
  });

  const deleteTeacherMutation = useMutation({
    mutationFn: async (teacherId: string) => {
      await apiRequest("DELETE", `/api/teachers/${teacherId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Teacher deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
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
        description: "Failed to delete teacher",
        variant: "destructive",
      });
    },
  });

  const filteredTeachers = teachers?.filter((teacher: Teacher) =>
    `${teacher.employeeId} ${teacher.subject}`
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
        <Header title="Teachers Management" />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6" data-testid="main-teachers">
          <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
            <CardContent className="p-6">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary bg-opacity-10 rounded-lg flex items-center justify-center">
                    <Presentation className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Teachers</h2>
                    <p className="text-sm text-gray-500">
                      Manage faculty and teaching staff
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => setShowAddTeacher(true)}
                    className="bg-primary text-white hover:bg-primary/90"
                    data-testid="button-add-teacher"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Teacher
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
                    placeholder="Search teachers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-teachers"
                  />
                </div>
              </div>

              {/* Teachers Table */}
              {teachersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredTeachers.length === 0 ? (
                <div className="text-center py-12">
                  <Presentation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No teachers found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? "No teachers match your search criteria." : "Start by adding your first teacher."}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setShowAddTeacher(true)} data-testid="button-add-first-teacher">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Teacher
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Experience</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Qualifications</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTeachers.map((teacher: Teacher) => (
                        <TableRow key={teacher.id} data-testid={`teacher-row-${teacher.id}`}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <Presentation className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900" data-testid={`teacher-id-${teacher.id}`}>
                                  {teacher.employeeId}
                                </div>
                                <div className="text-sm text-gray-500">
                                  User: {teacher.userId}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-secondary bg-opacity-10 text-secondary capitalize">
                              {teacher.subject}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-900">
                              {teacher.experience} years
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-900">
                              {teacher.phone || "Not provided"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {teacher.qualifications || "Not specified"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary/80"
                                data-testid={`button-edit-${teacher.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-gray-600"
                                data-testid={`button-view-${teacher.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive/80"
                                onClick={() => deleteTeacherMutation.mutate(teacher.id)}
                                disabled={deleteTeacherMutation.isPending}
                                data-testid={`button-delete-${teacher.id}`}
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

      <AddTeacherModal isOpen={showAddTeacher} onClose={() => setShowAddTeacher(false)} />
    </div>
  );
}
