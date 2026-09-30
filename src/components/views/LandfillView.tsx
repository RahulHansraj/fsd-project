import { useState } from 'react'
import { 
  Activity, 
  AlertCircle, 
  AlertTriangle, 
  ArrowRight, 
  Calendar, 
  Check, 
  ChevronRight, 
  Cpu,
  Gauge, 
  Leaf, 
  Percent, 
  RefreshCw, 
  Sliders, 
  Sparkles, 
  Thermometer, 
  Wind 
} from 'lucide-react'
import { LandfillTelemetry } from '../../types/operations'
import { mockLandfillTelemetry } from '../../data/mockOperationsData'
import { simulateLandfillRunway, getAIConfig, isAIConfigured } from '../../services/aiService'

interface LandfillViewProps {
  onTriggerNotice: (msg: string) => void
}

export function LandfillView({ onTriggerNotice }: LandfillViewProps) {
  const [telemetry, setTelemetry] = useState<LandfillTelemetry>(mockLandfillTelemetry)
  
  // Interactive Simulator State
  const [diversionIncrease, setDiversionIncrease] = useState<number>(15)
  const [segregationBoost, setSegregationBoost] = useState<number>(20)
  const [organicsBanActive, setOrganicsBanActive] = useState<boolean>(true)
  const [scenarioSaved, setScenarioSaved] = useState<boolean>(false)
  const [aiAdvisoryText, setAiAdvisoryText] = useState<string | null>(null)
  const [isSimulatingAi, setIsSimulatingAi] = useState<boolean>(false)
  const [isLiveAiSim, setIsLiveAiSim] = useState<boolean>(false)
  const currentConfig = getAIConfig()

  // Calculations for What-if Simulator
  const baselineIntake = telemetry.dailyIntakeTons
  const organicFactor = organicsBanActive ? 0.65 : 1.0
  const diversionReductionFactor = 1 - (diversionIncrease / 100) * 0.75
  const simulatedDailyIntake = Math.max(8.5, +(baselineIntake * diversionReductionFactor * organicFactor).toFixed(1))
  
  const remainingCapacityTons = telemetry.totalCapacityTons - telemetry.currentFillTons
  const simulatedRunwayDays = Math.round(remainingCapacityTons / simulatedDailyIntake)
  const daysGained = simulatedRunwayDays - telemetry.baselineRunwayDays
  const co2AvoidedTons = Math.round(daysGained * 18.4)

  const handleApplyScenario = () => {
    setScenarioSaved(true)
    onTriggerNotice(`Landfill Policy Scenario saved: Projected runway extended by ${daysGained} days (${simulatedRunwayDays} days total)!`)
    setTimeout(() => setScenarioSaved(false), 4000)
  }

  const handleRunAiSimulation = async () => {
    setIsSimulatingAi(true)
    try {
      const res = await simulateLandfillRunway(telemetry, diversionIncrease + segregationBoost)
      setAiAdvisoryText(res.advisory)
      setIsLiveAiSim(res.isLiveLLM)
      onTriggerNotice(
        res.isLiveLLM 
          ? 'Landfill geotechnical runway advisory computed successfully.'
          : 'Landfill predictive advisory updated.'
      )
    } catch (err) {
      console.error('[LandfillView] AI sim error:', err)
    } finally {
      setIsSimulatingAi(false)
    }
  }

  return (
    <div className="view-container">
      {/* Top Banner */}
      <div className="view-header">
        <div>
          <span className="cc-kicker">MUNICIPAL DEPOSIT SINK · ENVIRONMENTAL AUDIT</span>
          <h1>Landfill Capacity & Dynamic Runway Simulator</h1>
          <p className="cc-subtitle">
            Cell volume utilization, leachate retention, methane fugitive emissions, and scenario modeling to avert municipal landfill exhaustion.
          </p>
        </div>
        <div className="view-actions">
          <button 
            className="secondary-btn"
            onClick={() => onTriggerNotice('Landfill drone volumetric survey completed. Density confirmed at 985 kg/m³.')}
          >
            <RefreshCw size={14} /> Calibrate Drone Sonar
          </button>
        </div>
      </div>

      {/* Critical Status Banner */}
      <div className="landfill-alert-strip">
        <div className="alert-strip-left">
          <AlertTriangle size={20} className="pulse-alert" />
          <div>
            <strong>Pine Ridge Landfill Cell 4 is at {telemetry.fillPercentage}% Capacity</strong>
            <p>At current baseline intake ({telemetry.dailyIntakeTons} t/day), exhaustion is projected in {telemetry.baselineRunwayDays} operational days.</p>
          </div>
        </div>
        <div className="runway-counter">
          <small>CURRENT RUNWAY</small>
          <strong>{telemetry.baselineRunwayDays} DAYS</strong>
        </div>
      </div>

      {/* Main Grid: Simulator + Environmental Sensors */}
      <div className="landfill-grid">
        {/* Left Card: Interactive Runway Lifespan Simulator */}
        <section className="cc-card sim-card-large">
          <div className="cc-card-head">
            <div>
              <span className="badge-ai"><Sparkles size={13} /> Azure AI Policy Forecaster</span>
              <h2>Interactive Landfill Lifespan Simulator</h2>
            </div>
            <span className="scenario-chip">Cell 4 Extension Model</span>
          </div>

          <p className="card-subtitle">
            Model the direct operational impact of increased MRF diversion, source segregation compliance, and organic waste bans.
          </p>

          {/* Interactive Sliders */}
          <div className="simulator-controls">
            <div className="control-group">
              <div className="control-label-row">
                <span>Target MRF Diversion Boost:</span>
                <strong>+{diversionIncrease}%</strong>
              </div>
              <input 
                type="range" 
                min="0" 
                max="40" 
                step="5" 
                value={diversionIncrease} 
                onChange={(e) => setDiversionIncrease(Number(e.target.value))}
                className="range-slider"
              />
              <div className="slider-ticks">
                <span>0% (Status Quo)</span>
                <span>+20%</span>
                <span>+40% (Aggressive)</span>
              </div>
            </div>

            <div className="control-group">
              <div className="control-label-row">
                <span>Source Segregation Compliance Improvement:</span>
                <strong>+{segregationBoost}%</strong>
              </div>
              <input 
                type="range" 
                min="0" 
                max="50" 
                step="5" 
                value={segregationBoost} 
                onChange={(e) => setSegregationBoost(Number(e.target.value))}
                className="range-slider"
              />
              <div className="slider-ticks">
                <span>0%</span>
                <span>+25%</span>
                <span>+50% Target</span>
              </div>
            </div>

            <div className="toggle-box">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={organicsBanActive} 
                  onChange={(e) => setOrganicsBanActive(e.target.checked)} 
                />
                <span>Mandate 100% Organics Diversion to East Bay Composting Pit</span>
              </label>
              <small>Prevents anaerobic methane generation and cuts bulk volume by ~35%.</small>
            </div>
          </div>

          {/* Dynamic Comparison Dashboard */}
          <div className="sim-comparison-grid">
            <div className="sim-metric-tile">
              <small>Simulated Daily Intake</small>
              <div className="tile-value text-green">
                <strong>{simulatedDailyIntake}</strong> t/day
              </div>
              <p className="tile-sub">Down from {baselineIntake} t/day (-{Math.round((1 - simulatedDailyIntake/baselineIntake)*100)}%)</p>
            </div>

            <div className="sim-metric-tile highlight">
              <small>Extended Landfill Runway</small>
              <div className="tile-value text-highlight">
                <strong>{simulatedRunwayDays}</strong> DAYS
              </div>
              <p className="tile-sub">+{daysGained} Days Gained ({Math.round(daysGained / 30)} months)</p>
            </div>

            <div className="sim-metric-tile">
              <small>Emissions Avoided</small>
              <div className="tile-value text-blue">
                <strong>{co2AvoidedTons.toLocaleString()}</strong> t CO₂e
              </div>
              <p className="tile-sub">Direct carbon offset value</p>
            </div>
          </div>

          {/* Visual Runway Progression Bar */}
          <div className="runway-progression">
            <div className="runway-bar-label">
              <span>Runway Comparison</span>
              <span>Baseline: {telemetry.baselineRunwayDays}d → Simulated: {simulatedRunwayDays}d</span>
            </div>
            <div className="runway-bar-track">
              <div 
                className="bar-baseline" 
                style={{ width: `${Math.min(100, (telemetry.baselineRunwayDays / simulatedRunwayDays) * 100)}%` }}
                title={`Baseline: ${telemetry.baselineRunwayDays} days`}
              />
              <div 
                className="bar-extension" 
                style={{ width: '100%' }}
                title={`Simulated: ${simulatedRunwayDays} days`}
              />
            </div>
          </div>

          {/* Live AI Runway Advisory Box */}
          {aiAdvisoryText && (
            <div className="landfill-ai-advisory-box">
              <div className="ai-advisory-head">
                <span className="mono-kicker">
                  <Sparkles size={13} /> LANDFILL LIFESPAN PREDICTIVE ADVISORY
                </span>
                {isLiveAiSim && <span className="live-llm-pill"><Cpu size={10} /> Live Telemetry</span>}
              </div>
              <p>{aiAdvisoryText}</p>
            </div>
          )}

          <div className="card-footer-action">
            <button 
              className="primary-btn"
              onClick={handleApplyScenario}
            >
              {scenarioSaved ? <Check size={16} /> : <Sparkles size={16} />}
              {scenarioSaved ? 'Policy Mandate Staged' : 'Submit Simulation as Municipal Policy'}
            </button>
            <button
              className="ai-sim-trigger-btn"
              disabled={isSimulatingAi}
              onClick={handleRunAiSimulation}
              title="Run AI Geo-Technical Methane Model on current parameters"
            >
              {isSimulatingAi ? <RefreshCw size={15} className="spin" /> : <Cpu size={15} />}
              <span>{isSimulatingAi ? 'Computing AI Model...' : 'Run AI Model Advisory'}</span>
            </button>
            <button 
              className="secondary-btn"
              onClick={() => {
                setDiversionIncrease(0)
                setSegregationBoost(0)
                setOrganicsBanActive(false)
                setAiAdvisoryText(null)
                onTriggerNotice('Reset simulator to active operational baseline.')
              }}
            >
              Reset to Baseline
            </button>
          </div>
        </section>

        {/* Right Card: Environmental Sensors & Well Telemetry */}
        <section className="cc-card sensors-card">
          <div className="cc-card-head">
            <div>
              <p className="cc-kicker">SAFETY & REGULATORY COMPLIANCE</p>
              <h2>Environmental Telemetry Sensors</h2>
            </div>
            <span className="live-pill"><i /> Active IoT Sync</span>
          </div>

          <div className="sensor-list">
            <div className="sensor-item">
              <div className="sensor-icon">
                <Wind size={18} />
              </div>
              <div className="sensor-info">
                <strong>Fugitive Methane (CH₄)</strong>
                <small>Well #12 & Perimeter Laser Detector</small>
              </div>
              <div className="sensor-reading">
                <strong>{telemetry.methaneLevelPpm} <small>ppm</small></strong>
                <span className={`status-badge ${telemetry.methaneLevelPpm < telemetry.methaneThresholdPpm ? 'safe' : 'danger'}`}>
                  {telemetry.methaneLevelPpm < telemetry.methaneThresholdPpm ? 'Below Threshold' : 'Hazard Spike'}
                </span>
              </div>
            </div>

            <div className="sensor-item">
              <div className="sensor-icon">
                <Thermometer size={18} />
              </div>
              <div className="sensor-info">
                <strong>Leachate Retention Basin</strong>
                <small>Aeration Pond #2 Depth Sensor</small>
              </div>
              <div className="sensor-reading">
                <strong>{telemetry.leachatePondCapacityPercent}% <small>Level</small></strong>
                <span className="status-badge safe">Permitted Band</span>
              </div>
            </div>

            <div className="sensor-item">
              <div className="sensor-icon">
                <Gauge size={18} />
              </div>
              <div className="sensor-info">
                <strong>Compactor Density</strong>
                <small>Bomag Landfill Compactor GPS Telemetry</small>
              </div>
              <div className="sensor-reading">
                <strong>{telemetry.compactionDensityKgM3} <small>kg/m³</small></strong>
                <span className="status-badge safe">High Compaction</span>
              </div>
            </div>

            <div className="sensor-item">
              <div className="sensor-icon">
                <Activity size={18} />
              </div>
              <div className="sensor-info">
                <strong>Perimeter Odour Index</strong>
                <small>Electronic Nose Sensor Station 4</small>
              </div>
              <div className="sensor-reading">
                <strong>{telemetry.odourIndex} <small>/ 10.0</small></strong>
                <span className="status-badge safe">Low Dispersal</span>
              </div>
            </div>
          </div>

          <div className="compliance-statement">
            <Check size={16} />
            <p>Certified compliant with EPA Municipal Solid Waste Landfill Criteria (40 CFR Part 258).</p>
          </div>
        </section>
      </div>
    </div>
  )
}
