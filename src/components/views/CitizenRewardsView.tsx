import { useState } from 'react'
import { 
  Award, 
  Check, 
  CheckCircle2, 
  Gift, 
  Leaf, 
  QrCode, 
  Scan, 
  Sparkles, 
  Tag, 
  TrendingUp, 
  Trophy, 
  Users, 
  XCircle 
} from 'lucide-react'
import { CitizenProfile, CitizenReward, CitizenTransaction } from '../../types/operations'
import { mockAvailableRewards, mockCitizenProfile } from '../../data/mockOperationsData'

interface CitizenRewardsViewProps {
  onTriggerNotice: (msg: string) => void
}

export function CitizenRewardsView({ onTriggerNotice }: CitizenRewardsViewProps) {
  const [profile, setProfile] = useState<CitizenProfile>(mockCitizenProfile)
  const [rewards, setRewards] = useState<CitizenReward[]>(mockAvailableRewards)
  const [selectedBagType, setSelectedBagType] = useState<'clean_organic' | 'clean_dry' | 'contaminated'>('clean_organic')
  const [isScanning, setIsScanning] = useState(false)
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null)

  const handleSimulateScan = () => {
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      const now = new Date()
      const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`

      if (selectedBagType === 'clean_organic') {
        const points = 50
        const newTxn: CitizenTransaction = {
          id: `TXN-${Date.now().toString().slice(-4)}`,
          date: `Today, ${timeStr}`,
          bagBarcode: `QR-SD-${Math.floor(1000 + Math.random() * 9000)}`,
          ward: 'Sunset District',
          stream: 'Organics',
          purityGrade: 'Grade A (100% pure)',
          creditsEarned: points
        }
        setProfile(prev => ({
          ...prev,
          creditsBalance: prev.creditsBalance + points,
          lifetimeDivertedKg: +(prev.lifetimeDivertedKg + 4.2).toFixed(1),
          co2SavedKg: +(prev.co2SavedKg + 2.8).toFixed(1),
          recentScans: [newTxn, ...prev.recentScans]
        }))
        onTriggerNotice(`QR Bag Verified! Grade A pure organics. Awarded +${points} GreenCivic Credits!`)
      } else if (selectedBagType === 'clean_dry') {
        const points = 40
        const newTxn: CitizenTransaction = {
          id: `TXN-${Date.now().toString().slice(-4)}`,
          date: `Today, ${timeStr}`,
          bagBarcode: `QR-SD-${Math.floor(1000 + Math.random() * 9000)}`,
          ward: 'Sunset District',
          stream: 'Recyclables',
          purityGrade: 'Grade A (100% pure)',
          creditsEarned: points
        }
        setProfile(prev => ({
          ...prev,
          creditsBalance: prev.creditsBalance + points,
          lifetimeDivertedKg: +(prev.lifetimeDivertedKg + 3.5).toFixed(1),
          co2SavedKg: +(prev.co2SavedKg + 3.1).toFixed(1),
          recentScans: [newTxn, ...prev.recentScans]
        }))
        onTriggerNotice(`QR Bag Verified! Clean dry recyclables. Awarded +${points} GreenCivic Credits!`)
      } else {
        const newTxn: CitizenTransaction = {
          id: `TXN-${Date.now().toString().slice(-4)}`,
          date: `Today, ${timeStr}`,
          bagBarcode: `QR-SD-${Math.floor(1000 + Math.random() * 9000)}`,
          ward: 'Sunset District',
          stream: 'Recyclables',
          purityGrade: 'Rejected (Contaminated)',
          creditsEarned: 0
        }
        setProfile(prev => ({
          ...prev,
          recentScans: [newTxn, ...prev.recentScans]
        }))
        onTriggerNotice(`QR Bag Flagged: Food residue contamination detected. Purity advice sent via SMS. 0 credits.`)
      }
    }, 700)
  }

  const handleRedeem = (reward: CitizenReward) => {
    if (profile.creditsBalance < reward.creditsCost) {
      onTriggerNotice(`Insufficient credits (${profile.creditsBalance}/${reward.creditsCost}). Scan more segregated bags!`)
      return
    }

    setProfile(prev => ({
      ...prev,
      creditsBalance: prev.creditsBalance - reward.creditsCost
    }))
    setRedeemedCode(`${reward.code}-${Date.now().toString().slice(-4)}`)
    onTriggerNotice(`Redeemed "${reward.title}"! Voucher code: ${reward.code}`)
  }

  return (
    <div className="view-container">
      {/* Top Banner */}
      <div className="view-header">
        <div>
          <span className="cc-kicker">CIRCULAR CITIZEN INCENTIVE · SWACHH SURVEKSHAN GAMIFICATION</span>
          <h1>Citizen Green Rewards & Circular Pass</h1>
          <p className="cc-subtitle">
            Reward households for verified source segregation with municipal tax rebates, free metro passes, and certified organic compost bags.
          </p>
        </div>
      </div>

      {/* Citizen Profile Card */}
      <section className="citizen-hero-card">
        <div className="hero-left">
          <div className="citizen-avatar-box">ML</div>
          <div>
            <span className="hero-kicker">REGISTERED CITIZEN · GREEN ID #HC-4829</span>
            <h2>{profile.name}</h2>
            <p className="hero-sub">{profile.rwaName} · {profile.ward}</p>
            <span className="rank-tag"><Trophy size={13} /> {profile.rankTitle}</span>
          </div>
        </div>

        <div className="hero-metrics">
          <div className="hero-tile">
            <small>GreenCivic Balance</small>
            <strong className="text-highlight">{profile.creditsBalance}</strong>
            <span>Credits</span>
          </div>
          <div className="hero-tile">
            <small>Lifetime Diverted</small>
            <strong>{profile.lifetimeDivertedKg}</strong>
            <span>Kilograms</span>
          </div>
          <div className="hero-tile">
            <small>Net Carbon Avoided</small>
            <strong>{profile.co2SavedKg}</strong>
            <span>kg CO₂e</span>
          </div>
        </div>
      </section>

      {/* Main Grid: QR Scan Simulator + Rewards Store */}
      <div className="citizen-grid">
        {/* Left Column: QR Scan Simulator & Recent Ledger */}
        <section className="cc-card">
          <div className="cc-card-head">
            <div>
              <span className="badge-ai"><QrCode size={13} /> IoT Drop-off Camera Scanner</span>
              <h2>Simulate QR Bag Scan</h2>
            </div>
          </div>

          <p className="card-subtitle">
            Municipal RFID/QR barcodes on household waste bags are scanned at collection points or smart hoppers to credit citizen accounts.
          </p>

          <div className="qr-sim-box">
            <label className="input-label">Select Simulated Waste Bag Sample:</label>
            <div className="bag-type-selector">
              <button
                className={`bag-option ${selectedBagType === 'clean_organic' ? 'active' : ''}`}
                onClick={() => setSelectedBagType('clean_organic')}
              >
                <Leaf size={14} />
                <span>Clean Organics (+50 pts)</span>
              </button>
              <button
                className={`bag-option ${selectedBagType === 'clean_dry' ? 'active' : ''}`}
                onClick={() => setSelectedBagType('clean_dry')}
              >
                <Sparkles size={14} />
                <span>Pure Recyclables (+40 pts)</span>
              </button>
              <button
                className={`bag-option ${selectedBagType === 'contaminated' ? 'active' : ''}`}
                onClick={() => setSelectedBagType('contaminated')}
              >
                <XCircle size={14} />
                <span>Mixed Contaminated (0 pts)</span>
              </button>
            </div>

            <button 
              className="primary-btn full-w mt-3"
              onClick={handleSimulateScan}
              disabled={isScanning}
            >
              {isScanning ? (
                <>Scanning RFID QR Barcode...</>
              ) : (
                <><Scan size={15} /> Simulate Citizen Bag Drop-off</>
              )}
            </button>
          </div>

          {/* Recent Scans Table */}
          <div className="scan-history">
            <span className="history-title">Recent Verified Drop-offs:</span>
            <div className="history-list">
              {profile.recentScans.map(scan => (
                <div key={scan.id} className="history-item">
                  <div>
                    <strong>{scan.bagBarcode} ({scan.stream})</strong>
                    <small>{scan.date} · {scan.purityGrade}</small>
                  </div>
                  <span className={`points-earned ${scan.creditsEarned > 0 ? 'plus' : 'zero'}`}>
                    {scan.creditsEarned > 0 ? `+${scan.creditsEarned} pts` : '0 pts'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Column: Municipal Rewards Store & RWA Leaderboard */}
        <section className="cc-card">
          <div className="cc-card-head">
            <div>
              <p className="cc-kicker">MUNICIPAL BENEFITS REDEMPTION</p>
              <h2>Rewards Store</h2>
            </div>
            <span className="balance-badge">
              Available: <strong>{profile.creditsBalance} pts</strong>
            </span>
          </div>

          {redeemedCode && (
            <div className="voucher-alert">
              <CheckCircle2 size={18} />
              <div>
                <strong>Voucher Successfully Generated!</strong>
                <p>Present voucher code at municipal billing or portal: <code>{redeemedCode}</code></p>
              </div>
              <button onClick={() => setRedeemedCode(null)} className="dismiss-btn">✕</button>
            </div>
          )}

          <div className="rewards-list">
            {rewards.map(reward => {
              const canAfford = profile.creditsBalance >= reward.creditsCost
              return (
                <div key={reward.id} className="reward-card">
                  <div className="reward-top">
                    <div className="reward-icon">
                      <Gift size={18} />
                    </div>
                    <div className="reward-info">
                      <strong>{reward.title}</strong>
                      <small>{reward.description}</small>
                    </div>
                  </div>

                  <div className="reward-foot">
                    <span className="cost-tag">{reward.creditsCost} Credits</span>
                    <button 
                      className={canAfford ? 'primary-btn-sm' : 'secondary-btn-sm disabled'}
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford}
                    >
                      {canAfford ? 'Redeem' : 'Need More Pts'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* RWA Ward Leaderboard */}
          <div className="rwa-leaderboard-box">
            <span className="history-title">🏆 Top Residential Welfare Associations (RWAs):</span>
            <div className="rwa-list">
              <div className="rwa-item first">
                <span>🥇 Sunset Heights Neighborhood Guild (Sunset District)</span>
                <strong>94.2% Segregation</strong>
              </div>
              <div className="rwa-item">
                <span>🥈 Fisherman Wharf Maritime Association</span>
                <strong>89.6% Segregation</strong>
              </div>
              <div className="rwa-item">
                <span>🥉 SoMa Tech & Arts Residential Guild</span>
                <strong>68.2% Segregation</strong>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
