import { AlertTriangle, Recycle, Route, Trash2 } from 'lucide-react'
import type { FlowCategory, MetricDefinition, RouteStatus } from '../types/dashboard'

export const routes: RouteStatus[] = [
  { id: 'R-14', district: 'Fisherman Wharf', status: 'On schedule', progress: 78, color: '#3a8f68' },
  { id: 'R-22', district: 'Financial & SoMa', status: '12 min delayed', progress: 56, color: '#d88638' },
  { id: 'R-08', district: 'Sunset District', status: 'On schedule', progress: 89, color: '#3a8f68' },
]

export const metrics: MetricDefinition[] = [
  { label: 'Diversion rate', value: '67.4%', delta: '2.8%', positive: true, icon: <Recycle size={19} />, tone: 'mint', chart: 'rise' },
  { label: 'Collected today', value: '418.2', suffix: 'tonnes', delta: '4.1%', positive: true, icon: <Trash2 size={19} />, tone: 'sun', chart: 'wave' },
  { label: 'Landfill capacity', value: '41', suffix: 'days remaining', delta: '7 days', icon: <AlertTriangle size={19} />, tone: 'coral', chart: 'fall' },
  { label: 'Fleet availability', value: '94.6%', delta: '1.2%', positive: true, icon: <Route size={19} />, tone: 'sky', chart: 'rise' },
]

export const wasteFlow: FlowCategory[] = [
  { label: 'Organics', value: '163.1 t', percentage: 39, color: '#3a8f68', className: 'organic' },
  { label: 'Recycled', value: '129.6 t', percentage: 31, color: '#2d83ab', className: 'recycled' },
  { label: 'Energy', value: '75.2 t', percentage: 18, color: '#d88638', className: 'energy' },
  { label: 'Landfill', value: '50.3 t', percentage: 12, color: '#dc6a57', className: 'landfill' },
]