import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function NotificationsPanel() {
  // Static notifications for demonstration
  const notifications = [
    {
      id: 1,
      message: "New fee payment received from Emma Thompson's parent",
      time: "5 minutes ago",
      isNew: true
    },
    {
      id: 2,
      message: "Attendance report generated for Grade 8-A", 
      time: "1 hour ago",
      isNew: false
    },
    {
      id: 3,
      message: "Teacher Sarah Johnson submitted progress reports",
      time: "3 hours ago", 
      isNew: false
    }
  ];

  const newNotificationsCount = notifications.filter(n => n.isNew).length;

  return (
    <Card className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" data-testid="notifications-panel">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        {newNotificationsCount > 0 && (
          <Badge variant="destructive" className="bg-destructive bg-opacity-10 text-destructive" data-testid="new-notifications-badge">
            {newNotificationsCount} New
          </Badge>
        )}
      </div>
      <div className="space-y-3">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`flex items-start space-x-3 p-3 rounded-lg ${notification.isNew ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
            data-testid={`notification-${notification.id}`}
          >
            <div className={`w-2 h-2 rounded-full mt-2 ${notification.isNew ? 'bg-primary' : 'bg-gray-300'}`}></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">{notification.message}</p>
              <p className="text-xs text-gray-500">{notification.time}</p>
            </div>
          </div>
        ))}
      </div>
      
      <Button 
        variant="outline" 
        className="w-full mt-4 text-gray-600 border-gray-300 hover:bg-gray-50 transition-colors"
        data-testid="button-view-all-notifications"
      >
        View All Notifications
      </Button>
    </Card>
  );
}
