import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Class, Teacher } from "@shared/schema";

const addAssignmentSchema = z.object({
  title: z.string().min(1, "Assignment title is required"),
  description: z.string().min(1, "Description is required"),
  subject: z.string().min(1, "Subject is required"),
  classId: z.string().min(1, "Class is required"),
  teacherId: z.string().min(1, "Teacher is required"),
  dueDate: z.string().min(1, "Due date is required"),
  maxMarks: z.number().min(1, "Maximum marks must be at least 1"),
});

type AddAssignmentForm = z.infer<typeof addAssignmentSchema>;

interface AddAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddAssignmentModal({ isOpen, onClose }: AddAssignmentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddAssignmentForm>({
    resolver: zodResolver(addAssignmentSchema),
    defaultValues: {
      maxMarks: 100,
      dueDate: new Date().toISOString().split('T')[0],
    },
  });

  const { data: classes } = useQuery({
    queryKey: ["/api/classes"],
    enabled: isOpen,
  });

  const { data: teachers } = useQuery({
    queryKey: ["/api/teachers"],
    enabled: isOpen,
  });

  const addAssignmentMutation = useMutation({
    mutationFn: async (data: AddAssignmentForm) => {
      await apiRequest("POST", "/api/assignments", {
        ...data,
        status: "active",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Assignment created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
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
        description: "Failed to create assignment",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: AddAssignmentForm) => {
    addAssignmentMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="add-assignment-modal">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              <DialogTitle>Create New Assignment</DialogTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose} data-testid="button-close-modal">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="add-assignment-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Assignment Title</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="e.g., Chapter 5 Homework"
                data-testid="input-assignment-title"
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                {...register("subject")}
                placeholder="e.g., Mathematics, English"
                data-testid="input-subject"
              />
              {errors.subject && (
                <p className="text-sm text-destructive mt-1">{errors.subject.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Brief description of the assignment"
              rows={3}
              data-testid="textarea-description"
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="classId">Class</Label>
              <Select onValueChange={(value) => setValue("classId", value)}>
                <SelectTrigger data-testid="select-class">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {(classes as Class[])?.map((classItem: Class) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {classItem.name} - Section {classItem.section}
                    </SelectItem>
                  )) || []}
                </SelectContent>
              </Select>
              {errors.classId && (
                <p className="text-sm text-destructive mt-1">{errors.classId.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="teacherId">Teacher</Label>
              <Select onValueChange={(value) => setValue("teacherId", value)}>
                <SelectTrigger data-testid="select-teacher">
                  <SelectValue placeholder="Select Teacher" />
                </SelectTrigger>
                <SelectContent>
                  {(teachers as Teacher[])?.map((teacher: Teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.employeeId} - {teacher.subject}
                    </SelectItem>
                  )) || []}
                </SelectContent>
              </Select>
              {errors.teacherId && (
                <p className="text-sm text-destructive mt-1">{errors.teacherId.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                {...register("dueDate")}
                data-testid="input-due-date"
              />
              {errors.dueDate && (
                <p className="text-sm text-destructive mt-1">{errors.dueDate.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="maxMarks">Maximum Marks</Label>
              <Input
                id="maxMarks"
                type="number"
                {...register("maxMarks", { valueAsNumber: true })}
                placeholder="100"
                data-testid="input-max-marks"
              />
              {errors.maxMarks && (
                <p className="text-sm text-destructive mt-1">{errors.maxMarks.message}</p>
              )}
            </div>
          </div>
          
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} data-testid="button-cancel">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={addAssignmentMutation.isPending}
              data-testid="button-submit"
            >
              {addAssignmentMutation.isPending ? "Creating..." : "Create Assignment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}