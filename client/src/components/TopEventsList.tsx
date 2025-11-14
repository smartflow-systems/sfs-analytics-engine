import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// todo: remove mock functionality
const mockTopEvents = [
  { name: "page_view", count: 45230, change: 12 },
  { name: "button_click", count: 28940, change: -3 },
  { name: "form_submit", count: 15680, change: 8 },
  { name: "video_play", count: 12450, change: 22 },
  { name: "search", count: 9870, change: 5 },
];

export function TopEventsList() {
  return (
    <Card data-testid="card-top-events">
      <CardHeader>
        <CardTitle>Top Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockTopEvents.map((event, index) => (
            <div
              key={event.name}
              className="flex items-center justify-between"
              data-testid={`row-event-${index}`}
            >
              <div className="flex-1">
                <p className="font-mono text-sm font-medium" data-testid={`text-event-name-${index}`}>
                  {event.name}
                </p>
                <p className="text-xs text-muted-foreground" data-testid={`text-event-count-${index}`}>
                  {event.count.toLocaleString()} events
                </p>
              </div>
              <Badge
                variant={event.change >= 0 ? "secondary" : "outline"}
                className="ml-2"
                data-testid={`badge-event-change-${index}`}
              >
                {event.change >= 0 ? "+" : ""}
                {event.change}%
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
