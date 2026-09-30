import type { ReactNode } from 'react'

export type DashboardTab = 'Overview' | 'Collections' | 'Facilities' | 'Reports'

export interface RouteStatus {
  id: string
  district: string
  status: string
  progress: number
  color: string
}

export interface MetricDefinition {
  label: string
  value: string
  suffix?: string
  delta: string
  positive?: boolean
  icon: ReactNode
  tone: 'mint' | 'sun' | 'coral' | 'sky'
  chart: 'rise' | 'wave' | 'fall'
}

export interface FlowCategory {
  label: string
  value: string
  percentage: number
  color: string
  className: string
}