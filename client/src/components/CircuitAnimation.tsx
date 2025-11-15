import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cpu, Server, Database, Zap } from "lucide-react";

const DEMO_WORKSPACE_ID = "demo-workspace-001";

interface Node {
  id: string;
  label: string;
  icon: any;
  x: number;
  y: number;
  pulse: boolean;
}

interface Connection {
  from: string;
  to: string;
  particles: Particle[];
}

interface Particle {
  id: string;
  progress: number;
}

export function CircuitAnimation() {
  const [nodes] = useState<Node[]>([
    { id: "client", label: "Client App", icon: Cpu, x: 50, y: 150, pulse: false },
    { id: "api", label: "API Gateway", icon: Server, x: 250, y: 150, pulse: false },
    { id: "processing", label: "Event Queue", icon: Zap, x: 250, y: 50, pulse: false },
    { id: "database", label: "Database", icon: Database, x: 450, y: 150, pulse: false },
  ]);

  const [connections, setConnections] = useState<Connection[]>([
    { from: "client", to: "api", particles: [] },
    { from: "api", to: "processing", particles: [] },
    { from: "processing", to: "database", particles: [] },
  ]);

  const [eventCount, setEventCount] = useState(0);

  const { isConnected } = useWebSocket({
    workspaceId: DEMO_WORKSPACE_ID,
    channels: ['events'],
    onEvent: () => {
      setEventCount((prev) => prev + 1);
      // Trigger particle animation
      triggerFlow();
    },
  });

  const triggerFlow = () => {
    const particleId = `particle-${Date.now()}`;

    // Add particle to first connection
    setConnections((prev) => {
      const newConnections = [...prev];
      newConnections[0].particles.push({ id: particleId, progress: 0 });
      return newConnections;
    });

    // Animate through connections
    setTimeout(() => {
      setConnections((prev) => {
        const newConnections = [...prev];
        newConnections[0].particles = newConnections[0].particles.filter(p => p.id !== particleId);
        newConnections[1].particles.push({ id: particleId, progress: 0 });
        return newConnections;
      });
    }, 500);

    setTimeout(() => {
      setConnections((prev) => {
        const newConnections = [...prev];
        newConnections[1].particles = newConnections[1].particles.filter(p => p.id !== particleId);
        newConnections[2].particles.push({ id: particleId, progress: 0 });
        return newConnections;
      });
    }, 1000);

    setTimeout(() => {
      setConnections((prev) => {
        const newConnections = [...prev];
        newConnections[2].particles = newConnections[2].particles.filter(p => p.id !== particleId);
        return newConnections;
      });
    }, 1500);
  };

  // Get node position by id
  const getNodePos = (id: string) => {
    const node = nodes.find(n => n.id === id);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  return (
    <Card className="rounded-xl border bg-card border-card-border shadow-sm">
      <CardHeader className="p-6">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Event Flow Visualization
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Watch events flow through the system in real-time
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="relative w-full h-64 bg-muted/20 rounded-lg border border-border/50 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full">
            {/* Draw connections */}
            {connections.map((conn, idx) => {
              const from = getNodePos(conn.from);
              const to = getNodePos(conn.to);

              return (
                <g key={idx}>
                  {/* Connection line */}
                  <motion.line
                    x1={from.x + 40}
                    y1={from.y + 20}
                    x2={to.x + 40}
                    y2={to.y + 20}
                    stroke="hsl(var(--border))"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                  />

                  {/* Animated particles */}
                  {conn.particles.map((particle) => {
                    const progress = 0; // Will be animated
                    const x = from.x + 40 + (to.x - from.x + 40) * progress;
                    const y = from.y + 20 + (to.y - from.y + 20) * progress;

                    return (
                      <motion.circle
                        key={particle.id}
                        cx={from.x + 40}
                        cy={from.y + 20}
                        r="4"
                        fill="hsl(var(--primary))"
                        initial={{ cx: from.x + 40, cy: from.y + 20 }}
                        animate={{ cx: to.x + 40, cy: to.y + 20 }}
                        transition={{ duration: 0.5, ease: "linear" }}
                      >
                        <animate
                          attributeName="opacity"
                          values="0;1;1;0"
                          dur="0.5s"
                          repeatCount="1"
                        />
                      </motion.circle>
                    );
                  })}
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <motion.div
              key={node.id}
              className="absolute"
              style={{
                left: node.x,
                top: node.y,
              }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex flex-col items-center">
                <div className="w-20 h-10 bg-background border-2 border-primary/30 rounded-lg flex items-center justify-center hover-elevate group">
                  <node.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground mt-1 font-medium">
                  {node.label}
                </span>
              </div>
            </motion.div>
          ))}

          {/* Event counter overlay */}
          <div className="absolute top-4 right-4 bg-background/80 backdrop-blur rounded-lg border px-3 py-2">
            <div className="text-2xl font-bold text-primary">{eventCount}</div>
            <div className="text-xs text-muted-foreground">events processed</div>
          </div>

          {/* Connection status */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-background/80 backdrop-blur rounded-lg border px-3 py-1.5">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Streaming' : 'Disconnected'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
