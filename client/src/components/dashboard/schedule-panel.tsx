import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SchedulePanel() {
  // Static schedule data for demonstration
  const todaySchedule = [
    {
      id: 1,
      time: "9:00",
      period: "AM",
      title: "Math Class - Grade 10A",
      teacher: "Ms. Sarah Johnson",
      room: "Room 201",
      color: "primary"
    },
    {
      id: 2,
      time: "11:00", 
      period: "AM",
      title: "Physics Lab - Grade 11B",
      teacher: "Dr. Michael Brown",
      room: "Lab 1",
      color: "secondary"
    },
    {
      id: 3,
      time: "2:00",
      period: "PM", 
      title: "Parent Meeting",
      teacher: "Mr. & Mrs. Wilson",
      room: "Office",
      color: "accent"
    }
  ];

  return (
    <Card className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" data-testid="schedule-panel">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
      <div className="space-y-4">
        {todaySchedule.map((event) => (
          <div key={event.id} className="flex items-start space-x-3" data-testid={`schedule-event-${event.id}`}>
            <div className={`w-12 h-12 bg-${event.color} bg-opacity-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0`}>
              <span className={`text-xs font-medium text-${event.color}`}>{event.time}</span>
              <span className={`text-xs text-${event.color} opacity-75`}>{event.period}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{event.title}</p>
              <p className="text-sm text-gray-500">{event.teacher}</p>
              <p className="text-xs text-gray-400">{event.room}</p>
            </div>
          </div>
        ))}
      </div>
      
      <Button 
        variant="outline" 
        className="w-full mt-4 text-primary border-primary hover:bg-primary hover:text-white transition-colors"
        data-testid="button-view-full-schedule"
      >
        View Full Schedule
      </Button>
    </Card>
  );
}
