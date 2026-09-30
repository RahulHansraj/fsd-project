import { useState } from 'react'
import { 
  AlertTriangle, 
  ArrowUpRight, 
  Building, 
  Check, 
  Clock, 
  Cog, 
  Factory, 
  Flame, 
  Package, 
  RefreshCw, 
  TrendingUp, 
  Truck, 
  Wrench 
} from 'lucide-react'
import { RecyclingFacility } from '../../types/operations'
import { mockRecyclingFacilities } from '../../data/mockOperationsData'

interface FacilitiesViewProps {
  onTriggerNotice: (msg: string) => void
}

export function FacilitiesView({ onTriggerNotice }: FacilitiesViewProps) {
  const [facilities, setFacilities] = useState<RecyclingFacility[]>(mockRecyclingFacilities)
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(facilities[0].id)

  const activeFacility = facilities.find(f => f.id === selectedFacilityId) ?? facilities[0]

  const handleModeChange = (facilityId: string, newMode: RecyclingFacility['operatingMode']) => {
    setFacilities(prev => prev.map(f => {
      if (f.id === facilityId) {
        return { ...f, operatingMode: newMode }
      }
      return f
    }))
    onTriggerNotice(`${activeFacility.name} operating mode updated to: ${newMode}`)
  }

  const handleDispatchBale = (material: string, tons: number) => {
    onTriggerNotice(`Dispatched ${tons}t of ${material} to certified industrial recycler. Manifest generated.`)
  }

  const totalIntake = facilities.reduce((sum, f) => sum + f.dailyIntake, 0)
  const totalCapacity = facilities.reduce((sum, f) => sum + f.ratedCapacity, 0)
  const avgPurity = (facilities.reduce((sum, f) => sum + f.purityYield, 0) / facilities.length).toFixed(1)

  return (
    <div className="view-container">
      {/* Top Header */}
      <div className="view-header">
        <div>
          <span className="cc-kicker">INFRASTRUCTURE TELEMETRY · RECOVERY NETWORK</span>
          <h1>Recycling Plants & Recovery Facilities (MRF)</h1>
          <p className="cc-subtitle">
            Live processing line status, baled inventory ledger, sorting efficiency, and intake utilization across municipal recovery plants.
          </p>
        </div>
        <div className="view-actions">
          <button 
            className="secondary-btn"
            onClick={() => onTriggerNotice('Weighbridge scale calibrations verified across all 4 facilities.')}
          >
            <RefreshCw size={14} /> Sync Weighbridge Data
          </button>
        </div>
      </div>

      {/* Facilities KPI Bar */}
      <div className="cc-kpis mb-6">
        <div className="cc-kpi">
          <span>Total Municipal Intake</span>
          <div><strong>{totalIntake.toFixed(1)}</strong><small>t/day</small></div>
          <p><i className="up" /> Across 4 processing facilities</p>
        </div>
        <div className="cc-kpi">
          <span>Overall Capacity Util.</span>
          <div><strong>{((totalIntake / totalCapacity) * 100).toFixed(1)}</strong><small>%</small></div>
          <p><i className="steady" /> Max rated: {totalCapacity} t/day</p>
        </div>
        <div className="cc-kpi">
          <span>Average Purity Yield</span>
          <div><strong>{avgPurity}</strong><small>%</small></div>
          <p><i className="up" /> Target: &gt; 90.0% Grade A</p>
        </div>
        <div className="cc-kpi">
          <span>Operational Sorting Lines</span>
          <div><strong>10 / 11</strong><small>Active</small></div>
          <p><i className="steady" /> 1 under preventive check</p>
        </div>
      </div>

      {/* Facility Selection Tabs */}
      <div className="facility-tab-bar">
        {facilities.map((facility) => {
          const isSelected = facility.id === selectedFacilityId
          const percent = Math.round((facility.dailyIntake / facility.ratedCapacity) * 100)
          return (
            <button
              key={facility.id}
              className={`facility-tab-card ${isSelected ? 'active' : ''}`}
              onClick={() => setSelectedFacilityId(facility.id)}
            >
              <div className="fac-tab-top">
                <span className="fac-type-badge">{facility.type}</span>
                <span className={`fac-status-indicator ${facility.operatingMode === 'Maintenance' ? 'warn' : 'good'}`}>
                  {facility.operatingMode}
                </span>
              </div>
              <h3 className="fac-name">{facility.name}</h3>
              <div className="fac-capacity-info">
                <span>{facility.dailyIntake} / {facility.ratedCapacity} t ({percent}%)</span>
                <div className="progress-mini">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${percent}%`,
                      background: percent > 90 ? '#d4684e' : percent > 75 ? '#d99b45' : '#2d896b'
                    }} 
                  />
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Active Facility Deep-Dive */}
      <div className="facility-detail-layout">
        {/* Left Column: Lines and Equipment */}
        <section className="cc-card">
          <div className="cc-card-head">
            <div>
              <p className="cc-kicker">EQUIPMENT & PROCESS TELEMETRY</p>
              <h2>Sorting & Processing Lines · {activeFacility.name}</h2>
            </div>
            <div className="operating-mode-selector">
              <span className="mode-label">Mode:</span>
              <select 
                value={activeFacility.operatingMode}
                onChange={(e) => handleModeChange(activeFacility.id, e.target.value as RecyclingFacility['operatingMode'])}
                className="select-input"
              >
                <option value="High Throughput">High Throughput</option>
                <option value="Standard Sort">Standard Sort</option>
                <option value="Deep Purity">Deep Purity</option>
                <option value="Maintenance">Maintenance Hold</option>
              </select>
            </div>
          </div>

          <div className="lines-list">
            {activeFacility.lines.map((line) => (
              <div key={line.id} className="line-item-row">
                <div className="line-info">
                  <span className="line-id">{line.id}</span>
                  <div>
                    <strong>{line.name}</strong>
                    <small>{line.type} · Throughput: {line.hourlyThroughput}</small>
                  </div>
                </div>
                <div className="line-metrics">
                  <div className="efficiency-box">
                    <small>Efficiency</small>
                    <strong className={line.efficiency < 80 ? 'low' : ''}>{line.efficiency}%</strong>
                  </div>
                  <span className={`line-status-pill ${line.status.toLowerCase().replace(' ', '-')}`}>
                    {line.status}
                  </span>
                  <button 
                    className="line-action-btn"
                    onClick={() => onTriggerNotice(`Maintenance work order scheduled for ${line.name} at ${activeFacility.name}.`)}
                    title="Service Line"
                  >
                    <Wrench size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="card-footer-action">
            <button 
              className="primary-btn"
              onClick={() => onTriggerNotice(`Diverted 2 compactor loads to ${activeFacility.name} based on surplus line capacity.`)}
            >
              <Truck size={14} /> Divert Fleet Inflow To This Plant
            </button>
            <button 
              className="secondary-btn"
              onClick={() => onTriggerNotice(`Full ISO 14001 operational diagnostic test initialized on ${activeFacility.name}.`)}
            >
              <Cog size={14} /> Run Diagnostic
            </button>
          </div>
        </section>

        {/* Right Column: Baled Inventory & Commodity Value */}
        <section className="cc-card">
          <div className="cc-card-head">
            <div>
              <p className="cc-kicker">CIRCULAR ECONOMY LEDGER</p>
              <h2>Baled Inventory & Value</h2>
            </div>
            <span className="purity-badge">
              Plant Purity: <strong>{activeFacility.purityYield}%</strong>
            </span>
          </div>

          <p className="card-subtitle">
            Processed materials certified and ready for sale to industrial circular economy off-takers.
          </p>

          <div className="inventory-list">
            {activeFacility.baledInventory.map((item) => {
              const estimatedValue = Math.round(item.tons * item.valuePerTon)
              return (
                <div key={item.material} className="inventory-item">
                  <div className="inv-icon">
                    <Package size={18} />
                  </div>
                  <div className="inv-meta">
                    <strong>{item.material}</strong>
                    <small>${item.valuePerTon}/ton spot market</small>
                  </div>
                  <div className="inv-stats">
                    <div className="inv-tons">{item.tons} t</div>
                    <div className="inv-value">${estimatedValue.toLocaleString()}</div>
                  </div>
                  <button 
                    className="dispatch-bale-btn"
                    onClick={() => handleDispatchBale(item.material, item.tons)}
                    title="Dispatch to Buyer"
                  >
                    Dispatch <ArrowUpRight size={13} />
                  </button>
                </div>
              )
            })}
          </div>

          <div className="ledger-total-box">
            <div>
              <small>Total Recovered Stock Value</small>
              <strong>
                $
                {activeFacility.baledInventory
                  .reduce((sum, i) => sum + i.tons * i.valuePerTon, 0)
                  .toLocaleString()}
              </strong>
            </div>
            <button 
              className="secondary-btn"
              onClick={() => onTriggerNotice(`Commodity auction manifest exported for ${activeFacility.name}.`)}
            >
              Export Manifest
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
