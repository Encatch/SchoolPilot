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
import { DollarSign, Download, CreditCard, Plus, Search } from "lucide-react";
import type { FeeStructure, FeePayment, Class } from "@shared/schema";

export default function Fees() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'structure' | 'payments'>('structure');

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

  const { data: feeStructure, isLoading: structureLoading } = useQuery({
    queryKey: ["/api/fees/structure", selectedClass],
    enabled: isAuthenticated && !!selectedClass && activeTab === 'structure',
  });

  const createFeeStructureMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/fees/structure", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Fee structure created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/fees/structure", selectedClass] });
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
        description: "Failed to create fee structure",
        variant: "destructive",
      });
    },
  });

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
        <Header title="Fee Management" />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6" data-testid="main-fees">
          <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
            <CardContent className="p-6">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-warning bg-opacity-10 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Fee Management</h2>
                    <p className="text-sm text-gray-500">
                      Manage fee structure and track payments
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => console.log("Create fee structure")}
                    className="bg-primary text-white hover:bg-primary/90"
                    data-testid="button-create-fee"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Fee Structure
                  </Button>
                  <Button variant="outline" data-testid="button-export">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                <Button
                  variant={activeTab === 'structure' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('structure')}
                  className="flex-1"
                  data-testid="tab-structure"
                >
                  Fee Structure
                </Button>
                <Button
                  variant={activeTab === 'payments' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('payments')}
                  className="flex-1"
                  data-testid="tab-payments"
                >
                  Payment Records
                </Button>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search"
                    />
                  </div>
                </div>
              </div>

              {/* Content based on active tab */}
              {activeTab === 'structure' ? (
                // Fee Structure Content
                <div>
                  {!selectedClass ? (
                    <div className="text-center py-12">
                      <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Class</h3>
                      <p className="text-gray-500">
                        Choose a class to view or manage its fee structure.
                      </p>
                    </div>
                  ) : structureLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div>
                      {/* Fee Structure Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-primary">
                              ${feeStructure?.reduce((sum: number, fee: FeeStructure) => sum + parseFloat(fee.amount), 0).toLocaleString() || 0}
                            </div>
                            <div className="text-sm text-gray-500">Total Fees</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-accent">
                              {feeStructure?.filter((f: FeeStructure) => f.frequency === 'monthly').length || 0}
                            </div>
                            <div className="text-sm text-gray-500">Monthly Fees</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-warning">
                              {feeStructure?.filter((f: FeeStructure) => f.frequency === 'quarterly').length || 0}
                            </div>
                            <div className="text-sm text-gray-500">Quarterly Fees</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-secondary">
                              {feeStructure?.filter((f: FeeStructure) => f.frequency === 'annual').length || 0}
                            </div>
                            <div className="text-sm text-gray-500">Annual Fees</div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Fee Structure Table */}
                      {feeStructure && feeStructure.length > 0 ? (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Fee Type</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Frequency</TableHead>
                                <TableHead>Academic Year</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {feeStructure.map((fee: FeeStructure) => (
                                <TableRow key={fee.id} data-testid={`fee-row-${fee.id}`}>
                                  <TableCell>
                                    <div className="font-medium text-gray-900 capitalize">
                                      {fee.feeType}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-lg font-semibold text-green-600">
                                      ${parseFloat(fee.amount).toLocaleString()}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className="capitalize">
                                      {fee.frequency}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm text-gray-900">
                                      {fee.academicYear}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-primary hover:text-primary/80"
                                        data-testid={`button-edit-fee-${fee.id}`}
                                      >
                                        Edit
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-destructive hover:text-destructive/80"
                                        data-testid={`button-delete-fee-${fee.id}`}
                                      >
                                        Delete
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
                          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No fee structure found</h3>
                          <p className="text-gray-500 mb-4">
                            Create a fee structure for this class to get started.
                          </p>
                          <Button onClick={() => console.log("Create fee structure")}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Fee Structure
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                // Payment Records Content
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Records</h3>
                  <p className="text-gray-500">
                    Payment tracking functionality will be available here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
