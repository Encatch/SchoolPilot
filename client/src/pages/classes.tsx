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
import { Plus, Download, Edit, Eye, Trash2, Search, School } from "lucide-react";
import AddClassModal from "@/components/forms/add-class-modal";
import type { Class } from "@shared/schema";

export default function Classes() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddClass, setShowAddClass] = useState(false);
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

  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ["/api/classes"],
    enabled: isAuthenticated,
  });

  const deleteClassMutation = useMutation({
    mutationFn: async (classId: string) => {
      await apiRequest("DELETE", `/api/classes/${classId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Class deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
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
        description: "Failed to delete class",
        variant: "destructive",
      });
    },
  });

  const filteredClasses = classes?.filter((classItem: Class) =>
    `${classItem.name} ${classItem.section} ${classItem.academicYear}`
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
        <Header title="Classes Management" />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6" data-testid="main-classes">
          <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
            <CardContent className="p-6">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent bg-opacity-10 rounded-lg flex items-center justify-center">
                    <School className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Classes</h2>
                    <p className="text-sm text-gray-500">
                      Manage academic classes and sections
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => setShowAddClass(true)}
                    className="bg-primary text-white hover:bg-primary/90"
                    data-testid="button-add-class"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Class
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
                    placeholder="Search classes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-classes"
                  />
                </div>
              </div>

              {/* Classes Table */}
              {classesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredClasses.length === 0 ? (
                <div className="text-center py-12">
                  <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? "No classes match your search criteria." : "Start by creating your first class."}
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setShowAddClass(true)} data-testid="button-add-first-class">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Class
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Class</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Academic Year</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClasses.map((classItem: Class) => (
                        <TableRow key={classItem.id} data-testid={`class-row-${classItem.id}`}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <School className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900" data-testid={`class-name-${classItem.id}`}>
                                  {classItem.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Section {classItem.section}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-primary bg-opacity-10 text-primary">
                              Grade {classItem.grade}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-900">
                              {classItem.teacherId ? `Teacher: ${classItem.teacherId}` : "Not assigned"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-900">
                              {classItem.maxStudents || 30} students
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-900">
                              {classItem.academicYear}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary/80"
                                data-testid={`button-edit-${classItem.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-gray-600"
                                data-testid={`button-view-${classItem.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive/80"
                                onClick={() => deleteClassMutation.mutate(classItem.id)}
                                disabled={deleteClassMutation.isPending}
                                data-testid={`button-delete-${classItem.id}`}
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

      <AddClassModal isOpen={showAddClass} onClose={() => setShowAddClass(false)} />
    </div>
  );
}
