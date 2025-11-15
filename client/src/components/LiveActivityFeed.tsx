import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Zap } from "lucide-react";

interface LiveEvent {
  id: string;
  event: string;
  userId: string;
  timestamp: string;
  properties?: Record<string, any>;
}

const DEMO_WORKSPACE_ID = "demo-workspace-001";

export function LiveActivityFeed() {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [eventCount, setEventCount] = useState(0);

  const { isConnected, lastEvent } = useWebSocket({
    workspaceId: DEMO_WORKSPACE_ID,
    channels: ['events'],
    onEvent: (event: LiveEvent) => {
      setEvents((prev) => [event, ...prev].slice(0, 10)); // Keep only last 10
      setEventCount((prev) => prev + 1);
    },
  });

  // Add animation pulse effect when new event arrives
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (lastEvent) {
      setPulse(true);
      setTimeout(() => setPulse(false), 300);
    }
  }, [lastEvent]);

  return (
    <Card className="glass-card rounded-xl gold-glow">
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2 luxury-text">
              <Activity className="h-5 w-5 text-primary gold-pulse" />
              Live Activity Feed
            </CardTitle>
            <CardDescription className="text-sm text-sf-text-secondary">
              Real-time event stream
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              animate={pulse ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Badge
                variant={isConnected ? "default" : "secondary"}
                className={`${
                  isConnected
                    ? "bg-primary/10 text-primary border-primary/30 gold-glow"
                    : "bg-gray-500/10 text-gray-600"
                }`}
              >
                <span className="relative flex h-2 w-2 mr-1.5">
                  {isConnected && (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </>
                  )}
                  {!isConnected && (
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span>
                  )}
                </span>
                {isConnected ? "Live" : "Offline"}
              </Badge>
            </motion.div>
            <Badge variant="outline" className="font-mono">
              {eventCount.toLocaleString()} events
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="space-y-2">
          {events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Waiting for live events...</p>
              <p className="text-xs mt-1">
                Events will appear here as they're tracked
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -100, scale: 0.95 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    delay: index * 0.02,
                  }}
                  className="flex items-center justify-between p-3 rounded-lg glass-panel gold-border hover-elevate-2 group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-primary gold-pulse group-hover:scale-125 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs luxury-badge"
                        >
                          {event.event}
                        </Badge>
                        <span className="text-xs text-muted-foreground truncate">
                          {event.userId}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {formatDistanceToNow(new Date(event.timestamp), {
                      addSuffix: true,
                    })}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
