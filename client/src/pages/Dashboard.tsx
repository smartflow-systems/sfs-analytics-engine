import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/StatCard";
import { EventChart } from "@/components/EventChart";
import { TopEventsList } from "@/components/TopEventsList";
import { RecentEventsTable } from "@/components/RecentEventsTable";
import { LiveActivityFeed } from "@/components/LiveActivityFeed";
import { CircuitAnimation } from "@/components/CircuitAnimation";
import { Activity, Users, MousePointer, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsOverview {
  totalEvents: number;
  uniqueUsers: number;
  activeUsersNow: number;
  topEvents: { event: string; count: number }[];
  dateRange: { startDate: string; endDate: string };
}

export default function Dashboard() {
  const { data: overview, isLoading } = useQuery<AnalyticsOverview>({
    queryKey: ["/api/analytics/overview"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Calculate click rate (example: percentage of events that are clicks)
  const clickRate = overview?.topEvents
    ? ((overview.topEvents.find(e => e.event.includes("click"))?.count || 0) / overview.totalEvents * 100).toFixed(1)
    : "0.0";

  // Calculate conversion rate (example: paid / sent)
  const paidEvents = overview?.topEvents.find(e => e.event === "invoice_paid")?.count || 0;
  const sentEvents = overview?.topEvents.find(e => e.event === "invoice_sent")?.count || 0;
  const conversionRate = sentEvents > 0 ? ((paidEvents / sentEvents) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="text-page-title">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your events and monitor user activity in real-time
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="rounded-xl border bg-card border-card-border">
              <CardHeader className="p-6">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Events"
            value={overview?.totalEvents.toLocaleString() || "0"}
            change={12.5}
            trend="up"
            icon={Activity}
          />
          <StatCard
            title="Unique Users"
            value={overview?.uniqueUsers.toLocaleString() || "0"}
            change={8.2}
            trend="up"
            icon={Users}
          />
          <StatCard
            title="Active Now"
            value={overview?.activeUsersNow.toString() || "0"}
            subtitle="users online"
            icon={MousePointer}
          />
          <StatCard
            title="Conversion"
            value={`${conversionRate}%`}
            change={8.3}
            trend="up"
            icon={TrendingUp}
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EventChart />
        </div>
        <div>
          <TopEventsList topEvents={overview?.topEvents || []} isLoading={isLoading} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <LiveActivityFeed />
        <CircuitAnimation />
      </div>

      <RecentEventsTable />
    </div>
  );
}
