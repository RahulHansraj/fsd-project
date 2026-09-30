import { ArrowDownRight, ArrowUpRight, MoreHorizontal } from 'lucide-react'
import type { MetricDefinition } from '../../types/dashboard'

interface MetricCardProps {
  metric: MetricDefinition
}

export function MetricCard({ metric }: MetricCardProps) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${metric.tone}`}>{metric.icon}</div>
      <div className="metric-top"><span>{metric.label}</span><button aria-label={`More details for ${metric.label}`}><MoreHorizontal size={17} /></button></div>
      <div className="metric-number">{metric.value}<small>{metric.suffix}</small></div>
      <div className="metric-foot">
        <span className={metric.positive ? 'positive' : 'negative'}>{metric.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{metric.delta}</span>
        <span>vs. last week</span>
        <i className={`mini-chart ${metric.chart}`} />
      </div>
    </article>
  )
}