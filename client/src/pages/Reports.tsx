import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Plus, Clock } from "lucide-react";

// todo: remove mock functionality
const mockReports = [
  {
    id: 1,
    name: "Weekly User Engagement",
    description: "Track user activity patterns and engagement metrics",
    lastUpdated: "2 hours ago",
    type: "Scheduled",
  },
  {
    id: 2,
    name: "Conversion Funnel Analysis",
    description: "Monitor conversion rates across different stages",
    lastUpdated: "1 day ago",
    type: "On-demand",
  },
  {
    id: 3,
    name: "Event Performance Summary",
    description: "Comprehensive overview of all tracked events",
    lastUpdated: "3 hours ago",
    type: "Scheduled",
  },
  {
    id: 4,
    name: "Monthly Active Users",
    description: "Monthly breakdown of active user statistics",
    lastUpdated: "5 days ago",
    type: "Scheduled",
  },
  {
    id: 5,
    name: "Custom Property Analysis",
    description: "Deep dive into custom event properties and patterns",
    lastUpdated: "1 week ago",
    type: "On-demand",
  },
  {
    id: 6,
    name: "Retention Cohort Report",
    description: "Analyze user retention across different cohorts",
    lastUpdated: "2 days ago",
    type: "Scheduled",
  },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage custom analytics reports
          </p>
        </div>
        <Button data-testid="button-new-report">
          <Plus className="h-4 w-4 mr-2" />
          New Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockReports.map((report) => (
          <Card
            key={report.id}
            className="hover-elevate active-elevate-2"
            data-testid={`card-report-${report.id}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <Badge variant="outline" data-testid={`badge-report-type-${report.id}`}>
                  {report.type}
                </Badge>
              </div>
              <CardTitle className="text-base mt-2" data-testid={`text-report-name-${report.id}`}>
                {report.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground" data-testid={`text-report-desc-${report.id}`}>
                {report.description}
              </p>
              <div className="flex items-center gap-1 mt-4 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span data-testid={`text-report-updated-${report.id}`}>Updated {report.lastUpdated}</span>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" data-testid={`button-view-report-${report.id}`}>
                View
              </Button>
              <Button variant="ghost" size="sm" data-testid={`button-download-report-${report.id}`}>
                <Download className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
