import { StatCard } from '../StatCard'
import { Activity, Users, MousePointer, TrendingUp } from 'lucide-react'

export default function StatCardExample() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Events" value="124,592" change={12.5} trend="up" icon={Activity} />
      <StatCard title="Unique Users" value="8,234" change={-3.2} trend="down" icon={Users} />
      <StatCard title="Click Rate" value="24.8%" change={5.1} trend="up" icon={MousePointer} />
      <StatCard title="Conversion" value="3.2%" change={8.3} trend="up" icon={TrendingUp} />
    </div>
  )
}
