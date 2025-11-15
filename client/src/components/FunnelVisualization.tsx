import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

const mockFunnelData: FunnelStage[] = [
  { name: "Page View", count: 10000, percentage: 100, color: "hsl(var(--sf-gold))" },
  { name: "Product Viewed", count: 7500, percentage: 75, color: "hsl(var(--sf-gold-dark))" },
  { name: "Added to Cart", count: 4500, percentage: 45, color: "hsl(var(--sf-gold-muted))" },
  { name: "Checkout Started", count: 2000, percentage: 20, color: "hsl(45 70% 45%)" },
  { name: "Purchase Complete", count: 1200, percentage: 12, color: "hsl(45 50% 40%)" },
];

export function FunnelVisualization() {
  const maxWidth = 100;

  return (
    <Card className="glass-card gold-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2 luxury-text">
              <TrendingDown className="h-5 w-5 text-primary gold-pulse" />
              Conversion Funnel
            </CardTitle>
            <CardDescription className="text-sf-text-secondary">
              Track user journey from awareness to conversion
            </CardDescription>
          </div>
          <div className="glass-panel gold-border rounded-lg px-3 py-2">
            <div className="text-2xl font-bold luxury-heading">12%</div>
            <div className="text-xs text-sf-text-muted">Overall Rate</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {mockFunnelData.map((stage, index) => {
          const width = (stage.percentage / mockFunnelData[0].percentage) * maxWidth;
          const dropoff = index > 0
            ? ((mockFunnelData[index - 1].count - stage.count) / mockFunnelData[index - 1].count * 100).toFixed(1)
            : null;

          return (
            <div key={stage.name} className="space-y-2">
              <div className="relative group">
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: `${width}%`, opacity: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                  className="glass-panel gold-border rounded-lg p-4 hover-elevate-2 cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, ${stage.color}15 0%, ${stage.color}05 100%)`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full gold-pulse"
                        style={{ backgroundColor: stage.color }}
                      />
                      <div>
                        <p className="font-semibold luxury-text">{stage.name}</p>
                        <p className="text-xs text-sf-text-muted">
                          {stage.count.toLocaleString()} users
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {dropoff && (
                        <div className="glass-panel gold-border px-2 py-1 rounded">
                          <p className="text-xs text-destructive font-semibold">
                            -{dropoff}%
                          </p>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-2xl font-bold luxury-heading">{stage.percentage}%</p>
                        <p className="text-xs text-sf-text-muted">conversion</p>
                      </div>
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="absolute inset-0 rounded-lg shine" />
                  </div>
                </motion.div>
              </div>

              {/* Arrow between stages */}
              {index < mockFunnelData.length - 1 && (
                <div className="flex items-center justify-center py-1">
                  <ArrowRight className="h-4 w-4 text-primary/50" />
                </div>
              )}
            </div>
          );
        })}

        {/* Summary */}
        <div className="glass-panel gold-border rounded-lg p-4 mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary gold-pulse" />
            <span className="text-sm font-semibold luxury-text">Funnel Insights</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-sf-text-muted mb-1">Total Users</p>
              <p className="text-lg font-bold luxury-heading">
                {mockFunnelData[0].count.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-sf-text-muted mb-1">Conversions</p>
              <p className="text-lg font-bold luxury-heading">
                {mockFunnelData[mockFunnelData.length - 1].count.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-sf-text-muted mb-1">Biggest Drop</p>
              <p className="text-lg font-bold text-destructive">
                -55%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
