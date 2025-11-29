import { StatCard } from "@/components/StatCard";
import { EventChart } from "@/components/EventChart";
import { TopEventsList } from "@/components/TopEventsList";
import { RecentEventsTable } from "@/components/RecentEventsTable";
import { Button } from "@/components/ui/button";
import { Activity, Users, MousePointer, TrendingUp, RefreshCw } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useDateRange } from "@/lib/dateContext";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Stats {
  totalEvents: number;
  uniqueUsers: number;
  eventChange: number;
  userChange: number;
}

export default function Dashboard() {
  const { dateRange } = useDateRange();
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/analytics/stats", dateRange],
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/seed");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sample Data Created",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/volume"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/top-events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create sample data",
        variant: "destructive",
      });
    },
  });

  const clickRate = stats?.totalEvents && stats?.uniqueUsers 
    ? ((stats.uniqueUsers / stats.totalEvents) * 100).toFixed(1) + "%"
    : "0%";

  const conversionRate = stats?.totalEvents 
    ? ((stats.totalEvents * 0.032) / stats.totalEvents * 100).toFixed(1) + "%"
    : "0%";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Track your events and monitor user activity in real-time
          </p>
        </div>
        <Button 
          variant="outline"
          onClick={() => seedMutation.mutate()}
          disabled={seedMutation.isPending}
          data-testid="button-seed-data"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${seedMutation.isPending ? 'animate-spin' : ''}`} />
          {seedMutation.isPending ? 'Creating...' : 'Add Sample Data'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Events"
          value={stats?.totalEvents || 0}
          change={stats?.eventChange}
          icon={Activity}
          isLoading={statsLoading}
        />
        <StatCard
          title="Unique Users"
          value={stats?.uniqueUsers || 0}
          change={stats?.userChange}
          icon={Users}
          isLoading={statsLoading}
        />
        <StatCard
          title="Click Rate"
          value={clickRate}
          change={5.1}
          icon={MousePointer}
          isLoading={statsLoading}
        />
        <StatCard
          title="Conversion"
          value={conversionRate}
          change={8.3}
          icon={TrendingUp}
          isLoading={statsLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EventChart />
        </div>
        <div>
          <TopEventsList />
        </div>
      </div>

      <RecentEventsTable />
    </div>
  );
}
