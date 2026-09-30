import { useEffect, useRef, useState } from 'react'
import { 
  Building2, 
  Calendar, 
  Check, 
  ChevronRight, 
  Command, 
  Factory, 
  FileText, 
  Layers3, 
  MapPin, 
  Recycle, 
  Route, 
  Search, 
  Truck, 
  X 
} from 'lucide-react'
import { NavigationTab } from '../../types/operations'

interface SearchPaletteModalProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (tab: NavigationTab, zone?: string) => void
}

interface SearchItem {
  id: string
  title: string
  subtitle: string
  category: 'Views' | 'Districts' | 'Fleet' | 'Facilities'
  tab: NavigationTab
  zone?: string
  icon: any
}

const searchableItems: SearchItem[] = [
  { id: 'v-cc', title: 'Command Center (OpenStreetMap)', subtitle: 'Live municipal streaming, OpenStreetMap GIS & operational pulse', category: 'Views', tab: 'command-center', icon: Layers3 },
  { id: 'v-sf', title: 'San Francisco Urban Twin & 311', subtitle: 'Live SF 311 citizen requests, BAAQMD sensors, marine booms & circular depots', category: 'Views', tab: 'sf-intelligence', icon: MapPin },
  { id: 'v-seg', title: 'Waste Segregation & AI Vision', subtitle: 'Compliance audit & computer vision contamination scanner', category: 'Views', tab: 'segregation', icon: Recycle },
  { id: 'v-fac', title: 'Recycling Plants & MRF Facilities', subtitle: 'Weighbridge intake, sorting lines, baled inventory', category: 'Views', tab: 'facilities', icon: Factory },
  { id: 'v-land', title: 'Landfill Capacity & Runway Simulator', subtitle: 'Pine Ridge Cell 4 lifespan & environmental sensors', category: 'Views', tab: 'landfill', icon: Building2 },
  { id: 'v-flt', title: 'Fleet & Crew Field Operations', subtitle: 'Live truck GPS, dwell times, and reroute dispatch', category: 'Views', tab: 'fleet', icon: Truck },
  { id: 'v-bins', title: 'IoT Smart Bins & Sensor Grid', subtitle: 'Ultrasonic fill depth, smoldering fire alerts, auto-dispatch', category: 'Views', tab: 'smart-bins', icon: Building2 },
  { id: 'v-rew', title: 'Citizen Rewards & Circular Pass', subtitle: 'QR bag scan rewards, leaderboard, municipal tax rebates', category: 'Views', tab: 'citizen-rewards', icon: Recycle },
  { id: 'v-rep', title: 'Performance & Shift Reports', subtitle: 'Cost per ton, citizen grievance SLA, printable report', category: 'Views', tab: 'performance', icon: FileText },
  { id: 'v-muni', title: 'Active Municipality & Jurisdiction Switcher', subtitle: 'Switch active municipal twin (San Francisco, Oakland, San Jose, Berkeley, NYC, Tokyo)', category: 'Views', tab: 'command-center', zone: 'municipality-selector', icon: Building2 },

  { id: 'd-sf-mis', title: 'Mission District', subtitle: 'Urban culture & transit corridor · 74.2% segregation', category: 'Districts', tab: 'command-center', zone: 'Mission District', icon: MapPin },
  { id: 'd-sf-soma', title: 'Financial & SoMa', subtitle: 'Commercial high-density · 78.4% segregation', category: 'Districts', tab: 'command-center', zone: 'Financial & SoMa', icon: MapPin },
  { id: 'd-sf-sunset', title: 'Sunset District', subtitle: 'Residential Pacific boundary · 82.5% segregation', category: 'Districts', tab: 'command-center', zone: 'Sunset District', icon: MapPin },
  { id: 'd-sf-bayview', title: 'Bayview-Hunters Point', subtitle: 'Light industrial & logistics · 63.4% segregation', category: 'Districts', tab: 'command-center', zone: 'Bayview-Hunters Point', icon: MapPin },
  { id: 'd-sf-fw', title: 'Fisherman Wharf & Marina', subtitle: 'Northern waterfront & tourism · 84.1% segregation', category: 'Districts', tab: 'command-center', zone: 'Fisherman Wharf', icon: MapPin },
  { id: 'd-sf-richmond', title: 'Richmond District', subtitle: 'Ocean beach residential · 81.0% segregation rate', category: 'Districts', tab: 'command-center', zone: 'Richmond District', icon: MapPin },
  { id: 'd-sf-china', title: 'Chinatown & North Beach', subtitle: 'High-density culinary & commercial corridor', category: 'Districts', tab: 'command-center', zone: 'Chinatown & North Beach', icon: MapPin },
  { id: 'd-sf-civic', title: 'Civic Center & Tenderloin', subtitle: 'Municipal plaza & transit zone', category: 'Districts', tab: 'segregation', zone: 'Civic Center & Tenderloin', icon: MapPin },

  { id: 't-r22', title: 'Unit R-22 (Elena Rostova)', subtitle: 'Financial & SoMa · Side Loader · 34m dwell delay', category: 'Fleet', tab: 'fleet', icon: Truck },
  { id: 't-r14', title: 'Unit R-14 (Marcus Chen)', subtitle: 'Fisherman Wharf · EV Compactor · On schedule', category: 'Fleet', tab: 'fleet', icon: Truck },
  { id: 't-r08', title: 'Unit R-08 (Devon Vance)', subtitle: 'Sunset District · Organic Dumper · 91% complete', category: 'Fleet', tab: 'fleet', icon: Truck },
  { id: 't-r05', title: 'Unit R-05 (Kavita Rao)', subtitle: 'Depot 4 · Standby Reserve Unit', category: 'Fleet', tab: 'fleet', icon: Truck },

  { id: 'f-mrf', title: 'Recology Pier 96 Materials Recovery Facility (MRF)', subtitle: '145 t/day intake · Optical sorting active', category: 'Facilities', tab: 'facilities', icon: Factory },
  { id: 'f-comp', title: 'Recology Jepson Prairie Composting Facility', subtitle: '165 t/day intake · Grade A bio-piles', category: 'Facilities', tab: 'facilities', icon: Factory },
  { id: 'f-plas', title: 'San Francisco Advanced Plastics Upcycling Center', subtitle: '48.6 t/day intake · Pelletizing extruder', category: 'Facilities', tab: 'facilities', icon: Factory },
  { id: 'f-wte', title: 'GreenGrid Waste-to-Energy Co-Gen', subtitle: '75.2 t/day intake · Power grid export', category: 'Facilities', tab: 'facilities', icon: Factory }
]

export function SearchPaletteModal({ isOpen, onClose, onNavigate }: SearchPaletteModalProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setSelectedIndex(0)
      setQuery('')
    }
  }, [isOpen])

  const filteredItems = searchableItems.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const handleSelect = (item: SearchItem) => {
    onNavigate(item.tab, item.zone)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="search-palette" onClick={(e) => e.stopPropagation()}>
        <div className="palette-input-wrap">
          <Search size={18} />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Search views, districts, trucks, MRF facilities, or actions... (Esc to exit)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            className="palette-input"
          />
          <span className="kbd-shortcut">ESC</span>
        </div>

        <div className="palette-results">
          {filteredItems.length === 0 ? (
            <div className="no-results">
              <p>No municipal assets or views found matching "{query}"</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon
              const isSelected = idx === selectedIndex
              return (
                <button
                  key={item.id}
                  className={`palette-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="palette-item-icon">
                    <Icon size={16} />
                  </div>
                  <div className="palette-item-text">
                    <strong>{item.title}</strong>
                    <small>{item.subtitle}</small>
                  </div>
                  <span className="palette-category-badge">{item.category}</span>
                  <ChevronRight size={14} className="palette-arrow" />
                </button>
              )
            })
          )}
        </div>

        <div className="palette-footer">
          <span>Use <b>↑</b> <b>↓</b> to navigate</span>
          <span><b>Enter</b> to select</span>
          <span><b>Ctrl+K</b> to toggle anytime</span>
        </div>
      </div>
    </div>
  )
}
