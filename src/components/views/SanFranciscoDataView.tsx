import { useState, useMemo } from 'react'
import { 
  AlertTriangle, 
  ArrowRight, 
  ArrowUpRight, 
  Award, 
  BarChart3, 
  Battery, 
  Building2, 
  CheckCircle2, 
  ChevronRight, 
  CircleDot, 
  Clock3, 
  Compass, 
  ExternalLink, 
  Factory, 
  Filter, 
  Flame, 
  HeartHandshake, 
  HelpCircle, 
  Info, 
  Layers, 
  Leaf, 
  MapPin, 
  Navigation, 
  PhoneCall, 
  Radio, 
  RefreshCw, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  Trash2, 
  Truck, 
  Volume2, 
  Waves, 
  Wind, 
  Wrench, 
  Zap 
} from 'lucide-react'
import { CircularInfrastructureHub, EnvironmentalSensor, MarineTrashBoom, QueueItem, SF311Incident, ZoneData, ZoneName } from '../../types/operations'
import { 
  mockCircularHubs, 
  mockEnvironmentalSensors, 
  mockMarineBooms, 
  mockSF311Incidents, 
  mockZones 
} from '../../data/mockOperationsData'
import { playDispatchConfirm, playRadioChirp, playTelemetryPing } from '../../utils/audioEffects'
import { triageSF311Incident, getAIConfig, isAIConfigured } from '../../services/aiService'

interface SanFranciscoDataViewProps {
  onTriggerNotice: (msg: string) => void
  onTaskCreated?: (task: QueueItem) => void
  onFocusCoordinates?: (coords: [number, number], zoom?: number) => void
}

export function SanFranciscoDataView({ onTriggerNotice, onTaskCreated, onFocusCoordinates }: SanFranciscoDataViewProps) {
  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'311' | 'environmental' | 'marine' | 'circular-depots' | 'districts'>('311')

  // 311 Incidents State
  const [incidents, setIncidents] = useState<SF311Incident[]>(mockSF311Incidents)
  const [incidentCategoryFilter, setIncidentCategoryFilter] = useState<string>('All')
  const [incidentPriorityFilter, setIncidentPriorityFilter] = useState<string>('All')
  const [incidentSearch, setIncidentSearch] = useState<string>('')
  const [aiTriageMap, setAiTriageMap] = useState<Record<string, { unit: string; advisory: string; priority: string; isLive: boolean }>>({})
  const [triageLoadingId, setTriageLoadingId] = useState<string | null>(null)

  // Environmental Sensors State
  const [sensors, setSensors] = useState<EnvironmentalSensor[]>(mockEnvironmentalSensors)
  const [isRefreshingSensors, setIsRefreshingSensors] = useState<boolean>(false)

  // Marine Booms State
  const [booms, setBooms] = useState<MarineTrashBoom[]>(mockMarineBooms)

  // Circular Hubs State
  const [selectedHub, setSelectedHub] = useState<CircularInfrastructureHub>(mockCircularHubs[0])

  // Filtered 311 Incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const matchCat = incidentCategoryFilter === 'All' || inc.category === incidentCategoryFilter
      const matchPri = incidentPriorityFilter === 'All' || inc.priority === incidentPriorityFilter
      const q = incidentSearch.toLowerCase().trim()
      const matchSearch = !q || 
        inc.title.toLowerCase().includes(q) || 
        inc.address.toLowerCase().includes(q) || 
        inc.district.toLowerCase().includes(q) ||
        inc.caseNumber.toLowerCase().includes(q)
      return matchCat && matchPri && matchSearch
    })
  }, [incidents, incidentCategoryFilter, incidentPriorityFilter, incidentSearch])

  // 311 Dispatch Action
  const handleDispatchIncident = (incident: SF311Incident) => {
    playDispatchConfirm()
    const vehicleId = aiTriageMap[incident.id]?.unit || 'R-22'
    
    // Update local incident status
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incident.id) {
        return { ...inc, status: 'Dispatched', assignedVehicle: vehicleId }
      }
      return inc
    }))

    // Dispatch task into main queue if handler provided
    if (onTaskCreated) {
      const newTask: QueueItem = {
        id: `task-${Date.now().toString().slice(-4)}`,
        time: 'Just now',
        title: `SF 311 Rapid Cleanup: ${incident.title}`,
        detail: `Location: ${incident.address} (${incident.district}). Estimated load: ${incident.wasteEstimatedKg}kg. Case #${incident.caseNumber}`,
        severity: incident.priority === 'critical' || incident.priority === 'high' ? 'high' : 'medium',
        assignedVehicle: vehicleId,
        zone: incident.district,
        status: 'In Progress',
        recommendation: `Dispatched reserve truck ${vehicleId} for curb clearance.`
      }
      onTaskCreated(newTask)
    }

    onTriggerNotice(`Dispatched rapid clearance unit ${vehicleId} to SF 311 incident ${incident.caseNumber} at ${incident.address}.`)
  }

  const handleResolveIncident = (incidentId: string) => {
    playTelemetryPing()
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return { ...inc, status: 'Resolved' }
      }
      return inc
    }))
    onTriggerNotice(`SF 311 incident marked as resolved.`)
  }

  const handleRunAiTriage = async (incident: SF311Incident) => {
    setTriageLoadingId(incident.id)
    try {
      const res = await triageSF311Incident(incident)
      setAiTriageMap(prev => ({
        ...prev,
        [incident.id]: {
          unit: res.recommendedUnit,
          advisory: res.actionAdvisory,
          priority: res.suggestedPriority,
          isLive: res.isLiveLLM
        }
      }))
      onTriggerNotice(`AI Triage generated: Assigned ${res.recommendedUnit} to Case ${incident.caseNumber}.`)
    } catch (err) {
      console.error('[SF311] Triage error:', err)
    } finally {
      setTriageLoadingId(null)
    }
  }

  // Refresh Environmental Sensor Telemetry
  const handleRefreshSensors = () => {
    setIsRefreshingSensors(true)
    playRadioChirp()
    setTimeout(() => {
      setSensors(prev => prev.map(s => {
        const delta = (Math.random() - 0.48) * 1.5
        return {
          ...s,
          pm25: Math.max(4, +(s.pm25 + delta).toFixed(1)),
          soundDba: Math.max(48, Math.min(78, Math.round(s.soundDba + (Math.random() - 0.5) * 3))),
          lastReading: 'Just now'
        }
      }))
      setIsRefreshingSensors(false)
      onTriggerNotice('Environmental & Air Quality sensor telemetry synced across 8 San Francisco districts.')
    }, 600)
  }

  // Service Marine Boom
  const handleServiceBoom = (boomId: string) => {
    playDispatchConfirm()
    setBooms(prev => prev.map(b => {
      if (b.id === boomId) {
        return {
          ...b,
          operationalStatus: 'Active',
          weeklyInterceptedKg: 40
        }
      }
      return b
    }))
    onTriggerNotice('Marine trash boom skimmer emptied and reset. Plastic debris routed to Pier 96 MRF.')
  }

  // Aggregate Metrics for Header
  const open311Count = incidents.filter(i => i.status === 'Open').length
  const criticalCount = incidents.filter(i => i.priority === 'critical' && i.status !== 'Resolved').length
  const totalWeeklyMarineKg = booms.reduce((acc, b) => acc + b.weeklyInterceptedKg, 0)
  const avgPM25 = +(sensors.reduce((acc, s) => acc + s.pm25, 0) / sensors.length).toFixed(1)

  return (
    <div className="sf-data-shell">
      {/* Top Banner Header */}
      <section className="sf-header-card">
        <div className="sf-header-content">
          <div className="sf-header-badge">
            <MapPin size={15} />
            <span>CITY & COUNTY OF SAN FRANCISCO · MULTI-DOMAIN URBAN TWIN</span>
          </div>
          <h1>San Francisco Operations & Environmental Intelligence</h1>
          <p>
            Real-time urban telemetry across 8 San Francisco districts: live SF 311 citizen incident triage, 
            BAAQMD air quality & odor olfactometry ($PM_{2.5}, H_2S$), coastal marine trash interceptors, 
            and specialized circular re-use infrastructure.
          </p>

          <div className="sf-tab-nav">
            <button 
              className={activeTab === '311' ? 'active' : ''} 
              onClick={() => setActiveTab('311')}
            >
              <AlertTriangle size={15} /> SF 311 Citizen Incidents ({open311Count} Open)
            </button>
            <button 
              className={activeTab === 'environmental' ? 'active' : ''} 
              onClick={() => setActiveTab('environmental')}
            >
              <Wind size={15} /> Air Quality & Odor Sensors ({sensors.length})
            </button>
            <button 
              className={activeTab === 'marine' ? 'active' : ''} 
              onClick={() => setActiveTab('marine')}
            >
              <Waves size={15} /> Marine Trash Booms & Bay Clean Water ({booms.length})
            </button>
            <button 
              className={activeTab === 'circular-depots' ? 'active' : ''} 
              onClick={() => setActiveTab('circular-depots')}
            >
              <Building2 size={15} /> Circular Infrastructure Hubs ({mockCircularHubs.length})
            </button>
            <button 
              className={activeTab === 'districts' ? 'active' : ''} 
              onClick={() => setActiveTab('districts')}
            >
              <BarChart3 size={15} /> 8-District Zero-Waste Scorecard
            </button>
          </div>
        </div>

        {/* Quick SF Summary KPI Box */}
        <div className="sf-quick-box">
          <div className="sf-box-head">
            <span>SF MUNICIPAL TELEMETRY SNAPSHOT</span>
            <span className="live-dot"><i /> LIVE</span>
          </div>
          <div className="sf-box-grid">
            <div className="sf-box-cell">
              <small>Open SF 311 Reports</small>
              <strong className={criticalCount > 0 ? 'alert' : ''}>{open311Count} Cases</strong>
              <span>{criticalCount} Critical priority</span>
            </div>
            <div className="sf-box-cell">
              <small>Citywide Avg PM2.5</small>
              <strong className="green">{avgPM25} µg/m³</strong>
              <span>Optimal air quality</span>
            </div>
            <div className="sf-box-cell">
              <small>Weekly Bay Plastic Diverted</small>
              <strong>{totalWeeklyMarineKg} kg/wk</strong>
              <span>4 Marine outfall booms</span>
            </div>
            <div className="sf-box-cell">
              <small>SF Circular Hubs</small>
              <strong>6 Key Depots</strong>
              <span>380k t/yr at Recology MRF</span>
            </div>
          </div>
        </div>
      </section>

      {/* VIEW 1: SF 311 CITIZEN INCIDENT MANAGEMENT DESK */}
      {activeTab === '311' && (
        <section className="sf-section sf-311-section">
          {/* Filter Bar */}
          <div className="sf-filter-toolbar">
            <div className="sf-filter-group">
              <span className="filter-lbl"><Filter size={13} /> Category:</span>
              {['All', 'Illegal Dumping', 'Overflowing Bin', 'Hazardous Waste', 'Missed Pickup'].map(cat => (
                <button 
                  key={cat}
                  className={`sf-filter-pill ${incidentCategoryFilter === cat ? 'active' : ''}`}
                  onClick={() => setIncidentCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="sf-filter-group">
              <span className="filter-lbl">Priority:</span>
              {['All', 'critical', 'high', 'medium', 'low'].map(pri => (
                <button 
                  key={pri}
                  className={`sf-filter-pill pri-${pri} ${incidentPriorityFilter === pri ? 'active' : ''}`}
                  onClick={() => setIncidentPriorityFilter(pri)}
                >
                  {pri.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="sf-search-input-wrap">
              <Search size={14} />
              <input 
                type="text" 
                placeholder="Search SF address, case #, or street..." 
                value={incidentSearch}
                onChange={(e) => setIncidentSearch(e.target.value)}
              />
              {incidentSearch && (
                <button className="clear-btn" onClick={() => setIncidentSearch('')}>✕</button>
              )}
            </div>
          </div>

          {/* Incidents Grid */}
          <div className="sf-incidents-grid">
            {filteredIncidents.map(inc => {
              const isOpen = inc.status === 'Open'
              const isDispatched = inc.status === 'Dispatched'
              const isResolved = inc.status === 'Resolved'

              return (
                <div key={inc.id} className={`sf-incident-card priority-${inc.priority} status-${inc.status.toLowerCase()}`}>
                  <div className="inc-header">
                    <div className="inc-id-row">
                      <span className="inc-case-badge">{inc.caseNumber}</span>
                      <span className={`inc-pri-tag ${inc.priority}`}>{inc.priority.toUpperCase()}</span>
                      <span className="inc-time"><Clock3 size={11} /> {inc.reportedAt}</span>
                    </div>
                    <span className={`inc-status-pill ${inc.status.toLowerCase()}`}>{inc.status}</span>
                  </div>

                  <h3>{inc.title}</h3>
                  <p className="inc-desc">{inc.description}</p>

                  <div className="inc-meta-strip">
                    <div>
                      <small>ADDRESS & DISTRICT</small>
                      <strong><MapPin size={11} /> {inc.address}</strong>
                      <span>{inc.district}</span>
                    </div>
                    <div>
                      <small>EST. MASS</small>
                      <strong>{inc.wasteEstimatedKg} kg</strong>
                      <span>{inc.category}</span>
                    </div>
                    {inc.assignedVehicle && (
                      <div>
                        <small>ASSIGNED UNIT</small>
                        <strong className="vehicle-badge"><Truck size={12} /> {inc.assignedVehicle}</strong>
                      </div>
                    )}
                  </div>

                  {/* AI Triage Recommendation Card if generated */}
                  {aiTriageMap[inc.id] && (
                    <div className="inc-ai-advisory-box">
                      <div className="advisory-head">
                        <span className="mono-kicker">
                          <Sparkles size={12} /> AUTOMATED DISPATCH PROTOCOL
                        </span>
                        <span className="unit-rec-tag">
                          Rec. Unit: <b>{aiTriageMap[inc.id].unit}</b>
                        </span>
                      </div>
                      <p>{aiTriageMap[inc.id].advisory}</p>
                    </div>
                  )}

                  <div className="inc-actions">
                    {isOpen && (
                      <>
                        <button 
                          className="sf-btn-dispatch"
                          onClick={() => handleDispatchIncident(inc)}
                        >
                          <Truck size={14} /> Dispatch Crew {aiTriageMap[inc.id]?.unit ? `(${aiTriageMap[inc.id].unit})` : ''}
                        </button>
                        <button
                          className="sf-btn-ai-triage"
                          disabled={triageLoadingId === inc.id}
                          onClick={() => handleRunAiTriage(inc)}
                          title="Generate automated incident triage and routing recommendation"
                        >
                          {triageLoadingId === inc.id ? (
                            <RefreshCw size={13} className="spin" />
                          ) : (
                            <Sparkles size={13} />
                          )}
                          <span>Auto Triage</span>
                        </button>
                      </>
                    )}
                    {isDispatched && (
                      <button 
                        className="sf-btn-resolve"
                        onClick={() => handleResolveIncident(inc.id)}
                      >
                        <CheckCircle2 size={14} /> Mark Cleared & Resolved
                      </button>
                    )}
                    {isResolved && (
                      <span className="resolved-flag">
                        <CheckCircle2 size={14} /> Cleared by Field Operations
                      </span>
                    )}
                    {onFocusCoordinates && (
                      <button 
                        className="sf-btn-locate"
                        onClick={() => onFocusCoordinates(inc.coordinates, 16)}
                        title="Focus street on OpenStreetMap"
                      >
                        <Compass size={14} /> Map
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
            {filteredIncidents.length === 0 && (
              <div className="no-items-card">
                <ShieldCheck size={24} />
                <p>No SF 311 incident reports matching the selected filters.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* VIEW 2: ENVIRONMENTAL & AIR QUALITY SENSOR MONITOR */}
      {activeTab === 'environmental' && (
        <section className="sf-section sf-env-section">
          <div className="section-toolbar">
            <div>
              <h2>San Francisco Air Quality, Odor & Fleet Acoustic Telemetry</h2>
              <p>Real-time microclimate sensors measuring ambient particulates, composting hydrogen sulfide, and early morning collection noise limits.</p>
            </div>
            <button 
              className="sf-refresh-btn"
              onClick={handleRefreshSensors}
              disabled={isRefreshingSensors}
            >
              <RefreshCw size={14} className={isRefreshingSensors ? 'spin' : ''} />
              <span>{isRefreshingSensors ? 'Polling Sensors...' : 'Poll Live Telemetry'}</span>
            </button>
          </div>

          <div className="env-sensors-grid">
            {sensors.map(sensor => {
              const isPmExceeded = sensor.pm25 > 25
              const isNoiseHigh = sensor.soundDba > 70
              const isOdorPresent = sensor.h2sPpm > 0.03

              return (
                <div key={sensor.id} className="env-sensor-card">
                  <div className="sensor-card-top">
                    <div>
                      <span className="sensor-district-tag">{sensor.district}</span>
                      <h3>{sensor.name}</h3>
                    </div>
                    <span className={`sensor-status-badge ${sensor.status}`}>{sensor.status.toUpperCase()}</span>
                  </div>

                  <div className="sensor-metrics-grid">
                    <div className={`metric-box ${isPmExceeded ? 'warn' : 'good'}`}>
                      <small>PARTICULATE PM2.5</small>
                      <strong>{sensor.pm25} <span className="unit">µg/m³</span></strong>
                      <div className="sensor-bar">
                        <div className="sensor-bar-fill" style={{ width: `${Math.min(100, (sensor.pm25 / 35) * 100)}%` }} />
                      </div>
                      <span>EPA 24h Threshold: 35 µg/m³</span>
                    </div>

                    <div className={`metric-box ${isOdorPresent ? 'warn' : 'good'}`}>
                      <small>ODOR (H₂S / DILUTION)</small>
                      <strong>{sensor.h2sPpm} <span className="unit">ppm H₂S</span></strong>
                      <div className="sensor-bar">
                        <div className="sensor-bar-fill odor" style={{ width: `${Math.min(100, (sensor.h2sPpm / 0.05) * 100)}%` }} />
                      </div>
                      <span>Olfactometry: {sensor.odorUnitsM3} OU/m³</span>
                    </div>

                    <div className={`metric-box ${isNoiseHigh ? 'warn' : 'good'}`}>
                      <small>ACOUSTIC NOISE (dBA)</small>
                      <strong>{sensor.soundDba} <span className="unit">dBA</span></strong>
                      <div className="sensor-bar">
                        <div className="sensor-bar-fill noise" style={{ width: `${Math.min(100, (sensor.soundDba / 85) * 100)}%` }} />
                      </div>
                      <span>SF Police Code Limit: 75 dBA</span>
                    </div>
                  </div>

                  <div className="sensor-footer">
                    <span className="reading-time"><Clock3 size={12} /> Updated: {sensor.lastReading}</span>
                    {onFocusCoordinates && (
                      <button 
                        className="sensor-locate-btn"
                        onClick={() => onFocusCoordinates(sensor.coordinates, 15)}
                      >
                        <Compass size={12} /> View Sensor on GIS
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* VIEW 3: MARINE OUTFLOW TRASH BOOMS */}
      {activeTab === 'marine' && (
        <section className="sf-section sf-marine-section">
          <div className="marine-header-banner">
            <div>
              <h2>San Francisco Coastal & Bay Water Litter Defense</h2>
              <p>SFPUC clean water outfall booms and Pier 39 automated Seabins intercepting street litter, plastic bottles, and runoff before entering the National Marine Sanctuary.</p>
            </div>
            <div className="marine-stat-chip">
              <Waves size={20} />
              <div>
                <strong>{(booms.reduce((a, b) => a + b.annualPlasticsDivertedTons, 0)).toFixed(1)} t/year</strong>
                <small>Ocean Plastics Diverted</small>
              </div>
            </div>
          </div>

          <div className="booms-grid">
            {booms.map(boom => {
              const isFull = boom.operationalStatus === 'Full Capacity'
              return (
                <div key={boom.id} className={`boom-card ${isFull ? 'full-capacity' : ''}`}>
                  <div className="boom-top">
                    <div className="boom-type-badge">
                      <Waves size={14} />
                      <span>{boom.type}</span>
                    </div>
                    <span className={`boom-status ${boom.operationalStatus.toLowerCase().replace(' ', '-')}`}>
                      {boom.operationalStatus}
                    </span>
                  </div>

                  <h3>{boom.name}</h3>
                  <p className="boom-loc"><MapPin size={13} /> {boom.location} ({boom.waterBody})</p>

                  <div className="boom-metrics-row">
                    <div className="metric-item">
                      <small>WEEKLY CAPTURE</small>
                      <strong>{boom.weeklyInterceptedKg} kg/wk</strong>
                      <span>Urban stormwater runoff</span>
                    </div>
                    <div className="metric-item">
                      <small>ANNUAL DIVERSION</small>
                      <strong>{boom.annualPlasticsDivertedTons} t/yr</strong>
                      <span>Plastic kept out of Bay</span>
                    </div>
                    <div className="metric-item">
                      <small>SOLAR BATTERY</small>
                      <strong><Battery size={13} /> {boom.sensorBatteryPercent}%</strong>
                      <span>Telemetry online</span>
                    </div>
                  </div>

                  <div className="boom-actions">
                    <button 
                      className="service-boom-btn"
                      onClick={() => handleServiceBoom(boom.id)}
                    >
                      <Wrench size={13} /> Empty Skimmer Basket
                    </button>
                    {onFocusCoordinates && (
                      <button 
                        className="locate-boom-btn"
                        onClick={() => onFocusCoordinates(boom.coordinates, 16)}
                      >
                        <Compass size={13} /> Locate Outfall
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* VIEW 4: CIRCULAR INFRASTRUCTURE HUBS */}
      {activeTab === 'circular-depots' && (
        <section className="sf-section sf-depots-section">
          <div className="depots-layout">
            {/* Depots List */}
            <div className="depots-list">
              <h2>San Francisco Specialized Material Recovery Depots</h2>
              <p className="depots-sub">Authentic facilities handling organic recovery, hazardous chemicals, creative art supplies, and architectural salvage.</p>

              <div className="depots-cards-col">
                {mockCircularHubs.map(hub => {
                  const isSelected = selectedHub.id === hub.id
                  return (
                    <div 
                      key={hub.id} 
                      className={`depot-list-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedHub(hub)
                        playTelemetryPing()
                      }}
                    >
                      <div className="depot-item-header">
                        <span className="depot-category-tag">{hub.category}</span>
                        {hub.publicDropOff && <span className="public-tag">Public Drop-Off</span>}
                      </div>
                      <h3>{hub.name}</h3>
                      <p className="depot-addr"><MapPin size={12} /> {hub.address}</p>
                      <div className="depot-capacity">
                        Annual Capacity: <strong>{hub.annualThroughputTons.toLocaleString()} tonnes/yr</strong>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Selected Depot Detail Dossier */}
            <div className="depot-detail-dossier">
              <div className="dossier-top">
                <span className="dossier-cat-pill">{selectedHub.category}</span>
                <h2>{selectedHub.name}</h2>
                <p className="dossier-address"><MapPin size={13} /> {selectedHub.address}</p>
              </div>

              <p className="dossier-desc">{selectedHub.description}</p>

              <div className="dossier-stat-row">
                <div className="dossier-stat-card">
                  <small>ANNUAL RECOVERY THROUGHPUT</small>
                  <strong>{selectedHub.annualThroughputTons.toLocaleString()} t/yr</strong>
                  <span>Certified municipal diversion</span>
                </div>
                <div className="dossier-stat-card">
                  <small>PUBLIC RESIDENTIAL ACCESS</small>
                  <strong className="green">{selectedHub.publicDropOff ? 'Open to Public' : 'Commercial Fleet Only'}</strong>
                  <span>San Francisco residents</span>
                </div>
              </div>

              <div className="accepted-materials-section">
                <h3>Accepted Stream Classifications:</h3>
                <div className="materials-tags-grid">
                  {selectedHub.acceptedMaterials.map((mat, idx) => (
                    <span key={idx} className="mat-chip">
                      <CheckCircle2 size={13} /> {mat}
                    </span>
                  ))}
                </div>
              </div>

              {onFocusCoordinates && (
                <button 
                  className="dossier-locate-btn"
                  onClick={() => onFocusCoordinates(selectedHub.coordinates, 16)}
                >
                  <Compass size={14} /> Fly to Facility on San Francisco GIS Map
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* VIEW 5: 8-DISTRICT SCORECARD */}
      {activeTab === 'districts' && (
        <section className="sf-section sf-districts-section">
          <div className="districts-header">
            <h2>San Francisco 8-District Zero-Waste Operational Matrix</h2>
            <p>Comparative diversion yield, contamination risk, population, and active fleet deployment across all 8 San Francisco municipal sectors.</p>
          </div>

          <div className="districts-table-wrap">
            <table className="sf-districts-table">
              <thead>
                <tr>
                  <th>San Francisco District</th>
                  <th>Status</th>
                  <th>Population</th>
                  <th>Daily Waste</th>
                  <th>Source Segregation</th>
                  <th>Contamination</th>
                  <th>Active Fleet</th>
                  <th>Primary Operational Challenge</th>
                </tr>
              </thead>
              <tbody>
                {mockZones.map(zone => (
                  <tr key={zone.name}>
                    <td>
                      <strong>{zone.name}</strong>
                    </td>
                    <td>
                      <span className={`zone-status-badge ${zone.state}`}>{zone.state.toUpperCase()}</span>
                    </td>
                    <td>{zone.population.toLocaleString()}</td>
                    <td><strong>{zone.dailyTons} t/day</strong></td>
                    <td>
                      <div className="table-bar-cell">
                        <strong>{zone.segregationRate}%</strong>
                        <div className="mini-bar-track">
                          <div className="mini-bar-fill" style={{ width: `${zone.segregationRate}%` }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`contam-tag ${zone.contaminationRate > 15 ? 'high' : 'low'}`}>
                        {zone.contaminationRate}%
                      </span>
                    </td>
                    <td>
                      <span className="fleet-count"><Truck size={12} /> {zone.activeVehicles} trucks</span>
                    </td>
                    <td>
                      <span className="zone-issue-text">{zone.primaryIssue}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
