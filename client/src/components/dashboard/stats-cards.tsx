import { useQuery } from "@tanstack/react-query";
import { Users, Presentation, School, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cardData = [
    {
      title: "Total Students",
      value: stats?.totalStudents || 0,
      icon: Users,
      color: "primary",
      change: "+12% from last month"
    },
    {
      title: "Total Teachers", 
      value: stats?.totalTeachers || 0,
      icon: Presentation,
      color: "secondary",
      change: "+3 new this month"
    },
    {
      title: "Active Classes",
      value: stats?.activeClasses || 0,
      icon: School,
      color: "accent",
      change: "Across all grades"
    },
    {
      title: "Fee Collection",
      value: `$${stats?.totalFeeCollection?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: "warning",
      change: "85% collected"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6" data-testid="stats-cards">
      {cardData.map((card, index) => (
        <Card key={index} className="bg-white rounded-lg shadow-sm border border-gray-200" data-testid={`stats-card-${index}`}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 bg-${card.color} bg-opacity-10 rounded-lg flex items-center justify-center`}>
                  <card.icon className={`text-${card.color} h-5 w-5`} />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500" data-testid={`stats-title-${index}`}>{card.title}</p>
                <p className="text-2xl font-semibold text-gray-900" data-testid={`stats-value-${index}`}>{card.value}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-accent font-medium" data-testid={`stats-change-${index}`}>{card.change}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
