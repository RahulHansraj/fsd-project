import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  Bot,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock3,
  Command,
  Crosshair,
  Factory,
  FileBarChart2,
  Gift,
  Flame,
  Globe2,
  Layers3,
  LineChart,
  LogOut,
  Map,
  MapPin,
  Menu,
  MoreHorizontal,
  Navigation,
  Play,
  Plus,
  Radio,
  Recycle,
  Route,
  ScanSearch,
  Send,
  ShieldCheck,
  Sliders,
  Sparkles,
  Trash2,
  Truck,
  Waves,
  X
} from 'lucide-react'

import { NavigationTab, QueueItem, SmartBinSensor, SystemNotification, ZoneData, ZoneName } from '../types/operations'
import { 
  mockFleet, 
  mockInitialQueue, 
  mockLandfillTelemetry, 
  mockNotifications, 
  mockRecyclingFacilities, 
  mockSmartBins, 
  mockZones 
} from '../data/mockOperationsData'

import { SegregationView } from '../components/views/SegregationView'
import { FacilitiesView } from '../components/views/FacilitiesView'
import { LandfillView } from '../components/views/LandfillView'
import { FleetView } from '../components/views/FleetView'
import { SmartBinsView } from '../components/views/SmartBinsView'
import { CitizenRewardsView } from '../components/views/CitizenRewardsView'
import { PerformanceView } from '../components/views/PerformanceView'
import { GlobalBenchmarkView } from '../components/views/GlobalBenchmarkView'
import { SanFranciscoDataView } from '../components/views/SanFranciscoDataView'

import { CommodityTicker } from '../components/common/CommodityTicker'
import { OpenStreetMapContainer } from '../components/map/OpenStreetMapContainer'

import { CreateTaskModal } from '../components/modals/CreateTaskModal'
import { SearchPaletteModal } from '../components/modals/SearchPaletteModal'
import { NotificationsDrawer } from '../components/modals/NotificationsDrawer'
import { TriageModal } from '../components/modals/TriageModal'
import { AIAssistantDrawer } from '../components/ai/AIAssistantDrawer'
import { FloatingCopilotButton } from '../components/ai/FloatingCopilotButton'
import { RadioDispatchModal } from '../components/audio/RadioDispatchModal'
import { TrendChartsModal } from '../components/analytics/TrendChartsModal'
import { Municipality, mockMunicipalities } from '../data/mockMunicipalities'
import { MunicipalityModal } from '../components/modals/MunicipalityModal'
import { authService } from '../services/authService'

export default function CommandCenter() {
  const navigate = useNavigate()
  const [currentUser] = useState(() => authService.getUser() || {
    name: 'Jordan Smith',
    role: 'Operations Lead',
    avatar: 'JS'
  })

  const handleLogout = () => {
    authService.logout()
    navigate('/login')
  }

  // Navigation & View State
  const [activeTab, setActiveTab] = useState<NavigationTab>('command-center')
  const [activeMunicipality, setActiveMunicipality] = useState<Municipality>(mockMunicipalities[0])
  const [municipalityModalOpen, setMunicipalityModalOpen] = useState(false)
  const [activeZone, setActiveZone] = useState<ZoneName>('Mission District')
  const [zones, setZones] = useState<ZoneData[]>(mockZones)
  const [queue, setQueue] = useState<QueueItem[]>(mockInitialQueue)
  const [notifications, setNotifications] = useState<SystemNotification[]>(mockNotifications)
  const [smartBins, setSmartBins] = useState<SmartBinSensor[]>(mockSmartBins)

  // Drawer & Modal States
  const [navOpen, setNavOpen] = useState(false)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false)
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const [triageItem, setTriageItem] = useState<QueueItem | null>(null)
  const [radioModalOpen, setRadioModalOpen] = useState(false)
  const [radioPrefillVehicle, setRadioPrefillVehicle] = useState('R-22')
  const [radioPrefillDriver, setRadioPrefillDriver] = useState('Elena Rostova')
  const [trendModalOpen, setTrendModalOpen] = useState(false)
  
  // What-If Planner State in Overview
  const [scenarioRan, setScenarioRan] = useState(false)
  const [simDwellMinutes, setSimDwellMinutes] = useState(12)
  const [notice, setNotice] = useState('')

  // Prefill for Create Task
  const [taskPrefillZone, setTaskPrefillZone] = useState<ZoneName>('Mission District')
  const [taskPrefillVehicle, setTaskPrefillVehicle] = useState<string>('R-22')

  // Listen for Ctrl+K for search palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const selectedZone = zones.find((zone) => zone.name === activeZone) ?? zones[0]

  const triggerNotice = (message: string) => {
    setNotice(message)
  }

  const handleTaskCreated = (newTask: QueueItem) => {
    setQueue(prev => [newTask, ...prev])
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        timestamp: 'Just now',
        title: `Task Dispatched: ${newTask.title}`,
        description: `Assigned to ${newTask.assignedVehicle || 'Fleet'} in ${newTask.zone}.`,
        type: 'info',
        read: false
      },
      ...prev
    ])
    triggerNotice(`Task "${newTask.title}" dispatched to ${newTask.assignedVehicle || 'field team'}.`)
  }

  const handleResolveException = (itemId: string, actionNote: string) => {
    setQueue(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, status: 'Resolved', severity: 'resolved' }
      }
      return item
    }))
    triggerNotice(`Exception ${itemId} resolved: ${actionNote}`)
  }

  const handleReassignException = (itemId: string, targetVehicle: string) => {
    setQueue(prev => prev.map(item => {
      if (item.id === itemId) {
        return { 
          ...item, 
          assignedVehicle: targetVehicle, 
          detail: `${item.detail} (Reassigned to ${targetVehicle})`,
          status: 'In Progress' 
        }
      }
      return item
    }))
    triggerNotice(`Exception ${itemId} reassigned to reserve vehicle ${targetVehicle}.`)
  }

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    triggerNotice('All notifications marked as read.')
  }

  const handleClearNotifications = () => {
    setNotifications([])
    triggerNotice('Notification archive cleared.')
  }

  const handleExecuteAIAction = (actionKey: string) => {
    if (actionKey === 'dispatch_r18') {
      handleReassignException('Q-101', 'R-18')
      setAssistantOpen(false)
    } else if (actionKey === 'open_landfill') {
      setActiveTab('landfill')
      setAssistantOpen(false)
    } else if (actionKey === 'open_facilities') {
      setActiveTab('facilities')
      setAssistantOpen(false)
    } else if (actionKey === 'broadcast_notice') {
      triggerNotice('Mass citizen broadcast dispatched to 14,200 residents via Municipal WhatsApp API.')
    } else if (actionKey === 'view_queue') {
      setActiveTab('command-center')
      setAssistantOpen(false)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="cc-shell">
      {/* Sidebar Navigation */}
      <aside className={`cc-sidebar ${navOpen ? 'is-open' : ''}`}>
        <div className="cc-brand">
          <span><Command size={18} /></span>
          <strong>civic<span>cycle</span></strong>
          <button className="cc-close" onClick={() => setNavOpen(false)} aria-label="Close navigation">
            <X size={18} />
          </button>
        </div>

        <button 
          className="cc-city"
          onClick={() => setMunicipalityModalOpen(true)}
          aria-label={`Active Municipality: ${activeMunicipality.name}. Click to switch jurisdiction.`}
          title="Click to switch active municipality"
          type="button"
        >
          <div className="city-pin" />
          <div className="city-text">
            <small>ACTIVE MUNICIPALITY</small>
            <strong>{activeMunicipality.name}</strong>
          </div>
          <ChevronDown size={15} className={`city-chevron ${municipalityModalOpen ? 'open' : ''}`} />
        </button>

        <nav className="cc-nav" aria-label="Command center navigation">
          <button 
            className={activeTab === 'command-center' ? 'current' : ''} 
            onClick={() => { setActiveTab('command-center'); setNavOpen(false) }}
          >
            <Layers3 size={18} /> Command center
          </button>

          <button 
            className={activeTab === 'segregation' ? 'current' : ''} 
            onClick={() => { setActiveTab('segregation'); setNavOpen(false) }}
          >
            <Recycle size={18} /> Waste Segregation & AI
          </button>

          <button 
            className={activeTab === 'facilities' ? 'current' : ''} 
            onClick={() => { setActiveTab('facilities'); setNavOpen(false) }}
          >
            <Factory size={18} /> Recycling Plants (MRF)
          </button>

          <button 
            className={activeTab === 'landfill' ? 'current' : ''} 
            onClick={() => { setActiveTab('landfill'); setNavOpen(false) }}
          >
            <Building2 size={18} /> Landfill & Sensors
          </button>

          <button 
            className={activeTab === 'fleet' ? 'current' : ''} 
            onClick={() => { setActiveTab('fleet'); setNavOpen(false) }}
          >
            <Truck size={18} /> Fleet & Crews
          </button>

          <button 
            className={activeTab === 'smart-bins' ? 'current' : ''} 
            onClick={() => { setActiveTab('smart-bins'); setNavOpen(false) }}
          >
            <Trash2 size={18} /> IoT Smart Bins
          </button>

          <button 
            className={activeTab === 'citizen-rewards' ? 'current' : ''} 
            onClick={() => { setActiveTab('citizen-rewards'); setNavOpen(false) }}
          >
            <Award size={18} /> Citizen Green Rewards
          </button>

          <button 
            className={activeTab === 'sf-intelligence' ? 'current' : ''} 
            onClick={() => { setActiveTab('sf-intelligence'); setNavOpen(false) }}
          >
            <MapPin size={18} /> SF Urban Twin & 311
          </button>

          <button 
            className={activeTab === 'performance' ? 'current' : ''} 
            onClick={() => { setActiveTab('performance'); setNavOpen(false) }}
          >
            <FileBarChart2 size={18} /> Performance & Reports
          </button>
        </nav>

        <div className="cc-sidebar-foot">
          <div className="cc-profile">
            <div>{currentUser.avatar || 'JS'}</div>
            <span>
              <strong>{currentUser.name}</strong>
              <small>{currentUser.role}</small>
            </span>
            <button 
              className="cc-logout-btn" 
              onClick={handleLogout} 
              title="Sign Out to Login Page"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {navOpen && <button className="cc-scrim" aria-label="Close navigation" onClick={() => setNavOpen(false)} />}

      {/* Main Panel Content */}
      <main className="cc-main">
        {/* Rolling Circular Commodity Spot Market Ticker */}
        <CommodityTicker />

        {/* Topbar */}
        <header className="cc-topbar">
          <button className="cc-menu" onClick={() => setNavOpen(true)} aria-label="Open navigation">
            <Menu size={20} />
          </button>

          <div className="cc-breadcrumb">
            <span>Operations</span>
            <ChevronRight size={14} />
            <button 
              className="cc-breadcrumb-muni-btn"
              onClick={() => setMunicipalityModalOpen(true)}
              title="Click to switch active municipality"
              type="button"
            >
              {activeMunicipality.flag} {activeMunicipality.shortName}
            </button>
            <ChevronRight size={14} />
            <strong>
              {activeTab === 'command-center' && 'Command Center · OpenStreetMap GIS'}
              {activeTab === 'segregation' && 'Waste Segregation & AI Vision'}
              {activeTab === 'facilities' && 'Recycling Facilities (MRF)'}
              {activeTab === 'landfill' && 'Landfill Capacity & Sensors'}
              {activeTab === 'fleet' && 'Fleet & Crews'}
              {activeTab === 'smart-bins' && 'IoT Smart Bins & Sensor Grid'}
              {activeTab === 'citizen-rewards' && 'Citizen Green Rewards & Circular Pass'}
              {activeTab === 'sf-intelligence' && 'San Francisco Urban Twin · 311 Triage & Environmental Sensors'}
              {activeTab === 'global-benchmarks' && 'Global Municipal Benchmarks & Digital Twin Matrix'}
              {activeTab === 'performance' && 'Performance & Reports'}
            </strong>
          </div>

          <div className="cc-top-actions">
            {/* Visual Analytics Button */}
            <button 
              className="cc-icon"
              onClick={() => setTrendModalOpen(true)}
              aria-label="View Visual Analytics Charts"
              title="Visual Analytics Trends"
            >
              <LineChart size={18} />
            </button>

            {/* Field Radio Dispatch Button */}
            <button 
              className="cc-icon"
              onClick={() => {
                setRadioPrefillVehicle('R-22')
                setRadioPrefillDriver('Elena Rostova')
                setRadioModalOpen(true)
              }}
              aria-label="Open Municipal Dispatch Radio"
              title="Two-Way Dispatch Radio"
            >
              <Radio size={18} />
            </button>

            {/* Search Trigger */}
            <button 
              className="cc-icon search-trigger" 
              onClick={() => setSearchOpen(true)}
              aria-label="Search workspace (Ctrl+K)"
              title="Search workspace (Ctrl+K)"
            >
              <ScanSearch size={19} />
              <span className="kbd-badge">⌘K</span>
            </button>

            {/* Notifications Trigger */}
            <button 
              className={`cc-icon ${unreadCount > 0 ? 'notification-dot' : ''}`}
              onClick={() => setNotifDrawerOpen(true)}
              aria-label="View notifications"
              title="System Alerts"
            >
              <Bell size={18} />
            </button>

            {/* Create Task Button */}
            <button 
              className="cc-create" 
              onClick={() => setCreateTaskOpen(true)}
            >
              <Plus size={17} /> Create task
            </button>
          </div>
        </header>

        {/* Dynamic Toast Notice */}
        {notice && (
          <div className="cc-notice">
            <Check size={16} />
            <span>{notice}</span>
            <button aria-label="Dismiss notification" onClick={() => setNotice('')}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* View Switcher Routing */}
        {activeTab === 'segregation' && (
          <SegregationView zones={zones} onTriggerNotice={triggerNotice} />
        )}

        {activeTab === 'facilities' && (
          <FacilitiesView onTriggerNotice={triggerNotice} />
        )}

        {activeTab === 'landfill' && (
          <LandfillView onTriggerNotice={triggerNotice} />
        )}

        {activeTab === 'fleet' && (
          <FleetView 
            onTriggerNotice={triggerNotice} 
            onOpenCreateTask={(zone, vehicle) => {
              if (zone) setTaskPrefillZone(zone)
              if (vehicle) setTaskPrefillVehicle(vehicle)
              setCreateTaskOpen(true)
            }} 
          />
        )}

        {activeTab === 'smart-bins' && (
          <SmartBinsView 
            onTriggerNotice={triggerNotice}
            onTaskCreated={handleTaskCreated}
          />
        )}

        {activeTab === 'citizen-rewards' && (
          <CitizenRewardsView onTriggerNotice={triggerNotice} />
        )}

        {activeTab === 'performance' && (
          <PerformanceView onTriggerNotice={triggerNotice} />
        )}

        {activeTab === 'global-benchmarks' && (
          <GlobalBenchmarkView 
            onTriggerNotice={triggerNotice}
            onNavigateToHub={(hub) => {
              setActiveTab('command-center')
              triggerNotice(`Focused GIS OpenStreetMap view on ${hub.city}, ${hub.country}.`)
            }}
          />
        )}

        {activeTab === 'sf-intelligence' && (
          <SanFranciscoDataView 
            onTriggerNotice={triggerNotice}
            onTaskCreated={handleTaskCreated}
            onFocusCoordinates={(coords) => {
              setActiveTab('command-center')
              triggerNotice(`Navigated to SF coordinates [${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}].`)
            }}
          />
        )}

        {/* Default View: Command Center Overview with OpenStreetMap */}
        {activeTab === 'command-center' && (
          <>
            <section className="cc-title-row">
              <div>
                <p className="cc-kicker">TUESDAY, SEPTEMBER 1 · 09:47 LOCAL · {activeMunicipality.name.toUpperCase()} · GIS DIGITAL TWIN</p>
                <h1>{activeMunicipality.shortName} Service Continuity</h1>
                <p className="cc-subtitle">A live municipal digital twin tracking {activeMunicipality.shortName} 311 cases, environmental sensors, marine outfalls, and {activeMunicipality.primaryAgency} fleet operations on OpenStreetMap.</p>
              </div>
              <div className="cc-status">
                <span><i /> OpenStreetMap GIS Live Feed</span>
                <small>{activeMunicipality.fleetActive} vehicles streaming OBD-II telemetry</small>
              </div>
            </section>

            {/* Top KPI Cards */}
            <section className="cc-kpis" aria-label="Service performance overview">
              <Kpi 
                label="Today collected" 
                value={`${activeMunicipality.dailyTonnage.toLocaleString()}`} 
                unit="t" 
                detail={`${Math.round((activeMunicipality.dailyTonnage / activeMunicipality.forecastTonnage) * 100)}% of forecast`} 
                trend="up" 
              />
              <Kpi 
                label="Service on time" 
                value={`${activeMunicipality.onTimeAdherence}`} 
                unit="%" 
                detail="Fleet adherence" 
                trend="up" 
              />
              <Kpi 
                label="Recovery yield" 
                value={`${activeMunicipality.diversionRate}`} 
                unit="%" 
                detail={`Target: ${activeMunicipality.targetDiversionRate}%`} 
                trend="steady" 
              />
              <Kpi 
                label="Open exceptions" 
                value={`0${queue.filter(q => q.status !== 'Resolved').length}`} 
                unit="" 
                detail="Requires triage" 
                trend="down" 
                urgent 
              />
            </section>

            {/* Dashboard Grid */}
            <section className="cc-grid">
              {/* Interactive OpenStreetMap Container */}
              <article className="cc-card cc-territory-osm">
                <div className="cc-card-head">
                  <div>
                    <p className="cc-kicker">LIVE GIS MAP · OPENSTREETMAP</p>
                    <h2>Citywide Waste Collection & Fleet Live Map</h2>
                  </div>
                  <button 
                    className="cc-filter"
                    onClick={() => setActiveTab('fleet')}
                  >
                    <Map size={15} /> Open Fleet Telemetry <ChevronRight size={14} />
                  </button>
                </div>

                {/* Leaflet OpenStreetMap Engine */}
                <OpenStreetMapContainer 
                  zones={zones}
                  fleet={mockFleet}
                  facilities={mockRecyclingFacilities}
                  landfill={mockLandfillTelemetry}
                  smartBins={smartBins}
                  activeZone={activeZone}
                  onSelectZone={(z) => setActiveZone(z)}
                  onTriggerNotice={triggerNotice}
                  onOpenRadioModal={(vId, dName) => {
                    setRadioPrefillVehicle(vId)
                    setRadioPrefillDriver(dName)
                    setRadioModalOpen(true)
                  }}
                  onWaypointTaskDispatched={handleTaskCreated}
                  height="340px"
                />

                {/* Zone Strip Selector */}
                <div className="cc-zone-strip">
                  {zones.map((zone) => (
                    <button 
                      key={zone.name} 
                      className={activeZone === zone.name ? 'active-zone' : ''} 
                      onClick={() => setActiveZone(zone.name)}
                    >
                      <span className={`zone-state ${zone.state}`} />
                      <strong>{zone.name}</strong>
                      <small>{zone.service}</small>
                      <b>{zone.score}</b>
                    </button>
                  ))}
                </div>
              </article>

              {/* Daily Area Status & Action Card */}
              <article className="cc-card cc-shift-brief">
                <div className="brief-flag">
                  <AlertTriangle size={12} />
                  <span>Daily Area Alert</span>
                  <span className={`brief-status-pill ${selectedZone.state}`}>
                    {selectedZone.state === 'critical' ? 'Needs Immediate Help' : selectedZone.state === 'attention' ? 'Attention Needed' : 'Running Smoothly'}
                  </span>
                </div>
                <h2>{selectedZone.name}</h2>
                <p>
                  {selectedZone.primaryIssue}
                </p>

                <div className="brief-stats-row">
                  <div className="brief-stat-item">
                    <small>On-Time Pickup</small>
                    <strong>{selectedZone.service}</strong>
                  </div>
                  <div className="brief-stat-item">
                    <small>Clean Sorting</small>
                    <strong>{selectedZone.segregationRate}%</strong>
                  </div>
                  <div className="brief-stat-item">
                    <small>Active Trucks</small>
                    <strong>{selectedZone.activeVehicles} Trucks</strong>
                  </div>
                </div>

                <div className="brief-actions">
                  <button 
                    className="primary" 
                    onClick={() => {
                      triggerNotice(`Backup truck R-18 sent to assist ${selectedZone.name} routes.`)
                    }}
                    title="Send an extra truck to help this district"
                  >
                    <Truck size={13} /> Send Backup Truck
                  </button>
                  <button 
                    className="secondary" 
                    onClick={() => setAssistantOpen(true)}
                    title="Ask operations assistant for more details"
                  >
                    <Bot size={13} /> Ask Copilot
                  </button>
                </div>
              </article>

              {/* Materials & Landfill Runway Pulse */}
              <article className="cc-card cc-pulse">
                <div className="cc-card-head">
                  <div>
                    <p className="cc-kicker">NETWORK PULSE · MATERIAL RECOVERY</p>
                    <h2>Materials & capacity</h2>
                  </div>
                  <button className="cc-text-action" onClick={() => setActiveTab('facilities')}>
                    Details <ArrowRight size={14} />
                  </button>
                </div>
                <div className="pulse-bars">
                  <Pulse label="Wet Organics" current="163.1 t" percentage={81} color="green" />
                  <Pulse label="Dry Recyclables" current="129.6 t" percentage={65} color="blue" />
                  <Pulse label="Landfill Inerts" current="50.3 t" percentage={42} color="orange" />
                </div>
                <div 
                  className="capacity-callout clickable"
                  onClick={() => setActiveTab('landfill')}
                  title="Click to open Landfill Lifespan Simulator"
                >
                  <div>
                    <span>Landfill runway</span>
                    <strong>41 days</strong>
                  </div>
                  <p>Click to open Dynamic Simulator →</p>
                </div>
              </article>

              {/* Decision Queue (Triage Exceptions) */}
              <article className="cc-card cc-exceptions">
                <div className="cc-card-head">
                  <div>
                    <p className="cc-kicker">DECISION QUEUE · AI TRIAGE</p>
                    <h2>Exceptions requiring action</h2>
                  </div>
                  <button 
                    className="cc-text-action" 
                    onClick={() => triggerNotice('All active exceptions prioritized in review queue.')}
                  >
                    Prioritize <ArrowRight size={14} />
                  </button>
                </div>

                <div className="exception-list">
                  {queue.slice(0, 4).map((item) => (
                    <button 
                      className={`exception-row ${item.status === 'Resolved' ? 'is-resolved' : ''}`} 
                      key={item.id} 
                      onClick={() => setTriageItem(item)}
                    >
                      <time>{item.time}</time>
                      <span className={`exception-mark ${item.severity}`} />
                      <div>
                        <strong>{item.title}</strong>
                        <small>{item.detail} · <span className="status-badge-inline">{item.status}</span></small>
                      </div>
                      <ChevronRight size={17} />
                    </button>
                  ))}
                </div>
              </article>

              {/* Interactive What-If Route Planner */}
              <article className="cc-card cc-simulate">
                <div className="simulate-top">
                  <div>
                    <p className="cc-kicker">WHAT-IF PLANNER · ROUTE OPTIMIZATION</p>
                    <h2>Protect the 11:00 window</h2>
                  </div>
                  <span className="scenario-chip">Unit R-22</span>
                </div>

                <div className="scenario-route">
                  <span className="from">Depot 04</span>
                  <i />
                  <span className="through">Financial & SoMa</span>
                  <i />
                  <span className="to">Tunnel Ave Transfer</span>
                </div>

                {/* Interactive Slider for Dwell Impact */}
                <div className="sim-slider-row">
                  <div className="sim-slider-label">
                    <span>Simulated Dwell Time:</span>
                    <strong>{simDwellMinutes} mins</strong>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="45" 
                    value={simDwellMinutes}
                    onChange={(e) => {
                      setSimDwellMinutes(Number(e.target.value))
                      setScenarioRan(true)
                    }}
                    className="range-slider-sm"
                  />
                </div>

                <div className="scenario-metrics">
                  <div>
                    <small>Current Baseline ETA</small>
                    <strong>10:58</strong>
                  </div>
                  <div>
                    <small>Delay Risk</small>
                    <strong className="risk">{simDwellMinutes > 20 ? '34 min' : '8 min'}</strong>
                  </div>
                  {scenarioRan && (
                    <div className="sim-result">
                      <small>Simulated ETA</small>
                      <strong>{simDwellMinutes <= 15 ? '10:24' : '10:39'}</strong>
                    </div>
                  )}
                </div>

                <button 
                  className="simulate-button" 
                  onClick={() => {
                    setScenarioRan(true)
                    triggerNotice(`Route simulation executed: Alternate transit via Pier Avenue cuts ETA to 10:31.`)
                  }}
                >
                  {scenarioRan ? (
                    <><Check size={16} /> Scenario applied (10:31 ETA)</>
                  ) : (
                    <><Sparkles size={16} /> Run route simulation</>
                  )}
                </button>
              </article>
            </section>
          </>
        )}
      </main>

      {/* Floating Draggable Operations Copilot Button */}
      <FloatingCopilotButton onClick={() => setAssistantOpen(true)} />

      {/* Azure AI Operations Copilot Drawer */}
      <AIAssistantDrawer 
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        onTriggerNotice={triggerNotice}
        onExecuteAction={handleExecuteAIAction}
      />

      {/* Global Modals */}
      <SearchPaletteModal 
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={(tab, zone) => {
          if (zone === 'municipality-selector') {
            setMunicipalityModalOpen(true)
            return
          }
          setActiveTab(tab)
          if (zone) setActiveZone(zone as ZoneName)
        }}
      />

      <NotificationsDrawer 
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onClearAll={handleClearNotifications}
        onSelectNotification={(notif) => {
          triggerNotice(`Notification selected: ${notif.title}`)
          setNotifDrawerOpen(false)
        }}
      />

      <CreateTaskModal 
        isOpen={createTaskOpen}
        onClose={() => setCreateTaskOpen(false)}
        onTaskCreated={handleTaskCreated}
        initialZone={taskPrefillZone}
        initialVehicle={taskPrefillVehicle}
      />

      <TriageModal 
        item={triageItem}
        onClose={() => setTriageItem(null)}
        onResolve={handleResolveException}
        onReassign={handleReassignException}
      />

      <RadioDispatchModal 
        isOpen={radioModalOpen}
        onClose={() => setRadioModalOpen(false)}
        onTriggerNotice={triggerNotice}
        initialVehicleId={radioPrefillVehicle}
        initialDriverName={radioPrefillDriver}
      />

      <TrendChartsModal 
        isOpen={trendModalOpen}
        onClose={() => setTrendModalOpen(false)}
        onTriggerNotice={triggerNotice}
      />

      <MunicipalityModal
        isOpen={municipalityModalOpen}
        onClose={() => setMunicipalityModalOpen(false)}
        activeMunicipality={activeMunicipality}
        onSelectMunicipality={(muni) => {
          setActiveMunicipality(muni)
          triggerNotice(`Active municipality set to ${muni.name}. Regional dispatch and telemetry synchronized.`)
        }}
        onNavigateToGlobalBenchmark={() => {
          setActiveTab('global-benchmarks')
          setMunicipalityModalOpen(false)
        }}
      />
    </div>
  )
}

function Kpi({ label, value, unit, detail, trend, urgent = false }: { label: string; value: string; unit: string; detail: string; trend: 'up' | 'down' | 'steady'; urgent?: boolean }) {
  return (
    <article className={`cc-kpi ${urgent ? 'urgent' : ''}`}>
      <span>{label}</span>
      <div>
        <strong>{value}</strong>
        <small>{unit}</small>
      </div>
      <p>
        <i className={trend} />
        {detail}
      </p>
    </article>
  )
}

function Pulse({ label, current, percentage, color }: { label: string; current: string; percentage: number; color: string }) {
  return (
    <div className="pulse-row">
      <div>
        <span>{label}</span>
        <strong>{current}</strong>
      </div>
      <div className="pulse-track">
        <i className={color} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}