import { useState } from 'react'
import { 
  AlertTriangle, 
  ArrowRight, 
  BatteryCharging, 
  CheckCircle, 
  Clock, 
  Filter, 
  MapPin, 
  Navigation, 
  PhoneCall, 
  Plus, 
  Radio, 
  RefreshCw, 
  RotateCw, 
  Search, 
  ShieldAlert, 
  Truck, 
  Zap 
} from 'lucide-react'
import { FleetVehicle, ZoneName } from '../../types/operations'
import { mockFleet } from '../../data/mockOperationsData'

interface FleetViewProps {
  onTriggerNotice: (msg: string) => void
  onOpenCreateTask: (prefillZone?: ZoneName, prefillVehicle?: string) => void
}

export function FleetView({ onTriggerNotice, onOpenCreateTask }: FleetViewProps) {
  const [fleet, setFleet] = useState<FleetVehicle[]>(mockFleet)
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [zoneFilter, setZoneFilter] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const handleReroute = (vehicle: FleetVehicle) => {
    onTriggerNotice(`Dynamic reroute advisory sent to Driver ${vehicle.crewLeader} on Unit ${vehicle.id}. Alternate corridor selected.`)
    setFleet(prev => prev.map(v => {
      if (v.id === vehicle.id) {
        return {
          ...v,
          status: 'On route',
          dwellTimeMinutes: 2,
          nextStop: 'Diverted via Pier Avenue bypass'
        }
      }
      return v
    }))
  }

  const handleSwapReserve = (standbyUnitId: string, delayedUnitId: string) => {
    onTriggerNotice(`Reserve Unit ${standbyUnitId} mobilized from Depot 4 to relieve route pressure on ${delayedUnitId}.`)
    setFleet(prev => prev.map(v => {
      if (v.id === standbyUnitId) return { ...v, status: 'On route', nextStop: 'Assisting Financial & SoMa Sector 3' }
      if (v.id === delayedUnitId) return { ...v, status: 'Unloading', dwellTimeMinutes: 5 }
      return v
    }))
  }

  const filteredFleet = fleet.filter(vehicle => {
    const matchesStatus = statusFilter === 'All' || vehicle.status === statusFilter
    const matchesZone = zoneFilter === 'All' || vehicle.zone === zoneFilter
    const matchesSearch = vehicle.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          vehicle.crewLeader.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          vehicle.zone.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesZone && matchesSearch
  })

  const attentionCount = fleet.filter(v => v.status === 'Attention').length
  const activeRouteCount = fleet.filter(v => v.status === 'On route').length

  return (
    <div className="view-container">
      {/* Top Banner */}
      <div className="view-header">
        <div>
          <span className="cc-kicker">FLEET TELEMATICS · FIELD LOGISTICS</span>
          <h1>Fleet & Crew Operations</h1>
          <p className="cc-subtitle">
            Real-time GPS telemetry, route adherence, bin payload weights, dwell-time alerts, and dispatch optimization for 38 active units.
          </p>
        </div>
        <div className="view-actions">
          <button 
            className="primary-btn"
            onClick={() => onOpenCreateTask()}
          >
            <Plus size={15} /> Dispatch New Task
          </button>
          <button 
            className="secondary-btn"
            onClick={() => onTriggerNotice('Cellular OBD-II telemetry synced for all vehicles in service.')}
          >
            <RefreshCw size={14} /> Sync Telemetry
          </button>
        </div>
      </div>

      {/* Fleet KPI Quick Strip */}
      <div className="cc-kpis mb-6">
        <div className="cc-kpi">
          <span>Active on Route</span>
          <div><strong>{activeRouteCount}</strong><small>Vehicles</small></div>
          <p><i className="up" /> Morning collection pass</p>
        </div>
        <div className="cc-kpi urgent">
          <span>Dwell Threshold Alerts</span>
          <div><strong>0{attentionCount}</strong><small>Require Action</small></div>
          <p><i className="down" /> Dwell &gt; 25 mins flagged</p>
        </div>
        <div className="cc-kpi">
          <span>Fleet Electrification</span>
          <div><strong>62.5</strong><small>%</small></div>
          <p><i className="up" /> 24 zero-emission EV trucks</p>
        </div>
        <div className="cc-kpi">
          <span>Average Fuel/Battery</span>
          <div><strong>71</strong><small>%</small></div>
          <p><i className="steady" /> Sufficient for shift completion</p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="fleet-controls-bar">
        <div className="fleet-search-box">
          <Search size={15} />
          <input 
            type="text" 
            placeholder="Search truck ID, driver name, or ward..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="fleet-filter-chips">
          <span className="filter-label">Status:</span>
          {(['All', 'On route', 'Attention', 'Unloading', 'Depot Reserve'] as const).map(status => (
            <button
              key={status}
              className={`filter-pill ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="zone-select-wrap">
          <MapPin size={13} />
          <select 
            value={zoneFilter} 
            onChange={(e) => setZoneFilter(e.target.value)}
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

      {/* Fleet Vehicles Grid */}
      <div className="fleet-grid">
        {filteredFleet.map((vehicle) => {
          const loadPercent = Math.round((vehicle.currentLoadTons / vehicle.maxCapacityTons) * 100)
          return (
            <div 
              key={vehicle.id} 
              className={`fleet-card ${vehicle.status === 'Attention' ? 'attention-border' : ''}`}
            >
              <div className="fleet-card-top">
                <div className="fleet-id-box">
                  <Truck size={17} />
                  <div>
                    <strong>{vehicle.id}</strong>
                    <small>{vehicle.type}</small>
                  </div>
                </div>
                <span className={`fleet-status-tag ${vehicle.status.toLowerCase().replace(' ', '-')}`}>
                  {vehicle.status}
                </span>
              </div>

              <div className="fleet-details">
                <div className="detail-row">
                  <span>Crew Leader:</span>
                  <strong>{vehicle.crewLeader}</strong>
                </div>
                <div className="detail-row">
                  <span>Operating District:</span>
                  <strong>{vehicle.zone}</strong>
                </div>
                <div className="detail-row">
                  <span>Next Stop:</span>
                  <strong className="truncate">{vehicle.nextStop}</strong>
                </div>
              </div>

              {/* Progress and Payload Bars */}
              <div className="fleet-bars">
                <div className="bar-group">
                  <div className="bar-header">
                    <span>Route Completion</span>
                    <strong>{vehicle.progress}%</strong>
                  </div>
                  <div className="progress-mini">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${vehicle.progress}%`,
                        background: vehicle.progress === 100 ? '#2d896b' : '#3d8eb9'
                      }} 
                    />
                  </div>
                </div>

                <div className="bar-group">
                  <div className="bar-header">
                    <span>Payload ({vehicle.currentLoadTons} / {vehicle.maxCapacityTons} t)</span>
                    <strong>{loadPercent}%</strong>
                  </div>
                  <div className="progress-mini">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${loadPercent}%`,
                        background: loadPercent > 85 ? '#d4684e' : '#2d896b'
                      }} 
                    />
                  </div>
                </div>
              </div>

              {/* Dwell and Telemetry Strip */}
              <div className="fleet-meta-strip">
                <div className={`dwell-indicator ${vehicle.dwellTimeMinutes > 20 ? 'delayed' : ''}`}>
                  <Clock size={13} />
                  <span>Dwell: <strong>{vehicle.dwellTimeMinutes}m</strong></span>
                </div>
                <div className="battery-indicator">
                  <Zap size={13} />
                  <span>{vehicle.batteryFuel}%</span>
                </div>
                <div className="checkin-indicator">
                  <span>{vehicle.lastCheckIn}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="fleet-card-actions">
                {vehicle.status === 'Attention' ? (
                  <>
                    <button 
                      className="primary-btn-sm"
                      onClick={() => handleReroute(vehicle)}
                    >
                      <Navigation size={13} /> Reroute
                    </button>
                    <button 
                      className="secondary-btn-sm"
                      onClick={() => handleSwapReserve('R-05', vehicle.id)}
                    >
                      Deploy Backup
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      className="secondary-btn-sm"
                      onClick={() => onTriggerNotice(`Telemetry ping sent to unit ${vehicle.id} (${vehicle.crewLeader}). Signal: Excellent.`)}
                    >
                      <Radio size={13} /> Telemetry
                    </button>
                    <button 
                      className="secondary-btn-sm"
                      onClick={() => onOpenCreateTask(vehicle.zone, vehicle.id)}
                    >
                      Assign Task
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
