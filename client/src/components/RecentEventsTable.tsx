import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// todo: remove mock functionality
const mockEvents = [
  { id: "ev_001", event: "page_view", user: "user_8234", timestamp: "2 min ago", properties: 3 },
  { id: "ev_002", event: "button_click", user: "user_1923", timestamp: "5 min ago", properties: 5 },
  { id: "ev_003", event: "form_submit", user: "user_5671", timestamp: "8 min ago", properties: 8 },
  { id: "ev_004", event: "video_play", user: "user_3421", timestamp: "12 min ago", properties: 4 },
  { id: "ev_005", event: "search", user: "user_9012", timestamp: "15 min ago", properties: 6 },
  { id: "ev_006", event: "page_view", user: "user_4567", timestamp: "18 min ago", properties: 3 },
  { id: "ev_007", event: "button_click", user: "user_7890", timestamp: "22 min ago", properties: 5 },
];

export function RecentEventsTable() {
  return (
    <Card data-testid="card-recent-events">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event ID</TableHead>
              <TableHead>Event Name</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Properties</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockEvents.map((event, index) => (
              <TableRow key={event.id} data-testid={`row-recent-event-${index}`}>
                <TableCell className="font-mono text-xs" data-testid={`text-event-id-${index}`}>
                  {event.id}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" data-testid={`badge-event-name-${index}`}>
                    {event.event}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm" data-testid={`text-user-id-${index}`}>
                  {event.user}
                </TableCell>
                <TableCell className="text-muted-foreground" data-testid={`text-properties-${index}`}>
                  {event.properties} properties
                </TableCell>
                <TableCell className="text-muted-foreground" data-testid={`text-timestamp-${index}`}>
                  {event.timestamp}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
