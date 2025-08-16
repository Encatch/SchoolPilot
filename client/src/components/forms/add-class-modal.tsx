import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Teacher } from "@shared/schema";

const addClassSchema = z.object({
  name: z.string().min(1, "Class name is required"),
  grade: z.number().min(1).max(12, "Grade must be between 1 and 12"),
  section: z.string().min(1, "Section is required"),
  teacherId: z.string().optional(),
  academicYear: z.string().min(1, "Academic year is required"),
  maxStudents: z.number().min(1, "Maximum students must be at least 1").optional(),
});

type AddClassForm = z.infer<typeof addClassSchema>;

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddClassModal({ isOpen, onClose }: AddClassModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddClassForm>({
    resolver: zodResolver(addClassSchema),
    defaultValues: {
      maxStudents: 30,
      academicYear: new Date().getFullYear().toString(),
    },
  });

  const { data: teachers } = useQuery({
    queryKey: ["/api/teachers"],
    enabled: isOpen,
  });

  const addClassMutation = useMutation({
    mutationFn: async (data: AddClassForm) => {
      await apiRequest("POST", "/api/classes", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Class created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/classes"] });
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
        description: "Failed to create class",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: AddClassForm) => {
    addClassMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl" data-testid="add-class-modal">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Create New Class</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose} data-testid="button-close-modal">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="add-class-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Class Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g., Grade 10-A"
                data-testid="input-class-name"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="section">Section</Label>
              <Input
                id="section"
                {...register("section")}
                placeholder="e.g., A, B, C"
                data-testid="input-section"
              />
              {errors.section && (
                <p className="text-sm text-destructive mt-1">{errors.section.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="grade">Grade</Label>
              <Select onValueChange={(value) => setValue("grade", parseInt(value))}>
                <SelectTrigger data-testid="select-grade">
                  <SelectValue placeholder="Select Grade" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                    <SelectItem key={grade} value={grade.toString()}>
                      Grade {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.grade && (
                <p className="text-sm text-destructive mt-1">{errors.grade.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="teacherId">Class Teacher (Optional)</Label>
              <Select onValueChange={(value) => setValue("teacherId", value)}>
                <SelectTrigger data-testid="select-teacher">
                  <SelectValue placeholder="Select Teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers?.map((teacher: Teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.employeeId} - {teacher.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.teacherId && (
                <p className="text-sm text-destructive mt-1">{errors.teacherId.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="academicYear">Academic Year</Label>
              <Input
                id="academicYear"
                {...register("academicYear")}
                placeholder="2024-2025"
                data-testid="input-academic-year"
              />
              {errors.academicYear && (
                <p className="text-sm text-destructive mt-1">{errors.academicYear.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="maxStudents">Maximum Students</Label>
              <Input
                id="maxStudents"
                type="number"
                {...register("maxStudents", { valueAsNumber: true })}
                placeholder="30"
                data-testid="input-max-students"
              />
              {errors.maxStudents && (
                <p className="text-sm text-destructive mt-1">{errors.maxStudents.message}</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} data-testid="button-cancel">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={addClassMutation.isPending}
              data-testid="button-submit"
            >
              {addClassMutation.isPending ? "Creating..." : "Create Class"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
