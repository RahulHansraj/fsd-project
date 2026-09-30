import { useState, useMemo } from 'react'
import { 
  ArrowRight, 
  ArrowUpRight, 
  Award, 
  BarChart3, 
  Building2, 
  CheckCircle2, 
  ChevronRight, 
  Coins, 
  Compass, 
  Download, 
  ExternalLink, 
  Factory, 
  Flame, 
  Globe2, 
  HelpCircle, 
  Info, 
  Layers, 
  Leaf, 
  MapPin, 
  RefreshCw, 
  RotateCcw, 
  Scale, 
  Search, 
  ShieldCheck, 
  Sliders, 
  Sparkles, 
  TrendingUp, 
  Truck, 
  Zap 
} from 'lucide-react'
import { ContinentName, GlobalHub } from '../../types/operations'
import { mockCommodities, mockGlobalHubs } from '../../data/mockOperationsData'
import { playDispatchConfirm, playTelemetryPing } from '../../utils/audioEffects'

interface GlobalBenchmarkViewProps {
  onTriggerNotice: (msg: string) => void
  onNavigateToHub?: (hub: GlobalHub) => void
}

interface AdoptedPolicy {
  id: string
  hubId: string
  hubName: string
  country: string
  title: string
  description: string
  segregationBoost: number
  diversionBoost: number
  co2ReductionTons: number
  annualSavingsUsd: number
  tech: string
}

const availablePolicies: AdoptedPolicy[] = [
  {
    id: 'policy-indore',
    hubId: 'hub-indore',
    hubName: 'Indore Swachh Corporation',
    country: 'India 🇮🇳',
    title: '6-Stream Door-to-Door Partitioned Fleet Routing',
    description: '100% door-to-door source collection with segregated compartment electric tippers and zero garbage vulnerable points.',
    segregationBoost: 16.5,
    diversionBoost: 14.0,
    co2ReductionTons: 18400,
    annualSavingsUsd: 1250000,
    tech: 'Partitioned Electric EV Tippers & RFID Weighing at Gate'
  },
  {
    id: 'policy-berlin',
    hubId: 'hub-berlin',
    hubName: 'Berlin BSR Circular Grid',
    country: 'Germany 🇩🇪',
    title: 'Pfand Packaging Deposit Return & MBT Biogas',
    description: 'Mandatory nationwide deposit return with 98% bottle return rate and total ban on untreated municipal organic landfilling.',
    segregationBoost: 11.2,
    diversionBoost: 12.8,
    co2ReductionTons: 24200,
    annualSavingsUsd: 2100000,
    tech: 'Mechanical Biological Treatment (MBT) & High-Solids Biogas Digestion'
  },
  {
    id: 'policy-stockholm',
    hubId: 'hub-stockholm',
    hubName: 'Stockholm Envac Network',
    country: 'Sweden 🇸🇪',
    title: 'Envac Pneumatic Vacuum Tube Chutes',
    description: 'Underground pneumatic vacuum chutes moving waste at 70 km/h directly into central recovery terminals, slashing truck road emissions.',
    segregationBoost: 8.5,
    diversionBoost: 18.2,
    co2ReductionTons: 31000,
    annualSavingsUsd: 3400000,
    tech: 'Subterranean Vacuum Inlets & District Co-Generation Heat Grid'
  },
  {
    id: 'policy-curitiba',
    hubId: 'hub-curitiba',
    hubName: 'Curitiba Câmbio Verde Hub',
    country: 'Brazil 🇧🇷',
    title: 'Câmbio Verde (Food-for-Trash Municipal Vouchers)',
    description: 'Low-income community exchange program where citizens trade 4kg of sorted recyclable plastics for 1kg of fresh agricultural produce.',
    segregationBoost: 13.8,
    diversionBoost: 12.5,
    co2ReductionTons: 21500,
    annualSavingsUsd: 1450000,
    tech: 'Decentralized Micro-Sorting Cooperatives & Direct Agro-Exchange'
  },
  {
    id: 'policy-seoul',
    hubId: 'hub-seoul',
    hubName: 'Seoul Jongnyangje Grid',
    country: 'South Korea 🇰🇷',
    title: 'RFID Pay-As-You-Throw Smart Weighing Food Chutes',
    description: 'Dynamic RFID scales that weigh household food waste deposits and bill micro-cents directly to resident smart utility accounts.',
    segregationBoost: 15.2,
    diversionBoost: 16.0,
    co2ReductionTons: 27800,
    annualSavingsUsd: 2800000,
    tech: 'RFID Weighing Chutes & High-Temp Food Slurry Bio-Drying'
  },
  {
    id: 'policy-tokyo',
    hubId: 'hub-tokyo',
    hubName: 'Clean Authority Tokyo',
    country: 'Japan 🇯🇵',
    title: 'Slag Vitrification & Ash Melting Road-Base',
    description: 'Ultra-high temperature gasification converting municipal incineration ash into inert vitreous slag for maritime and asphalt infrastructure.',
    segregationBoost: 9.4,
    diversionBoost: 19.5,
    co2ReductionTons: 15600,
    annualSavingsUsd: 1850000,
    tech: 'Plasma Arc Ash Melting & Eco-Cement Slag Concrete'
  },
  {
    id: 'policy-kigali',
    hubId: 'hub-kigali',
    hubName: 'City of Kigali Umuganda',
    country: 'Rwanda 🇷🇼',
    title: 'Umuganda Civic Cleanups & Total Non-Biodegradable Ban',
    description: 'National mandatory monthly civic cleanup combined with strict enforcement against non-essential single-use polymers and plastic packaging.',
    segregationBoost: 14.1,
    diversionBoost: 11.8,
    co2ReductionTons: 12400,
    annualSavingsUsd: 890000,
    tech: 'Citizen-Led Stormwater Interceptors & Decentralized Bio-Piles'
  },
  {
    id: 'policy-zurich',
    hubId: 'hub-zurich',
    hubName: 'ERZ Zürich',
    country: 'Switzerland 🇨🇭',
    title: 'Züri-Sack Prepaid Pay-As-You-Throw Micro-Tax',
    description: 'Mandatory municipal fee bags that directly penalize unsorted residual trash while providing 100% free neighborhood drop-offs for sorted streams.',
    segregationBoost: 12.0,
    diversionBoost: 14.5,
    co2ReductionTons: 16900,
    annualSavingsUsd: 1950000,
    tech: 'Prepaid Micro-Tax Bags & High-Density Neighborhood Glass/Metal Bells'
  },
  {
    id: 'policy-adelaide',
    hubId: 'hub-adelaide',
    hubName: 'Green Industries SA',
    country: 'Australia 🇦🇺',
    title: 'Beverage Container Deposit & Closed-Loop Smelting',
    description: 'Australia’s benchmark 10c refund scheme achieving 84% container return with 100% recycled glass routed into local industrial bottle production.',
    segregationBoost: 10.5,
    diversionBoost: 15.0,
    co2ReductionTons: 19200,
    annualSavingsUsd: 1650000,
    tech: 'Automated Reverse Vending Optical Depots & Local Cullet Glass Beneficiation'
  },
  {
    id: 'policy-oslo',
    hubId: 'hub-oslo',
    hubName: 'Oslo Longship Project',
    country: 'Norway 🇳🇴',
    title: 'Carbon Capture & Storage (CCS) on Waste-to-Energy',
    description: 'Industrial amine carbon capture scrubbing 90% of CO2 from incineration flue gases, liquefied and stored permanently under the North Sea seabed.',
    segregationBoost: 6.0,
    diversionBoost: 17.5,
    co2ReductionTons: 42000,
    annualSavingsUsd: 3800000,
    tech: 'Klemetsrud Amine Absorption Flue Gas CCS & Subsea Pipeline Sequestration'
  },
  {
    id: 'policy-singapore',
    hubId: 'hub-singapore',
    hubName: 'Singapore NEA Tuas Nexus',
    country: 'Singapore 🇸🇬',
    title: 'Tuas Nexus Food Waste & Sludge Co-Digestion',
    description: 'Integrated co-location of used water reclamation and municipal solid waste treatment maximizing biogas energy generation by 40%.',
    segregationBoost: 6.2,
    diversionBoost: 11.0,
    co2ReductionTons: 14100,
    annualSavingsUsd: 1600000,
    tech: 'Anaerobic Food-Sludge Co-Digestion & Flue Gas Carbon Capture'
  },
  {
    id: 'policy-london',
    hubId: 'hub-london',
    hubName: 'London Western Riverside',
    country: 'United Kingdom 🇬🇧',
    title: 'Thames River Fluvial Barge Freight Network',
    description: 'Transporting bulk containerized waste via electric-hybrid river tugs, removing over 100,000 heavy diesel lorry trips from urban streets.',
    segregationBoost: 4.8,
    diversionBoost: 8.5,
    co2ReductionTons: 22800,
    annualSavingsUsd: 950000,
    tech: 'Fluvial Container Barges & Riverbank Hermetic Transfer Docks'
  }
]

export function GlobalBenchmarkView({ onTriggerNotice, onNavigateToHub }: GlobalBenchmarkViewProps) {
  const [selectedHub, setSelectedHub] = useState<GlobalHub>(mockGlobalHubs[0])
  const [adoptedPolicyIds, setAdoptedPolicyIds] = useState<string[]>([])
  const [calcRecoveryTons, setCalcRecoveryTons] = useState<number>(350)
  const [activeTab, setActiveTab] = useState<'matrix' | 'simulator' | 'commodities'>('matrix')
  const [selectedContinent, setSelectedContinent] = useState<ContinentName>('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Calculate San Francisco Baseline vs Policy Adoptions
  const baselineSegregation = 74.2
  const baselineDiversion = 67.4

  const adoptedPolicies = availablePolicies.filter(p => adoptedPolicyIds.includes(p.id))
  const totalSegregationBoost = adoptedPolicies.reduce((acc, p) => acc + p.segregationBoost, 0)
  const totalDiversionBoost = adoptedPolicies.reduce((acc, p) => acc + p.diversionBoost, 0)
  const totalCO2Saved = adoptedPolicies.reduce((acc, p) => acc + p.co2ReductionTons, 0)
  const totalFinancialBenefit = adoptedPolicies.reduce((acc, p) => acc + p.annualSavingsUsd, 0)

  const simulatedSegregation = Math.min(99.5, +(baselineSegregation + totalSegregationBoost).toFixed(1))
  const simulatedDiversion = Math.min(99.8, +(baselineDiversion + totalDiversionBoost).toFixed(1))

  // Worldwide Aggregate Stats
  const worldMetrics = useMemo(() => {
    const totalDailyTons = mockGlobalHubs.reduce((acc, h) => acc + (h.dailyTons ?? 0), 0)
    const avgDiversion = +(mockGlobalHubs.reduce((acc, h) => acc + h.diversionRate, 0) / mockGlobalHubs.length).toFixed(1)
    const avgSegregation = +(mockGlobalHubs.reduce((acc, h) => acc + h.segregationRate, 0) / mockGlobalHubs.length).toFixed(1)
    const totalEmissionsSaved = mockGlobalHubs.reduce((acc, h) => acc + (h.emissionsSavedTonsYear || 0), 0)
    return {
      totalHubs: mockGlobalHubs.length,
      totalDailyTons: Math.round(totalDailyTons),
      avgDiversion,
      avgSegregation,
      totalEmissionsSaved
    }
  }, [])

  // Filtered Hubs by Continent & Search
  const filteredHubs = useMemo(() => {
    return mockGlobalHubs.filter(h => {
      const matchContinent = selectedContinent === 'All' || h.continent === selectedContinent
      const q = searchQuery.toLowerCase().trim()
      const matchQuery = !q || 
        h.city.toLowerCase().includes(q) || 
        h.country.toLowerCase().includes(q) || 
        (h.primaryTech || '').toLowerCase().includes(q) ||
        h.continent.toLowerCase().includes(q)
      return matchContinent && matchQuery
    })
  }, [selectedContinent, searchQuery])

  const handleTogglePolicy = (policy: AdoptedPolicy) => {
    if (adoptedPolicyIds.includes(policy.id)) {
      setAdoptedPolicyIds(prev => prev.filter(id => id !== policy.id))
      playTelemetryPing()
      onTriggerNotice(`Removed policy: "${policy.title}". Recalculated San Francisco baseline.`)
    } else {
      setAdoptedPolicyIds(prev => [...prev, policy.id])
      playDispatchConfirm()
      onTriggerNotice(`Adopted international policy: "${policy.title}" (${policy.country}). Projected +${policy.segregationBoost}% source segregation!`)
    }
  }

  const handleResetPolicies = () => {
    setAdoptedPolicyIds([])
    playTelemetryPing()
    onTriggerNotice('Reverted San Francisco simulation back to baseline municipal status.')
  }

  const continentsList: ContinentName[] = [
    'All',
    'North America',
    'South America',
    'Europe',
    'Asia',
    'Oceania',
    'Africa',
    'Middle East'
  ]

  return (
    <div className="global-benchmark-shell">
      {/* Top Banner & Header */}
      <section className="benchmark-header">
        <div className="benchmark-header-content">
          <div className="benchmark-badge">
            <Globe2 size={16} />
            <span>WORLDWIDE MUNICIPAL ZERO-WASTE INTELLIGENCE · 28 CITIES</span>
          </div>
          <h1>Cross-Border Global Municipal Benchmarks & Digital Twin Matrix</h1>
          <p>
            Explore verified municipal circular economy datasets spanning all 6 inhabited continents—from Stockholm's pneumatic vacuum tubes 
            and Seoul's RFID food scales to Curitiba's food exchange and Kigali's civic cleanups. Simulate cross-border policy transfers and monitor international commodity revenue.
          </p>

          <div className="benchmark-tab-pills">
            <button 
              className={activeTab === 'matrix' ? 'active' : ''} 
              onClick={() => setActiveTab('matrix')}
            >
              <Scale size={16} /> Global Hub Explorer ({mockGlobalHubs.length} Cities Worldwide)
            </button>
            <button 
              className={activeTab === 'simulator' ? 'active' : ''} 
              onClick={() => setActiveTab('simulator')}
            >
              <Sparkles size={16} /> Policy Adoption Simulator {adoptedPolicyIds.length > 0 && `(${adoptedPolicyIds.length} Active)`}
            </button>
            <button 
              className={activeTab === 'commodities' ? 'active' : ''} 
              onClick={() => setActiveTab('commodities')}
            >
              <Coins size={16} /> Circular Commodity Spot Index & Revenue
            </button>
          </div>
        </div>

        {/* Live Simulation Scorecard Quick Card */}
        <div className="benchmark-quick-impact">
          <div className="quick-impact-header">
            <span>SAN FRANCISCO DIGITAL TWIN</span>
            <span className={adoptedPolicyIds.length > 0 ? 'status-boosted' : 'status-baseline'}>
              {adoptedPolicyIds.length > 0 ? 'SIMULATION ACTIVE' : 'BASELINE 2026'}
            </span>
          </div>
          <div className="quick-impact-metrics">
            <div className="metric-cell">
              <small>Segregation Rate</small>
              <strong>{simulatedSegregation}%</strong>
              {totalSegregationBoost > 0 && <span className="delta">+{totalSegregationBoost.toFixed(1)}%</span>}
            </div>
            <div className="metric-cell">
              <small>Landfill Diversion</small>
              <strong>{simulatedDiversion}%</strong>
              {totalDiversionBoost > 0 && <span className="delta">+{totalDiversionBoost.toFixed(1)}%</span>}
            </div>
            <div className="metric-cell">
              <small>Net CO₂ Avoidance</small>
              <strong>{totalCO2Saved.toLocaleString()} t/yr</strong>
            </div>
            <div className="metric-cell">
              <small>Est. Annual Benefit</small>
              <strong>${(totalFinancialBenefit / 1000000).toFixed(2)}M/yr</strong>
            </div>
          </div>
          {adoptedPolicyIds.length > 0 && (
            <button className="reset-sim-btn" onClick={handleResetPolicies}>
              <RotateCcw size={13} /> Reset to San Francisco Baseline
            </button>
          )}
        </div>
      </section>

      {/* Global Aggregate KPI Strip */}
      <section className="global-aggregates-strip">
        <div className="global-agg-card">
          <small>MONITORED HUBS</small>
          <strong>{worldMetrics.totalHubs} Cities</strong>
          <span>Across 6 continents</span>
        </div>
        <div className="global-agg-card">
          <small>TOTAL DAILY INTAKE</small>
          <strong>{worldMetrics.totalDailyTons.toLocaleString()} t/day</strong>
          <span>Combined municipal volume</span>
        </div>
        <div className="global-agg-card">
          <small>AVG DIVERSION RATE</small>
          <strong>{worldMetrics.avgDiversion}%</strong>
          <span>Global municipal frontrunners</span>
        </div>
        <div className="global-agg-card">
          <small>AVG SEGREGATION</small>
          <strong>{worldMetrics.avgSegregation}%</strong>
          <span>Source separation compliance</span>
        </div>
        <div className="global-agg-card">
          <small>ANNUAL CO₂e AVOIDED</small>
          <strong>{(worldMetrics.totalEmissionsSaved / 1000000).toFixed(2)}M t/yr</strong>
          <span>Net greenhouse gas abatement</span>
        </div>
      </section>

      {/* VIEW 1: COMPARATIVE MATRIX */}
      {activeTab === 'matrix' && (
        <section className="benchmark-matrix-section">
          {/* Continent Filter Pills & Search Bar */}
          <div className="hub-filters-row">
            <div className="continent-pills">
              {continentsList.map(continent => {
                const count = continent === 'All' 
                  ? mockGlobalHubs.length 
                  : mockGlobalHubs.filter(h => h.continent === continent).length
                const isActive = selectedContinent === continent
                return (
                  <button 
                    key={continent}
                    className={`continent-pill-btn ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedContinent(continent)
                      playTelemetryPing()
                    }}
                  >
                    {continent === 'All' && '🌍 All World'}
                    {continent === 'Europe' && '🇪🇺 Europe'}
                    {continent === 'Asia' && '🌏 Asia'}
                    {continent === 'North America' && '🌎 N. America'}
                    {continent === 'South America' && '🌎 S. America'}
                    {continent === 'Africa' && '🌍 Africa'}
                    {continent === 'Oceania' && '🌏 Oceania'}
                    {continent === 'Middle East' && '🕌 Middle East'}
                    {' '}({count})
                  </button>
                )
              })}
            </div>

            <div className="hub-search-box">
              <Search size={14} />
              <input 
                type="text" 
                placeholder="Search city, country, or technology..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="search-clear-btn" onClick={() => setSearchQuery('')}>✕</button>
              )}
            </div>
          </div>

          {/* Hub Carousel Selector */}
          <div className="hub-selector-strip">
            {filteredHubs.map(hub => {
              const isSelected = selectedHub.id === hub.id
              return (
                <button 
                  key={hub.id}
                  className={`hub-card-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedHub(hub)
                    playTelemetryPing()
                  }}
                >
                  <div className="hub-flag">{hub.flag}</div>
                  <div className="hub-names">
                    <strong>{hub.city}</strong>
                    <small>{hub.country}</small>
                  </div>
                  <div className="hub-pill">
                    <span>{hub.diversionRate}% Diversion</span>
                  </div>
                </button>
              )
            })}
            {filteredHubs.length === 0 && (
              <div className="no-hubs-msg">No world hubs match search "{searchQuery}" in {selectedContinent}.</div>
            )}
          </div>

          {/* Detailed Selected Hub Dossier */}
          <div className="hub-dossier-grid">
            {/* Left: Detailed Profile */}
            <div className="hub-dossier-main">
              <div className="dossier-header">
                <div>
                  <div className="dossier-country">
                    <span className="big-flag">{selectedHub.flag}</span>
                    <div>
                      <h2>{selectedHub.name}</h2>
                      <p>
                        {selectedHub.city}, {selectedHub.country} ({selectedHub.countryCode}) · <strong>{selectedHub.continent}</strong> · Digital Twin Dossier
                      </p>
                    </div>
                  </div>
                </div>
                {onNavigateToHub && (
                  <button 
                    className="locate-map-btn"
                    onClick={() => onNavigateToHub(selectedHub)}
                    title={`Fly to ${selectedHub.city} on OpenStreetMap GIS`}
                  >
                    <Compass size={16} /> Fly to City on Map <ArrowRight size={14} />
                  </button>
                )}
              </div>

              <p className="dossier-description">{selectedHub.description}</p>

              {/* Key Indicators Row */}
              <div className="dossier-kpis">
                <div className="dossier-kpi-card">
                  <small>SOURCE SEGREGATION</small>
                  <strong>{selectedHub.segregationRate}%</strong>
                  <div className="kpi-bar-track">
                    <div className="kpi-bar-fill" style={{ width: `${selectedHub.segregationRate}%` }} />
                  </div>
                  <span>Citizen sorting compliance</span>
                </div>

                <div className="dossier-kpi-card">
                  <small>LANDFILL DIVERSION</small>
                  <strong>{selectedHub.diversionRate}%</strong>
                  <div className="kpi-bar-track">
                    <div className="kpi-bar-fill diversion" style={{ width: `${selectedHub.diversionRate}%` }} />
                  </div>
                  <span>Recovered via circular streams</span>
                </div>

                <div className="dossier-kpi-card">
                  <small>DAILY GENERATION</small>
                  <strong>{(selectedHub.dailyTons ?? 0).toLocaleString()} t</strong>
                  <div className="kpi-bar-track">
                    <div className="kpi-bar-fill tons" style={{ width: `${Math.min(100, ((selectedHub.dailyTons ?? 0) / 15000) * 100)}%` }} />
                  </div>
                  <span>{selectedHub.perCapitaKgDay} kg/capita/day</span>
                </div>

                <div className="dossier-kpi-card">
                  <small>SERVICE POPULATION</small>
                  <strong>{selectedHub.population}</strong>
                  <div className="kpi-bar-track">
                    <div className="kpi-bar-fill population" style={{ width: '80%' }} />
                  </div>
                  <span>{selectedHub.facilitiesCount} primary recovery plants</span>
                </div>
              </div>

              {/* Flagship Circular Initiative Highlight */}
              <div className="flagship-initiative-card">
                <Sparkles size={18} />
                <div>
                  <strong>Flagship Circular Initiative:</strong>
                  <p>{selectedHub.circularInitiative}</p>
                </div>
              </div>

              {/* Policy Highlights */}
              <div className="dossier-policies">
                <h3>
                  <Award size={18} /> Municipal Policy Mandates & Regulatory Drivers
                </h3>
                <div className="policy-chips-grid">
                  {(selectedHub.policyHighlights || selectedHub.standoutPolicies || []).map((policy: string, idx: number) => (
                    <div key={idx} className="policy-chip">
                      <CheckCircle2 size={16} />
                      <span>{policy}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Engineering Tech */}
              <div className="dossier-tech">
                <h3>
                  <Factory size={18} /> Primary Engineering Infrastructure
                </h3>
                <div className="tech-badge-box">
                  <Zap size={18} />
                  <span>{selectedHub.primaryTech}</span>
                </div>
              </div>
            </div>

            {/* Right: Comparative Ranking Table */}
            <div className="hub-ranking-sidebar">
              <h3>
                <BarChart3 size={18} /> Global Diversion Leaderboard ({mockGlobalHubs.length} Cities)
              </h3>
              <p className="ranking-subtitle">Ranked by overall municipal circular diversion index</p>

              <div className="ranking-list">
                {[...mockGlobalHubs].sort((a, b) => b.diversionRate - a.diversionRate).map((hub, rank) => {
                  const isCurrent = hub.id === selectedHub.id
                  return (
                    <div 
                      key={hub.id} 
                      className={`ranking-item ${isCurrent ? 'highlight' : ''}`}
                      onClick={() => {
                        setSelectedHub(hub)
                        playTelemetryPing()
                      }}
                    >
                      <span className="rank-num">#{rank + 1}</span>
                      <span className="rank-flag">{hub.flag}</span>
                      <div className="rank-info">
                        <strong>{hub.city}</strong>
                        <small>{hub.country} ({hub.continent})</small>
                      </div>
                      <div className="rank-rates">
                        <strong className="rate-diversion">{hub.diversionRate}%</strong>
                        <small className="rate-seg">{hub.segregationRate}% seg.</small>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="matrix-methodology-note">
                <Info size={15} />
                <span>
                  Calibrated against UNEP Global Waste Management Outlook 2024, World Bank What a Waste 2.0, and official municipal reports.
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* VIEW 2: POLICY ADOPTION SIMULATOR */}
      {activeTab === 'simulator' && (
        <section className="benchmark-simulator-section">
          <div className="simulator-intro">
            <div>
              <h2>International Policy Adoption Simulator ({availablePolicies.length} Global Strategies)</h2>
              <p>
                Test what would happen if the City & County of San Francisco deployed proven municipal strategies from Stockholm, 
                Berlin, Curitiba, Seoul, Kigali, Zurich, Adelaide, or Tokyo. Toggle policies below to see real-time impact 
                on collection efficiency, landfill avoidance, and greenhouse gas abatement.
              </p>
            </div>

            <div className="sim-summary-box">
              <div className="summary-title">Simulation Projected Deltas</div>
              <div className="summary-rows">
                <div className="summary-row">
                  <span>Source Segregation:</span>
                  <strong className="green">{simulatedSegregation}% (+{totalSegregationBoost.toFixed(1)}%)</strong>
                </div>
                <div className="summary-row">
                  <span>Landfill Diversion:</span>
                  <strong className="green">{simulatedDiversion}% (+{totalDiversionBoost.toFixed(1)}%)</strong>
                </div>
                <div className="summary-row">
                  <span>Greenhouse Gas Cut:</span>
                  <strong className="blue">-{totalCO2Saved.toLocaleString()} t CO₂e/yr</strong>
                </div>
                <div className="summary-row">
                  <span>Direct Annual Value:</span>
                  <strong className="amber">+${(totalFinancialBenefit / 1000000).toFixed(2)}M / year</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="policies-grid">
            {availablePolicies.map(policy => {
              const isAdopted = adoptedPolicyIds.includes(policy.id)
              return (
                <div key={policy.id} className={`policy-card ${isAdopted ? 'adopted' : ''}`}>
                  <div className="policy-card-top">
                    <div className="policy-origin">
                      <span>{policy.country}</span>
                      <small>{policy.hubName}</small>
                    </div>
                    <button 
                      className={`policy-toggle-btn ${isAdopted ? 'active' : ''}`}
                      onClick={() => handleTogglePolicy(policy)}
                    >
                      {isAdopted ? (
                        <>
                          <CheckCircle2 size={16} /> Policy Deployed
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} /> Adopt Policy
                        </>
                      )}
                    </button>
                  </div>

                  <h3>{policy.title}</h3>
                  <p className="policy-card-desc">{policy.description}</p>

                  <div className="policy-impact-tags">
                    <div className="impact-tag">
                      <small>Segregation</small>
                      <strong>+{policy.segregationBoost}%</strong>
                    </div>
                    <div className="impact-tag">
                      <small>Diversion</small>
                      <strong>+{policy.diversionBoost}%</strong>
                    </div>
                    <div className="impact-tag">
                      <small>CO₂ Abatement</small>
                      <strong>-{policy.co2ReductionTons.toLocaleString()} t</strong>
                    </div>
                    <div className="impact-tag">
                      <small>Value / Year</small>
                      <strong>+${(policy.annualSavingsUsd / 1000).toLocaleString()}k</strong>
                    </div>
                  </div>

                  <div className="policy-card-tech">
                    <Zap size={14} />
                    <span>{policy.tech}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* VIEW 3: CIRCULAR COMMODITY SPOT INDEX & REVENUE CALCULATOR */}
      {activeTab === 'commodities' && (
        <section className="benchmark-commodities-section">
          <div className="commodities-intro">
            <div>
              <h2>Circular Economy Secondary Materials Spot Market Index</h2>
              <p>
                Live benchmark commodity prices for recycled polymers, fiber, metals, and biological fuels across international trading hubs. 
                Municipal revenue model is coupled to daily MRF sorting yields and recovery efficiency.
              </p>
            </div>

            <div className="mrf-tonnage-controller">
              <label>Simulated Daily Recovery Intake (Tonnes):</label>
              <div className="slider-row">
                <input 
                  type="range" 
                  min="100" 
                  max="800" 
                  step="25"
                  value={calcRecoveryTons} 
                  onChange={(e) => setCalcRecoveryTons(Number(e.target.value))}
                />
                <strong>{calcRecoveryTons} t/day</strong>
              </div>
            </div>
          </div>

          {/* Commodity Spot Prices Table */}
          <div className="commodities-table-wrapper">
            <table className="commodities-table">
              <thead>
                <tr>
                  <th>Commodity / Grade</th>
                  <th>Symbol</th>
                  <th>Market Spot Price</th>
                  <th>24h Movement</th>
                  <th>Est. Daily Revenue ({calcRecoveryTons}t intake)</th>
                  <th>Primary Municipal Output</th>
                </tr>
              </thead>
              <tbody>
                {mockCommodities.map((item, idx) => {
                  const sharePercentages = [0.22, 0.35, 0.12, 0.08, 0.15, 0.05, 0.03]
                  const share = sharePercentages[idx % sharePercentages.length]
                  const dailyVolume = calcRecoveryTons * share
                  const dailyRevenue = dailyVolume * item.price

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="commodity-name-cell">
                          <Leaf size={16} />
                          <div>
                            <strong>{item.name}</strong>
                            <small>{item.unit}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="symbol-badge">{item.symbol}</span>
                      </td>
                      <td>
                        <strong className="price-tag">${item.price.toLocaleString()}</strong>
                        <small className="price-unit"> / {item.unit.replace('$/', '')}</small>
                      </td>
                      <td>
                        <span className={`change-badge ${item.trend}`}>
                          {item.trend === 'up' ? <ArrowUpRight size={14} /> : null}
                          {item.change24h > 0 ? `+${item.change24h}%` : `${item.change24h}%`}
                        </span>
                      </td>
                      <td>
                        <strong className="revenue-est">${Math.round(dailyRevenue).toLocaleString()}</strong>
                        <small className="revenue-tons"> ({dailyVolume.toFixed(1)} t/day)</small>
                      </td>
                      <td>
                        <span className="output-dest">
                          {item.symbol === 'rPET-FLK' && 'Bottle-to-bottle food grade packaging'}
                          {item.symbol === 'OCC-11' && 'Corrugated recycled paper mills'}
                          {item.symbol === 'BIO-CNG' && 'Municipal fleet green fuel grid'}
                          {item.symbol === 'CMP-A' && 'Urban farming & topsoil regeneration'}
                          {item.symbol === 'HDPE-B' && 'Industrial drainage pipes & crates'}
                          {item.symbol === 'UBC-AL' && 'Infinite closed-loop can smelting'}
                          {item.symbol === 'CU-SCRAP' && 'High-purity electronics metallurgy'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
