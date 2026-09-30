import { useState } from 'react'
import { ArrowDownRight, ArrowUpRight, DollarSign, Globe2, Sparkles, TrendingUp } from 'lucide-react'
import { mockCommodities } from '../../data/mockOperationsData'

export function CommodityTicker() {
  const [commodities] = useState(mockCommodities)

  return (
    <div className="commodity-ticker-shell">
      <div className="ticker-label">
        <Globe2 size={13} />
        <span>CIRCULAR COMMODITIES SPOT INDEX</span>
      </div>

      <div className="ticker-viewport">
        <div className="ticker-track">
          {commodities.concat(commodities).map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="ticker-item">
              <span className="ticker-symbol">{item.symbol}</span>
              <span className="ticker-name">{item.name}</span>
              <strong className="ticker-price">${item.price.toLocaleString()}</strong>
              <small className="ticker-unit">{item.unit}</small>
              <span className={`ticker-change ${item.trend}`}>
                {item.trend === 'up' ? <ArrowUpRight size={12} /> : item.trend === 'down' ? <ArrowDownRight size={12} /> : null}
                {item.change24h > 0 ? `+${item.change24h}%` : item.change24h === 0 ? '0.0%' : `${item.change24h}%`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
