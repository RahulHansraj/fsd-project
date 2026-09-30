import { useState } from 'react'
import { 
  Activity, 
  AlertOctagon, 
  AlertTriangle, 
  Battery, 
  Check, 
  CheckCircle2, 
  Clock, 
  Flame, 
  MapPin, 
  Plus, 
  Radio, 
  RefreshCw, 
  Search, 
  Thermometer, 
  Trash2, 
  Truck, 
  Zap 
} from 'lucide-react'
import { QueueItem, SmartBinSensor, ZoneName } from '../../types/operations'
import { mockSmartBins } from '../../data/mockOperationsData'

interface SmartBinsViewProps {
  onTriggerNotice: (msg: string) => void
  onTaskCreated: (newTask: QueueItem) => void
}

export function SmartBinsView({ onTriggerNotice, onTaskCreated }: SmartBinsViewProps) {
  const [bins, setBins] = useState<SmartBinSensor[]>(mockSmartBins)
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [wardFilter, setWardFilter] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState('')

  const handleSimulatePulse = () => {
    setBins(prev => prev.map(bin => {
      const delta = Math.floor((Math.random() - 0.4) * 6)
      const newFill = Math.max(10, Math.min(100, bin.fillPercent + delta))
      let newStatus: SmartBinSensor['status'] = 'Normal'
      if (newFill >= 85) newStatus = 'Overflow'
      else if (newFill >= 60) newStatus = 'Approaching'
      if (bin.temperatureC > 35) newStatus = 'FireAlert'

      return {
        ...bin,
        fillPercent: newFill,
        status: newStatus
      }
    }))
    onTriggerNotice('Ultrasonic sensor pulse received from 8 smart bins across San Francisco.')
  }

  const handleAutoDispatchNearest = (bin: SmartBinSensor) => {
    const assignedTruck = bin.ward === 'Financial & SoMa' ? 'Unit R-22' : 
                          bin.ward === 'Fisherman Wharf' ? 'Unit R-18' : 
                          bin.ward === 'Sunset District' ? 'Unit R-08' : 'Unit R-05'

    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const mins = String(now.getMinutes()).padStart(2, '0')

    const newTask: QueueItem = {
      id: `TASK-SB-${bin.code.slice(-4)}`,
      time: `${hours}:${mins}`,
      title: `Auto-Clearance for ${bin.code} (${bin.fillPercent}% full)`,
      detail: `Ultrasonic overflow detected at ${bin.locationName}. Assigned nearest ${assignedTruck}.`,
      severity: bin.status === 'FireAlert' || bin.fillPercent > 85 ? 'high' : 'medium',
      zone: bin.ward,
      assignedVehicle: assignedTruck.replace('Unit ', ''),
      status: 'Pending',
      recommendation: `Automated IoT trigger: ${assignedTruck} dispatched for urgent clearance.`
    }

    onTaskCreated(newTask)

    // Reset bin fill
    setBins(prev => prev.map(b => {
      if (b.id === bin.id) {
        return {
          ...b,
          fillPercent: 15,
          status: 'Normal',
          lastEmptied: 'Just now'
        }
      }
      return b
    }))

    onTriggerNotice(`Automated clearance task dispatched: ${assignedTruck} assigned to ${bin.code} at ${bin.locationName}!`)
  }

  const filteredBins = bins.filter(b => {
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter
    const matchesWard = wardFilter === 'All' || b.ward === wardFilter
    const matchesSearch = b.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.ward.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesWard && matchesSearch
  })

  const overflowCount = bins.filter(b => b.status === 'Overflow').length
  const fireAlertCount = bins.filter(b => b.status === 'FireAlert').length
  const avgFill = Math.round(bins.reduce((sum, b) => sum + b.fillPercent, 0) / bins.length)

  return (
    <div className="view-container">
      {/* Top Banner */}
      <div className="view-header">
        <div>
          <span className="cc-kicker">INTERNET OF THINGS · EDGE TELEMETRY</span>
          <h1>IoT Smart Bins & Sensor Grid</h1>
          <p className="cc-subtitle">
            Ultrasonic fill levels, temperature smoldering alarms, battery health, and automated route dispatch for connected municipal bins.
          </p>
        </div>
        <div className="view-actions">
          <button 
            className="primary-btn"
            onClick={handleSimulatePulse}
          >
            <Activity size={14} /> Simulate Sensor Telemetry Pulse
          </button>
          <button 
            className="secondary-btn"
            onClick={() => onTriggerNotice('Cellular NB-IoT mesh network health: 99.4% uptime.')}
          >
            <Radio size={14} /> Check Mesh Signal
          </button>
        </div>
      </div>

      {/* Sensor KPI Strip */}
      <div className="cc-kpis mb-6">
        <div className="cc-kpi">
          <span>Reporting Sensors</span>
          <div><strong>08</strong><small>Online</small></div>
          <p><i className="up" /> 100% NB-IoT signal active</p>
        </div>
        <div className="cc-kpi urgent">
          <span>Overflowing Bins (&gt;80%)</span>
          <div><strong>0{overflowCount}</strong><small>Bins</small></div>
          <p><i className="down" /> Immediate clearance needed</p>
        </div>
        <div className="cc-kpi">
          <span>Average City Fill</span>
          <div><strong>{avgFill}</strong><small>%</small></div>
          <p><i className="steady" /> Within scheduled clearance cycle</p>
        </div>
        <div className="cc-kpi">
          <span>Active Fire / Heat Alerts</span>
          <div><strong>0{fireAlertCount}</strong><small>Alarms</small></div>
          <p><i className={fireAlertCount > 0 ? 'down' : 'up'} /> Temp &gt; 35°C flagged</p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="fleet-controls-bar">
        <div className="fleet-search-box">
          <Search size={15} />
          <input 
            type="text" 
            placeholder="Search smart bin code, location, or ward..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="fleet-filter-chips">
          <span className="filter-label">Filter Status:</span>
          {(['All', 'Overflow', 'Approaching', 'Normal', 'FireAlert'] as const).map(status => (
            <button
              key={status}
              className={`filter-pill ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status === 'FireAlert' ? '🔥 Fire Alert' : status}
            </button>
          ))}
        </div>

        <div className="zone-select-wrap">
          <MapPin size={13} />
          <select 
            value={wardFilter} 
            onChange={(e) => setWardFilter(e.target.value)}
            className="select-input"
          >
            <option value="All">All Districts</option>
            <option value="Financial & SoMa">Financial & SoMa</option>
            <option value="Fisherman Wharf">Fisherman Wharf</option>
            <option value="Sunset District">Sunset District</option>
            <option value="Bayview-Hunters Point">Bayview-Hunters Point</option>
            <option value="Mission District">Mission District</option>
            <option value="Richmond District">Richmond District</option>
            <option value="Chinatown & North Beach">Chinatown & North Beach</option>
            <option value="Civic Center & Tenderloin">Civic Center & Tenderloin</option>
          </select>
        </div>
      </div>

      {/* Smart Bins Grid */}
      <div className="smart-bins-grid">
        {filteredBins.map((bin) => {
          const isCritical = bin.status === 'Overflow' || bin.status === 'FireAlert'
          const fillBarColor = bin.fillPercent > 80 ? '#d4684e' : bin.fillPercent > 60 ? '#d99b45' : '#2d896b'

          return (
            <div 
              key={bin.id} 
              className={`smart-bin-card ${isCritical ? 'critical-border' : ''}`}
            >
              <div className="bin-card-head">
                <div className="bin-title-group">
                  <div className="bin-icon-box">
                    <Trash2 size={16} />
                  </div>
                  <div>
                    <strong>{bin.code}</strong>
                    <small>{bin.ward} · {bin.wasteType}</small>
                  </div>
                </div>
                <span className={`bin-status-tag ${bin.status.toLowerCase()}`}>
                  {bin.status === 'FireAlert' ? '🔥 Heat Spike' : `${bin.fillPercent}% Full`}
                </span>
              </div>

              <div className="bin-location-text">
                <MapPin size={13} />
                <span>{bin.locationName}</span>
              </div>

              {/* Large Circular/Gauge Meter */}
              <div className="bin-fill-visual">
                <div className="bin-fill-bar-wrap">
                  <div 
                    className="bin-fill-bar" 
                    style={{ width: `${bin.fillPercent}%`, background: fillBarColor }} 
                  />
                </div>
                <div className="bin-fill-stats">
                  <span>Ultrasonic Depth Gauge</span>
                  <strong>{bin.fillPercent}% Volume</strong>
                </div>
              </div>

              {/* Telemetry Sensor Badges */}
              <div className="bin-sensor-readings">
                <div className={`sensor-pill ${bin.temperatureC > 30 ? 'warn' : ''}`}>
                  <Thermometer size={13} />
                  <span>{bin.temperatureC}°C</span>
                </div>
                <div className="sensor-pill">
                  <Battery size={13} />
                  <span>{bin.batteryPercent}% Li-ion</span>
                </div>
                <div className="sensor-pill">
                  <Clock size={13} />
                  <span>{bin.lastEmptied}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="bin-card-action">
                <button 
                  className={bin.fillPercent > 70 ? 'primary-btn full-w' : 'secondary-btn full-w'}
                  onClick={() => handleAutoDispatchNearest(bin)}
                >
                  <Truck size={14} /> Auto-Dispatch Nearest Truck
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
