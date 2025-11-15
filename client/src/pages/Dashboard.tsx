import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/StatCard";
import { EventChart } from "@/components/EventChart";
import { TopEventsList } from "@/components/TopEventsList";
import { RecentEventsTable } from "@/components/RecentEventsTable";
import { LiveActivityFeed } from "@/components/LiveActivityFeed";
import { CircuitAnimation } from "@/components/CircuitAnimation";
import { DateRangePicker } from "@/components/DateRangePicker";
import { QuickFilters } from "@/components/QuickFilters";
import { FunnelVisualization } from "@/components/FunnelVisualization";
import { AIInsights } from "@/components/AIInsights";
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
      <div className="glass-card p-8 gold-glow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-5xl luxury-heading mb-2" data-testid="text-page-title">
              SFS Analytics Engine
            </h1>
            <p className="text-lg text-sf-text-secondary">
              Luxurious event tracking with real-time insights ✨
            </p>
          </div>
          <DateRangePicker />
        </div>
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

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <div className="grid gap-6">
            <EventChart />
            <FunnelVisualization />
          </div>
        </div>
        <div className="space-y-6">
          <QuickFilters />
          <TopEventsList topEvents={overview?.topEvents || []} isLoading={isLoading} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <LiveActivityFeed />
        <CircuitAnimation />
        <AIInsights />
      </div>

      <RecentEventsTable />
    </div>
  );
}
