import { UserPlus, Check, DollarSign, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RecentActivities() {
  // Static activities for demonstration - replace with real data from API
  const activities = [
    {
      id: 1,
      icon: UserPlus,
      color: "primary",
      actor: "Sarah Johnson",
      action: "added new student",
      target: "Michael Chen",
      details: "to Grade 10-A",
      timestamp: "2 hours ago"
    },
    {
      id: 2,
      icon: Check,
      color: "accent", 
      actor: "Attendance",
      action: "marked for Grade 8-B -",
      target: "28/30 present",
      details: "",
      timestamp: "4 hours ago"
    },
    {
      id: 3,
      icon: DollarSign,
      color: "warning",
      actor: "Fee payment",
      action: "received from",
      target: "David Wilson",
      details: "- $450",
      timestamp: "6 hours ago"
    },
    {
      id: 4,
      icon: FileText,
      color: "secondary",
      actor: "Progress report",
      action: "generated for Grade 9-C by",
      target: "Ms. Anderson",
      details: "",
      timestamp: "1 day ago"
    }
  ];

  return (
    <Card className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" data-testid="recent-activities">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
        <Button variant="link" className="text-sm text-primary hover:text-primary-dark" data-testid="button-view-all">
          View All
        </Button>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3" data-testid={`activity-${activity.id}`}>
            <div className={`w-8 h-8 bg-${activity.color} bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0`}>
              <activity.icon className={`text-${activity.color} h-4 w-4`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium">{activity.actor}</span>
                <span> {activity.action} </span>
                <span className="font-medium">{activity.target}</span>
                <span> {activity.details}</span>
              </p>
              <p className="text-xs text-gray-500">{activity.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
