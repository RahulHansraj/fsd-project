import type { FlowCategory } from '../../types/dashboard'

interface FlowLegendProps {
  category: FlowCategory
}

export function FlowLegend({ category }: FlowLegendProps) {
  return <div><span><i style={{ background: category.color }} />{category.label}</span><strong>{category.value}</strong></div>
}