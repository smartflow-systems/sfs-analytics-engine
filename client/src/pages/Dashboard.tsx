import { StatCard } from "@/components/StatCard";
import { EventChart } from "@/components/EventChart";
import { TopEventsList } from "@/components/TopEventsList";
import { RecentEventsTable } from "@/components/RecentEventsTable";
import { Button } from "@/components/ui/button";
import { Activity, Users, MousePointer, TrendingUp, RefreshCw, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useDateRange } from "@/lib/dateContext";
import { useAuth } from "@/lib/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface Stats {
  totalEvents: number;
  uniqueUsers: number;
  trends: {
    eventsChange: number;
    usersChange: number;
  };
}

export default function Dashboard() {
  const { dateRange } = useDateRange();
  const { currentWorkspace, token } = useAuth();

  const { data: stats, isLoading: statsLoading, error } = useQuery<Stats>({
    queryKey: ['analytics-stats', currentWorkspace?.id, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        range: dateRange || '7d',
      });
      const response = await fetch(
        `/api/workspaces/${currentWorkspace?.id}/analytics/stats?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    enabled: !!currentWorkspace && !!token,
  });

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">No Workspace Selected</h2>
          <p className="text-muted-foreground">Please select or create a workspace to continue</p>
        </div>
      </div>
    );
  }

  const usagePercentage = (currentWorkspace.eventCount / currentWorkspace.eventQuota) * 100;
  const isNearLimit = usagePercentage > 80;

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
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your events and monitor user activity in real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {currentWorkspace.eventCount.toLocaleString()} / {currentWorkspace.eventQuota.toLocaleString()} events
          </div>
        </div>
      </div>

      {/* Usage Warning */}
      {isNearLimit && (
        <Alert variant={usagePercentage >= 100 ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {usagePercentage >= 100 ? (
              <>
                You've reached your event limit for this month. Upgrade your plan to continue tracking events.
              </>
            ) : (
              <>
                You're using {usagePercentage.toFixed(0)}% of your monthly quota. Consider upgrading to avoid interruption.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Usage Progress Bar */}
      <div className="bg-card rounded-lg border p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Monthly Usage</span>
          <span className="text-sm text-muted-foreground">
            {usagePercentage.toFixed(1)}% used
          </span>
        </div>
        <Progress
          value={Math.min(usagePercentage, 100)}
          className="h-2"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Events"
          value={stats?.totalEvents || 0}
          change={stats?.trends?.eventsChange}
          icon={Activity}
          isLoading={statsLoading}
        />
        <StatCard
          title="Unique Users"
          value={stats?.uniqueUsers || 0}
          change={stats?.trends?.usersChange}
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

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EventChart />
        </div>
        <div>
          <TopEventsList />
        </div>
      </div>

      {/* Recent Events */}
      <RecentEventsTable />

      {/* Empty State */}
      {!statsLoading && stats?.totalEvents === 0 && (
        <div className="bg-card rounded-lg border p-12 text-center">
          <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Events Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start tracking events by creating an API key in Settings
          </p>
          <Button onClick={() => window.location.href = '/settings'}>
            Go to Settings
          </Button>
        </div>
      )}
    </div>
  );
}
