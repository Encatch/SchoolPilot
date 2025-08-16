import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

const addTeacherSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  subject: z.string().min(1, "Subject is required"),
  experience: z.number().min(0, "Experience must be 0 or more"),
  phone: z.string().optional(),
  qualifications: z.string().optional(),
});

type AddTeacherForm = z.infer<typeof addTeacherSchema>;

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddTeacherModal({ isOpen, onClose }: AddTeacherModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AddTeacherForm>({
    resolver: zodResolver(addTeacherSchema),
    defaultValues: {
      experience: 0,
    },
  });

  const addTeacherMutation = useMutation({
    mutationFn: async (data: AddTeacherForm) => {
      await apiRequest("POST", "/api/teachers", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Teacher added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
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
        description: "Failed to add teacher",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: AddTeacherForm) => {
    addTeacherMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl" data-testid="add-teacher-modal">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Add New Teacher</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose} data-testid="button-close-modal">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="add-teacher-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                {...register("userId")}
                placeholder="Enter user ID"
                data-testid="input-user-id"
              />
              {errors.userId && (
                <p className="text-sm text-destructive mt-1">{errors.userId.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                {...register("employeeId")}
                placeholder="Enter employee ID"
                data-testid="input-employee-id"
              />
              {errors.employeeId && (
                <p className="text-sm text-destructive mt-1">{errors.employeeId.message}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select onValueChange={(value) => setValue("subject", value)}>
                <SelectTrigger data-testid="select-subject">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="biology">Biology</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="history">History</SelectItem>
                </SelectContent>
              </Select>
              {errors.subject && (
                <p className="text-sm text-destructive mt-1">{errors.subject.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="experience">Experience (Years)</Label>
              <Input
                id="experience"
                type="number"
                {...register("experience", { valueAsNumber: true })}
                placeholder="5"
                data-testid="input-experience"
              />
              {errors.experience && (
                <p className="text-sm text-destructive mt-1">{errors.experience.message}</p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="+1 (555) 123-4567"
              data-testid="input-phone"
            />
            {errors.phone && (
              <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="qualifications">Qualifications</Label>
            <Input
              id="qualifications"
              {...register("qualifications")}
              placeholder="Enter qualifications"
              data-testid="input-qualifications"
            />
            {errors.qualifications && (
              <p className="text-sm text-destructive mt-1">{errors.qualifications.message}</p>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} data-testid="button-cancel">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={addTeacherMutation.isPending}
              data-testid="button-submit"
            >
              {addTeacherMutation.isPending ? "Adding..." : "Add Teacher"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
