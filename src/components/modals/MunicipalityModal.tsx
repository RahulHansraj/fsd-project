import React, { useState, useEffect } from 'react'
import { 
  Building2, 
  Check, 
  ChevronRight, 
  Globe, 
  MapPin, 
  RotateCcw, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  Truck, 
  X 
} from 'lucide-react'
import { Municipality, mockMunicipalities } from '../../data/mockMunicipalities'

interface MunicipalityModalProps {
  isOpen: boolean
  onClose: () => void
  activeMunicipality: Municipality
  onSelectMunicipality: (municipality: Municipality) => void
  onNavigateToGlobalBenchmark?: (hubId?: string) => void
}

export const MunicipalityModal: React.FC<MunicipalityModalProps> = ({
  isOpen,
  onClose,
  activeMunicipality,
  onSelectMunicipality,
  onNavigateToGlobalBenchmark
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'bay-area' | 'global'>('all')

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const filteredMunicipalities = mockMunicipalities.filter(m => {
    const matchesCategory = 
      selectedCategory === 'all' || 
      (selectedCategory === 'bay-area' && m.category === 'bay-area') ||
      (selectedCategory === 'global' && m.category === 'global')

    const query = searchQuery.toLowerCase().trim()
    const matchesQuery = 
      !query || 
      m.name.toLowerCase().includes(query) ||
      m.shortName.toLowerCase().includes(query) ||
      m.stateOrRegion.toLowerCase().includes(query) ||
      m.country.toLowerCase().includes(query) ||
      m.primaryAgency.toLowerCase().includes(query) ||
      m.ordinance.toLowerCase().includes(query)

    return matchesCategory && matchesQuery
  })

  const handleSelect = (municipality: Municipality) => {
    onSelectMunicipality(municipality)
    onClose()
  }

  const handleResetToSF = () => {
    const sf = mockMunicipalities.find(m => m.id === 'sf') || mockMunicipalities[0]
    onSelectMunicipality(sf)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Municipality Selector">
      <div 
        className="municipality-modal-container" 
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="muni-modal-header">
          <div className="muni-header-title-wrap">
            <div className="muni-header-icon">
              <Building2 size={20} />
            </div>
            <div>
              <h2>Active Municipality & Jurisdiction Switcher</h2>
              <p>Switch active municipal digital twin telemetry, regional waste ordinances, and dispatch boundaries.</p>
            </div>
          </div>
          <button 
            className="muni-close-btn" 
            onClick={onClose}
            aria-label="Close municipality switcher"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Active Banner */}
        <div className="muni-current-banner">
          <div className="muni-current-badge">
            <span className="muni-pulse-dot" />
            <span>CURRENTLY ACTIVE JURISDICTION</span>
          </div>
          <div className="muni-current-info">
            <strong>{activeMunicipality.flag} {activeMunicipality.name}</strong>
            <span>{activeMunicipality.primaryAgency} · {activeMunicipality.stateOrRegion}</span>
          </div>
          {activeMunicipality.id !== 'sf' && (
            <button className="muni-reset-btn" onClick={handleResetToSF} title="Switch back to primary San Francisco digital twin">
              <RotateCcw size={13} /> Reset to SF HQ
            </button>
          )}
        </div>

        {/* Search & Category Filter Row */}
        <div className="muni-controls-row">
          <div className="muni-search-box">
            <Search size={15} className="muni-search-icon" />
            <input 
              type="text" 
              placeholder="Search by city, county, region, or operating agency..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button className="muni-search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="muni-filter-tabs">
            <button 
              className={selectedCategory === 'all' ? 'active' : ''} 
              onClick={() => setSelectedCategory('all')}
            >
              All ({mockMunicipalities.length})
            </button>
            <button 
              className={selectedCategory === 'bay-area' ? 'active' : ''} 
              onClick={() => setSelectedCategory('bay-area')}
            >
              Bay Area & California (5)
            </button>
            <button 
              className={selectedCategory === 'global' ? 'active' : ''} 
              onClick={() => setSelectedCategory('global')}
            >
              Global Twins (4)
            </button>
          </div>
        </div>

        {/* List of Municipalities */}
        <div className="muni-list-container">
          {filteredMunicipalities.length === 0 ? (
            <div className="muni-empty-state">
              <Building2 size={36} />
              <p>No municipalities found matching "<strong>{searchQuery}</strong>"</p>
              <button onClick={() => { setSearchQuery(''); setSelectedCategory('all') }}>Clear filters</button>
            </div>
          ) : (
            filteredMunicipalities.map(muni => {
              const isActive = muni.id === activeMunicipality.id
              return (
                <div 
                  key={muni.id} 
                  className={`muni-card ${isActive ? 'is-active' : ''}`}
                  onClick={() => handleSelect(muni)}
                >
                  <div className="muni-card-main">
                    <div className="muni-card-top">
                      <span className="muni-flag">{muni.flag}</span>
                      <div className="muni-title-group">
                        <div className="muni-title-row">
                          <h3 className="muni-name">{muni.name}</h3>
                          <span className={`muni-badge ${muni.isCoreTelemetry ? 'core' : ''}`}>
                            {muni.badge}
                          </span>
                        </div>
                        <p className="muni-agency">
                          {muni.primaryAgency} · <span className="muni-region">{muni.stateOrRegion}</span>
                        </p>
                      </div>

                      <div className="muni-card-action">
                        {isActive ? (
                          <div className="muni-active-tag">
                            <Check size={14} />
                            <span>Active Jurisdiction</span>
                          </div>
                        ) : (
                          <button 
                            className="muni-select-btn" 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelect(muni)
                            }}
                          >
                            <span>Switch Jurisdiction</span>
                            <ChevronRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="muni-metrics-grid">
                      <div className="muni-metric-col">
                        <small>DIVERSION RATE</small>
                        <div className="muni-metric-val">
                          <strong>{muni.diversionRate}%</strong>
                          <span>Target: {muni.targetDiversionRate}%</span>
                        </div>
                        <div className="muni-progress-track">
                          <div 
                            className="muni-progress-bar" 
                            style={{ width: `${Math.min(100, muni.diversionRate)}%` }} 
                          />
                        </div>
                      </div>

                      <div className="muni-metric-col">
                        <small>DAILY INTAKE</small>
                        <div className="muni-metric-val">
                          <strong>{muni.dailyTonnage.toLocaleString()} t</strong>
                          <span>/ day</span>
                        </div>
                      </div>

                      <div className="muni-metric-col">
                        <small>ACTIVE FLEET</small>
                        <div className="muni-metric-val">
                          <strong>{muni.fleetActive}</strong>
                          <span>/ {muni.fleetTotal} vehicles</span>
                        </div>
                      </div>

                      <div className="muni-metric-col">
                        <small>POPULATION</small>
                        <div className="muni-metric-val">
                          <strong>{muni.population}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="muni-ordinance-row">
                      <ShieldCheck size={13} className="muni-ordinance-icon" />
                      <span><strong>Key Ordinance:</strong> {muni.ordinance}</span>
                      {muni.hubId && onNavigateToGlobalBenchmark && (
                        <button 
                          className="muni-twin-link" 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelect(muni)
                            onNavigateToGlobalBenchmark(muni.hubId)
                          }}
                          title="Open Global Benchmark & Digital Twin"
                        >
                          <Globe size={12} /> Explore Benchmark
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="muni-modal-footer">
          <div className="muni-footer-left">
            <span className="muni-dot-status" />
            <span>Municipal telemetry streaming via OpenStreetMap GIS · SB 1383 & Zero Waste standard compliant</span>
          </div>
          <div className="muni-footer-right">
            <button className="muni-cancel-btn" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
