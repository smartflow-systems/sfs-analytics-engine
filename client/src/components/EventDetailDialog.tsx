import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { Calendar, User, Code, Sparkles } from "lucide-react";

interface EventDetailDialogProps {
  event: {
    id: string;
    event: string;
    userId: string;
    timestamp: string;
    properties?: Record<string, any>;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailDialog({ event, open, onOpenChange }: EventDetailDialogProps) {
  if (!event) return null;

  const formatJSON = (obj: any) => JSON.stringify(obj, null, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card gold-glow max-w-2xl border-primary/30">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center gold-border gold-glow">
              <Sparkles className="h-6 w-6 text-primary gold-pulse" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl luxury-heading">Event Details</DialogTitle>
              <DialogDescription className="text-sf-text-secondary">
                Complete information about this tracked event
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[600px] pr-4">
          <div className="space-y-6 py-4">
            {/* Event Name */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-sf-text-muted">
                <Code className="h-4 w-4" />
                <span className="font-medium">Event Name</span>
              </div>
              <Badge className="luxury-badge text-base px-4 py-2">
                {event.event}
              </Badge>
            </div>

            <Separator className="bg-primary/20" />

            {/* User ID */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-sf-text-muted">
                <User className="h-4 w-4" />
                <span className="font-medium">User ID</span>
              </div>
              <p className="font-mono text-lg luxury-text">{event.userId}</p>
            </div>

            <Separator className="bg-primary/20" />

            {/* Timestamp */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-sf-text-muted">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Timestamp</span>
              </div>
              <div className="space-y-1">
                <p className="luxury-text font-semibold">
                  {new Date(event.timestamp).toLocaleString("en-US", {
                    dateStyle: "full",
                    timeStyle: "long",
                  })}
                </p>
                <p className="text-sm text-sf-text-muted">
                  {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>

            {/* Properties */}
            {event.properties && Object.keys(event.properties).length > 0 && (
              <>
                <Separator className="bg-primary/20" />
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-sf-text-muted">
                    <Code className="h-4 w-4" />
                    <span className="font-medium">Properties ({Object.keys(event.properties).length})</span>
                  </div>

                  {/* Property cards */}
                  <div className="space-y-2">
                    {Object.entries(event.properties).map(([key, value]) => (
                      <div
                        key={key}
                        className="glass-panel gold-border rounded-lg p-3 hover-elevate-2 group transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <span className="font-mono text-sm text-primary group-hover:text-primary/80 transition-colors">
                            {key}
                          </span>
                          <span className="font-mono text-sm luxury-text text-right break-all">
                            {typeof value === "object" ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-primary/20" />

                {/* JSON Viewer */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-sf-text-muted">
                    <Code className="h-4 w-4" />
                    <span className="font-medium">Raw JSON</span>
                  </div>
                  <div className="glass-panel gold-border rounded-lg p-4 overflow-x-auto">
                    <pre className="font-mono text-xs luxury-text">
                      {formatJSON(event.properties)}
                    </pre>
                  </div>
                </div>
              </>
            )}

            {/* Event ID */}
            <Separator className="bg-primary/20" />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-sf-text-muted">
                <Code className="h-4 w-4" />
                <span className="font-medium">Event ID</span>
              </div>
              <p className="font-mono text-xs text-sf-text-muted">{event.id}</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
