import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

const addStudentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  classId: z.string().optional(),
  parentId: z.string().optional(),
  admissionDate: z.string().min(1, "Admission date is required"),
  rollNumber: z.number().optional(),
});

type AddStudentForm = z.infer<typeof addStudentSchema>;

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddStudentModal({ isOpen, onClose }: AddStudentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddStudentForm>({
    resolver: zodResolver(addStudentSchema),
  });

  const addStudentMutation = useMutation({
    mutationFn: async (data: AddStudentForm) => {
      await apiRequest("POST", "/api/students", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Student added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      reset();
      onClose();
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
        description: "Failed to add student",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: AddStudentForm) => {
    addStudentMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl" data-testid="add-student-modal">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Add New Student</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose} data-testid="button-close-modal">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="add-student-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...register("firstName")}
                placeholder="Enter first name"
                data-testid="input-first-name"
              />
              {errors.firstName && (
                <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...register("lastName")}
                placeholder="Enter last name"
                data-testid="input-last-name"
              />
              {errors.lastName && (
                <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              {...register("studentId")}
              placeholder="STU-2024-001"
              data-testid="input-student-id"
            />
            {errors.studentId && (
              <p className="text-sm text-destructive mt-1">{errors.studentId.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
                data-testid="input-date-of-birth"
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-destructive mt-1">{errors.dateOfBirth.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="admissionDate">Admission Date</Label>
              <Input
                id="admissionDate"
                type="date"
                {...register("admissionDate")}
                data-testid="input-admission-date"
              />
              {errors.admissionDate && (
                <p className="text-sm text-destructive mt-1">{errors.admissionDate.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="classId">Class ID (Optional)</Label>
              <Input
                id="classId"
                {...register("classId")}
                placeholder="Enter class ID"
                data-testid="input-class-id"
              />
            </div>
            <div>
              <Label htmlFor="rollNumber">Roll Number (Optional)</Label>
              <Input
                id="rollNumber"
                type="number"
                {...register("rollNumber", { valueAsNumber: true })}
                placeholder="1"
                data-testid="input-roll-number"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="parentId">Parent ID (Optional)</Label>
            <Input
              id="parentId"
              {...register("parentId")}
              placeholder="Enter parent ID"
              data-testid="input-parent-id"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} data-testid="button-cancel">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={addStudentMutation.isPending}
              data-testid="button-submit"
            >
              {addStudentMutation.isPending ? "Adding..." : "Add Student"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
