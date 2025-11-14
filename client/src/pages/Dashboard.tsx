import { StatCard } from "@/components/StatCard";
import { EventChart } from "@/components/EventChart";
import { TopEventsList } from "@/components/TopEventsList";
import { RecentEventsTable } from "@/components/RecentEventsTable";
import { Activity, Users, MousePointer, TrendingUp } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Track your events and monitor user activity in real-time
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Events"
          value="124,592"
          change={12.5}
          trend="up"
          icon={Activity}
        />
        <StatCard
          title="Unique Users"
          value="8,234"
          change={-3.2}
          trend="down"
          icon={Users}
        />
        <StatCard
          title="Click Rate"
          value="24.8%"
          change={5.1}
          trend="up"
          icon={MousePointer}
        />
        <StatCard
          title="Conversion"
          value="3.2%"
          change={8.3}
          trend="up"
          icon={TrendingUp}
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
