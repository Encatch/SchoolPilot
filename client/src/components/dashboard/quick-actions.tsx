import { UserPlus, GraduationCap, School, CalendarPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import AddTeacherModal from "@/components/forms/add-teacher-modal";
import AddStudentModal from "@/components/forms/add-student-modal";
import AddClassModal from "@/components/forms/add-class-modal";

export default function QuickActions() {
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddClass, setShowAddClass] = useState(false);

  const actions = [
    {
      icon: UserPlus,
      label: "Add Teacher",
      color: "primary",
      onClick: () => setShowAddTeacher(true)
    },
    {
      icon: GraduationCap,
      label: "Add Student", 
      color: "secondary",
      onClick: () => setShowAddStudent(true)
    },
    {
      icon: School,
      label: "Create Class",
      color: "accent", 
      onClick: () => setShowAddClass(true)
    },
    {
      icon: CalendarPlus,
      label: "Schedule",
      color: "warning",
      onClick: () => console.log("Schedule clicked")
    }
  ];

  return (
    <>
      <Card className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" data-testid="quick-actions">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={action.onClick}
              className="flex flex-col items-center p-4 h-auto space-y-2 hover:bg-gray-50 transition-colors"
              data-testid={`quick-action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <action.icon className={`text-${action.color} h-6 w-6`} />
              <span className="text-sm font-medium text-gray-700">{action.label}</span>
            </Button>
          ))}
        </div>
      </Card>

      <AddTeacherModal isOpen={showAddTeacher} onClose={() => setShowAddTeacher(false)} />
      <AddStudentModal isOpen={showAddStudent} onClose={() => setShowAddStudent(false)} />
      <AddClassModal isOpen={showAddClass} onClose={() => setShowAddClass(false)} />
    </>
  );
}
